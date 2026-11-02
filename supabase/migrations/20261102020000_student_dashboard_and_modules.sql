-- ============================================================================
-- VECTONIX WI26 - STUDENT DASHBOARD, ASSIGNMENTS, REVIEWS & MODULES MIGRATION
-- ============================================================================

-- 1. Add email_validation_status to internship_applications
ALTER TABLE public.internship_applications 
    ADD COLUMN IF NOT EXISTS email_validation_status TEXT DEFAULT 'valid';

-- 2. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id TEXT NOT NULL DEFAULT 'wi26',
    domain TEXT DEFAULT 'All', -- 'All' or specific domain
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
    reference_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ASSIGNMENTS TABLE
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

-- 4. ASSIGNMENT SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    application_id TEXT NOT NULL, -- Application ID or UUID
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
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.assignment_submissions(assignment_id);

-- 5. STUDENT PROJECTS WORKSPACE TABLE
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

-- 6. WEEKLY PROJECT REVIEWS TABLE
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

-- 7. LEARNING RESOURCES TABLE
CREATE TABLE IF NOT EXISTS public.learning_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id TEXT NOT NULL DEFAULT 'wi26',
    domain TEXT NOT NULL DEFAULT 'All',
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Documentation' CHECK (category IN ('PDF Notes', 'Documentation', 'Video Link', 'Tutorial', 'Starter Code')),
    resource_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. MENTOR SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    domain TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    reply TEXT,
    status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Answered', 'Closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS POLICIES FOR NEW TABLES
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public Read Assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Public Select/Insert Submissions" ON public.assignment_submissions FOR ALL USING (true);
CREATE POLICY "Public Select/Modify Projects" ON public.student_projects FOR ALL USING (true);
CREATE POLICY "Public Read Weekly Reviews" ON public.weekly_reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Learning Resources" ON public.learning_resources FOR SELECT USING (true);
CREATE POLICY "Public Select/Insert Support Tickets" ON public.support_tickets FOR ALL USING (true);

-- 9. SEED WI26 INITIAL DATA
INSERT INTO public.announcements (batch_id, domain, title, message, priority, reference_url)
VALUES 
(
    'wi26',
    'All',
    'Welcome to Vectonix Winter Internship 2026!',
    'Orientation kicks off on November 25, 2026. Please verify your domain track and review the curriculum syllabus in the Learning Resources section.',
    'important',
    'https://vectonix.in/learning'
),
(
    'wi26',
    'All',
    'Welcome Kits Dispatch Notice (Premium Students)',
    'Premium package welcome kits (branded bottle, executive pen, badge) will be dispatched through India Post/BlueDart during the second week of the cohort.',
    'normal',
    NULL
)
ON CONFLICT DO NOTHING;

INSERT INTO public.assignments (batch_id, domain, title, description, instructions, deadline, max_marks, difficulty)
VALUES
(
    'wi26',
    'Full Stack Development',
    'Milestone 1: RESTful API & Relational Database Design',
    'Design and deploy a backend architecture utilizing PostgreSQL/Supabase with CRUD endpoints and token authentication.',
    'Include schema diagram, README setup guide, and push code to your personal GitHub repository.',
    '2026-12-05 23:59:59+05:30',
    100,
    'Beginner'
),
(
    'wi26',
    'AI / Machine Learning',
    'Milestone 1: Exploratory Data Analysis & Feature Pipeline',
    'Clean, normalize, and visualize a real-world multi-dimensional dataset using Pandas, Seaborn, and Scikit-Learn.',
    'Submit Jupyter Notebook link with documented insights and baseline evaluation metrics.',
    '2026-12-05 23:59:59+05:30',
    100,
    'Intermediate'
),
(
    'wi26',
    'Cybersecurity',
    'Milestone 1: Network Threat Assessment & Vulnerability Scanning',
    'Perform security posture reconnaissance using Wireshark and Nmap in a sandbox environment and compile a risk matrix.',
    'Export structured audit report in PDF with mitigation recommendations.',
    '2026-12-05 23:59:59+05:30',
    100,
    'Intermediate'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.weekly_reviews (batch_id, domain, review_date, topic, assigned_mentor, meeting_link, status)
VALUES
(
    'wi26',
    'All',
    '2026-12-02 18:30:00+05:30',
    'Inaugural Technical Orientation & Workspace Setup',
    'Senior Vectonix Engineering Team',
    'https://meet.google.com/vectonix-wi26',
    'Upcoming'
),
(
    'wi26',
    'All',
    '2026-12-09 18:30:00+05:30',
    'Sprint 1 Milestone Code Review & Architecture Q&A',
    'Lead Technical Mentors',
    'https://meet.google.com/vectonix-wi26',
    'Upcoming'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.learning_resources (batch_id, domain, title, description, category, resource_url)
VALUES
(
    'wi26',
    'All',
    'Vectonix Internship Developer Handbook 2026',
    'Comprehensive onboarding handbook covering Git conventions, review rubrics, and submission guidelines.',
    'PDF Notes',
    'https://vectonix.in/about'
),
(
    'wi26',
    'Full Stack Development',
    'Modern Next.js & TypeScript Architecture Primer',
    'Official production guide to App Router, server actions, and PostgreSQL integration.',
    'Starter Code',
    'https://github.com/vectonixofficial'
),
(
    'wi26',
    'AI / Machine Learning',
    'Machine Learning Engineering Best Practices',
    'Tutorial notes on feature pipelines, hyperparameter tuning, and model evaluation.',
    'Tutorial',
    'https://vectonix.in/learning'
)
ON CONFLICT DO NOTHING;

-- RELOAD SUPABASE POSTGREST SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
