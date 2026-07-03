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
