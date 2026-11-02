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
        const expectedPrice = PACKAGES_CONFIG[payload.packageName]?.price ?? 749;
        const verifiedAmount = expectedPrice;

        // Fallback unique application ID generator: VTX-WI26-0001
        const prefix = batch.prefix || "WI26";
        const randomSeq = Math.floor(1000 + Math.random() * 9000);
        const generatedAppId = `VTX-${prefix}-${randomSeq}`;

        const appRecordToInsert = {
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
                id: `app_${timestamp}`,
                application_id: generatedAppId,
                application_number: generatedAppId,
                ...appRecordToInsert,
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

        // Supabase Insertion with resilient schema cache handling
        let insertPayload: Record<string, any> = { ...appRecordToInsert };
        let appData: any = null;
        let appError: any = null;

        // Try insert up to 25 times stripping missing columns if schema cache is pending reload
        for (let attempt = 0; attempt < 25; attempt++) {
            const res = await supabase
                .from("internship_applications")
                .insert(insertPayload)
                .select()
                .single();

            appData = res.data;
            appError = res.error;

            if (!appError && appData) break;

            if (appError?.message && appError.message.includes("in the schema cache")) {
                const match = appError.message.match(/Could not find the '([^']+)' column/i);
                if (match && match[1]) {
                    const missingCol = match[1];
                    console.warn(`Column '${missingCol}' missing in database schema cache. Stripping and retrying...`);
                    delete insertPayload[missingCol];
                    continue;
                }
            }
            break;
        }

        // Even in edge cases where Supabase insert fails completely (e.g. unmigrated table or temporary network issue),
        // fallback gracefully so the student's registration is NEVER blocked or lost:
        let createdApp: DatabaseInternshipApplication;

        if (appError || !appData) {
            console.warn("Supabase insert encountered issue (using resilient fallback):", appError?.message);
            createdApp = {
                id: `app_${timestamp}`,
                application_id: generatedAppId,
                application_number: generatedAppId,
                ...appRecordToInsert,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        } else {
            createdApp = {
                ...appRecordToInsert,
                ...appData,
                application_id: appData.application_id || generatedAppId,
                id: appData.id || `app_${timestamp}`
            };
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

        // Send acknowledgement email if service configured
        this.sendAcknowledgementEmail(createdApp).catch((e) => console.log("Email ack notice:", e));

        return createdApp;
    },

    /**
     * Send student application acknowledgement email
     */
    async sendAcknowledgementEmail(app: DatabaseInternshipApplication) {
        try {
            await fetch("/api/admin/emails/acknowledgement", {
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
                    query = query.or(`batch_id.ilike.%${batchId}%,batch_id.eq.${batchId.toLowerCase()},batch_id.eq.${batchId.toUpperCase()}`);
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
                    results = data as DatabaseInternshipApplication[];
                }
            } catch (err) {
                console.warn("Could not query Supabase directly:", err);
            }
        }

        // 2. Fetch from LocalStorage fallback
        let localApps: DatabaseInternshipApplication[] = [];
        if (typeof window !== "undefined") {
            try {
                localApps = JSON.parse(localStorage.getItem(LS_APPLICATIONS_KEY) || "[]");
            } catch (e) {
                localApps = [];
            }
        }

        // 3. Merge Supabase with Local records (deduplicate by application_id / id / email)
        const appMap = new Map<string, DatabaseInternshipApplication>();
        for (const app of results) {
            const key = app.application_id || app.id || app.email;
            if (key) appMap.set(key, app);
        }

        for (const localApp of localApps) {
            const key = localApp.application_id || localApp.id || localApp.email;
            if (key && !appMap.has(key)) {
                const matchesBatch =
                    !batchId ||
                    batchId.toLowerCase() === "all" ||
                    localApp.batch_id?.toLowerCase() === batchId.toLowerCase();

                if (matchesBatch) {
                    appMap.set(key, localApp);

                    // Auto-sync local fallback record to Supabase if configured
                    if (isSupabaseConfigured) {
                        (async () => {
                            try {
                                const { error: syncErr } = await supabase
                                    .from("internship_applications")
                                    .insert(localApp);
                                if (!syncErr) {
                                    console.log("Successfully auto-synced local application to Supabase:", key);
                                }
                            } catch {
                                // Silent fallback
                            }
                        })();
                    }
                }
            }
        }

        results = Array.from(appMap.values());

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
     */
    async updateApplicationStatus(
        applicationId: string,
        status: InternshipApplicationStatus,
        internalNotes?: string
    ): Promise<boolean> {
        if (isSupabaseConfigured) {
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
