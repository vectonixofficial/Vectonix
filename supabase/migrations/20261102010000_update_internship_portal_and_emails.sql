-- ============================================================================
-- VECTONIX WI26 - SCHEMA ENHANCEMENT: PACKAGE SELECTION, ADDRESS, 
-- COLLEGE DIRECTORY & BULK EMAIL MANAGEMENT SYSTEM
-- ============================================================================

-- 1. UPDATE INTERNSHIP APPLICATIONS TABLE SAFELY (No data loss)
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
    ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS privacy_consent BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false;

-- Allow resume_url to be optional/nullable since resume upload is removed
ALTER TABLE public.internship_applications ALTER COLUMN resume_url DROP NOT NULL;

-- Backfill application_number from application_id where null
UPDATE public.internship_applications 
SET application_number = application_id 
WHERE application_number IS NULL;

-- 2. UPDATE TRIGGER FOR VTX-WI26-0001 FORMAT
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

    -- Concurrency-safe format: VTX-WI26-0001
    v_formatted_id := 'VTX-' || v_prefix || '-' || LPAD(v_next_val::TEXT, 4, '0');
    NEW.application_id := v_formatted_id;
    NEW.application_number := v_formatted_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. INDIAN COLLEGES & UNIVERSITIES DIRECTORY TABLE
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
CREATE INDEX IF NOT EXISTS idx_indian_colleges_city ON public.indian_colleges(city);

-- Enable RLS for Indian Colleges
ALTER TABLE public.indian_colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Colleges" ON public.indian_colleges FOR SELECT USING (true);
CREATE POLICY "Admin Modify Colleges" ON public.indian_colleges FOR ALL USING (auth.role() = 'authenticated');

-- 4. EMAIL MANAGEMENT TABLES

-- A. Email Campaigns
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_by TEXT NOT NULL,
    total_recipients INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    failed_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'sending', 'completed', 'failed')),
    filter_criteria JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns(status);

-- B. Email Recipients
CREATE TABLE IF NOT EXISTS public.email_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.internship_applications(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    delivery_status TEXT NOT NULL DEFAULT 'queued' CHECK (delivery_status IN ('queued', 'sent', 'failed', 'bounced')),
    provider_message_id TEXT,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_recipients_campaign ON public.email_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_recipients_email ON public.email_recipients(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_recipients_status ON public.email_recipients(delivery_status);

-- C. Email Templates
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- D. Email Drafts
CREATE TABLE IF NOT EXISTS public.email_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT,
    body TEXT,
    selected_recipient_ids JSONB DEFAULT '[]'::jsonb,
    filter_criteria JSONB DEFAULT '{}'::jsonb,
    created_by TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E. Email Consent Records & Unsubscribe Management
CREATE TABLE IF NOT EXISTS public.email_consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    application_id UUID REFERENCES public.internship_applications(id) ON DELETE SET NULL,
    transactional_consent BOOLEAN NOT NULL DEFAULT true,
    marketing_consent BOOLEAN NOT NULL DEFAULT false,
    unsubscribed_at TIMESTAMPTZ,
    consent_source TEXT DEFAULT 'wi26_application',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for Email Tables (Admin Only)
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin Access Email Campaigns" ON public.email_campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Access Email Recipients" ON public.email_recipients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Access Email Templates" ON public.email_templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Access Email Drafts" ON public.email_drafts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Access Consent Records" ON public.email_consent_records FOR ALL USING (auth.role() = 'authenticated');

-- Public policy to allow unsubscribing
CREATE POLICY "Public Unsubscribe Consent" ON public.email_consent_records FOR UPDATE USING (true);

-- 5. SEED DEFAULT EMAIL TEMPLATES
INSERT INTO public.email_templates (name, subject, body, category, is_system)
VALUES 
(
    'Application Acknowledgement',
    'Welcome to Vectonix Winter Internship 2026! (Application ID: {{application_id}})',
    'Hello {{student_name}},<br><br>Congratulations!<br>Your application for the <strong>Vectonix Winter Internship 2026</strong> has been received.<br><br><strong>Application Summary:</strong><br>• Application ID: <strong>{{application_id}}</strong><br>• Selected Domain: <strong>{{internship_domain}}</strong><br>• Selected Package: <strong>{{package_name}}</strong><br>• Institution: <strong>{{college_name}}</strong><br><br>Our onboarding team will review your application and send your batch schedule and orientation link shortly.<br><br>Regards,<br><strong>Team Vectonix Technologies</strong><br>vectonixofficial@gmail.com<br>Contact: 6382340278 / 7538872586',
    'onboarding',
    true
),
(
    'Internship Orientation Reminder',
    'Upcoming Onboarding & Orientation Session - {{internship_domain}}',
    'Hello {{student_name}},<br><br>This is a friendly reminder that the orientation session for your <strong>{{internship_domain}}</strong> track is scheduled soon.<br><br>Please keep your Application ID: <strong>{{application_id}}</strong> ready during the check-in.<br><br>Best regards,<br>Vectonix Academic Team',
    'orientation',
    true
)
ON CONFLICT DO NOTHING;

-- 6. RELOAD SCHEMA CACHE IN SUPABASE POSTGREST
NOTIFY pgrst, 'reload schema';

