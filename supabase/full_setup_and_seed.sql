-- ============================================================================
-- VECTONIX SUPABASE FULL DATABASE SETUP & SEED SCRIPT
-- Copy and paste this ENTIRE script into Supabase SQL Editor and click RUN
-- ============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CERTIFICATES TABLE
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
    verification_status TEXT NOT NULL DEFAULT 'verified',
    type TEXT NOT NULL DEFAULT 'completion',
    designation TEXT,
    stipend TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Certificates
CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON public.certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_student_name ON public.certificates(student_name);

-- 2. EVENTS TABLE
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

-- 3. REGISTRATIONS TABLE
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

-- 4. ENABLE RLS & PUBLIC POLICIES
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select for certificates" ON public.certificates;
DROP POLICY IF EXISTS "Allow public insert for certificates" ON public.certificates;
DROP POLICY IF EXISTS "Allow public update for certificates" ON public.certificates;
DROP POLICY IF EXISTS "Allow public delete for certificates" ON public.certificates;

CREATE POLICY "Allow public select for certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Allow public insert for certificates" ON public.certificates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for certificates" ON public.certificates FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for certificates" ON public.certificates FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public select for events" ON public.events;
DROP POLICY IF EXISTS "Allow public insert for events" ON public.events;
DROP POLICY IF EXISTS "Allow public update for events" ON public.events;
DROP POLICY IF EXISTS "Allow public delete for events" ON public.events;

CREATE POLICY "Allow public select for events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public insert for events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for events" ON public.events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for events" ON public.events FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public insert for registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow public select for registrations" ON public.registrations;
CREATE POLICY "Allow public insert for registrations" ON public.registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select for registrations" ON public.registrations FOR SELECT USING (true);

-- 5. SEED ALL CERTIFICATES FROM FIRESTORE
INSERT INTO public.certificates (certificate_id, student_name, college_name, domain, start_date, end_date, issue_date, signature_image, verification_status, type, designation, stipend) VALUES
('VTX-OFF-2026-001', 'Kavitha R', 'Government College of Technology, Coimbatore', 'Full Stack Web Development', '2026-08-01', '2026-09-01', '2026-07-25', '', 'revoked', 'offer_letter', 'Software Engineering Intern', 'Performance-Based Stipend'),
('VTX-OFF-2026-002', 'Rethish S', 'Nehru institute of technology', 'Cyber Security', '2026-07-10', '2026-06-01', '2026-07-02', '', 'verified', 'offer_letter', 'Software Engineering Intern', ''),
('VTX20261847', 'Harini K ', 'V.S.B.College of Engineering Technical Campus Coimbatore ', 'B.E.CSE(AIML)', '2026-06-01', '2026-07-01', '2026-07-02', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0002', 'Lohit D', 'VSB Engineering College, Karur (B.Tech)', 'Artificial Intelligence and Data Science (Web Development)', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0007', 'Kanagavalli V', 'VSB Engineering College, Karur (B.Tech)', 'Full Stack Development', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0005', 'Reena S', 'V.S.B College of Engineering Technical Campus, Coimbatore (B.E. ECE)', 'Artificial Intelligence', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0020', 'Dhanush M', 'VSB Engineering College (B.Tech)', 'Artificial Intelligence', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0006', 'Jeevananthan S', 'VSB Engineering College (B.Tech AI & DS)', 'Full Stack Development', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0015', 'Dhanu Sri R', 'KIT — Kalaignar Karunanidhi Institute of Technology (B.E. CSE - Cyber Security)', 'Cyber Security', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VTX20262313', 'Thunaivan M ', 'Christian college of engineering and technology ', 'Electronics and Communication Engineering', '2026-06-01', '2026-07-01', '2026-07-02', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0019', 'Malini M', 'VSB Engineering College, Karur (B.Tech AI & DS)', 'Artificial Intelligence', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0009', 'Sandiya S', 'KIT — Kalaignar Karunanidhi Institute of Technology (B.E. CSE - Cyber Security)', 'Cyber Security', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0004', 'Mounishwaran L', 'VSB Engineering College (B.Tech AI & DS)', 'Full Stack Development', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0001', 'Thilagavathi S', 'V.S.B Engineering College, Karur (B.E. CCE)', 'Artificial Intelligence', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0011', 'Sakthi Manoj M', 'VSB Engineering College (B.E. CCE)', 'Artificial Intelligence', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0010', 'Saranya M', 'KIT — Kalaignar Karunanidhi Institute of Technology (B.E.)', 'Cyber Security', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VTX20261541', 'MOHAMED JAMIL FAYAAZ  A', 'V.S.B. Engineering college, karur', 'B. TECH ', '2026-06-01', '2026-07-01', '2026-07-02', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0012', 'Nagalakshmi P', 'Christian College of Engineering and Technology (B.E.)', 'Artificial Intelligence', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0018', 'Dharshini C', 'VSB Engineering College (B.E. ECE)', 'Full Stack Development', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VTX20262023', 'Sivane K', 'SRM Madurai College for Engineering and Technology.', 'Mern Stack Development', '2026-06-01', '2026-07-01', '2026-07-02', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0023', 'Monisha R ', 'VSB Engineering College ', 'Artificial Intelligence ', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0022', 'Gowtham k ', 'PGP College Of Engineering And Technology ', 'Full stack developer ', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VTX20261033', 'M. Raja subhiksha ', 'SRMIST', 'Electronics and Communication Engineering', '2026-06-01', '2026-07-01', '2026-07-02', '', 'verified', 'completion', '', ''),
('VTX20261113', 'Gokulkrishnan s', 'VSB COLLEGE OF ENGINEERING AND TECHNICAL CAMPUS ', 'B.E CSE(AIML)', '2026-06-01', '2026-07-01', '2026-07-02', '', 'verified', 'completion', '', ''),
('VTX20261835', 'Madhu Sri P', 'V. S. B Engineering college ', 'BE CCE', '2026-06-01', '2026-07-01', '2026-07-02', '', 'verified', 'completion', '', ''),
('VTX20261934', 'SRI DEVA DHARSHINI B ', 'V.S.B Engineering College ', 'Full Stack Development', '2026-06-01', '2026-07-01', '2026-07-02', '', 'verified', 'completion', '', ''),
('VTX20261954', 'Rethish S', 'Nehru institute of technology ', 'BE.CSE. CYBER SECURITY ', '2026-06-01', '2026-07-01', '2026-07-02', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0008', 'Ruchika Ashok Kumar', 'KIT — Kalaignar Karunanidhi Institute of Technology (B.E. CSE - Cyber Security)', 'Cyber Security', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VTX20261157', 'Gopikrishna R', 'Christian college of engineering and Technology', 'Full Stack Development', '2026-06-01', '2026-07-01', '2026-07-02', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0003', 'Antony Sujin A', 'V.S.B College of Engineering and Technical Campus (B.E.)', 'Full Stack Development', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0014', 'Rithicka Shree P', 'KIT — Kalaignar Karunanidhi Institute of Technology (B.E. CSE - Cyber Security)', 'Cyber Security', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0013', 'Sivane K', 'SRM Madurai College for Engineering and Technology (B.E. CSE)', 'MERN Stack Development', '2026-06-01', '2026-07-01', '2026-07-01', '', 'verified', 'completion', '', ''),
('VTX20262330', 'HARSHAD CHANDRU M', 'V.S.B ENGINEERING COLLEGE ', 'B.E.Computer and Communication Engineering', '2026-06-01', '2026-07-01', '2026-07-02', '', 'verified', 'completion', '', ''),
('VT/INT/FS/2026/0021', 'Shobini K', 'St. Xavier''s Catholic College of Engineering ', 'Artificial intelligence ', '2026-06-23', '2026-07-23', '2026-07-23', '', 'verified', 'completion', '', ''),
('VTX20261957', 'Rakshana C ', 'V.S.B ENGINEERING COLLEGE ', 'BE', '2026-06-01', '2026-07-01', '2026-07-02', '', 'verified', 'completion', '', '')
ON CONFLICT (certificate_id) DO UPDATE SET
  student_name = EXCLUDED.student_name,
  college_name = EXCLUDED.college_name,
  domain = EXCLUDED.domain,
  verification_status = EXCLUDED.verification_status;
