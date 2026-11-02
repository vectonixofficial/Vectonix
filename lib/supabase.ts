import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});

// Database Type Definitions
export type CertificateType = "completion" | "offer_letter";
export type VerificationStatus = "verified" | "revoked";

export interface DatabaseCertificate {
    id: string;
    certificate_id: string;
    student_name: string;
    college_name: string;
    domain: string;
    start_date: string;
    end_date: string;
    issue_date: string;
    signature_image?: string;
    verification_status: VerificationStatus;
    type: CertificateType;
    designation?: string;
    stipend?: string;
    created_at?: string;
    updated_at?: string;
}

export interface DatabaseEvent {
    id: string;
    title: string;
    description: string;
    date: string;
    time?: string;
    location?: string;
    category?: string;
    image_url?: string;
    registration_link?: string;
    custom_fields?: any[];
    created_at?: string;
    updated_at?: string;
}

export interface DatabaseRegistration {
    id: string;
    event_id?: string;
    user_id?: string;
    full_name: string;
    email: string;
    phone?: string;
    college?: string;
    department?: string;
    year?: string;
    program_name?: string;
    type?: string;
    answers?: Record<string, any>;
    status?: string;
    created_at?: string;
    updated_at?: string;
}

// Internship Management Types
export interface DatabaseInternshipBatch {
    id: string; // e.g. 'wi26', 'si26'
    title: string;
    program_type: "internship" | "workshop" | "bootcamp";
    year: number;
    prefix: string; // e.g. 'WI26'
    fee_amount: number;
    upi_id?: string;
    qr_code_url?: string;
    domains: string[];
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    created_at?: string;
    updated_at?: string;
}

export type InternshipApplicationStatus = "pending" | "under_review" | "accepted" | "rejected" | "waitlisted";

export interface DatabaseInternshipApplication {
    id: string;
    application_id: string; // e.g. 'VX-WI26-0001'
    batch_id: string;
    full_name: string;
    email: string;
    phone: string;
    whatsapp_number?: string;
    college_name: string;
    degree: string;
    department: string;
    year_of_study: string;
    domain: string;
    resume_url: string;
    linkedin_url?: string;
    github_url?: string;
    status: InternshipApplicationStatus;
    internal_notes?: string;
    created_at?: string;
    updated_at?: string;
    // Joined payment record
    payment?: DatabaseInternshipPayment;
}

export type InternshipPaymentStatus = "pending_verification" | "verified" | "rejected";

export interface DatabaseInternshipPayment {
    id: string;
    application_id: string;
    batch_id: string;
    amount: number;
    transaction_id_utr: string;
    screenshot_url: string;
    payment_status: InternshipPaymentStatus;
    verified_by?: string;
    verified_at?: string;
    rejection_reason?: string;
    created_at?: string;
    updated_at?: string;
}
