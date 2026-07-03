-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CERTIFICATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_id TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    college_name TEXT NOT NULL,
    domain TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    issue_date DATE NOT NULL,
    signature_image TEXT,
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'revoked')),
    type TEXT NOT NULL DEFAULT 'completion' CHECK (type IN ('completion', 'offer_letter')),
    designation TEXT,
    stipend TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Certificates
CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON public.certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_name ON public.certificates(student_name);
CREATE INDEX IF NOT EXISTS idx_certificates_type ON public.certificates(type);

-- ============================================================================
-- 2. EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE,
    time TEXT,
    location TEXT,
    category TEXT DEFAULT 'Workshop',
    image_url TEXT,
    registration_link TEXT,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for Events
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);

-- ============================================================================
-- 3. REGISTRATIONS / FORM RESPONSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    college TEXT,
    department TEXT,
    year TEXT,
    program_name TEXT,
    type TEXT DEFAULT 'event',
    answers JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Registrations
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);

-- ============================================================================
-- 4. PROFILES TABLE (SYNCS WITH AUTH.USERS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger Function to Auto-Update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
CREATE TRIGGER set_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_registrations_updated_at BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Certificates Policies: Public SELECT, Admin INSERT/UPDATE/DELETE
CREATE POLICY "Allow public select for certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access for certificates" ON public.certificates FOR ALL USING (auth.role() = 'authenticated');

-- Events Policies: Public SELECT, Admin INSERT/UPDATE/DELETE
CREATE POLICY "Allow public select for events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access for events" ON public.events FOR ALL USING (auth.role() = 'authenticated');

-- Registrations Policies: Public INSERT, Admin SELECT/UPDATE/DELETE
CREATE POLICY "Allow public insert for registrations" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated select for registrations" ON public.registrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated modify for registrations" ON public.registrations FOR ALL USING (auth.role() = 'authenticated');

-- Profiles Policies: Self SELECT/UPDATE, Admin ALL
CREATE POLICY "Allow public select for profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow self update for profiles" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- 6. STORAGE BUCKETS
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('events', 'events', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public Read Access for Signatures" ON storage.objects FOR SELECT USING (bucket_id = 'signatures');
CREATE POLICY "Authenticated Upload Access for Signatures" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Public Read Access for Events" ON storage.objects FOR SELECT USING (bucket_id = 'events');
CREATE POLICY "Authenticated Upload Access for Events" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'events');
