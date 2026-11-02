import {
    supabase,
    isSupabaseConfigured,
    DatabaseInternshipBatch,
    DatabaseInternshipApplication,
    DatabaseInternshipPayment,
    InternshipApplicationStatus,
    InternshipPaymentStatus
} from "@/lib/supabase";
import { storageService } from "./storageService";

const DEFAULT_WI26_BATCH: DatabaseInternshipBatch = {
    id: "wi26",
    title: "Winter Internship 2026",
    program_type: "internship",
    year: 2026,
    prefix: "WI26",
    fee_amount: 499.00,
    upi_id: "vectonixofficial@okhdfcbank",
    qr_code_url: "",
    domains: [
        "Full Stack Web Development",
        "AI / Machine Learning",
        "Data Science & Analytics",
        "IoT & Embedded Systems",
        "Cybersecurity & Cloud",
        "UI/UX & Product Design"
    ],
    is_active: true,
    start_date: "2026-12-01",
    end_date: "2027-01-15",
};

// Fallback in-memory/local storage keys for dev preview
const LS_BATCHES_KEY = "vx_internship_batches";
const LS_APPLICATIONS_KEY = "vx_internship_apps";
const LS_PAYMENTS_KEY = "vx_internship_payments";

export interface ApplicationSubmitPayload {
    batchId: string;
    fullName: string;
    email: string;
    phone: string;
    whatsappNumber?: string;
    collegeName: string;
    degree: string;
    department: string;
    yearOfStudy: string;
    domain: string;
    linkedinUrl?: string;
    githubUrl?: string;
    transactionIdUtr: string;
    amount: number;
    resumeFile: File;
    paymentProofFile: File;
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
     * Retrieve all active batches (for batch selector)
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
     * Submit an internship application with resume and payment screenshot
     */
    async submitApplication(payload: ApplicationSubmitPayload): Promise<{
        application: DatabaseInternshipApplication;
        payment: DatabaseInternshipPayment;
    }> {
        const batch = (await this.getBatch(payload.batchId)) || DEFAULT_WI26_BATCH;
        const timestamp = Date.now();
        const safeName = payload.fullName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();

        // 1. Upload Resume
        const resumePath = `${payload.batchId}/${safeName}_resume_${timestamp}_${payload.resumeFile.name}`;
        const resumeUrl = await storageService.uploadFile("internship-resumes", resumePath, payload.resumeFile);

        // 2. Upload Payment Proof
        const proofPath = `${payload.batchId}/${safeName}_proof_${timestamp}_${payload.paymentProofFile.name}`;
        const paymentProofUrl = await storageService.uploadFile("internship-payments", proofPath, payload.paymentProofFile);

        // Fallback Application ID if trigger is bypassed or mock mode
        const generatedAppId = `VX-${batch.prefix || batch.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

        if (!isSupabaseConfigured) {
            // Local fallback simulation
            const newApp: DatabaseInternshipApplication = {
                id: `app_${timestamp}`,
                application_id: generatedAppId,
                batch_id: payload.batchId,
                full_name: payload.fullName,
                email: payload.email,
                phone: payload.phone,
                whatsapp_number: payload.whatsappNumber,
                college_name: payload.collegeName,
                degree: payload.degree,
                department: payload.department,
                year_of_study: payload.yearOfStudy,
                domain: payload.domain,
                resume_url: resumeUrl,
                linkedin_url: payload.linkedinUrl,
                github_url: payload.githubUrl,
                status: "pending",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const newPayment: DatabaseInternshipPayment = {
                id: `pay_${timestamp}`,
                application_id: newApp.id,
                batch_id: payload.batchId,
                amount: payload.amount,
                transaction_id_utr: payload.transactionIdUtr,
                screenshot_url: paymentProofUrl,
                payment_status: "pending_verification",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (typeof window !== "undefined") {
                const existingApps = JSON.parse(localStorage.getItem(LS_APPLICATIONS_KEY) || "[]");
                localStorage.setItem(LS_APPLICATIONS_KEY, JSON.stringify([newApp, ...existingApps]));

                const existingPayments = JSON.parse(localStorage.getItem(LS_PAYMENTS_KEY) || "[]");
                localStorage.setItem(LS_PAYMENTS_KEY, JSON.stringify([newPayment, ...existingPayments]));
            }

            return { application: newApp, payment: newPayment };
        }

        // Supabase Insertion
        const { data: appData, error: appError } = await supabase
            .from("internship_applications")
            .insert({
                batch_id: payload.batchId,
                full_name: payload.fullName,
                email: payload.email,
                phone: payload.phone,
                whatsapp_number: payload.whatsappNumber || null,
                college_name: payload.collegeName,
                degree: payload.degree,
                department: payload.department,
                year_of_study: payload.yearOfStudy,
                domain: payload.domain,
                resume_url: resumeUrl,
                linkedin_url: payload.linkedinUrl || null,
                github_url: payload.githubUrl || null,
                status: "pending"
            })
            .select()
            .single();

        if (appError) {
            throw new Error(`Application submission failed: ${appError.message}`);
        }

        const { data: payData, error: payError } = await supabase
            .from("internship_payments")
            .insert({
                application_id: appData.id,
                batch_id: payload.batchId,
                amount: payload.amount,
                transaction_id_utr: payload.transactionIdUtr,
                screenshot_url: paymentProofUrl,
                payment_status: "pending_verification"
            })
            .select()
            .single();

        if (payError) {
            throw new Error(`Payment record failed: ${payError.message}`);
        }

        return {
            application: appData as DatabaseInternshipApplication,
            payment: payData as DatabaseInternshipPayment
        };
    },

    /**
     * Get applications for a batch, joining their payment records
     */
    async getApplications(
        batchId: string,
        filters?: { domain?: string; status?: string; search?: string }
    ): Promise<DatabaseInternshipApplication[]> {
        if (!isSupabaseConfigured) {
            if (typeof window === "undefined") return [];
            let apps: DatabaseInternshipApplication[] = JSON.parse(localStorage.getItem(LS_APPLICATIONS_KEY) || "[]");
            const payments: DatabaseInternshipPayment[] = JSON.parse(localStorage.getItem(LS_PAYMENTS_KEY) || "[]");

            apps = apps.filter((a) => a.batch_id.toLowerCase() === batchId.toLowerCase());

            // Join payment
            apps = apps.map((app) => ({
                ...app,
                payment: payments.find((p) => p.application_id === app.id)
            }));

            // Filter
            if (filters?.domain && filters.domain !== "all") {
                apps = apps.filter((a) => a.domain === filters.domain);
            }
            if (filters?.status && filters.status !== "all") {
                apps = apps.filter((a) => a.status === filters.status);
            }
            if (filters?.search) {
                const s = filters.search.toLowerCase();
                apps = apps.filter(
                    (a) =>
                        a.full_name.toLowerCase().includes(s) ||
                        a.application_id.toLowerCase().includes(s) ||
                        a.email.toLowerCase().includes(s) ||
                        a.college_name.toLowerCase().includes(s)
                );
            }
            return apps;
        }

        let query = supabase
            .from("internship_applications")
            .select(`
                *,
                internship_payments (*)
            `)
            .eq("batch_id", batchId.toLowerCase())
            .order("created_at", { ascending: false });

        if (filters?.domain && filters.domain !== "all") {
            query = query.eq("domain", filters.domain);
        }
        if (filters?.status && filters.status !== "all") {
            query = query.eq("status", filters.status);
        }

        const { data, error } = await query;
        if (error) {
            console.error("Error fetching applications:", error);
            return [];
        }

        let results = (data || []).map((row: any) => {
            const paymentRecord = Array.isArray(row.internship_payments)
                ? row.internship_payments[0]
                : row.internship_payments;
            return {
                ...row,
                payment: paymentRecord || undefined
            } as DatabaseInternshipApplication;
        });

        if (filters?.search) {
            const s = filters.search.toLowerCase();
            results = results.filter(
                (a) =>
                    a.full_name?.toLowerCase().includes(s) ||
                    a.application_id?.toLowerCase().includes(s) ||
                    a.email?.toLowerCase().includes(s) ||
                    a.college_name?.toLowerCase().includes(s)
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
        if (!isSupabaseConfigured) {
            if (typeof window !== "undefined") {
                const apps: DatabaseInternshipApplication[] = JSON.parse(localStorage.getItem(LS_APPLICATIONS_KEY) || "[]");
                const idx = apps.findIndex((a) => a.id === applicationId);
                if (idx !== -1) {
                    apps[idx].status = status;
                    if (internalNotes !== undefined) apps[idx].internal_notes = internalNotes;
                    apps[idx].updated_at = new Date().toISOString();
                    localStorage.setItem(LS_APPLICATIONS_KEY, JSON.stringify(apps));
                }
            }
            return true;
        }

        const updateData: any = { status };
        if (internalNotes !== undefined) updateData.internal_notes = internalNotes;

        const { error } = await supabase
            .from("internship_applications")
            .update(updateData)
            .eq("id", applicationId);

        return !error;
    },

    /**
     * Verify or reject an applicant's payment UTR
     */
    async verifyPayment(
        paymentId: string,
        applicationId: string,
        paymentStatus: InternshipPaymentStatus,
        verifiedBy: string,
        rejectionReason?: string
    ): Promise<boolean> {
        if (!isSupabaseConfigured) {
            if (typeof window !== "undefined") {
                const payments: DatabaseInternshipPayment[] = JSON.parse(localStorage.getItem(LS_PAYMENTS_KEY) || "[]");
                const pIdx = payments.findIndex((p) => p.id === paymentId);
                if (pIdx !== -1) {
                    payments[pIdx].payment_status = paymentStatus;
                    payments[pIdx].verified_by = verifiedBy;
                    payments[pIdx].verified_at = new Date().toISOString();
                    if (rejectionReason) payments[pIdx].rejection_reason = rejectionReason;
                    localStorage.setItem(LS_PAYMENTS_KEY, JSON.stringify(payments));
                }
                // If verified, advance application status if it was pending
                if (paymentStatus === "verified") {
                    await this.updateApplicationStatus(applicationId, "under_review");
                }
            }
            return true;
        }

        const { error: payError } = await supabase
            .from("internship_payments")
            .update({
                payment_status: paymentStatus,
                verified_by: verifiedBy,
                verified_at: new Date().toISOString(),
                rejection_reason: rejectionReason || null
            })
            .eq("id", paymentId);

        if (payError) return false;

        // Auto-advance application status to 'under_review' upon verification
        if (paymentStatus === "verified") {
            await supabase
                .from("internship_applications")
                .update({ status: "under_review" })
                .eq("id", applicationId)
                .eq("status", "pending");
        }

        return true;
    },

    /**
     * Cohort metrics & analytics
     */
    async getBatchAnalytics(batchId: string) {
        const apps = await this.getApplications(batchId);
        const total = apps.length;

        let verifiedCount = 0;
        let pendingPaymentCount = 0;
        let totalRevenue = 0;

        const domainBreakdown: Record<string, number> = {};
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

            // Payment verification
            if (app.payment?.payment_status === "verified") {
                verifiedCount += 1;
                totalRevenue += Number(app.payment.amount || 0);
            } else {
                pendingPaymentCount += 1;
            }
        }

        const conversionRate = total > 0 ? Math.round((verifiedCount / total) * 100) : 0;

        return {
            total,
            verifiedCount,
            pendingPaymentCount,
            totalRevenue,
            conversionRate,
            domainBreakdown,
            statusBreakdown
        };
    }
};

