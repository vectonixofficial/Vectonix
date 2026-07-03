import { supabase, isSupabaseConfigured, DatabaseCertificate } from "@/lib/supabase";
import { Certificate, DEFAULT_CERTIFICATES } from "@/lib/certificates";

// Helper to convert DB snake_case to app camelCase
function mapToCertificate(item: DatabaseCertificate): Certificate {
    return {
        id: item.id,
        certificateId: item.certificate_id,
        studentName: item.student_name,
        collegeName: item.college_name,
        domain: item.domain,
        startDate: item.start_date,
        endDate: item.end_date,
        issueDate: item.issue_date,
        signatureImage: item.signature_image || "",
        verificationStatus: item.verification_status,
        type: item.type,
        designation: item.designation || "",
        stipend: item.stipend || "",
        createdAt: item.created_at,
    };
}

// Helper to convert app camelCase to DB snake_case
function mapToDatabaseFormat(cert: Partial<Certificate>): Partial<DatabaseCertificate> {
    return {
        certificate_id: cert.certificateId,
        student_name: cert.studentName,
        college_name: cert.collegeName,
        domain: cert.domain,
        start_date: cert.startDate,
        end_date: cert.endDate,
        issue_date: cert.issueDate,
        signature_image: cert.signatureImage || undefined,
        verification_status: cert.verificationStatus || "verified",
        type: cert.type || "completion",
        designation: cert.designation || undefined,
        stipend: cert.stipend || undefined,
    };
}

export const certificatesService = {
    async getAll(): Promise<Certificate[]> {
        if (!isSupabaseConfigured) {
            return DEFAULT_CERTIFICATES.map(c => ({ ...c, id: c.certificateId })) as Certificate[];
        }

        const { data, error } = await supabase
            .from("certificates")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.warn("Supabase fetch error, using defaults:", error.message);
            return DEFAULT_CERTIFICATES.map(c => ({ ...c, id: c.certificateId })) as Certificate[];
        }

        if (!data || data.length === 0) {
            return DEFAULT_CERTIFICATES.map(c => ({ ...c, id: c.certificateId })) as Certificate[];
        }

        return data.map(mapToCertificate);
    },

    async getByCode(certificateId: string): Promise<Certificate | null> {
        const decodedId = decodeURIComponent(certificateId).trim();

        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from("certificates")
                .select("*")
                .ilike("certificate_id", decodedId)
                .maybeSingle();

            if (!error && data) {
                return mapToCertificate(data);
            }
        }

        // Fallback search
        const fallback = DEFAULT_CERTIFICATES.find(
            (c) => c.certificateId.toUpperCase() === decodedId.toUpperCase()
        );
        if (fallback) {
            return { id: fallback.certificateId, ...fallback } as Certificate;
        }
        return null;
    },

    async create(certData: Omit<Certificate, "id">): Promise<string> {
        if (!isSupabaseConfigured) {
            console.warn("Supabase not configured. Saved locally.");
            return certData.certificateId;
        }

        const dbRecord = mapToDatabaseFormat(certData);
        const { data, error } = await supabase
            .from("certificates")
            .insert([dbRecord])
            .select("id")
            .single();

        if (error) {
            throw new Error(`Failed to create certificate in Supabase: ${error.message}`);
        }

        return data.id;
    },

    async update(id: string, certData: Partial<Certificate>): Promise<void> {
        if (!isSupabaseConfigured) return;

        const dbRecord = mapToDatabaseFormat(certData);
        const { error } = await supabase
            .from("certificates")
            .update(dbRecord)
            .eq("id", id);

        if (error) {
            // Try matching by certificate_id if id is a custom code
            const { error: codeErr } = await supabase
                .from("certificates")
                .update(dbRecord)
                .eq("certificate_id", id);
            
            if (codeErr) {
                throw new Error(`Failed to update certificate: ${error.message}`);
            }
        }
    },

    async delete(id: string): Promise<void> {
        if (!isSupabaseConfigured) return;

        const { error } = await supabase
            .from("certificates")
            .delete()
            .or(`id.eq.${id},certificate_id.eq.${id}`);

        if (error) {
            throw new Error(`Failed to delete certificate: ${error.message}`);
        }
    },

    async generateCertificateId(type: "completion" | "offer_letter" = "completion"): Promise<string> {
        const year = new Date().getFullYear();
        if (isSupabaseConfigured) {
            const { count } = await supabase
                .from("certificates")
                .select("*", { count: "exact", head: true });
            
            const nextCount = (count ?? 0) + 1;
            if (type === "offer_letter") {
                return `VTX-OFF-${year}-${String(nextCount).padStart(3, "0")}`;
            }
            return `VTX${year}-${String(nextCount).padStart(3, "0")}`;
        }

        const randomNum = Math.floor(Math.random() * 899) + 100;
        return type === "offer_letter" ? `VTX-OFF-${year}-${randomNum}` : `VTX${year}-${randomNum}`;
    },

    async syncAll(certificates: Omit<Certificate, "id">[]): Promise<number> {
        if (!isSupabaseConfigured || certificates.length === 0) return 0;

        const dbRecords = certificates.map(c => mapToDatabaseFormat(c));
        const { data, error } = await supabase
            .from("certificates")
            .upsert(dbRecords, { onConflict: "certificate_id" })
            .select("id");

        if (error) {
            console.error("Bulk sync error:", error.message);
            throw new Error(`Failed to sync certificates to Supabase: ${error.message}`);
        }

        return data ? data.length : certificates.length;
    }
};
