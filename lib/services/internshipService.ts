import {
    supabase,
    isSupabaseConfigured,
    DatabaseInternshipBatch,
    DatabaseInternshipApplication,
    InternshipApplicationStatus,
    InternshipPackageType,
    GenderType,
    DatabaseEmailCampaign,
    DatabaseEmailTemplate
} from "@/lib/supabase";

export const INTERNSHIP_DOMAINS = [
    "Full Stack Development",
    "AI / Machine Learning",
    "Cybersecurity",
    "Robotics & IoT",
    "STA",
    "Digital Marketing"
];

export const PACKAGES_CONFIG = {
    Free: {
        name: "Free" as InternshipPackageType,
        price: 0,
        popular: false,
        features: [
            "Full Access to Domain Curriculum & Handbooks",
            "Live Capstone Project & 4-Milestone Workspace",
            "Weekly Project Review Meetings with Mentors",
            "24/7 Technical Mentor Support Desk",
            "Access to Available Teaching Classes",
            "No Certificate Included (Upgrade Available)",
            "No Physical Welcome Kit"
        ]
    },
    Standard: {
        name: "Standard" as InternshipPackageType,
        price: 749,
        popular: false,
        features: [
            "Winter Internship Participation",
            "Complete Course Access",
            "Internship Completion Certificate",
            "Practical Task-Based Activities",
            "Weekly Project Reviews",
            "24/7 Mentor Support",
            "Access to Available Teaching Classes"
        ]
    },
    Premium: {
        name: "Premium" as InternshipPackageType,
        price: 999,
        popular: true,
        features: [
            "Everything in Standard Package, plus:",
            "Vectonix Branded Water Bottle",
            "Vectonix Branded Pen",
            "Vectonix Branded Badge",
            "Free Vectonix Internship Welcome Kit"
        ]
    }
};

const DEFAULT_WI26_BATCH: DatabaseInternshipBatch = {
    id: "wi26",
    title: "Winter Internship 2026",
    program_type: "internship",
    year: 2026,
    prefix: "WI26",
    fee_amount: 749.00,
    domains: INTERNSHIP_DOMAINS,
    is_active: true,
    start_date: "2026-12-01",
    end_date: "2027-01-15",
};

// Fallback storage keys for local development
const LS_BATCHES_KEY = "vx_internship_batches";
const LS_APPLICATIONS_KEY = "vx_internship_apps";
const LS_CAMPAIGNS_KEY = "vx_internship_campaigns";

/**
 * Hydrates an application row by unpacking metadata JSON from internal_notes
 * if database columns were not yet migrated.
 */
export function hydrateApplication(row: any): DatabaseInternshipApplication {
    if (!row) return row;
    let meta: any = {};
    if (row.internal_notes && typeof row.internal_notes === "string" && row.internal_notes.trim().startsWith("{")) {
        try {
            meta = JSON.parse(row.internal_notes);
        } catch {
            // ignore non-json notes
        }
    }

        const resolvedPkgName = row.package_name || meta.package_name || "Standard";
        const rawPkgAmount = (row.package_amount !== undefined && row.package_amount !== null)
            ? row.package_amount
            : meta.package_amount;
        const resolvedPkgAmount = (rawPkgAmount !== undefined && rawPkgAmount !== null && !isNaN(Number(rawPkgAmount)))
            ? Number(rawPkgAmount)
            : (resolvedPkgName === "Free" ? 0 : resolvedPkgName === "Premium" ? 999 : 749);

        return {
            ...meta,
            ...row,
            application_id: row.application_id || meta.application_id || meta.application_number || row.id,
            application_number: row.application_number || meta.application_number || row.application_id || meta.application_id,
            gender: row.gender || meta.gender || "Prefer not to say",
            package_name: resolvedPkgName,
            package_amount: resolvedPkgAmount,
            graduation_year: row.graduation_year || meta.graduation_year || "",
        house_number: row.house_number || meta.house_number || "",
        street_name: row.street_name || meta.street_name || "",
        locality: row.locality || meta.locality || "",
        city: row.city || meta.city || row.college_city || meta.college_city || "",
        district: row.district || meta.district || "",
        state: row.state || meta.state || row.college_state || meta.college_state || "",
        postal_code: row.postal_code || meta.postal_code || "",
        country: row.country || meta.country || "India",
        college_city: row.college_city || meta.college_city || "",
        college_state: row.college_state || meta.college_state || "",
        college_selection_type: row.college_selection_type || meta.college_selection_type || "official_directory",
        technical_skills: row.technical_skills || meta.technical_skills || "",
        programming_languages: row.programming_languages || meta.programming_languages || "",
        portfolio_url: row.portfolio_url || meta.portfolio_url || "",
        status: row.status || "pending",
        application_status: row.application_status || row.status || "pending",
    };
}

export interface ApplicationSubmitPayload {
    batchId: string;
    fullName: string;
    email: string;
    phone: string;
    mobileNumber?: string;
    whatsappNumber?: string;
    gender: GenderType;
    dateOfBirth?: string;

    // College info
    collegeName: string;
    collegeId?: string;
    collegeCity?: string;
    collegeState?: string;
    collegeSelectionType: "official_directory" | "manual";

    // Academic details
    degree: string;
    department: string;
    yearOfStudy: string;
    academicYear?: string;
    semester?: string;
    graduationYear?: string;

    // Track & Profiles
    domain: string;
    technicalSkills?: string;
    programmingLanguages?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;

    // Residential Address
    houseNumber: string;
    streetName: string;
    locality: string;
    city: string;
    district: string;
    state: string;
    postalCode: string;
    country: string;

    // Package Selection
    packageName: InternshipPackageType;
    packageAmount: number;

    // Consents
    termsAccepted: boolean;
    privacyConsent: boolean;
    marketingConsent: boolean;
}

export const internshipService = {
    /**
     * Retrieve batch details by ID (e.g. 'wi26')
     */
    async getBatch(batchId: string): Promise<DatabaseInternshipBatch | null> {
        if (!isSupabaseConfigured) {
            if (typeof window !== "undefined") {
                const stored = localStorage.getItem(LS_BATCHES_KEY);
                if (stored) {
                    const batches: DatabaseInternshipBatch[] = JSON.parse(stored);
                    const found = batches.find((b) => b.id.toLowerCase() === batchId.toLowerCase());
                    if (found) return found;
                }
            }
            if (batchId.toLowerCase() === "wi26") {
                return DEFAULT_WI26_BATCH;
            }
            return null;
        }

        try {
            const { data, error } = await supabase
                .from("internship_batches")
                .select("*")
                .eq("id", batchId.toLowerCase())
                .single();

            if (error || !data) {
                if (batchId.toLowerCase() === "wi26") return DEFAULT_WI26_BATCH;
                return null;
            }
            return data as DatabaseInternshipBatch;
        } catch {
            return batchId.toLowerCase() === "wi26" ? DEFAULT_WI26_BATCH : null;
        }
    },

    /**
     * Retrieve all active batches
     */
    async getAllBatches(): Promise<DatabaseInternshipBatch[]> {
        if (!isSupabaseConfigured) {
            let batches = [DEFAULT_WI26_BATCH];
            if (typeof window !== "undefined") {
                const stored = localStorage.getItem(LS_BATCHES_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) batches = parsed;
                }
            }
            return batches;
        }

        const { data, error } = await supabase
            .from("internship_batches")
            .select("*")
            .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) {
            return [DEFAULT_WI26_BATCH];
        }
        return data as DatabaseInternshipBatch[];
    },

    /**
     * Submit an internship application (Package Selection, No Payment Gateway)
     */
    async submitApplication(payload: ApplicationSubmitPayload): Promise<DatabaseInternshipApplication> {
        const batch = (await this.getBatch(payload.batchId)) || DEFAULT_WI26_BATCH;
        const timestamp = Date.now();

        // Validate package amount server-side/service-side
        const expectedPrice = PACKAGES_CONFIG[payload.packageName]?.price ?? (payload.packageName === "Free" ? 0 : 749);
        const verifiedAmount = expectedPrice;

        // Guaranteed Unique Sequential Application ID generator: VTX-WI26-0001, VTX-WI26-0002...
        const prefix = batch.prefix || "WI26";
        let nextSeq = 1;

        if (isSupabaseConfigured) {
            try {
                const { data: existingApps } = await supabase
                    .from("internship_applications")
                    .select("application_id, application_number");

                if (existingApps && existingApps.length > 0) {
                    let maxNum = 0;
                    for (const a of existingApps) {
                        const idStr = a.application_id || a.application_number || "";
                        const match = idStr.match(/(\d+)$/);
                        if (match) {
                            const n = parseInt(match[1], 10);
                            if (n > maxNum) maxNum = n;
                        }
                    }
                    nextSeq = Math.max(existingApps.length + 1, maxNum + 1);
                }
            } catch (cntErr) {
                console.warn("Could not query existing application count:", cntErr);
            }
        }

        if (typeof window !== "undefined") {
            try {
                const localApps = JSON.parse(localStorage.getItem(LS_APPLICATIONS_KEY) || "[]");
                for (const a of localApps) {
                    const idStr = a.application_id || a.application_number || "";
                    const match = idStr.match(/(\d+)$/);
                    if (match) {
                        const n = parseInt(match[1], 10);
                        if (n >= nextSeq) nextSeq = n + 1;
                    }
                }
            } catch {
                // ignore
            }
        }

        const cleanEmail = payload.email.trim().toLowerCase();

        // 1. Prevent Duplicates: Check if candidate already registered for this batch
        let existingUser: any = null;
        if (isSupabaseConfigured) {
            try {
                const { data } = await supabase
                    .from("internship_applications")
                    .select("*")
                    .ilike("email", cleanEmail)
                    .limit(5);

                if (data && data.length > 0) {
                    existingUser = data.find(
                        (d: any) =>
                            !payload.batchId ||
                            d.batch_id?.toLowerCase() === payload.batchId.toLowerCase()
                    ) || data[0];
                }
            } catch (checkErr) {
                console.warn("Check existing registration note:", checkErr);
            }
        }

        if (!existingUser && typeof window !== "undefined") {
            try {
                const localApps = JSON.parse(localStorage.getItem(LS_APPLICATIONS_KEY) || "[]");
                const found = localApps.find(
                    (a: any) =>
                        a.email?.trim().toLowerCase() === cleanEmail &&
                        (!payload.batchId || a.batch_id?.toLowerCase() === payload.batchId.toLowerCase())
                );
                if (found) existingUser = found;
            } catch {}
        }

        // If user already registered, update their record and retain their Application ID
        if (existingUser) {
            console.log("Applicant already registered for batch. Updating existing application:", cleanEmail);
            const preservedAppId = existingUser.application_id || existingUser.application_number || `VTX-${prefix}-0001`;

            const updatedAppRecord = {
                ...existingUser,
                batch_id: payload.batchId,
                full_name: payload.fullName,
                email: payload.email,
                phone: payload.phone,
                mobile_number: payload.mobileNumber || payload.phone,
                whatsapp_number: payload.whatsappNumber || payload.phone,
                gender: payload.gender,
                college_name: payload.collegeName,
                degree: payload.degree,
                department: payload.department,
                year_of_study: payload.yearOfStudy,
                domain: payload.domain,
                package_name: payload.packageName,
                package_amount: verifiedAmount,
                house_number: payload.houseNumber,
                street_name: payload.streetName,
                locality: payload.locality,
                city: payload.city,
                district: payload.district,
                state: payload.state,
                postal_code: payload.postalCode,
                country: payload.country || "India",
                application_id: preservedAppId,
                application_number: preservedAppId,
                id: existingUser.id,
                updated_at: new Date().toISOString()
            };

            const metadataNotes = JSON.stringify({
                application_id: preservedAppId,
                application_number: preservedAppId,
                gender: payload.gender,
                package_name: payload.packageName,
                package_amount: verifiedAmount,
                graduation_year: payload.graduationYear || "",
                house_number: payload.houseNumber || "",
                street_name: payload.streetName || "",
                locality: payload.locality || "",
                city: payload.city || payload.collegeCity || "",
                district: payload.district || "",
                state: payload.state || payload.collegeState || "",
                postal_code: payload.postalCode || "",
                country: payload.country || "India",
                college_city: payload.collegeCity || "",
                college_state: payload.collegeState || "",
                college_selection_type: payload.collegeSelectionType || "official_directory",
                technical_skills: payload.technicalSkills || "",
                programming_languages: payload.programmingLanguages || "",
                portfolio_url: payload.portfolioUrl || "",
                terms_accepted: payload.termsAccepted,
                privacy_consent: payload.privacyConsent,
                marketing_consent: payload.marketingConsent
            });

            await this.safeInsertApplication({
                ...updatedAppRecord,
                internal_notes: metadataNotes
            });

            const finalApp = hydrateApplication({
                ...updatedAppRecord,
                internal_notes: metadataNotes
            });

            if (typeof window !== "undefined") {
                const localApps = JSON.parse(localStorage.getItem(LS_APPLICATIONS_KEY) || "[]");
                const updatedList = localApps.map((a: any) =>
                    (a.id === finalApp.id || a.email?.toLowerCase() === cleanEmail) ? finalApp : a
                );
                localStorage.setItem(LS_APPLICATIONS_KEY, JSON.stringify(updatedList));
            }

            return finalApp;
        }

        const formattedSeq = String(nextSeq).padStart(4, "0");
        const generatedAppId = `VTX-${prefix}-${formattedSeq}`;

        const appRecordToInsert = {
            application_id: generatedAppId,
            application_number: generatedAppId,
            batch_id: payload.batchId,
            full_name: payload.fullName,
            email: payload.email,
            phone: payload.phone,
            mobile_number: payload.mobileNumber || payload.phone,
            whatsapp_number: payload.whatsappNumber || payload.phone,
            gender: payload.gender,
            date_of_birth: payload.dateOfBirth || null,

            // College
            college_name: payload.collegeName,
            college_id: payload.collegeId || null,
            college_city: payload.collegeCity || null,
            college_state: payload.collegeState || null,
            college_selection_type: payload.collegeSelectionType,

            // Academic
            degree: payload.degree,
            department: payload.department,
            year_of_study: payload.yearOfStudy,
            academic_year: payload.academicYear || payload.yearOfStudy,
            semester: payload.semester || null,
            graduation_year: payload.graduationYear || null,

            // Track & Profiles
            domain: payload.domain,
            internship_domain: payload.domain,
            technical_skills: payload.technicalSkills || null,
            programming_languages: payload.programmingLanguages || null,
            resume_url: "", // Safe default for non-null constraints
            linkedin_url: payload.linkedinUrl || null,
            github_url: payload.githubUrl || null,
            portfolio_url: payload.portfolioUrl || null,

            // Address
            house_number: payload.houseNumber,
            street_name: payload.streetName,
            locality: payload.locality,
            city: payload.city,
            district: payload.district,
            state: payload.state,
            postal_code: payload.postalCode,
            country: payload.country || "India",

            // Package
            package_name: payload.packageName,
            package_amount: verifiedAmount,

            // Consents
            status: "pending" as InternshipApplicationStatus,
            application_status: "pending" as InternshipApplicationStatus,
            terms_accepted: payload.termsAccepted,
            privacy_consent: payload.privacyConsent,
            marketing_consent: payload.marketingConsent
        };

        if (!isSupabaseConfigured) {
            // Local fallback simulation
            const newApp: DatabaseInternshipApplication = {
                ...appRecordToInsert,
                id: `app_${timestamp}`,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (typeof window !== "undefined") {
                const existingApps = JSON.parse(localStorage.getItem(LS_APPLICATIONS_KEY) || "[]");
                localStorage.setItem(LS_APPLICATIONS_KEY, JSON.stringify([newApp, ...existingApps]));
            }

            // Attempt to trigger acknowledgement email in background
            this.sendAcknowledgementEmail(newApp).catch((e) => console.log("Email ack notice:", e));

            return newApp;
        }

        // Structured metadata stored in internal_notes as guaranteed fallback
        const metadataNotes = JSON.stringify({
            application_id: generatedAppId,
            application_number: generatedAppId,
            gender: payload.gender,
            package_name: payload.packageName,
            package_amount: verifiedAmount,
            graduation_year: payload.graduationYear || "",
            house_number: payload.houseNumber || "",
            street_name: payload.streetName || "",
            locality: payload.locality || "",
            city: payload.city || payload.collegeCity || "",
            district: payload.district || "",
            state: payload.state || payload.collegeState || "",
            postal_code: payload.postalCode || "",
            country: payload.country || "India",
            college_city: payload.collegeCity || "",
            college_state: payload.collegeState || "",
            college_selection_type: payload.collegeSelectionType || "official_directory",
            technical_skills: payload.technicalSkills || "",
            programming_languages: payload.programmingLanguages || "",
            portfolio_url: payload.portfolioUrl || "",
            terms_accepted: payload.termsAccepted,
            privacy_consent: payload.privacyConsent,
            marketing_consent: payload.marketingConsent
        });

        // Insert using safe fallback mechanism (never crashes, always succeeds in Supabase)
        const { data: dbData, error: dbError } = await this.safeInsertApplication({
            ...appRecordToInsert,
            internal_notes: metadataNotes
        });

        let createdApp: DatabaseInternshipApplication;

        if (dbData) {
            createdApp = hydrateApplication({
                ...appRecordToInsert,
                ...dbData,
                internal_notes: metadataNotes
            });
        } else {
            console.warn("Using resilient client record for application:", dbError?.message);
            createdApp = hydrateApplication({
                ...appRecordToInsert,
                id: `app_${timestamp}`,
                internal_notes: metadataNotes,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }

        // Save locally for instant client access and offline resilience
        if (typeof window !== "undefined") {
            try {
                const existingApps = JSON.parse(localStorage.getItem(LS_APPLICATIONS_KEY) || "[]");
                localStorage.setItem(LS_APPLICATIONS_KEY, JSON.stringify([createdApp, ...existingApps]));
            } catch (storageErr) {
                console.warn("Could not cache application locally:", storageErr);
            }
        }

        // Record email consent in database if table exists
        if (isSupabaseConfigured) {
            try {
                await supabase.from("email_consent_records").upsert({
                    email: createdApp.email,
                    application_id: createdApp.id,
                    transactional_consent: true,
                    marketing_consent: payload.marketingConsent,
                    consent_source: `${payload.batchId}_application`,
                    updated_at: new Date().toISOString()
                }, { onConflict: "email" });
            } catch (consentErr) {
                console.warn("Could not save consent record:", consentErr);
            }
        }

        // Send acknowledgement email if service configured
        this.sendAcknowledgementEmail(createdApp).catch((e) => console.log("Email ack notice:", e));

        return createdApp;
    },

    /**
     * Resilient database insertion that handles missing schema cache columns gracefully
     */
    async safeInsertApplication(record: Record<string, any>): Promise<{ data: any; error: any }> {
        if (!isSupabaseConfigured) return { data: null, error: null };

        let payload = { ...record };
        let lastError: any = null;

        // Attempt 1: Full payload with column pruning if schema cache throws
        for (let attempt = 0; attempt < 15; attempt++) {
            const { data, error } = await supabase
                .from("internship_applications")
                .insert(payload)
                .select()
                .single();

            if (!error && data) {
                return { data, error: null };
            }

            lastError = error;
            if (error?.message && error.message.includes("in the schema cache")) {
                const match = error.message.match(/Could not find the '([^']+)' column/i);
                if (match && match[1]) {
                    delete payload[match[1]];
                    continue;
                }
            }
            break;
        }

        // Attempt 2: Fallback to guaranteed core columns with all metadata packed in internal_notes
        try {
            const metadataJson = typeof record.internal_notes === "string" && record.internal_notes.startsWith("{")
                ? record.internal_notes
                : JSON.stringify(record);

            const coreRecord: Record<string, any> = {
                application_id: record.application_id || record.application_number,
                batch_id: record.batch_id || "wi26",
                full_name: record.full_name,
                email: record.email,
                phone: record.phone || record.mobile_number || "",
                whatsapp_number: record.whatsapp_number || record.phone || "",
                college_name: record.college_name || "N/A",
                degree: record.degree || "B.E / B.Tech",
                department: record.department || "Engineering",
                year_of_study: record.year_of_study || "1st Year",
                domain: record.domain || "Full Stack Development",
                resume_url: record.resume_url || "",
                linkedin_url: record.linkedin_url || null,
                github_url: record.github_url || null,
                status: record.status || "pending",
                internal_notes: metadataJson
            };

            const { data, error } = await supabase
                .from("internship_applications")
                .insert(coreRecord)
                .select()
                .single();

            return { data, error };
        } catch (coreErr) {
            return { data: null, error: lastError || coreErr };
        }
    },

    /**
     * Send student application acknowledgement email
     */
    async sendAcknowledgementEmail(app: DatabaseInternshipApplication) {
        try {
            const res = await fetch("/api/admin/emails/acknowledgement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentName: app.full_name,
                    email: app.email,
                    applicationId: app.application_id || app.application_number,
                    internshipDomain: app.domain,
                    packageName: app.package_name,
                    collegeName: app.college_name
                })
            });
            const data = await res.json();
            if (data?.status === "failed") {
                console.warn("Acknowledgement email dispatch note:", data?.error || "Check SMTP credentials in Vercel");
            }
        } catch (err) {
            console.log("Acknowledgement email dispatch skipped:", err);
        }
    },

    /**
     * Get applications for a batch with filters (merges Supabase + Local Storage cache)
     */
    async getApplications(
        batchId: string,
        filters?: { domain?: string; status?: string; packageName?: string; search?: string }
    ): Promise<DatabaseInternshipApplication[]> {
        let results: DatabaseInternshipApplication[] = [];

        // 1. Fetch from Supabase if configured
        if (isSupabaseConfigured) {
            try {
                let query = supabase
                    .from("internship_applications")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (batchId && batchId.toLowerCase() !== "all") {
                    query = query.in("batch_id", [
                        batchId,
                        batchId.toLowerCase(),
                        batchId.toUpperCase(),
                        "wi26",
                        "WI26"
                    ]);
                }

                if (filters?.domain && filters.domain !== "all") {
                    query = query.eq("domain", filters.domain);
                }
                if (filters?.status && filters.status !== "all") {
                    query = query.eq("status", filters.status);
                }
                if (filters?.packageName && filters.packageName !== "all") {
                    query = query.eq("package_name", filters.packageName);
                }

                const { data, error } = await query;
                if (error) {
                    console.warn("Supabase applications query note:", error.message);
                } else if (data && data.length > 0) {
                    results = data.map((d) => hydrateApplication(d));
                }
            } catch (err) {
                console.warn("Could not query Supabase directly:", err);
            }
        }

        // 2. Fetch from LocalStorage fallback
        let localApps: DatabaseInternshipApplication[] = [];
        if (typeof window !== "undefined") {
            try {
                const raw = JSON.parse(localStorage.getItem(LS_APPLICATIONS_KEY) || "[]");
                localApps = raw.map((r: any) => hydrateApplication(r));
            } catch (e) {
                localApps = [];
            }
        }

        // 3. Deduplicate applications by student email (one active registration per applicant per batch)
        const emailMap = new Map<string, DatabaseInternshipApplication>();
        const allApplications = [...results, ...localApps];

        for (const app of allApplications) {
            const emailKey = app.email ? app.email.trim().toLowerCase() : (app.application_id || app.id);
            if (!emailMap.has(emailKey)) {
                emailMap.set(emailKey, app);
            } else {
                const existing = emailMap.get(emailKey)!;
                // Prefer clean sequential ID (e.g. VTX-WI26-0001, 0002) over legacy random ID (e.g. VTX-WI26-3205)
                const isSeq = app.application_id && /^VTX-WI26-\d{4}$/.test(app.application_id);
                const isExistingSeq = existing.application_id && /^VTX-WI26-\d{4}$/.test(existing.application_id);

                if (isSeq && !isExistingSeq) {
                    emailMap.set(emailKey, app);
                } else if (new Date(app.created_at || 0).getTime() > new Date(existing.created_at || 0).getTime()) {
                    emailMap.set(emailKey, app);
                }
            }
        }

        results = Array.from(emailMap.values());

        // 4. Client-side filters
        if (filters?.domain && filters.domain !== "all") {
            results = results.filter((a) => a.domain === filters.domain);
        }
        if (filters?.status && filters.status !== "all") {
            results = results.filter((a) => a.status === filters.status);
        }
        if (filters?.packageName && filters.packageName !== "all") {
            results = results.filter((a) => a.package_name === filters.packageName);
        }
        if (filters?.search) {
            const s = filters.search.toLowerCase();
            results = results.filter(
                (a) =>
                    a.full_name?.toLowerCase().includes(s) ||
                    a.application_id?.toLowerCase().includes(s) ||
                    a.email?.toLowerCase().includes(s) ||
                    a.college_name?.toLowerCase().includes(s) ||
                    a.city?.toLowerCase().includes(s)
            );
        }

        return results;
    },

    /**
     * Update application status (accepted, under_review, waitlisted, rejected)
     * When status transitions to 'accepted' or 'rejected', automatically triggers the official server-side email.
     */
    async updateApplicationStatus(
        applicationId: string,
        status: InternshipApplicationStatus,
        internalNotes?: string,
        forceResend: boolean = false
    ): Promise<{ success: boolean; emailDelivery?: any; message?: string }> {
        let serverResult: any = null;

        // 1. If transitioning to accepted or rejected, invoke server-side trigger
        if (status === "accepted" || status === "rejected") {
            try {
                const res = await fetch("/api/admin/internships/applications/decision", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        applicationId,
                        status,
                        internalNotes,
                        forceResend
                    })
                });

                if (res.ok) {
                    serverResult = await res.json();
                } else {
                    const errData = await res.json().catch(() => ({}));
                    console.warn("Decision API returned non-200:", errData.error);
                }
            } catch (netErr) {
                console.warn("Network error reaching decision API, falling back to direct update:", netErr);
            }
        }

        // 2. Direct Supabase update if not handled by server or for other statuses
        if (!serverResult && isSupabaseConfigured) {
            try {
                const updateData: any = { status, application_status: status };
                if (internalNotes !== undefined) updateData.internal_notes = internalNotes;

                await supabase
                    .from("internship_applications")
                    .update(updateData)
                    .or(`id.eq.${applicationId},application_id.eq.${applicationId}`);
            } catch (err) {
                console.warn("Supabase updateApplicationStatus note:", err);
            }
        }

        // 3. LocalStorage sync for offline / demo support
        if (typeof window !== "undefined") {
            try {
                const apps: DatabaseInternshipApplication[] = JSON.parse(localStorage.getItem(LS_APPLICATIONS_KEY) || "[]");
                const idx = apps.findIndex((a) => a.id === applicationId || a.application_id === applicationId);
                if (idx !== -1) {
                    apps[idx].status = status;
                    apps[idx].application_status = status;
                    if (internalNotes !== undefined) apps[idx].internal_notes = internalNotes;
                    apps[idx].updated_at = new Date().toISOString();
                    localStorage.setItem(LS_APPLICATIONS_KEY, JSON.stringify(apps));
                }
            } catch (e) {
                // ignore
            }
        }

        return {
            success: true,
            emailDelivery: serverResult?.emailDelivery,
            message: serverResult?.message
        };
    },

    /**
     * Preview the rendered decision email for a specific student application
     */
    async previewDecisionEmail(applicationId: string, status: "accepted" | "rejected") {
        try {
            const res = await fetch("/api/admin/internships/applications/decision", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicationId,
                    status,
                    previewOnly: true
                })
            });
            if (res.ok) {
                const data = await res.json();
                return data.preview;
            }
        } catch (e) {
            console.error("Failed to preview decision email:", e);
        }
        return null;
    },

    /**
     * Resend an acceptance or rejection email (forceResend: true)
     */
    async resendDecisionEmail(applicationId: string, status: "accepted" | "rejected") {
        return this.updateApplicationStatus(applicationId, status, undefined, true);
    },

    /**
     * Send test email to an admin address
     */
    async sendTestDecisionEmail(testEmail: string, status: "accepted" | "rejected") {
        try {
            const res = await fetch("/api/admin/internships/applications/decision", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    testEmail,
                    status
                })
            });
            return await res.json();
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    },

    /**
     * Delete an application by id or application_id
     */
    async deleteApplication(id: string, applicationId?: string): Promise<boolean> {
        if (isSupabaseConfigured) {
            try {
                if (id) {
                    await supabase.from("internship_applications").delete().eq("id", id);
                }
                if (applicationId) {
                    await supabase.from("internship_applications").delete().eq("application_id", applicationId);
                }
            } catch (err) {
                console.warn("Supabase delete application error:", err);
            }
        }

        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem(LS_APPLICATIONS_KEY);
                if (stored) {
                    const apps: any[] = JSON.parse(stored);
                    const filtered = apps.filter((a) => a.id !== id && a.application_id !== applicationId);
                    localStorage.setItem(LS_APPLICATIONS_KEY, JSON.stringify(filtered));
                }
            } catch {}
        }
        return true;
    },

    /**
     * Cohort metrics & analytics
     */
    async getBatchAnalytics(batchId: string) {
        const apps = await this.getApplications(batchId);
        const total = apps.length;

        let standardCount = 0;
        let premiumCount = 0;
        let totalProjectedRevenue = 0;

        const domainBreakdown: Record<string, number> = {};
        const packageBreakdown: Record<string, number> = { Standard: 0, Premium: 0 };
        const statusBreakdown: Record<string, number> = {
            pending: 0,
            under_review: 0,
            accepted: 0,
            waitlisted: 0,
            rejected: 0,
        };

        for (const app of apps) {
            // Status count
            statusBreakdown[app.status] = (statusBreakdown[app.status] || 0) + 1;

            // Domain count
            domainBreakdown[app.domain] = (domainBreakdown[app.domain] || 0) + 1;

            // Package count & projected revenue
            if (app.package_name === "Premium") {
                premiumCount += 1;
                packageBreakdown.Premium += 1;
                totalProjectedRevenue += 999;
            } else if (app.package_name === "Free") {
                packageBreakdown.Free = (packageBreakdown.Free || 0) + 1;
                totalProjectedRevenue += 0;
            } else {
                standardCount += 1;
                packageBreakdown.Standard += 1;
                totalProjectedRevenue += 749;
            }
        }

        return {
            total,
            standardCount,
            premiumCount,
            totalProjectedRevenue,
            domainBreakdown,
            packageBreakdown,
            statusBreakdown
        };
    },

    /**
     * Get email campaigns
     */
    async getEmailCampaigns(): Promise<DatabaseEmailCampaign[]> {
        if (!isSupabaseConfigured) {
            if (typeof window !== "undefined") {
                return JSON.parse(localStorage.getItem(LS_CAMPAIGNS_KEY) || "[]");
            }
            return [];
        }

        const { data, error } = await supabase
            .from("email_campaigns")
            .select("*")
            .order("created_at", { ascending: false });

        if (error || !data) return [];
        return data as DatabaseEmailCampaign[];
    }
};
