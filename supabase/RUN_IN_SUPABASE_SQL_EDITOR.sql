-- ============================================================================
-- VECTONIX WI26 COMPLETE DATABASE MIGRATION SCRIPT
-- Run this in Supabase -> SQL Editor -> Click 'Run'
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INTERNSHIP BATCHES TABLE
CREATE TABLE IF NOT EXISTS public.internship_batches (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    program_type TEXT NOT NULL DEFAULT 'internship',
    year INTEGER NOT NULL DEFAULT 2026,
    prefix TEXT NOT NULL DEFAULT 'WI26',
    fee_amount NUMERIC(10,2) NOT NULL DEFAULT 749.00,
    upi_id TEXT DEFAULT 'vectonixofficial@okhdfcbank',
    qr_code_url TEXT DEFAULT '',
    domains JSONB NOT NULL DEFAULT '["Full Stack Web Development", "AI / Machine Learning", "Data Science & Analytics", "IoT & Embedded Systems", "Cybersecurity", "UI/UX Design"]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date DATE DEFAULT '2026-11-25',
    end_date DATE DEFAULT '2026-12-25',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Winter Internship 2026 (wi26)
INSERT INTO public.internship_batches (id, title, program_type, year, prefix, fee_amount, domains, is_active, start_date, end_date)
VALUES (
    'wi26',
    'Winter Internship 2026',
    'internship',
    2026,
    'WI26',
    749.00,
    '["Full Stack Web Development", "AI / Machine Learning", "Data Science & Analytics", "IoT & Embedded Systems", "Cybersecurity", "UI/UX Design"]'::jsonb,
    true,
    '2026-11-25',
    '2026-12-25'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    prefix = EXCLUDED.prefix,
    fee_amount = EXCLUDED.fee_amount,
    is_active = EXCLUDED.is_active;

-- 2. BATCH SEQUENCES TRACKER
CREATE TABLE IF NOT EXISTS public.batch_sequences (
    batch_id TEXT PRIMARY KEY REFERENCES public.internship_batches(id) ON DELETE CASCADE,
    last_val INTEGER NOT NULL DEFAULT 0
);

INSERT INTO public.batch_sequences (batch_id, last_val)
VALUES ('wi26', 0)
ON CONFLICT (batch_id) DO NOTHING;

-- 3. INTERNSHIP APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.internship_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id TEXT UNIQUE NOT NULL,
    batch_id TEXT NOT NULL REFERENCES public.internship_batches(id) ON DELETE RESTRICT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp_number TEXT,
    college_name TEXT NOT NULL,
    degree TEXT NOT NULL,
    department TEXT NOT NULL,
    year_of_study TEXT NOT NULL,
    domain TEXT NOT NULL,
    resume_url TEXT DEFAULT '',
    linkedin_url TEXT,
    github_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safely add all enhanced columns to internship_applications (idempotent)
ALTER TABLE public.internship_applications 
    ADD COLUMN IF NOT EXISTS application_number TEXT,
    ADD COLUMN IF NOT EXISTS mobile_number TEXT,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS date_of_birth DATE,
    ADD COLUMN IF NOT EXISTS college_id TEXT,
    ADD COLUMN IF NOT EXISTS college_city TEXT,
    ADD COLUMN IF NOT EXISTS college_state TEXT,
    ADD COLUMN IF NOT EXISTS college_selection_type TEXT DEFAULT 'official_directory',
    ADD COLUMN IF NOT EXISTS academic_year TEXT,
    ADD COLUMN IF NOT EXISTS semester TEXT,
    ADD COLUMN IF NOT EXISTS graduation_year TEXT,
    ADD COLUMN IF NOT EXISTS internship_domain TEXT,
    ADD COLUMN IF NOT EXISTS technical_skills TEXT,
    ADD COLUMN IF NOT EXISTS programming_languages TEXT,
    ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
    ADD COLUMN IF NOT EXISTS house_number TEXT,
    ADD COLUMN IF NOT EXISTS street_name TEXT,
    ADD COLUMN IF NOT EXISTS locality TEXT,
    ADD COLUMN IF NOT EXISTS city TEXT,
    ADD COLUMN IF NOT EXISTS district TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS postal_code TEXT,
    ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India',
    ADD COLUMN IF NOT EXISTS package_name TEXT DEFAULT 'Standard',
    ADD COLUMN IF NOT EXISTS package_amount NUMERIC(10,2) DEFAULT 749.00,
    ADD COLUMN IF NOT EXISTS application_status TEXT DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS email_validation_status TEXT DEFAULT 'valid',
    ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS privacy_consent BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;

-- Allow resume_url to be optional/nullable
ALTER TABLE public.internship_applications ALTER COLUMN resume_url DROP NOT NULL;

-- Backfill application_number from application_id where null
UPDATE public.internship_applications 
SET application_number = application_id 
WHERE application_number IS NULL;

-- Backfill internship_domain from domain where null
UPDATE public.internship_applications 
SET internship_domain = domain 
WHERE internship_domain IS NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_internship_apps_batch ON public.internship_applications(batch_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_email ON public.internship_applications(email);
CREATE INDEX IF NOT EXISTS idx_internship_apps_status ON public.internship_applications(status);
CREATE INDEX IF NOT EXISTS idx_internship_apps_app_id ON public.internship_applications(application_id);

-- Enable RLS for internship_applications (Universal access policy matching app authentication)
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Can Submit Applications" ON public.internship_applications;
DROP POLICY IF EXISTS "Public Can Read Own Application" ON public.internship_applications;
DROP POLICY IF EXISTS "Admin Full Access Applications" ON public.internship_applications;
DROP POLICY IF EXISTS "Allow all for internship_applications" ON public.internship_applications;

CREATE POLICY "Allow all for internship_applications" 
ON public.internship_applications 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 4. ATOMIC APPLICATION ID GENERATION TRIGGER: VTX-WI26-0001
CREATE OR REPLACE FUNCTION public.fn_assign_application_id()
RETURNS TRIGGER AS $$
DECLARE
    v_prefix TEXT;
    v_next_val INTEGER;
    v_formatted_id TEXT;
BEGIN
    SELECT prefix INTO v_prefix FROM public.internship_batches WHERE id = NEW.batch_id;
    IF v_prefix IS NULL THEN
        v_prefix := 'WI26';
    END IF;

    INSERT INTO public.batch_sequences (batch_id, last_val)
    VALUES (NEW.batch_id, 1)
    ON CONFLICT (batch_id)
    DO UPDATE SET last_val = public.batch_sequences.last_val + 1
    RETURNING last_val INTO v_next_val;

    v_formatted_id := 'VTX-' || v_prefix || '-' || LPAD(v_next_val::TEXT, 4, '0');
    
    NEW.application_id := v_formatted_id;
    NEW.application_number := v_formatted_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_application_id ON public.internship_applications;
CREATE TRIGGER trg_assign_application_id
    BEFORE INSERT ON public.internship_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.fn_assign_application_id();

-- 5. INDIAN COLLEGES & UNIVERSITIES DIRECTORY TABLE
CREATE TABLE IF NOT EXISTS public.indian_colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT,
    state TEXT NOT NULL,
    category TEXT DEFAULT 'Engineering',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_indian_colleges_name ON public.indian_colleges USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_indian_colleges_state ON public.indian_colleges(state);

ALTER TABLE public.indian_colleges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Colleges" ON public.indian_colleges;
CREATE POLICY "Public Read Colleges" ON public.indian_colleges FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Modify Colleges" ON public.indian_colleges;
CREATE POLICY "Admin Modify Colleges" ON public.indian_colleges FOR ALL USING (auth.role() = 'authenticated');

-- 6. EMAIL MANAGEMENT TABLES
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by TEXT NOT NULL,
    total_recipients INTEGER NOT NULL DEFAULT 0,
    successful_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    target_batch TEXT NOT NULL,
    target_domain TEXT,
    target_package TEXT,
    email_type TEXT NOT NULL DEFAULT 'transactional',
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.email_campaign_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id TEXT NOT NULL REFERENCES public.email_campaigns(campaign_id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    application_id TEXT,
    status TEXT NOT NULL DEFAULT 'sent',
    error_message TEXT,
    provider_message_id TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.email_consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    application_id TEXT,
    transactional_consent BOOLEAN NOT NULL DEFAULT true,
    marketing_consent BOOLEAN NOT NULL DEFAULT false,
    consent_source TEXT NOT NULL,
    opt_out_token TEXT DEFAULT md5(random()::text),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_consent_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin Campaigns" ON public.email_campaigns;
CREATE POLICY "Admin Campaigns" ON public.email_campaigns FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin Logs" ON public.email_campaign_logs;
CREATE POLICY "Admin Logs" ON public.email_campaign_logs FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Public Consent Upsert" ON public.email_consent_records;
CREATE POLICY "Public Consent Upsert" ON public.email_consent_records FOR ALL USING (true);

-- 7. STUDENT DASHBOARD MODULES

-- Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id TEXT NOT NULL DEFAULT 'wi26',
    domain TEXT DEFAULT 'All',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
    reference_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id TEXT NOT NULL DEFAULT 'wi26',
    domain TEXT NOT NULL DEFAULT 'All',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    reference_url TEXT,
    deadline TIMESTAMPTZ,
    max_marks INTEGER NOT NULL DEFAULT 100,
    difficulty TEXT NOT NULL DEFAULT 'Intermediate' CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    application_id TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    description TEXT,
    github_url TEXT,
    project_url TEXT,
    file_url TEXT,
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Not Started', 'In Progress', 'Submitted', 'Under Review', 'Completed', 'Needs Revision', 'Overdue')),
    marks INTEGER,
    mentor_feedback TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_submissions_app_id ON public.assignment_submissions(application_id);

-- Student Projects Workspace
CREATE TABLE IF NOT EXISTS public.student_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id TEXT UNIQUE NOT NULL,
    batch_id TEXT NOT NULL DEFAULT 'wi26',
    domain TEXT NOT NULL,
    project_title TEXT NOT NULL DEFAULT 'Capstone Industrial Project',
    description TEXT DEFAULT 'Build an industry-grade application applying domain principles and best practices.',
    github_url TEXT,
    project_url TEXT,
    status TEXT NOT NULL DEFAULT 'Planning' CHECK (status IN ('Planning', 'In Development', 'Testing', 'Completed', 'Needs Review')),
    progress_percent INTEGER NOT NULL DEFAULT 15,
    milestones JSONB DEFAULT '[
        {"title": "Project Proposal & Architecture Design", "completed": true},
        {"title": "Core Module & API Implementation", "completed": false},
        {"title": "Integration, Testing & UI Polish", "completed": false},
        {"title": "Final Deployment & Documentation", "completed": false}
    ]'::jsonb,
    mentor_feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Weekly Reviews
CREATE TABLE IF NOT EXISTS public.weekly_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id TEXT NOT NULL DEFAULT 'wi26',
    domain TEXT NOT NULL DEFAULT 'All',
    review_date TIMESTAMPTZ NOT NULL,
    topic TEXT NOT NULL,
    assigned_mentor TEXT NOT NULL DEFAULT 'Senior Vectonix Engineering Team',
    meeting_link TEXT DEFAULT 'https://meet.google.com/vectonix-wi26',
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Completed', 'Rescheduled')),
    mentor_comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Learning Resources
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id TEXT NOT NULL DEFAULT 'wi26',
    domain TEXT NOT NULL DEFAULT 'All',
    title TEXT NOT NULL,
    resource_type TEXT NOT NULL DEFAULT 'Guide' CHECK (resource_type IN ('Video', 'Documentation', 'Repository', 'Guide', 'Cheatsheet')),
    url TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Technical Support', 'Assignment Help', 'Certificate Inquiry', 'Kit / Delivery Status', 'General Inquiry')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    admin_response TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Enable RLS on Student Modules
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public Read Assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Student Submissions Manage" ON public.assignment_submissions FOR ALL USING (true);
CREATE POLICY "Student Projects Manage" ON public.student_projects FOR ALL USING (true);
CREATE POLICY "Public Read Reviews" ON public.weekly_reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Resources" ON public.learning_resources FOR SELECT USING (true);
CREATE POLICY "Student Support Tickets" ON public.support_tickets FOR ALL USING (true);

-- 8. RELOAD SCHEMA CACHE IMMEDIATELY
NOTIFY pgrst, 'reload schema';

