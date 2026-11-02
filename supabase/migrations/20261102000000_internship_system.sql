-- ============================================================================
-- VECTONIX INTERNSHIP MANAGEMENT SYSTEM MIGRATION
-- Supports dynamic batches (Winter Internship wi26, Summer si26, etc.)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BATCHES TABLE
CREATE TABLE IF NOT EXISTS public.internship_batches (
    id TEXT PRIMARY KEY, -- e.g. 'wi26', 'si26'
    title TEXT NOT NULL,
    program_type TEXT NOT NULL DEFAULT 'internship',
    year INTEGER NOT NULL DEFAULT 2026,
    prefix TEXT NOT NULL DEFAULT 'WI26',
    fee_amount NUMERIC(10,2) NOT NULL DEFAULT 499.00,
    upi_id TEXT DEFAULT 'vectonixofficial@okhdfcbank',
    qr_code_url TEXT DEFAULT '',
    domains JSONB NOT NULL DEFAULT '["Full Stack Web Development", "AI / Machine Learning", "Data Science & Analytics", "IoT & Embedded Systems", "Cybersecurity", "UI/UX Design"]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date DATE DEFAULT '2026-12-01',
    end_date DATE DEFAULT '2027-01-15',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial batch for Winter Internship 2026 (wi26)
INSERT INTO public.internship_batches (id, title, program_type, year, prefix, fee_amount, upi_id, domains, is_active)
VALUES (
    'wi26',
    'Winter Internship 2026',
    'internship',
    2026,
    'WI26',
    499.00,
    'vectonixofficial@okhdfcbank',
    '["Full Stack Web Development", "AI / Machine Learning", "Data Science & Analytics", "IoT & Embedded Systems", "Cybersecurity", "UI/UX Design"]'::jsonb,
    true
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    prefix = EXCLUDED.prefix,
    is_active = EXCLUDED.is_active;

-- 2. BATCH SEQUENCES TRACKER (Atomic generator)
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
    resume_url TEXT NOT NULL,
    linkedin_url TEXT,
    github_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'accepted', 'rejected', 'waitlisted')),
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internship_apps_batch ON public.internship_applications(batch_id);
CREATE INDEX IF NOT EXISTS idx_internship_apps_email ON public.internship_applications(email);
CREATE INDEX IF NOT EXISTS idx_internship_apps_status ON public.internship_applications(status);
CREATE INDEX IF NOT EXISTS idx_internship_apps_app_id ON public.internship_applications(application_id);

-- 4. INTERNSHIP PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.internship_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.internship_applications(id) ON DELETE CASCADE,
    batch_id TEXT NOT NULL REFERENCES public.internship_batches(id) ON DELETE RESTRICT,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    transaction_id_utr TEXT NOT NULL,
    screenshot_url TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (payment_status IN ('pending_verification', 'verified', 'rejected')),
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internship_payments_batch ON public.internship_payments(batch_id);
CREATE INDEX IF NOT EXISTS idx_internship_payments_status ON public.internship_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_internship_payments_utr ON public.internship_payments(transaction_id_utr);

-- 5. TRIGGER FOR ATOMIC APPLICATION ID ASSIGNMENT
CREATE OR REPLACE FUNCTION public.fn_assign_application_id()
RETURNS TRIGGER AS $$
DECLARE
    v_prefix TEXT;
    v_next_val INTEGER;
BEGIN
    SELECT prefix INTO v_prefix FROM public.internship_batches WHERE id = NEW.batch_id;
    IF v_prefix IS NULL THEN
        v_prefix := UPPER(NEW.batch_id);
    END IF;

    INSERT INTO public.batch_sequences (batch_id, last_val)
    VALUES (NEW.batch_id, 1)
    ON CONFLICT (batch_id)
    DO UPDATE SET last_val = public.batch_sequences.last_val + 1
    RETURNING last_val INTO v_next_val;

    NEW.application_id := 'VX-' || v_prefix || '-' || LPAD(v_next_val::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_application_id ON public.internship_applications;
CREATE TRIGGER trg_assign_application_id
BEFORE INSERT ON public.internship_applications
FOR EACH ROW
WHEN (NEW.application_id IS NULL OR NEW.application_id = '')
EXECUTE FUNCTION public.fn_assign_application_id();

-- 6. UPDATED_AT TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_internship_batches_updated_at ON public.internship_batches;
CREATE TRIGGER set_internship_batches_updated_at BEFORE UPDATE ON public.internship_batches FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_internship_apps_updated_at ON public.internship_applications;
CREATE TRIGGER set_internship_apps_updated_at BEFORE UPDATE ON public.internship_applications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_internship_payments_updated_at ON public.internship_payments;
CREATE TRIGGER set_internship_payments_updated_at BEFORE UPDATE ON public.internship_payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.internship_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internship_payments ENABLE ROW LEVEL SECURITY;

-- Batches Policies: Public can read active batches; Admins have full access
CREATE POLICY "Public Read Active Batches" ON public.internship_batches FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin Full Batches" ON public.internship_batches FOR ALL USING (auth.role() = 'authenticated');

-- Applications Policies: Public can insert; Admin can select/update/delete
CREATE POLICY "Public Insert Applications" ON public.internship_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Own Application by ID" ON public.internship_applications FOR SELECT USING (true);
CREATE POLICY "Admin Modify Applications" ON public.internship_applications FOR ALL USING (auth.role() = 'authenticated');

-- Payments Policies: Public can insert; Admin can select/update/delete
CREATE POLICY "Public Insert Payments" ON public.internship_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Modify Payments" ON public.internship_payments FOR ALL USING (auth.role() = 'authenticated');

-- 8. STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public) VALUES ('internship-resumes', 'internship-resumes', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('internship-payments', 'internship-payments', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Access Resumes" ON storage.objects FOR SELECT USING (bucket_id = 'internship-resumes');
CREATE POLICY "Public Upload Access Resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'internship-resumes');

CREATE POLICY "Public Read Access Payments" ON storage.objects FOR SELECT USING (bucket_id = 'internship-payments');
CREATE POLICY "Public Upload Access Payments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'internship-payments');

