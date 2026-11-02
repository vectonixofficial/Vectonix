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

