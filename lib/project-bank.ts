import { supabase, isSupabaseConfigured, ProjectTemplate, DatabaseMentor } from "@/lib/supabase";

export const INITIAL_PROJECT_TEMPLATES: ProjectTemplate[] = [
    // FULL STACK DEVELOPMENT (6 Projects)
    {
        id: "vtx-fs-01",
        title: "Smart Campus Lost & Found Platform",
        domain: "Full Stack Development",
        short_description: "Centralized portal for university students and staff to report, track, and reclaim lost items with verified claim matching.",
        problem_statement: "Campuses experience thousands of lost items each semester with zero accountability, leading to chaos in security offices and lost personal belongings.",
        objectives: [
            "Build a responsive full-stack platform for claiming and reporting lost goods",
            "Implement image attachment and categorization algorithms",
            "Enable secure claim verification through student ID authentication"
        ],
        requirements: [
            "Responsive UI for desktop and mobile",
            "Automated email notifications when matching item is reported",
            "Admin validation portal for security desks"
        ],
        expected_features: [
            "Item reporting with category, location, and photos",
            "Smart keyword search and filter by date/location",
            "Two-party chat or verification claim workflow",
            "Security officer hand-over confirmation PIN"
        ],
        tech_stack: ["Next.js / React", "Tailwind CSS", "Node.js", "PostgreSQL / Supabase", "Nodemailer"],
        difficulty_level: "Intermediate",
        expected_deliverables: [
            "Public repository with clean Git commit history",
            "Live working deployment URL (e.g. Vercel)",
            "System architecture documentation and API rubric"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "UI/UX responsiveness (25%)",
            "Database schema design & relations (25%)",
            "Authentication & claim security (25%)",
            "Code quality & documentation (25%)"
        ],
        reference_materials: ["https://nextjs.org/docs", "https://supabase.com/docs"],
        is_active: true
    },
    {
        id: "vtx-fs-02",
        title: "Smart Queue & Appointment Management",
        domain: "Full Stack Development",
        short_description: "Virtual token issuing and real-time appointment booking system to eliminate physical waiting lines in clinics and service centers.",
        problem_statement: "Overcrowded reception areas and physical waiting queues cause extreme time loss, customer frustration, and inefficient staff scheduling.",
        objectives: [
            "Develop a real-time virtual queueing web application",
            "Provide estimated wait-time calculation",
            "Enable SMS/Email notifications when user is 3rd in queue"
        ],
        requirements: [
            "Real-time queue board update",
            "Instant token booking without mandatory complex app downloads",
            "Admin counter calling interface"
        ],
        expected_features: [
            "Live digital display board for waiting rooms",
            "QR-code ticket scanner on arrival",
            "Counter management interface for service staff",
            "Average wait time and throughput analytics"
        ],
        tech_stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase Realtime / WebSockets", "PostgreSQL"],
        difficulty_level: "Intermediate",
        expected_deliverables: [
            "Git repository",
            "Live deployment URL",
            "Demonstration video walkthrough link"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Real-time queue reactivity (30%)",
            "Counter interface usability (25%)",
            "Database integrity (25%)",
            "Architecture & deployment (20%)"
        ],
        reference_materials: ["https://supabase.com/docs/guides/realtime"],
        is_active: true
    },
    {
        id: "vtx-fs-03",
        title: "Student Freelance Marketplace",
        domain: "Full Stack Development",
        short_description: "Campus-exclusive freelance marketplace connecting student developers, designers, and writers with local businesses and peer projects.",
        problem_statement: "Students struggle to build verified portfolios and find legitimate paid gigs, while campus startups cannot afford agency rates.",
        objectives: [
            "Design a trust-backed marketplace with verified college email authentication",
            "Implement project listing, proposals, and milestone escrow tracking",
            "Provide review and rating mechanisms"
        ],
        requirements: [
            "Role-based portals (Client vs Freelancer)",
            "Proposal submission with portfolio attachments",
            "Milestone approval flow"
        ],
        expected_features: [
            "Service gig catalog with search and filters",
            "Bidding and proposal system",
            "Deliverable submission and client feedback",
            "Student portfolio builder with verified review badges"
        ],
        tech_stack: ["React / Next.js", "Node.js", "Tailwind CSS", "PostgreSQL", "Supabase"],
        difficulty_level: "Advanced",
        expected_deliverables: [
            "Source code repository",
            "Hosted production demo",
            "Database entity-relationship diagram"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Marketplace workflow completeness (30%)",
            "Role access control (25%)",
            "Data validation & security (25%)",
            "Code modularity (20%)"
        ],
        reference_materials: ["https://react.dev", "https://tailwindcss.com"],
        is_active: true
    },
    {
        id: "vtx-fs-04",
        title: "Smart Expense & Budget Tracker",
        domain: "Full Stack Development",
        short_description: "Collaborative financial dashboard for college roommates and student groups to track shared expenses, recurring splits, and budgets.",
        problem_statement: "Splitting apartment rent, groceries, and team projects leads to awkward calculations, unpaid debts, and zero long-term savings visibility.",
        objectives: [
            "Deliver an intuitive expense splitting engine",
            "Implement automated balance calculation and settlement paths",
            "Provide monthly spending analytics charts"
        ],
        requirements: [
            "Group creation with invite codes",
            "Multi-currency support with INR default",
            "Visual category breakdown charts"
        ],
        expected_features: [
            "Expense logging with unequal or percentage split options",
            "Who owes whom optimization algorithm",
            "Monthly budget threshold alerts",
            "CSV/PDF expense export"
        ],
        tech_stack: ["Next.js", "TypeScript", "Tailwind CSS", "Chart.js / Recharts", "PostgreSQL"],
        difficulty_level: "Beginner",
        expected_deliverables: [
            "GitHub repository",
            "Live URL on Vercel/Netlify",
            "Technical architecture README"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Split calculation accuracy (30%)",
            "Data visualization & charts (25%)",
            "Mobile responsiveness (25%)",
            "Code cleanliness (20%)"
        ],
        reference_materials: ["https://recharts.org"],
        is_active: true
    },
    {
        id: "vtx-fs-05",
        title: "QR-Based Event Entry Management",
        domain: "Full Stack Development",
        short_description: "Rapid attendee registration and tamper-proof QR code check-in platform for college symposiums, hackathons, and corporate workshops.",
        problem_statement: "Manual paper attendance or spreadsheet lookup at event entrance causes massive check-in delays and duplicate ticket fraud.",
        objectives: [
            "Generate cryptographically signed QR admission passes",
            "Provide real-time camera scanning verification interface",
            "Prevent duplicate check-in reuse"
        ],
        requirements: [
            "Sub-second camera QR decoding in browser",
            "Offline verification resilience",
            "Live attendance counter dashboard"
        ],
        expected_features: [
            "Event registration with dynamic ticket tiering",
            "Instant QR pass email dispatch with calendar invite",
            "Organizer camera scanner check-in webapp",
            "Attendee demographics and peak arrival analytics"
        ],
        tech_stack: ["Next.js", "Tailwind CSS", "jsQR / html5-qrcode", "Supabase", "Nodemailer"],
        difficulty_level: "Intermediate",
        expected_deliverables: [
            "Git repository link",
            "Live scanner demo URL",
            "Event organizer guide PDF"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Scanner performance & speed (30%)",
            "Ticket tamper prevention (25%)",
            "Email dispatch reliability (25%)",
            "UI/UX polish (20%)"
        ],
        reference_materials: ["https://github.com/mebjas/html5-qrcode"],
        is_active: true
    },
    {
        id: "vtx-fs-06",
        title: "Local Service Booking Platform",
        domain: "Full Stack Development",
        short_description: "Hyperlocal marketplace connecting neighborhood residents with vetted service providers (electricians, appliance repair, tutoring).",
        problem_statement: "Finding reliable local home services involves word-of-mouth uncertainty, lack of transparent pricing, and zero schedule predictability.",
        objectives: [
            "Create a clean booking portal with service catalog and transparent rate cards",
            "Implement slot booking calendar with provider availability",
            "Enable order tracking and status updates"
        ],
        requirements: [
            "Location-filtered service discovery",
            "Time-slot selection with conflict prevention",
            "Booking confirmation and provider acceptance flow"
        ],
        expected_features: [
            "Service catalog with ratings and transparent pricing",
            "Multi-step booking wizard with address picker",
            "Provider order management dashboard",
            "Customer feedback and review system"
        ],
        tech_stack: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Supabase"],
        difficulty_level: "Intermediate",
        expected_deliverables: [
            "Public GitHub repository",
            "Live web deployment URL",
            "Database schema and documentation"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Booking calendar logic (30%)",
            "Responsive mobile layouts (25%)",
            "Backend validation (25%)",
            "Documentation & testing (20%)"
        ],
        reference_materials: ["https://nextjs.org/docs/app"],
        is_active: true
    },

    // CYBERSECURITY (6 Projects)
    {
        id: "vtx-cs-01",
        title: "Phishing URL Detection System",
        domain: "Cybersecurity",
        short_description: "Automated threat intelligence tool to analyze URLs, detect credential harvesting schemes, and flag deceptive domains.",
        problem_statement: "Phishing accounts for over 80% of reported security incidents. Users click malicious links in emails and SMS without awareness of subtle domain spoofing.",
        objectives: [
            "Analyze URLs for lexical, structural, and domain age anomalies",
            "Detect punycode attacks, typosquatting, and zero-day redirects",
            "Output actionable security risk scores"
        ],
        requirements: [
            "Lexical analysis engine (length, special characters, entropy)",
            "WHOIS & DNS reputation lookup integration",
            "Clean web UI with high/medium/low risk indicators"
        ],
        expected_features: [
            "Single and bulk URL scanning input",
            "Domain age and SSL certificate verification check",
            "Heuristic anomaly score with explanation breakdown",
            "API endpoint for programmatic URL reputation lookups"
        ],
        tech_stack: ["Python / FastAPI or Node.js", "Next.js", "WHOIS/DNS APIs", "Tailwind CSS"],
        difficulty_level: "Intermediate",
        expected_deliverables: [
            "GitHub repository with source code",
            "Live detection dashboard link",
            "Technical vulnerability report detailing detection metrics"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Detection heuristic accuracy (35%)",
            "Analysis report clarity (25%)",
            "Tool interface usability (20%)",
            "Documentation & test dataset (20%)"
        ],
        reference_materials: ["https://owasp.org", "https://urlhaus.abuse.ch"],
        is_active: true
    },
    {
        id: "vtx-cs-02",
        title: "Password Security Analyzer",
        domain: "Cybersecurity",
        short_description: "Enterprise-grade password hygiene tool evaluating entropy, dictionary patterns, credential stuffing risks, and breached database checks.",
        problem_statement: "Users repeatedly reuse predictable patterns and weak passwords across critical accounts, leaving organizations open to credential-stuffing attacks.",
        objectives: [
            "Calculate true cryptographic entropy of passwords",
            "Implement k-Anonymity lookup against known breach databases",
            "Provide real-time cracking time estimates and remediation suggestions"
        ],
        requirements: [
            "Zero transmission of plaintext passwords (k-Anonymity SHA-1 model)",
            "Detection of common dictionary substitutions (l33t speak, keyboard walks)",
            "Password generator with custom complexity constraints"
        ],
        expected_features: [
            "Live interactive strength meter with visual entropy breakdown",
            "HaveIBeenPwned API integration via k-Anonymity hash ranges",
            "Brute-force crack time estimator across GPU tiers",
            "Enterprise password policy validator simulator"
        ],
        tech_stack: ["JavaScript / TypeScript", "Web Crypto API", "Next.js", "Tailwind CSS"],
        difficulty_level: "Beginner",
        expected_deliverables: [
            "GitHub repository",
            "Live interactive analyzer URL",
            "Password policy guidelines PDF report"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "k-Anonymity privacy compliance (35%)",
            "Entropy calculation accuracy (25%)",
            "UI feedback & suggestions (20%)",
            "Code security practices (20%)"
        ],
        reference_materials: ["https://haveibeenpwned.com/API/v3"],
        is_active: true
    },
    {
        id: "vtx-cs-03",
        title: "Web Application Security Checker",
        domain: "Cybersecurity",
        short_description: "Automated lightweight security scanner that inspects web endpoints for HTTP security headers, CORS misconfigurations, and cookie flags.",
        problem_statement: "Thousands of production web servers omit standard security headers (CSP, HSTS, X-Frame-Options), leaving them vulnerable to clickjacking and XSS.",
        objectives: [
            "Perform non-invasive passive security audits on target URLs",
            "Validate HTTP security headers against OWASP guidelines",
            "Inspect TLS/SSL versions and cipher strength"
        ],
        requirements: [
            "Fast passive scanner engine",
            "Clear remediation instructions for missing headers",
            "Exportable security audit report"
        ],
        expected_features: [
            "Header compliance audit (HSTS, CSP, X-Content-Type, X-Frame-Options)",
            "CORS wildcard and origin reflection check",
            "Cookie security attributes check (Secure, HttpOnly, SameSite)",
            "Audit summary score (A+ to F grade) with code fix snippets"
        ],
        tech_stack: ["Node.js / Express", "Next.js", "Tailwind CSS", "Axios"],
        difficulty_level: "Intermediate",
        expected_deliverables: [
            "Source code repository",
            "Live scanner deployment link",
            "Sample audit benchmark report of 5 live websites"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Audit accuracy against OWASP headers (35%)",
            "Report grading algorithm (25%)",
            "Remediation quality (20%)",
            "Application performance (20%)"
        ],
        reference_materials: ["https://owasp.org/www-project-secure-headers"],
        is_active: true
    },
    {
        id: "vtx-cs-04",
        title: "File Integrity Monitoring System",
        domain: "Cybersecurity",
        short_description: "Host-based integrity monitoring tool that tracks unauthorized modifications, creations, and deletions in critical system files.",
        problem_statement: "Advanced persistent threats and ransomware quietly modify system binaries, config files, and web roots before executing attacks.",
        objectives: [
            "Compute baseline cryptographic hashes (SHA-256) of critical directories",
            "Continuously or periodically verify file state against baseline",
            "Trigger real-time security alerts upon detected changes"
        ],
        requirements: [
            "Recursive directory hashing with baseline database",
            "Diff output detailing exact byte or timestamp shifts",
            "Alert dispatch via webhook or email"
        ],
        expected_features: [
            "Baseline hash generation CLI / web dashboard",
            "Automated scan runner with change detection log",
            "Privilege change and ownership monitoring",
            "Incident timeline report with hash mismatches"
        ],
        tech_stack: ["Python / Node.js", "Crypto Library", "SQLite / JSON storage", "Tailwind UI"],
        difficulty_level: "Intermediate",
        expected_deliverables: [
            "GitHub repository link",
            "Demonstration video walkthrough",
            "Security incident response runbook"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Integrity detection speed & accuracy (35%)",
            "Alerting mechanism (25%)",
            "Zero false-positive handling (20%)",
            "Documentation & testing (20%)"
        ],
        reference_materials: ["https://csrc.nist.gov/publications/detail/sp/800-92/final"],
        is_active: true
    },
    {
        id: "vtx-cs-05",
        title: "Mini SIEM – Security Log Monitoring System",
        domain: "Cybersecurity",
        short_description: "Centralized log analysis and visualization engine to ingest server access logs, detect brute-force patterns, and alert administrators.",
        problem_statement: "Security teams drown in gigabytes of unstructured logs without correlation tools, missing active intrusion indicators until it is too late.",
        objectives: [
            "Parse Nginx/Apache/SSH authentication logs into structured schemas",
            "Correlate failed login attempts to detect distributed brute-force attacks",
            "Visualize attack origins and frequency on an interactive map/chart dashboard"
        ],
        requirements: [
            "Log ingestion pipeline for standard syslog and HTTP access formats",
            "Rule-based threshold alerting (e.g. >5 failed logins in 60s)",
            "Searchable log explorer with severity filters"
        ],
        expected_features: [
            "Log file upload and live streaming parser",
            "Threat detection alerts with source IP and user agent",
            "Geographic IP origin lookup and top attacker analytics",
            "Incident report generator with attack timeframe"
        ],
        tech_stack: ["Next.js", "Node.js", "Tailwind CSS", "Recharts / Leaflet", "PostgreSQL"],
        difficulty_level: "Advanced",
        expected_deliverables: [
            "GitHub repository",
            "Live SIEM dashboard demo link",
            "Log attack simulation test dataset"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Rule engine detection logic (35%)",
            "Data visualization & parsing (25%)",
            "Search & filtering speed (20%)",
            "Security reporting (20%)"
        ],
        reference_materials: ["https://attack.mitre.org"],
        is_active: true
    },
    {
        id: "vtx-cs-06",
        title: "Email Spam & Scam Detection Tool",
        domain: "Cybersecurity",
        short_description: "Intelligent email header and content security inspector identifying spoofing, SPF/DKIM/DMARC failures, and advance-fee scam language.",
        problem_statement: "Spear-phishing and business email compromise trick employees by spoofing executive domains and employing urgent manipulative phrasing.",
        objectives: [
            "Parse raw RFC 822 email headers and message bodies",
            "Validate sender authenticity via SPF, DKIM, and DMARC verification records",
            "Flag high-risk scam triggers, urgent call-to-actions, and suspicious links"
        ],
        requirements: [
            "Raw `.eml` and text paste input support",
            "Authentication header breakdown with pass/fail badges",
            "Scam probability score with highlighted risk sentences"
        ],
        expected_features: [
            "Email header parser extracting Return-Path, Received, Message-ID",
            "SPF, DKIM, DMARC alignment status checker",
            "NLP/keyword heuristic scanner for urgency, gift cards, and wire requests",
            "Educational explanation of detected indicators for non-technical users"
        ],
        tech_stack: ["TypeScript / Next.js", "Tailwind CSS", "DNS lookup engine", "Nodemailer parser"],
        difficulty_level: "Intermediate",
        expected_deliverables: [
            "Public repository link",
            "Live web analyzer demo link",
            "Email threat investigation case study"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Header authentication accuracy (35%)",
            "Heuristic scam scoring (25%)",
            "UI presentation & explanation (20%)",
            "Documentation & test emails (20%)"
        ],
        reference_materials: ["https://dmarc.org"],
        is_active: true
    },

    // DIGITAL MARKETING (6 Projects)
    {
        id: "vtx-dm-01",
        title: "Complete Digital Growth Campaign for Vectonix",
        domain: "Digital Marketing",
        short_description: "Multi-channel growth strategy and execution plan to scale Vectonix brand visibility, product signups, and student community engagement.",
        problem_statement: "Early-stage tech startups struggle with low brand recall, high customer acquisition costs, and fragmented marketing across social channels.",
        objectives: [
            "Build a cohesive 30-day multi-channel digital growth roadmap",
            "Execute content calendars for LinkedIn, Instagram, and Twitter/X",
            "Design high-converting landing page mockups and ad copy"
        ],
        requirements: [
            "Target audience persona segmentation",
            "30-day content calendar with copy and visual briefs",
            "Paid and organic distribution channel strategy",
            "KPI dashboard and growth projection model"
        ],
        expected_features: [
            "Audience persona and positioning matrix",
            "Comprehensive 30-day content calendar with creative copy",
            "Ad campaign briefs for Meta & Google Search Ads",
            "Measurement framework tracking CAC, LTV, and conversion rates"
        ],
        tech_stack: ["Notion / Google Docs", "Canva / Figma", "Meta Ads Manager", "Google Analytics 4"],
        difficulty_level: "Intermediate",
        expected_deliverables: [
            "Comprehensive Strategy Deck (Google Slides / PDF)",
            "Live Content Calendar Link (Notion/Sheets)",
            "Ad Creatives & Copy Portfolio Link"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Strategic coherence & positioning (30%)",
            "Copywriting & creative quality (30%)",
            "Measurement & KPI rigor (25%)",
            "Presentation polish (15%)"
        ],
        reference_materials: ["https://hubspot.com/marketing-resources"],
        is_active: true
    },
    {
        id: "vtx-dm-02",
        title: "SEO Growth & Website Optimization",
        domain: "Digital Marketing",
        short_description: "End-to-end technical, on-page, and off-page search engine optimization blueprint to rank Vectonix for high-intent keywords.",
        problem_statement: "Websites with great products remain invisible on Google because of unindexed pages, missing schema markup, and lack of keyword targeting.",
        objectives: [
            "Perform comprehensive keyword research for tech internships and software solutions",
            "Conduct a full technical and on-page SEO audit of the current website",
            "Produce optimized content blueprints and backlink acquisition plans"
        ],
        requirements: [
            "Keyword research report with search volume and intent classification",
            "Technical SEO audit addressing crawlability, speed, and meta tags",
            "Content cluster recommendations and backlink outreach plan"
        ],
        expected_features: [
            "Keyword master spreadsheet (Top 100 keywords categorized)",
            "Technical audit spreadsheet with prioritized recommendations",
            "Two fully drafted, SEO-optimized pillar blog articles",
            "Backlink outreach prospect list with customized email templates"
        ],
        tech_stack: ["Google Search Console", "Ahrefs / SEMrush / Ubersuggest", "Google Docs", "Screaming Frog"],
        difficulty_level: "Intermediate",
        expected_deliverables: [
            "Live SEO Audit Report (Google Sheets/Docs link)",
            "2 Pillar Articles (Google Docs / Medium links)",
            "Outreach Backlink Strategy Portfolio link"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Keyword research depth & relevance (35%)",
            "Technical recommendations feasibility (25%)",
            "Content quality & optimization (25%)",
            "Reporting clarity (15%)"
        ],
        reference_materials: ["https://developers.google.com/search/docs"],
        is_active: true
    },
    {
        id: "vtx-dm-03",
        title: "Social Media Automation & Content Planner",
        domain: "Digital Marketing",
        short_description: "Data-driven social media content planning, visual creative system, and scheduling workflow to establish industry thought leadership.",
        problem_statement: "Inconsistent posting schedules, generic stock visuals, and zero audience engagement lead to stagnant organic reach on social media.",
        objectives: [
            "Formulate distinct brand voices for LinkedIn (B2B/Tech) and Instagram (Student/Culture)",
            "Design a modular visual template system in Figma/Canva",
            "Develop a 30-day scheduled publishing calendar with engagement strategies"
        ],
        requirements: [
            "Brand voice and design guidelines",
            "20 polished graphic/carousel post concepts",
            "Hashtag strategy and influencer collaboration outreach plan"
        ],
        expected_features: [
            "Brand social media styleguide and tone manual",
            "20 production-ready social media posts with copy and hashtags",
            "Story and Reel video concept storyboards",
            "Engagement playbooks for handling comments and community DMs"
        ],
        tech_stack: ["Figma / Canva", "Buffer / Hootsuite", "LinkedIn Analytics", "Instagram Creator Studio"],
        difficulty_level: "Beginner",
        expected_deliverables: [
            "Figma / Canva Design Portfolio Link",
            "30-Day Content Spreadsheet Link",
            "Social Media Strategy Playbook PDF Link"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Visual design quality & brand alignment (35%)",
            "Copywriting engagement & hooks (30%)",
            "Calendar structure & consistency (20%)",
            "Strategy presentation (15%)"
        ],
        reference_materials: ["https://sproutsocial.com/insights"],
        is_active: true
    },
    {
        id: "vtx-dm-04",
        title: "Competitor Intelligence & Brand Analysis",
        domain: "Digital Marketing",
        short_description: "In-depth competitive benchmarking of leading EdTech and tech service platforms to carve out Vectonix unique market positioning.",
        problem_statement: "Startups often launch generic marketing campaigns that mimic established competitors without identifying underserved market niches.",
        objectives: [
            "Analyze 5 direct and indirect competitors across product, pricing, and messaging",
            "Deconstruct competitor ad creatives, funnel hooks, and customer reviews",
            "Formulate a differentiated value proposition and counter-positioning strategy"
        ],
        requirements: [
            "Competitor SWOT and feature comparison matrix",
            "Ad creative tear-down analyzing messaging and offers",
            "Differentiated positioning statement and battlecard"
        ],
        expected_features: [
            "Competitor analysis matrix comparing 5 industry players",
            "Ad library breakdown dissecting competitor active paid ads",
            "Customer sentiment and review analysis identifying pain points",
            "Vectonix competitive advantage blueprint and value propositions"
        ],
        tech_stack: ["Meta Ad Library", "Similarweb", "Google Sheets", "Canva / Slides"],
        difficulty_level: "Intermediate",
        expected_deliverables: [
            "Competitive Benchmarking Deck Link (Google Slides)",
            "Ad Teardown Portfolio Link",
            "Strategic Positioning Executive Summary"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Research depth and analytical rigor (35%)",
            "Strategic insight & counter-positioning (30%)",
            "Actionable recommendations (20%)",
            "Deck presentation polish (15%)"
        ],
        reference_materials: ["https://facebook.com/ads/library"],
        is_active: true
    },
    {
        id: "vtx-dm-05",
        title: "Lead Generation Funnel",
        domain: "Digital Marketing",
        short_description: "High-converting digital lead generation funnel with dedicated landing page wireframes, lead magnets, and retargeting workflows.",
        problem_statement: "Website visitors bounce within seconds without converting because of vague calls-to-action and lack of compelling, free introductory value.",
        objectives: [
            "Design a multi-stage acquisition funnel from awareness to qualified lead",
            "Create a compelling lead magnet concept (e.g. Developer Handbook / Checklist)",
            "Architect high-converting landing page wireframes with persuasive copywriting"
        ],
        requirements: [
            "Funnel flowchart mapping every user touchpoint",
            "Lead magnet draft ready for distribution",
            "Landing page copy and wireframe optimized for mobile conversion",
            "Email capture and follow-up sequence"
        ],
        expected_features: [
            "Visual funnel flow diagram (Figma/Whimsical)",
            "Completed lead magnet (e.g. 15-page PDF Guide)",
            "Landing page desktop & mobile wireframe with headline/CTA copy",
            "Lead scoring criteria and attribution model"
        ],
        tech_stack: ["Figma", "Whimsical / Miro", "Google Docs", "Canva"],
        difficulty_level: "Advanced",
        expected_deliverables: [
            "Funnel Architecture Diagram Link",
            "Lead Magnet Document Link",
            "Landing Page Wireframe & Copy Link"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Funnel logic & conversion psychology (35%)",
            "Lead magnet value & completeness (25%)",
            "Copywriting persuasiveness (25%)",
            "Deliverable organization (15%)"
        ],
        reference_materials: ["https://cxl.com/blog"],
        is_active: true
    },
    {
        id: "vtx-dm-06",
        title: "Email Marketing & Customer Retention Campaign",
        domain: "Digital Marketing",
        short_description: "Automated lifecycle email marketing strategy with segmentation, onboarding drips, nurture sequences, and re-engagement campaigns.",
        problem_statement: "Organizations lose up to 70% of registered leads because they fail to follow up with timely, relevant, and automated lifecycle communication.",
        objectives: [
            "Develop comprehensive email lifecycle flows (Welcome, Nurture, Promotional, Winback)",
            "Write persuasive, spam-compliant email copy with compelling subject lines",
            "Design responsive HTML email templates aligning with Vectonix branding"
        ],
        requirements: [
            "Lifecycle email automation flowchart",
            "10 fully written email templates with subject line variants",
            "A/B testing plan targeting open rates and click-through rates",
            "Deliverability and sender reputation checklist"
        ],
        expected_features: [
            "Automation workflow map detailing trigger conditions and time delays",
            "Complete copy deck for 10 lifecycle emails with preview text",
            "2 branded responsive HTML/visual email templates",
            "Deliverability checklist covering SPF, DKIM, DMARC, and list hygiene"
        ],
        tech_stack: ["HTML / CSS", "Figma / Canva", "Google Docs", "Mailchimp / Brevo / Resend"],
        difficulty_level: "Intermediate",
        expected_deliverables: [
            "Email Flowchart Diagram Link",
            "10-Email Copywriting Deck Link (Google Docs)",
            "HTML Email Template Files Link"
        ],
        duration_weeks: 4,
        evaluation_criteria: [
            "Email copywriting & psychological triggers (35%)",
            "Automation flow completeness (25%)",
            "Deliverability & technical hygiene (20%)",
            "Template visual design (20%)"
        ],
        reference_materials: ["https://reallygoodemails.com"],
        is_active: true
    }
];

export const INITIAL_MENTORS: DatabaseMentor[] = [
    {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Senior Full Stack Mentor",
        email: "mentor.fullstack@vectonix.in",
        domains: ["Full Stack Development", "Full Stack Web Development"],
        designation: "Lead Software Architect",
        bio: "Senior engineer with 8+ years building enterprise SaaS platforms and distributed web applications.",
        max_students: 30,
        is_active: true
    },
    {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Cybersecurity Specialist",
        email: "mentor.security@vectonix.in",
        domains: ["Cybersecurity"],
        designation: "Principal Security Consultant",
        bio: "Offensive security researcher and certified ethical hacker specializing in application penetration testing and SIEM.",
        max_students: 30,
        is_active: true
    },
    {
        id: "33333333-3333-3333-3333-333333333333",
        name: "Digital Marketing Director",
        email: "mentor.marketing@vectonix.in",
        domains: ["Digital Marketing"],
        designation: "Growth Marketing Strategist",
        bio: "Performance marketing leader with expertise in organic SEO, conversion rate optimization, and brand scaling.",
        max_students: 30,
        is_active: true
    }
];

// Helper to normalize domain strings for robust matching
export function normalizeDomain(domain: string): string {
    const d = (domain || "").toLowerCase().trim();
    if (d.includes("full") || d.includes("stack") || d.includes("web dev") || d.includes("fs")) return "Full Stack Development";
    if (d.includes("cyber") || d.includes("security") || d.includes("sec")) return "Cybersecurity";
    if (d.includes("market") || d.includes("digital") || d.includes("growth")) return "Digital Marketing";
    return domain;
}

export const projectBankService = {
    /**
     * Fetch all project templates, optionally filtered by domain
     */
    async getProjectTemplates(domainFilter?: string): Promise<ProjectTemplate[]> {
        let templates: ProjectTemplate[] = [];

        if (isSupabaseConfigured) {
            try {
                let query = supabase.from("project_templates").select("*").eq("is_active", true);
                const { data, error } = await query;
                if (!error && data && data.length > 0) {
                    templates = data as ProjectTemplate[];
                }
            } catch (err) {
                console.warn("Could not query project_templates from Supabase, using fallback:", err);
            }
        }

        // Fallback to local 18 templates if database has no templates yet
        if (!templates || templates.length === 0) {
            templates = INITIAL_PROJECT_TEMPLATES;
        }

        if (domainFilter && domainFilter !== "All" && domainFilter !== "all") {
            const targetNorm = normalizeDomain(domainFilter);
            templates = templates.filter((p) => normalizeDomain(p.domain) === targetNorm);
        }

        return templates;
    },

    /**
     * Get a single project template by ID
     */
    async getProjectTemplateById(id: string): Promise<ProjectTemplate | null> {
        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from("project_templates")
                    .select("*")
                    .eq("id", id)
                    .single();
                if (!error && data) {
                    return data as ProjectTemplate;
                }
            } catch (err) {
                // fall through to local lookup
            }
        }

        const fallback = INITIAL_PROJECT_TEMPLATES.find((p) => p.id === id);
        return fallback || null;
    },

    /**
     * Create or edit a project template
     */
    async saveProjectTemplate(template: Partial<ProjectTemplate> & { title: string; domain: string }): Promise<{ success: boolean; data?: ProjectTemplate; error?: string }> {
        const id = template.id || `vtx-${Date.now().toString(36)}`;
        const record: ProjectTemplate = {
            id,
            title: template.title,
            domain: template.domain,
            short_description: template.short_description || "",
            problem_statement: template.problem_statement || "",
            objectives: template.objectives || [],
            requirements: template.requirements || [],
            expected_features: template.expected_features || [],
            tech_stack: template.tech_stack || [],
            difficulty_level: template.difficulty_level || "Intermediate",
            expected_deliverables: template.expected_deliverables || [],
            duration_weeks: template.duration_weeks || 4,
            evaluation_criteria: template.evaluation_criteria || [],
            reference_materials: template.reference_materials || [],
            is_active: template.is_active !== undefined ? template.is_active : true,
            updated_at: new Date().toISOString()
        };

        if (isSupabaseConfigured) {
            const { data, error } = await supabase
                .from("project_templates")
                .upsert(record)
                .select()
                .single();

            if (error) {
                return { success: false, error: error.message };
            }
            return { success: true, data: data as ProjectTemplate };
        }

        return { success: true, data: record };
    },

    /**
     * Delete or archive a project template
     */
    async deleteProjectTemplate(id: string): Promise<{ success: boolean; error?: string }> {
        if (isSupabaseConfigured) {
            const { error } = await supabase
                .from("project_templates")
                .delete()
                .eq("id", id);

            if (error) {
                // If foreign key constraint prevents deletion, archive it instead
                const { error: archiveError } = await supabase
                    .from("project_templates")
                    .update({ is_active: false })
                    .eq("id", id);

                if (archiveError) return { success: false, error: archiveError.message };
            }
        }
        return { success: true };
    },

    /**
     * Fetch active mentors
     */
    async getMentors(domainFilter?: string): Promise<DatabaseMentor[]> {
        let mentors: DatabaseMentor[] = [];

        if (isSupabaseConfigured) {
            try {
                const { data, error } = await supabase
                    .from("mentors")
                    .select("*")
                    .eq("is_active", true);

                if (!error && data && data.length > 0) {
                    mentors = data as DatabaseMentor[];
                }
            } catch (err) {
                console.warn("Could not query mentors, using fallback:", err);
            }
        }

        if (!mentors || mentors.length === 0) {
            mentors = INITIAL_MENTORS;
        }

        if (domainFilter && domainFilter !== "All") {
            const targetNorm = normalizeDomain(domainFilter);
            mentors = mentors.filter((m) =>
                m.domains.some((d) => normalizeDomain(d) === targetNorm)
            );
        }

        return mentors;
    }
};

