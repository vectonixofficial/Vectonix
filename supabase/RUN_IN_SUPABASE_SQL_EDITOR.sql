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

ALTER TABLE public.internship_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Batches" ON public.internship_batches;
CREATE POLICY "Public Read Batches" ON public.internship_batches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Manage Batches" ON public.internship_batches;
CREATE POLICY "Admin Manage Batches" ON public.internship_batches FOR ALL USING (true);

-- 2. BATCH SEQUENCES TRACKER
CREATE TABLE IF NOT EXISTS public.batch_sequences (
    batch_id TEXT PRIMARY KEY REFERENCES public.internship_batches(id) ON DELETE CASCADE,
    last_val INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.batch_sequences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Manage Sequences" ON public.batch_sequences;
CREATE POLICY "Public Manage Sequences" ON public.batch_sequences FOR ALL USING (true);

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

-- Email Recipients Log (Tracks acknowledgements and dispatches)
CREATE TABLE IF NOT EXISTS public.email_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    application_id TEXT,
    delivery_status TEXT NOT NULL DEFAULT 'queued',
    provider_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin Campaigns" ON public.email_campaigns;
CREATE POLICY "Admin Campaigns" ON public.email_campaigns FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Admin Logs" ON public.email_campaign_logs;
CREATE POLICY "Admin Logs" ON public.email_campaign_logs FOR ALL USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Public Consent Upsert" ON public.email_consent_records;
CREATE POLICY "Public Consent Upsert" ON public.email_consent_records FOR ALL USING (true);
DROP POLICY IF EXISTS "Public Manage Email Recipients" ON public.email_recipients;
CREATE POLICY "Public Manage Email Recipients" ON public.email_recipients FOR ALL USING (true);

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

DROP POLICY IF EXISTS "Public Read Announcements" ON public.announcements;
DROP POLICY IF EXISTS "Public Read Assignments" ON public.assignments;
DROP POLICY IF EXISTS "Student Submissions Manage" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Student Projects Manage" ON public.student_projects;
DROP POLICY IF EXISTS "Public Read Reviews" ON public.weekly_reviews;
DROP POLICY IF EXISTS "Public Read Resources" ON public.learning_resources;
DROP POLICY IF EXISTS "Student Support Tickets" ON public.support_tickets;

CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public Read Assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Student Submissions Manage" ON public.assignment_submissions FOR ALL USING (true);
CREATE POLICY "Student Projects Manage" ON public.student_projects FOR ALL USING (true);
CREATE POLICY "Public Read Reviews" ON public.weekly_reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Resources" ON public.learning_resources FOR SELECT USING (true);
CREATE POLICY "Student Support Tickets" ON public.support_tickets FOR ALL USING (true);

-- 8. RELOAD SCHEMA CACHE IMMEDIATELY
NOTIFY pgrst, 'reload schema';



-- ============================================================================
-- VECTONIX WI26 - PHASE 1: DATABASE & SECURITY ARCHITECTURE MIGRATION
-- Project Bank, Student Projects, Milestone Submissions, Mentors, RLS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROJECT TEMPLATES (PROJECT BANK)
CREATE TABLE IF NOT EXISTS public.project_templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    domain TEXT NOT NULL,
    short_description TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
    requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    expected_features JSONB NOT NULL DEFAULT '[]'::jsonb,
    tech_stack JSONB NOT NULL DEFAULT '[]'::jsonb,
    difficulty_level TEXT NOT NULL DEFAULT 'Intermediate' CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
    expected_deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
    duration_weeks INTEGER NOT NULL DEFAULT 4,
    evaluation_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    reference_materials JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. MENTORS TABLE
CREATE TABLE IF NOT EXISTS public.mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    domains JSONB NOT NULL DEFAULT '["Full Stack Development"]'::jsonb,
    designation TEXT DEFAULT 'Lead Technical Mentor',
    bio TEXT,
    max_students INTEGER DEFAULT 25,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Initial Core Mentors
INSERT INTO public.mentors (id, name, email, domains, designation, max_students)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Senior Full Stack Mentor', 'mentor.fullstack@vectonix.in', '["Full Stack Development"]'::jsonb, 'Lead Software Architect', 30),
    ('22222222-2222-2222-2222-222222222222', 'Cybersecurity Specialist', 'mentor.security@vectonix.in', '["Cybersecurity"]'::jsonb, 'Principal Security Consultant', 30),
    ('33333333-3333-3333-3333-333333333333', 'Digital Marketing Director', 'mentor.marketing@vectonix.in', '["Digital Marketing"]'::jsonb, 'Growth Marketing Strategist', 30)
ON CONFLICT (email) DO NOTHING;

-- 3. ENHANCE STUDENT PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.student_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id TEXT NOT NULL,
    batch_id TEXT NOT NULL DEFAULT 'wi26',
    domain TEXT NOT NULL,
    project_template_id TEXT REFERENCES public.project_templates(id) ON DELETE SET NULL,
    project_title TEXT NOT NULL,
    description TEXT,
    assigned_mentor_id UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
    assigned_mentor_name TEXT,
    start_date DATE DEFAULT '2026-11-25',
    deadline DATE DEFAULT '2026-12-25',
    personalized_instructions TEXT,
    github_url TEXT,
    project_url TEXT,
    documentation_url TEXT,
    presentation_url TEXT,
    evidence_url TEXT,
    status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Submitted', 'Under Review', 'Revision Required', 'Approved', 'Completed', 'Overdue')),
    progress_percent INTEGER NOT NULL DEFAULT 0,
    current_milestone INTEGER NOT NULL DEFAULT 1,
    milestones JSONB DEFAULT '[]'::jsonb,
    mentor_feedback TEXT,
    evaluation_marks NUMERIC(5,2) DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safely add columns if student_projects already existed
ALTER TABLE public.student_projects
    ADD COLUMN IF NOT EXISTS project_template_id TEXT,
    ADD COLUMN IF NOT EXISTS assigned_mentor_id UUID,
    ADD COLUMN IF NOT EXISTS assigned_mentor_name TEXT,
    ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT '2026-11-25',
    ADD COLUMN IF NOT EXISTS deadline DATE DEFAULT '2026-12-25',
    ADD COLUMN IF NOT EXISTS personalized_instructions TEXT,
    ADD COLUMN IF NOT EXISTS documentation_url TEXT,
    ADD COLUMN IF NOT EXISTS presentation_url TEXT,
    ADD COLUMN IF NOT EXISTS evidence_url TEXT,
    ADD COLUMN IF NOT EXISTS current_milestone INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS evaluation_marks NUMERIC(5,2);

-- Update status check constraint to support both existing and new statuses
ALTER TABLE public.student_projects DROP CONSTRAINT IF EXISTS student_projects_status_check;
ALTER TABLE public.student_projects ADD CONSTRAINT student_projects_status_check CHECK (status IN ('Not Started', 'In Progress', 'Submitted', 'Under Review', 'Revision Required', 'Approved', 'Completed', 'Overdue', 'Planning', 'In Development', 'Testing', 'Needs Review'));

-- 4. STUDENT MILESTONE SUBMISSIONS TABLE (URL-based submissions)
CREATE TABLE IF NOT EXISTS public.student_milestone_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_project_id UUID REFERENCES public.student_projects(id) ON DELETE CASCADE,
    application_id TEXT NOT NULL,
    milestone_index INTEGER NOT NULL CHECK (milestone_index BETWEEN 1 AND 4),
    milestone_title TEXT NOT NULL,
    submission_urls JSONB DEFAULT '[]'::jsonb,
    github_url TEXT,
    demo_url TEXT,
    documentation_url TEXT,
    evidence_url TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Revision Required', 'Approved')),
    mentor_feedback TEXT,
    marks NUMERIC(5,2) DEFAULT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 5. MENTOR ALLOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.mentor_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
    application_id TEXT NOT NULL,
    batch_id TEXT NOT NULL DEFAULT 'wi26',
    domain TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ENHANCE ASSIGNMENTS TABLE
ALTER TABLE public.assignments
    ADD COLUMN IF NOT EXISTS target_type TEXT DEFAULT 'batch' CHECK (target_type IN ('batch', 'domain', 'individual')),
    ADD COLUMN IF NOT EXISTS target_id TEXT DEFAULT 'wi26',
    ADD COLUMN IF NOT EXISTS allow_resubmission BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS reference_attachments JSONB DEFAULT '[]'::jsonb;

-- 7. ENABLE ROW LEVEL SECURITY & DEFINE POLICIES
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_milestone_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Project Templates" ON public.project_templates;
CREATE POLICY "Public Read Project Templates" ON public.project_templates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Manage Project Templates" ON public.project_templates;
CREATE POLICY "Admin Manage Project Templates" ON public.project_templates FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read Mentors" ON public.mentors;
CREATE POLICY "Public Read Mentors" ON public.mentors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Manage Mentors" ON public.mentors;
CREATE POLICY "Admin Manage Mentors" ON public.mentors FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Manage Student Projects" ON public.student_projects;
CREATE POLICY "Public Manage Student Projects" ON public.student_projects FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Manage Milestone Submissions" ON public.student_milestone_submissions;
CREATE POLICY "Public Manage Milestone Submissions" ON public.student_milestone_submissions FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Manage Mentor Allocations" ON public.mentor_allocations;
CREATE POLICY "Public Manage Mentor Allocations" ON public.mentor_allocations FOR ALL USING (true);

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_project_templates_domain ON public.project_templates(domain);
CREATE INDEX IF NOT EXISTS idx_student_projects_app_id ON public.student_projects(application_id);
CREATE INDEX IF NOT EXISTS idx_student_projects_batch ON public.student_projects(batch_id);
CREATE INDEX IF NOT EXISTS idx_milestone_subs_project ON public.student_milestone_submissions(student_project_id);
CREATE INDEX IF NOT EXISTS idx_milestone_subs_app ON public.student_milestone_submissions(application_id);
CREATE INDEX IF NOT EXISTS idx_mentor_alloc_app ON public.mentor_allocations(application_id);

-- 8. SEED THE INITIAL 18 PROJECT TEMPLATES

-- FULL STACK DEVELOPMENT (6 Projects)
INSERT INTO public.project_templates (id, title, domain, short_description, problem_statement, objectives, requirements, expected_features, tech_stack, difficulty_level, expected_deliverables, duration_weeks, evaluation_criteria, reference_materials)
VALUES
(
    'vtx-fs-01',
    'Smart Campus Lost & Found Platform',
    'Full Stack Development',
    'Centralized portal for university students and staff to report, track, and reclaim lost items with verified claim matching.',
    'Campuses experience thousands of lost items each semester with zero accountability, leading to chaos in security offices and lost personal belongings.',
    '["Build a responsive full-stack platform for claiming and reporting lost goods", "Implement image attachment and categorization algorithms", "Enable secure claim verification through student ID authentication"]'::jsonb,
    '["Responsive UI for desktop and mobile", "Automated email notifications when matching item is reported", "Admin validation portal for security desks"]'::jsonb,
    '["Item reporting with category, location, and photos", "Smart keyword search and filter by date/location", "Two-party chat or verification claim workflow", "Security officer hand-over confirmation PIN"]'::jsonb,
    '["Next.js / React", "Tailwind CSS", "Node.js", "PostgreSQL / Supabase", "Nodemailer"]'::jsonb,
    'Intermediate',
    '["Public repository with clean Git commit history", "Live working deployment URL (e.g. Vercel)", "System architecture documentation and API rubric"]'::jsonb,
    4,
    '["UI/UX responsiveness (25%)", "Database schema design & relations (25%)", "Authentication & claim security (25%)", "Code quality & documentation (25%)"]'::jsonb,
    '["https://nextjs.org/docs", "https://supabase.com/docs"]'::jsonb
),
(
    'vtx-fs-02',
    'Smart Queue & Appointment Management',
    'Full Stack Development',
    'Virtual token issuing and real-time appointment booking system to eliminate physical waiting lines in clinics and service centers.',
    'Overcrowded reception areas and physical waiting queues cause extreme time loss, customer frustration, and inefficient staff scheduling.',
    '["Develop a real-time virtual queueing web application", "Provide estimated wait-time calculation", "Enable SMS/Email notifications when user is 3rd in queue"]'::jsonb,
    '["Real-time queue board update", "Instant token booking without mandatory complex app downloads", "Admin counter calling interface"]'::jsonb,
    '["Live digital display board for waiting rooms", "QR-code ticket scanner on arrival", "Counter management interface for service staff", "Average wait time and throughput analytics"]'::jsonb,
    '["Next.js", "TypeScript", "Tailwind CSS", "Supabase Realtime / WebSockets", "PostgreSQL"]'::jsonb,
    'Intermediate',
    '["Git repository", "Live deployment URL", "Demonstration video walkthrough link"]'::jsonb,
    4,
    '["Real-time queue reactivity (30%)", "Counter interface usability (25%)", "Database integrity (25%)", "Architecture & deployment (20%)"]'::jsonb,
    '["https://supabase.com/docs/guides/realtime"]'::jsonb
),
(
    'vtx-fs-03',
    'Student Freelance Marketplace',
    'Full Stack Development',
    'Campus-exclusive freelance marketplace connecting student developers, designers, and writers with local businesses and peer projects.',
    'Students struggle to build verified portfolios and find legitimate paid gigs, while campus startups cannot afford agency rates.',
    '["Design a trust-backed marketplace with verified college email authentication", "Implement project listing, proposals, and milestone milestone escrow tracking", "Provide review and rating mechanisms"]'::jsonb,
    '["Role-based portals (Client vs Freelancer)", "Proposal submission with portfolio attachments", "Milestone approval flow"]'::jsonb,
    '["Service gig catalog with search and filters", "Bidding and proposal system", "Deliverable submission and client feedback", "Student portfolio builder with verified review badges"]'::jsonb,
    '["React / Next.js", "Node.js", "Tailwind CSS", "PostgreSQL", "Supabase"]'::jsonb,
    'Advanced',
    '["Source code repository", "Hosted production demo", "Database entity-relationship diagram"]'::jsonb,
    4,
    '["Marketplace workflow completeness (30%)", "Role access control (25%)", "Data validation & security (25%)", "Code modularity (20%)"]'::jsonb,
    '["https://react.dev", "https://tailwindcss.com"]'::jsonb
),
(
    'vtx-fs-04',
    'Smart Expense & Budget Tracker',
    'Full Stack Development',
    'Collaborative financial dashboard for college roommates and student groups to track shared expenses, recurring splits, and budgets.',
    'Splitting apartment rent, groceries, and team projects leads to awkward calculations, unpaid debts, and zero long-term savings visibility.',
    '["Deliver an intuitive expense splitting engine", "Implement automated balance calculation and settlement paths", "Provide monthly spending analytics charts"]'::jsonb,
    '["Group creation with invite codes", "Multi-currency support with INR default", "Visual category breakdown charts"]'::jsonb,
    '["Expense logging with unequal or percentage split options", "Who owes whom optimization algorithm", "Monthly budget threshold alerts", "CSV/PDF expense export"]'::jsonb,
    '["Next.js", "TypeScript", "Tailwind CSS", "Chart.js / Recharts", "PostgreSQL"]'::jsonb,
    'Beginner',
    '["GitHub repository", "Live URL on Vercel/Netlify", "Technical architecture README"]'::jsonb,
    4,
    '["Split calculation accuracy (30%)", "Data visualization & charts (25%)", "Mobile responsiveness (25%)", "Code cleanliness (20%)"]'::jsonb,
    '["https://recharts.org"]'::jsonb
),
(
    'vtx-fs-05',
    'QR-Based Event Entry Management',
    'Full Stack Development',
    'Rapid attendee registration and tamper-proof QR code check-in platform for college symposiums, hackathons, and corporate workshops.',
    'Manual paper attendance or spreadsheet lookup at event entrance causes massive check-in delays and duplicate ticket fraud.',
    '["Generate cryptographically signed QR admission passes", "Provide real-time camera scanning verification interface", "Prevent duplicate check-in reuse"]'::jsonb,
    '["Sub-second camera QR decoding in browser", "Offline verification resilience", "Live attendance counter dashboard"]'::jsonb,
    '["Event registration with dynamic ticket tiering", "Instant QR pass email dispatch with calendar invite", "Organizer camera scanner check-in webapp", "Attendee demographics and peak arrival analytics"]'::jsonb,
    '["Next.js", "Tailwind CSS", "jsQR / html5-qrcode", "Supabase", "Nodemailer"]'::jsonb,
    'Intermediate',
    '["Git repository link", "Live scanner demo URL", "Event organizer guide PDF"]'::jsonb,
    4,
    '["Scanner performance & speed (30%)", "Ticket tamper prevention (25%)", "Email dispatch reliability (25%)", "UI/UX polish (20%)"]'::jsonb,
    '["https://github.com/mebjas/html5-qrcode"]'::jsonb
),
(
    'vtx-fs-06',
    'Local Service Booking Platform',
    'Full Stack Development',
    'Hyperlocal marketplace connecting neighborhood residents with vetted service providers (electricians, appliance repair, tutoring).',
    'Finding reliable local home services involves word-of-mouth uncertainty, lack of transparent pricing, and zero schedule predictability.',
    '["Create a clean booking portal with service catalog and transparent rate cards", "Implement slot booking calendar with provider availability", "Enable order tracking and status updates"]'::jsonb,
    '["Location-filtered service discovery", "Time-slot selection with conflict prevention", "Booking confirmation and provider acceptance flow"]'::jsonb,
    '["Service catalog with ratings and transparent pricing", "Multi-step booking wizard with address picker", "Provider order management dashboard", "Customer feedback and review system"]'::jsonb,
    '["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Supabase"]'::jsonb,
    'Intermediate',
    '["Public GitHub repository", "Live web deployment URL", "Database schema and documentation"]'::jsonb,
    4,
    '["Booking calendar logic (30%)", "Responsive mobile layouts (25%)", "Backend validation (25%)", "Documentation & testing (20%)"]'::jsonb,
    '["https://nextjs.org/docs/app"]'::jsonb
),

-- CYBERSECURITY (6 Projects)
(
    'vtx-cs-01',
    'Phishing URL Detection System',
    'Cybersecurity',
    'Automated threat intelligence tool to analyze URLs, detect credential harvesting schemes, and flag deceptive domains.',
    'Phishing accounts for over 80% of reported security incidents. Users click malicious links in emails and SMS without awareness of subtle domain spoofing.',
    '["Analyze URLs for lexical, structural, and domain age anomalies", "Detect punycode attacks, typosquatting, and zero-day redirects", "Output actionable security risk scores"]'::jsonb,
    '["Lexical analysis engine (length, special characters, entropy)", "WHOIS & DNS reputation lookup integration", "Clean web UI with high/medium/low risk indicators"]'::jsonb,
    '["Single and bulk URL scanning input", "Domain age and SSL certificate verification check", "Heuristic anomaly score with explanation breakdown", "API endpoint for programmatic URL reputation lookups"]'::jsonb,
    '["Python / FastAPI or Node.js", "Next.js", "WHOIS/DNS APIs", "Tailwind CSS"]'::jsonb,
    'Intermediate',
    '["GitHub repository with source code", "Live detection dashboard link", "Technical vulnerability report detailing detection metrics"]'::jsonb,
    4,
    '["Detection heuristic accuracy (35%)", "Analysis report clarity (25%)", "Tool interface usability (20%)", "Documentation & test dataset (20%)"]'::jsonb,
    '["https://owasp.org", "https://urlhaus.abuse.ch"]'::jsonb
),
(
    'vtx-cs-02',
    'Password Security Analyzer',
    'Cybersecurity',
    'Enterprise-grade password hygiene tool evaluating entropy, dictionary patterns, credential stuffing risks, and breached database checks.',
    'Users repeatedly reuse predictable patterns and weak passwords across critical accounts, leaving organizations open to credential-stuffing attacks.',
    '["Calculate true cryptographic entropy of passwords", "Implement k-Anonymity lookup against known breach databases", "Provide real-time cracking time estimates and remediation suggestions"]'::jsonb,
    '["Zero transmission of plaintext passwords (k-Anonymity SHA-1 model)", "Detection of common dictionary substitutions (l33t speak, keyboard walks)", "Password generator with custom complexity constraints"]'::jsonb,
    '["Live interactive strength meter with visual entropy breakdown", "HaveIBeenPwned API integration via k-Anonymity hash ranges", "Brute-force crack time estimator across GPU tiers", "Enterprise password policy validator simulator"]'::jsonb,
    '["JavaScript / TypeScript", "Web Crypto API", "Next.js", "Tailwind CSS"]'::jsonb,
    'Beginner',
    '["GitHub repository", "Live interactive analyzer URL", "Password policy guidelines PDF report"]'::jsonb,
    4,
    '["k-Anonymity privacy compliance (35%)", "Entropy calculation accuracy (25%)", "UI feedback & suggestions (20%)", "Code security practices (20%)"]'::jsonb,
    '["https://haveibeenpwned.com/API/v3"]'::jsonb
),
(
    'vtx-cs-03',
    'Web Application Security Checker',
    'Cybersecurity',
    'Automated lightweight security scanner that inspects web endpoints for HTTP security headers, CORS misconfigurations, and cookie flags.',
    'Thousands of production web servers omit standard security headers (CSP, HSTS, X-Frame-Options), leaving them vulnerable to clickjacking and XSS.',
    '["Perform non-invasive passive security audits on target URLs", "Validate HTTP security headers against OWASP guidelines", "Inspect TLS/SSL versions and cipher strength"]'::jsonb,
    '["Fast passive scanner engine", "Clear remediation instructions for missing headers", "Exportable security audit report"]'::jsonb,
    '["Header compliance audit (HSTS, CSP, X-Content-Type, X-Frame-Options)", "CORS wildcard and origin reflection check", "Cookie security attributes check (Secure, HttpOnly, SameSite)", "Audit summary score (A+ to F grade) with code fix snippets"]'::jsonb,
    '["Node.js / Express", "Next.js", "Tailwind CSS", "Axios"]'::jsonb,
    'Intermediate',
    '["Source code repository", "Live scanner deployment link", "Sample audit benchmark report of 5 live websites"]'::jsonb,
    4,
    '["Audit accuracy against OWASP headers (35%)", "Report grading algorithm (25%)", "Remediation quality (20%)", "Application performance (20%)"]'::jsonb,
    '["https://owasp.org/www-project-secure-headers"]'::jsonb
),
(
    'vtx-cs-04',
    'File Integrity Monitoring System',
    'Cybersecurity',
    'Host-based integrity monitoring tool that tracks unauthorized modifications, creations, and deletions in critical system files.',
    'Advanced persistent threats and ransomware quietly modify system binaries, config files, and web roots before executing attacks.',
    '["Compute baseline cryptographic hashes (SHA-256) of critical directories", "Continuously or periodically verify file state against baseline", "Trigger real-time security alerts upon detected changes"]'::jsonb,
    '["Recursive directory hashing with baseline database", "Diff output detailing exact byte or timestamp shifts", "Alert dispatch via webhook or email"]'::jsonb,
    '["Baseline hash generation CLI / web dashboard", "Automated scan runner with change detection log", "Privilege change and ownership monitoring", "Incident timeline report with hash mismatches"]'::jsonb,
    '["Python / Node.js", "Crypto Library", "SQLite / JSON storage", "Tailwind UI"]'::jsonb,
    'Intermediate',
    '["GitHub repository link", "Demonstration video walkthrough", "Security incident response runbook"]'::jsonb,
    4,
    '["Integrity detection speed & accuracy (35%)", "Alerting mechanism (25%)", "Zero false-positive handling (20%)", "Documentation & testing (20%)"]'::jsonb,
    '["https://csrc.nist.gov/publications/detail/sp/800-92/final"]'::jsonb
),
(
    'vtx-cs-05',
    'Mini SIEM – Security Log Monitoring System',
    'Cybersecurity',
    'Centralized log analysis and visualization engine to ingest server access logs, detect brute-force patterns, and alert administrators.',
    'Security teams drown in gigabytes of unstructured logs without correlation tools, missing active intrusion indicators until it is too late.',
    '["Parse Nginx/Apache/SSH authentication logs into structured schemas", "Correlate failed login attempts to detect distributed brute-force attacks", "Visualize attack origins and frequency on an interactive map/chart dashboard"]'::jsonb,
    '["Log ingestion pipeline for standard syslog and HTTP access formats", "Rule-based threshold alerting (e.g. >5 failed logins in 60s)", "Searchable log explorer with severity filters"]'::jsonb,
    '["Log file upload and live streaming parser", "Threat detection alerts with source IP and user agent", "Geographic IP origin lookup and top attacker analytics", "Incident report generator with attack timeframe"]'::jsonb,
    '["Next.js", "Node.js", "Tailwind CSS", "Recharts / Leaflet", "PostgreSQL"]'::jsonb,
    'Advanced',
    '["GitHub repository", "Live SIEM dashboard demo link", "Log attack simulation test dataset"]'::jsonb,
    4,
    '["Rule engine detection logic (35%)", "Data visualization & parsing (25%)", "Search & filtering speed (20%)", "Security reporting (20%)"]'::jsonb,
    '["https://attack.mitre.org"]'::jsonb
),
(
    'vtx-cs-06',
    'Email Spam & Scam Detection Tool',
    'Cybersecurity',
    'Intelligent email header and content security inspector identifying spoofing, SPF/DKIM/DMARC failures, and advance-fee scam language.',
    'Spear-phishing and business email compromise trick employees by spoofing executive domains and employing urgent manipulative phrasing.',
    '["Parse raw RFC 822 email headers and message bodies", "Validate sender authenticity via SPF, DKIM, and DMARC verification records", "Flag high-risk scam triggers, urgent call-to-actions, and suspicious links"]'::jsonb,
    '["Raw `.eml` and text paste input support", "Authentication header breakdown with pass/fail badges", "Scam probability score with highlighted risk sentences"]'::jsonb,
    '["Email header parser extracting Return-Path, Received, Message-ID", "SPF, DKIM, DMARC alignment status checker", "NLP/keyword heuristic scanner for urgency, gift cards, and wire requests", "Educational explanation of detected indicators for non-technical users"]'::jsonb,
    '["TypeScript / Next.js", "Tailwind CSS", "DNS lookup engine", "Nodemailer parser"]'::jsonb,
    'Intermediate',
    '["Public repository link", "Live web analyzer demo link", "Email threat investigation case study"]'::jsonb,
    4,
    '["Header authentication accuracy (35%)", "Heuristic scam scoring (25%)", "UI presentation & explanation (20%)", "Documentation & test emails (20%)"]'::jsonb,
    '["https://dmarc.org"]'::jsonb
),

-- DIGITAL MARKETING (6 Projects)
(
    'vtx-dm-01',
    'Complete Digital Growth Campaign for Vectonix',
    'Digital Marketing',
    'Multi-channel growth strategy and execution plan to scale Vectonix brand visibility, product signups, and student community engagement.',
    'Early-stage tech startups struggle with low brand recall, high customer acquisition costs, and fragmented marketing across social channels.',
    '["Build a cohesive 30-day multi-channel digital growth roadmap", "Execute content calendars for LinkedIn, Instagram, and Twitter/X", "Design high-converting landing page mockups and ad copy"]'::jsonb,
    '["Target audience persona segmentation", "30-day content calendar with copy and visual briefs", "Paid and organic distribution channel strategy", "KPI dashboard and growth projection model"]'::jsonb,
    '["Audience persona and positioning matrix", "Comprehensive 30-day content calendar with creative copy", "Ad campaign briefs for Meta & Google Search Ads", "Measurement framework tracking CAC, LTV, and conversion rates"]'::jsonb,
    '["Notion / Google Docs", "Canva / Figma", "Meta Ads Manager", "Google Analytics 4"]'::jsonb,
    'Intermediate',
    '["Comprehensive Strategy Deck (Google Slides / PDF)", "Live Content Calendar Link (Notion/Sheets)", "Ad Creatives & Copy Portfolio Link"]'::jsonb,
    4,
    '["Strategic coherence & positioning (30%)", "Copywriting & creative quality (30%)", "Measurement & KPI rigor (25%)", "Presentation polish (15%)"]'::jsonb,
    '["https://hubspot.com/marketing-resources"]'::jsonb
),
(
    'vtx-dm-02',
    'SEO Growth & Website Optimization',
    'Digital Marketing',
    'End-to-end technical, on-page, and off-page search engine optimization blueprint to rank Vectonix for high-intent keywords.',
    'Websites with great products remain invisible on Google because of unindexed pages, missing schema markup, and lack of keyword targeting.',
    '["Perform comprehensive keyword research for tech internships and software solutions", "Conduct a full technical and on-page SEO audit of the current website", "Produce optimized content blueprints and backlink acquisition plans"]'::jsonb,
    '["Keyword research report with search volume and intent classification", "Technical SEO audit addressing crawlability, speed, and meta tags", "Content cluster recommendations and backlink outreach plan"]'::jsonb,
    '["Keyword master spreadsheet (Top 100 keywords categorized)", "Technical audit spreadsheet with prioritized recommendations", "Two fully drafted, SEO-optimized pillar blog articles", "Backlink outreach prospect list with customized email templates"]'::jsonb,
    '["Google Search Console", "Ahrefs / SEMrush / Ubersuggest", "Google Docs", "Screaming Frog"]'::jsonb,
    'Intermediate',
    '["Live SEO Audit Report (Google Sheets/Docs link)", "2 Pillar Articles (Google Docs / Medium links)", "Outreach Backlink Strategy Portfolio link"]'::jsonb,
    4,
    '["Keyword research depth & relevance (35%)", "Technical recommendations feasibility (25%)", "Content quality & optimization (25%)", "Reporting clarity (15%)"]'::jsonb,
    '["https://developers.google.com/search/docs"]'::jsonb
),
(
    'vtx-dm-03',
    'Social Media Automation & Content Planner',
    'Digital Marketing',
    'Data-driven social media content planning, visual creative system, and scheduling workflow to establish industry thought leadership.',
    'Inconsistent posting schedules, generic stock visuals, and zero audience engagement lead to stagnant organic reach on social media.',
    '["Formulate distinct brand voices for LinkedIn (B2B/Tech) and Instagram (Student/Culture)", "Design a modular visual template system in Figma/Canva", "Develop a 30-day scheduled publishing calendar with engagement strategies"]'::jsonb,
    '["Brand voice and design guidelines", "20 polished graphic/carousel post concepts", "Hashtag strategy and influencer collaboration outreach plan"]'::jsonb,
    '["Brand social media styleguide and tone manual", "20 production-ready social media posts with copy and hashtags", "Story and Reel video concept storyboards", "Engagement playbooks for handling comments and community DMs"]'::jsonb,
    '["Figma / Canva", "Buffer / Hootsuite", "LinkedIn Analytics", "Instagram Creator Studio"]'::jsonb,
    'Beginner',
    '["Figma / Canva Design Portfolio Link", "30-Day Content Spreadsheet Link", "Social Media Strategy Playbook PDF Link"]'::jsonb,
    4,
    '["Visual design quality & brand alignment (35%)", "Copywriting engagement & hooks (30%)", "Calendar structure & consistency (20%)", "Strategy presentation (15%)"]'::jsonb,
    '["https://sproutsocial.com/insights"]'::jsonb
),
(
    'vtx-dm-04',
    'Competitor Intelligence & Brand Analysis',
    'Digital Marketing',
    'In-depth competitive benchmarking of leading EdTech and tech service platforms to carve out Vectonix unique market positioning.',
    'Startups often launch generic marketing campaigns that mimic established competitors without identifying underserved market niches.',
    '["Analyze 5 direct and indirect competitors across product, pricing, and messaging", "Deconstruct competitor ad creatives, funnel hooks, and customer reviews", "Formulate a differentiated value proposition and counter-positioning strategy"]'::jsonb,
    '["Competitor SWOT and feature comparison matrix", "Ad creative tear-down analyzing messaging and offers", "Differentiated positioning statement and battlecard"]'::jsonb,
    '["Competitor analysis matrix comparing 5 industry players", "Ad library breakdown dissecting competitor active paid ads", "Customer sentiment and review analysis identifying pain points", "Vectonix competitive advantage blueprint and value propositions"]'::jsonb,
    '["Meta Ad Library", "Similarweb", "Google Sheets", "Canva / Slides"]'::jsonb,
    'Intermediate',
    '["Competitive Benchmarking Deck Link (Google Slides)", "Ad Teardown Portfolio Link", "Strategic Positioning Executive Summary"]'::jsonb,
    4,
    '["Research depth and analytical rigor (35%)", "Strategic insight & counter-positioning (30%)", "Actionable recommendations (20%)", "Deck presentation polish (15%)"]'::jsonb,
    '["https://facebook.com/ads/library"]'::jsonb
),
(
    'vtx-dm-05',
    'Lead Generation Funnel',
    'Digital Marketing',
    'High-converting digital lead generation funnel with dedicated landing page wireframes, lead magnets, and retargeting workflows.',
    'Website visitors bounce within seconds without converting because of vague calls-to-action and lack of compelling, free introductory value.',
    '["Design a multi-stage acquisition funnel from awareness to qualified lead", "Create a compelling lead magnet concept (e.g. Developer Handbook / Checklist)", "Architect high-converting landing page wireframes with persuasive copywriting"]'::jsonb,
    '["Funnel flowchart mapping every user touchpoint", "Lead magnet draft ready for distribution", "Landing page copy and wireframe optimized for mobile conversion", "Email capture and follow-up sequence"]'::jsonb,
    '["Visual funnel flow diagram (Figma/Whimsical)", "Completed lead magnet (e.g. 15-page PDF Guide)", "Landing page desktop & mobile wireframe with headline/CTA copy", "Lead scoring criteria and attribution model"]'::jsonb,
    '["Figma", "Whimsical / Miro", "Google Docs", "Canva"]'::jsonb,
    'Advanced',
    '["Funnel Architecture Diagram Link", "Lead Magnet Document Link", "Landing Page Wireframe & Copy Link"]'::jsonb,
    4,
    '["Funnel logic & conversion psychology (35%)", "Lead magnet value & completeness (25%)", "Copywriting persuasiveness (25%)", "Deliverable organization (15%)"]'::jsonb,
    '["https://cxl.com/blog"]'::jsonb
),
(
    'vtx-dm-06',
    'Email Marketing & Customer Retention Campaign',
    'Digital Marketing',
    'Automated lifecycle email marketing strategy with segmentation, onboarding drips, nurture sequences, and re-engagement campaigns.',
    'Organizations lose up to 70% of registered leads because they fail to follow up with timely, relevant, and automated lifecycle communication.',
    '["Develop comprehensive email lifecycle flows (Welcome, Nurture, Promotional, Winback)", "Write persuasive, spam-compliant email copy with compelling subject lines", "Design responsive HTML email templates aligning with Vectonix branding"]'::jsonb,
    '["Lifecycle email automation flowchart", "10 fully written email templates with subject line variants", "A/B testing plan targeting open rates and click-through rates", "Deliverability and sender reputation checklist"]'::jsonb,
    '["Automation workflow map detailing trigger conditions and time delays", "Complete copy deck for 10 lifecycle emails with preview text", "2 branded responsive HTML/visual email templates", "Deliverability checklist covering SPF, DKIM, DMARC, and list hygiene"]'::jsonb,
    '["HTML / CSS", "Figma / Canva", "Google Docs", "Mailchimp / Brevo / Resend"]'::jsonb,
    'Intermediate',
    '["Email Flowchart Diagram Link", "10-Email Copywriting Deck Link (Google Docs)", "HTML Email Template Files Link"]'::jsonb,
    4,
    '["Email copywriting & psychological triggers (35%)", "Automation flow completeness (25%)", "Deliverability & technical hygiene (20%)", "Template visual design (20%)"]'::jsonb,
    '["https://reallygoodemails.com"]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    domain = EXCLUDED.domain,
    short_description = EXCLUDED.short_description,
    problem_statement = EXCLUDED.problem_statement,
    objectives = EXCLUDED.objectives,
    requirements = EXCLUDED.requirements,
    expected_features = EXCLUDED.expected_features,
    tech_stack = EXCLUDED.tech_stack,
    difficulty_level = EXCLUDED.difficulty_level,
    expected_deliverables = EXCLUDED.expected_deliverables,
    evaluation_criteria = EXCLUDED.evaluation_criteria,
    reference_materials = EXCLUDED.reference_materials,
    updated_at = NOW();

-- 9. REFRESH POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
