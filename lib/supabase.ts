import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://asrnrvsfbogrgspixyvg.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcm5ydnNmYm9ncmdzcGl4eXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDU3NTMsImV4cCI6MjA5ODU4MTc1M30.Qb-lgMU3xRRomdrlDeUCtpDoiK82YNjAlwbr0c-kYw0";

export const isSupabaseConfigured = true;

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
export type InternshipPackageType = "Standard" | "Premium";
export type GenderType = "Male" | "Female" | "Other" | "Prefer not to say";

export interface DatabaseInternshipApplication {
    id: string;
    application_id: string; // e.g. 'VTX-WI26-0001'
    application_number?: string;
    batch_id: string;
    full_name: string;
    email: string;
    phone: string;
    mobile_number?: string;
    whatsapp_number?: string;
    gender: GenderType;
    date_of_birth?: string | null;
    // College fields
    college_name: string;
    college_id?: string | null;
    college_city?: string | null;
    college_state?: string | null;
    college_selection_type?: "official_directory" | "manual";
    // Academic fields
    degree: string;
    department: string;
    year_of_study: string;
    academic_year?: string | null;
    semester?: string | null;
    graduation_year?: string | null;
    // Skills & Profiles
    domain: string; // e.g. "Full Stack Development"
    internship_domain?: string;
    technical_skills?: string | null;
    programming_languages?: string | null;
    resume_url?: string | null;
    linkedin_url?: string | null;
    github_url?: string | null;
    portfolio_url?: string | null;
    // Address fields
    house_number: string;
    street_name: string;
    locality: string;
    city: string;
    district: string;
    state: string;
    postal_code: string;
    country: string;
    // Package selection (No payment gateway)
    package_name: InternshipPackageType;
    package_amount: number; // 749 or 999
    // Status & Consents
    status: InternshipApplicationStatus;
    application_status?: InternshipApplicationStatus;
    terms_accepted: boolean;
    privacy_consent: boolean;
    marketing_consent: boolean;
    internal_notes?: string | null;
    created_at?: string;
    updated_at?: string;
}

// Bulk Email Management Types
export interface DatabaseEmailCampaign {
    id: string;
    campaign_id: string;
    subject: string;
    message: string;
    created_by: string;
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    status: "draft" | "queued" | "sending" | "completed" | "failed";
    filter_criteria?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}

export interface DatabaseEmailRecipient {
    id: string;
    campaign_id: string;
    application_id?: string;
    recipient_email: string;
    recipient_name?: string;
    delivery_status: "queued" | "sent" | "failed" | "bounced";
    provider_message_id?: string;
    sent_at?: string;
    error_message?: string;
    created_at?: string;
}

export interface DatabaseEmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category?: string;
    is_system?: boolean;
    created_at?: string;
    updated_at?: string;
}
