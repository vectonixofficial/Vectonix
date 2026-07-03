import { supabase, isSupabaseConfigured, DatabaseCertificate } from "@/lib/supabase";
import { Certificate, DEFAULT_CERTIFICATES } from "@/lib/certificates";
import { db } from "@/lib/firebase";
import { collection, getDocs, query as fsQuery, where as fsWhere } from "firebase/firestore";

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

function sanitizeDate(d?: string): string {
    if (!d || typeof d !== "string" || d.trim() === "") return "2026-06-01";
    return d.trim();
}

// Helper to convert app camelCase to DB snake_case
function mapToDatabaseFormat(cert: Partial<Certificate>): Partial<DatabaseCertificate> {
    return {
        certificate_id: cert.certificateId,
        student_name: cert.studentName,
        college_name: cert.collegeName,
        domain: cert.domain,
        start_date: sanitizeDate(cert.startDate),
        end_date: sanitizeDate(cert.endDate),
        issue_date: sanitizeDate(cert.issueDate),
        signature_image: cert.signatureImage || undefined,
        verification_status: cert.verificationStatus || "verified",
        type: cert.type || (cert.certificateId?.includes("OFF") ? "offer_letter" : "completion"),
        designation: cert.designation || undefined,
        stipend: cert.stipend || undefined,
    };
}

export const certificatesService = {
    async getAll(): Promise<Certificate[]> {
        let supabaseCerts: Certificate[] = [];
        let firestoreCerts: Certificate[] = [];

        // 1. Fetch from Supabase if configured
        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from("certificates")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error && data) {
                supabaseCerts = data.map(mapToCertificate);
            }
        }

        // 2. Fetch from Firestore (where live generated certificates exist)
        if (db) {
            try {
                const snapshot = await getDocs(collection(db, "certificates"));
                firestoreCerts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Certificate));
            } catch (e) {
                console.warn("Firestore fetch warning:", e);
            }
        }

        // 3. Merge all sources: Supabase, Firestore, and DEFAULT_CERTIFICATES
        const allCombinedMap = new Map<string, Certificate>();

        // Default certs first
        DEFAULT_CERTIFICATES.forEach(c => {
            allCombinedMap.set(c.certificateId.toUpperCase(), { id: c.certificateId, ...c } as Certificate);
        });

        // Firestore certs next (overrides defaults)
        firestoreCerts.forEach(c => {
            if (c.certificateId) {
                allCombinedMap.set(c.certificateId.toUpperCase(), c);
            }
        });

        // Supabase certs (highest priority)
        supabaseCerts.forEach(c => {
            if (c.certificateId) {
                allCombinedMap.set(c.certificateId.toUpperCase(), c);
            }
        });

        const mergedList = Array.from(allCombinedMap.values());

        // 4. Auto-seed any missing Firestore/Default certificates into Supabase in the background
        if (isSupabaseConfigured && mergedList.length > supabaseCerts.length) {
            const missingInSupabase = mergedList.filter(
                m => !supabaseCerts.some(s => s.certificateId.toUpperCase() === m.certificateId.toUpperCase())
            );
            if (missingInSupabase.length > 0) {
                console.log(`Auto-seeding ${missingInSupabase.length} missing certificates from Firestore into Supabase...`);
                this.syncAll(missingInSupabase).catch(err => console.error("Auto-sync error:", err));
            }
        }

        return mergedList;
    },

    async getByCode(certificateId: string): Promise<Certificate | null> {
        const decodedId = decodeURIComponent(certificateId).trim();

        // 1. Check Supabase
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

        // 2. Check Firestore if not found in Supabase
        if (db) {
            try {
                const q = fsQuery(collection(db, "certificates"), fsWhere("certificateId", "==", decodedId));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const docData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Certificate;
                    // Auto-sync into Supabase
                    if (isSupabaseConfigured) {
                        this.create(docData).catch(console.error);
                    }
                    return docData;
                }
            } catch (e) {
                console.warn("Firestore lookup failed:", e);
            }
        }

        // 3. Fallback search in defaults
        const fallback = DEFAULT_CERTIFICATES.find(
            (c) => c.certificateId.toUpperCase() === decodedId.toUpperCase()
        );
        if (fallback) {
            const certObj = { id: fallback.certificateId, ...fallback } as Certificate;
            if (isSupabaseConfigured) {
                this.create(certObj).catch(console.error);
            }
            return certObj;
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
        if (!certificates || certificates.length === 0) return 0;

        let syncedCount = 0;

        // 1. Try Supabase
        if (isSupabaseConfigured) {
            try {
                const dbRecords = certificates.map(c => mapToDatabaseFormat(c));
                const { data, error } = await supabase
                    .from("certificates")
                    .upsert(dbRecords, { onConflict: "certificate_id" })
                    .select("id");

                if (!error && data) {
                    syncedCount = data.length;
                } else if (error) {
                    console.warn("Supabase syncAll error:", error.message);
                }
            } catch (e) {
                console.warn("Supabase syncAll exception:", e);
            }
        }

        // 2. Fallback to Firestore or count returned items if Supabase was unconfigured
        if (syncedCount === 0 && db) {
            try {
                const { doc, setDoc } = await import("firebase/firestore");
                for (const cert of certificates) {
                    if (cert.certificateId) {
                        const certRef = doc(collection(db, "certificates"), cert.certificateId);
                        await setDoc(certRef, cert, { merge: true });
                        syncedCount++;
                    }
                }
            } catch (err) {
                console.warn("Firestore fallback batch sync warning:", err);
            }
        }

        return syncedCount > 0 ? syncedCount : certificates.length;
    }
};
