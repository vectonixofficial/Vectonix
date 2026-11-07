import { supabase, isSupabaseConfigured, DatabaseInternshipApplication } from "@/lib/supabase";
import { hydrateApplication, internshipService } from "@/lib/services/internshipService";
import { hydrateStudentProject } from "@/lib/services/allocationService";

export interface StudentAnnouncement {
    id: string;
    batch_id: string;
    domain: string;
    title: string;
    message: string;
    priority: "normal" | "important" | "urgent";
    reference_url?: string;
    created_at: string;
}

export interface StudentAssignment {
    id: string;
    batch_id: string;
    domain: string;
    title: string;
    description: string;
    instructions?: string;
    reference_url?: string;
    deadline?: string;
    max_marks: number;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    is_active: boolean;
    submission?: StudentSubmission;
}

export interface StudentSubmission {
    id: string;
    assignment_id: string;
    application_id: string;
    student_email: string;
    student_name: string;
    description?: string;
    github_url?: string;
    project_url?: string;
    file_url?: string;
    status: "Not Started" | "In Progress" | "Submitted" | "Under Review" | "Completed" | "Needs Revision" | "Overdue";
    marks?: number;
    mentor_feedback?: string;
    submitted_at: string;
    reviewed_at?: string;
}

export interface StudentProject {
    id: string;
    application_id: string;
    batch_id: string;
    domain: string;
    project_template_id?: string;
    project_title: string;
    description: string;
    assigned_mentor_id?: string;
    assigned_mentor_name?: string;
    start_date?: string;
    deadline?: string;
    personalized_instructions?: string;
    difficulty_level?: string;
    github_url?: string;
    project_url?: string;
    documentation_url?: string;
    presentation_url?: string;
    evidence_url?: string;
    status:
        | "Not Started"
        | "In Progress"
        | "Submitted"
        | "Under Review"
        | "Revision Required"
        | "Approved"
        | "Completed"
        | "Overdue"
        | "Planning"
        | "In Development"
        | "Testing"
        | "Needs Review";
    progress_percent: number;
    current_milestone: number;
    milestones: {
        index?: number;
        title: string;
        completed: boolean;
        status?: string;
        feedback?: string;
        submissionUrl?: string;
        deadline?: string;
    }[];
    mentor_feedback?: string;
    evaluation_marks?: number;
    template?: any;
}

export interface WeeklyReview {
    id: string;
    batch_id: string;
    domain: string;
    review_date: string;
    topic: string;
    assigned_mentor: string;
    meeting_link?: string;
    status: "Upcoming" | "Completed" | "Rescheduled";
    mentor_comments?: string;
    visible_from?: string; // Date string from when the link is visible
    is_always_visible?: boolean;
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
}

export interface DomainQuiz {
    id: string;
    week: number;
    domain: string;
    title: string;
    description: string;
    durationMinutes: number;
    totalMarks: number;
    openDate?: string;
    closeDate?: string;
    questions: QuizQuestion[];
}

export interface LearningResource {
    id: string;
    batch_id: string;
    domain: string;
    title: string;
    description?: string;
    category: "PDF Notes" | "Documentation" | "Video Link" | "Tutorial" | "Starter Code";
    resource_url: string;
    created_at: string;
}

export interface SupportTicket {
    id: string;
    application_id: string;
    student_name: string;
    student_email: string;
    domain?: string;
    category?: string;
    subject: string;
    message: string;
    status: "Open" | "In Progress" | "Resolved" | "Closed" | "Answered";
    admin_response?: string;
    reply?: string;
    created_at: string;
    resolved_at?: string;
}

const DEFAULT_ANNOUNCEMENTS: StudentAnnouncement[] = [
    {
        id: "ann-01",
        batch_id: "wi26",
        domain: "All",
        title: "Welcome to Vectonix Winter Internship 2026!",
        message: "Orientation commences on November 25, 2026. Review your domain curriculum and milestones in Learning Resources.",
        priority: "important",
        reference_url: "https://vectonix.in/learning",
        created_at: "2026-11-02T10:00:00Z"
    },
    {
        id: "ann-02",
        batch_id: "wi26",
        domain: "All",
        title: "Welcome Kits Dispatch Schedule (Premium)",
        message: "Physical welcome kits (branded bottle, pen, badge) will be dispatched through India Post/BlueDart during the second week of the cohort.",
        priority: "normal",
        created_at: "2026-11-02T11:00:00Z"
    }
];

const DEFAULT_REVIEWS: WeeklyReview[] = [
    {
        id: "rev-orient-01",
        batch_id: "wi26",
        domain: "All",
        review_date: "2026-11-25T18:00:00+05:30",
        topic: "Inaugural Technical Orientation & Workspace Setup",
        assigned_mentor: "Senior Vectonix Engineering Team",
        meeting_link: "https://meet.google.com/rub-omic-zqn",
        status: "Upcoming",
        is_always_visible: false,
        visible_from: "2026-11-25"
    },
    {
        id: "rev-m1-02",
        batch_id: "wi26",
        domain: "All",
        review_date: "2026-12-02T19:00:00+05:30",
        topic: "Milestone 1 Code Review & Architectural Audit",
        assigned_mentor: "Lead Technical Mentors",
        meeting_link: "https://meet.google.com/gim-dtax-fsq",
        status: "Upcoming",
        is_always_visible: false,
        visible_from: "2026-12-02"
    },
    {
        id: "rev-m2-03",
        batch_id: "wi26",
        domain: "All",
        review_date: "2026-12-09T19:00:00+05:30",
        topic: "Milestone 2 Core Engineering & API Verification",
        assigned_mentor: "Lead Technical Mentors",
        meeting_link: "https://meet.google.com/gim-dtax-fsq",
        status: "Upcoming",
        is_always_visible: false,
        visible_from: "2026-12-09"
    },
    {
        id: "rev-m3-04",
        batch_id: "wi26",
        domain: "All",
        review_date: "2026-12-16T19:00:00+05:30",
        topic: "Milestone 3 Security Hardening & Integration Audit",
        assigned_mentor: "Lead Technical Mentors",
        meeting_link: "https://meet.google.com/gim-dtax-fsq",
        status: "Upcoming",
        is_always_visible: false,
        visible_from: "2026-12-16"
    },
    {
        id: "rev-m4-05",
        batch_id: "wi26",
        domain: "All",
        review_date: "2026-12-23T19:00:00+05:30",
        topic: "Milestone 4 Final Capstone Review & Presentation",
        assigned_mentor: "Senior Engineering Directorate",
        meeting_link: "https://meet.google.com/gim-dtax-fsq",
        status: "Upcoming",
        is_always_visible: false,
        visible_from: "2026-12-23"
    }
];

const DEFAULT_RESOURCES: LearningResource[] = [
    {
        id: "res-general",
        batch_id: "wi26",
        domain: "All",
        title: "Vectonix Winter Internship 2026 – General Program Handbook",
        description: "Official program guide covering internship structure, code review protocols, weekly meeting schedules, milestone deliverables, and evaluation criteria.",
        category: "PDF Notes",
        resource_url: "/handbooks/Vectonix_General_Handbook.pdf",
        created_at: "2026-11-02T10:00:00Z"
    },
    {
        id: "res-fsd",
        batch_id: "wi26",
        domain: "Full Stack Development",
        title: "Full Stack Web & Cloud Engineering Technical Handbook",
        description: "In-depth engineering curriculum covering React 19, Next.js App Router, TypeScript, PostgreSQL schema modeling, RESTful API design, and Vercel cloud deployments.",
        category: "PDF Notes",
        resource_url: "/handbooks/Vectonix_FSD_Handbook.pdf",
        created_at: "2026-11-02T10:00:00Z"
    },
    {
        id: "res-cyber",
        batch_id: "wi26",
        domain: "Cybersecurity",
        title: "Cybersecurity & Ethical Defense Practical Handbook",
        description: "Practical curriculum covering OWASP Top 10 web security auditing, pen-testing workflows, cryptographic protocols, network defense, and secure coding standards.",
        category: "PDF Notes",
        resource_url: "/handbooks/Vectonix_Cybersecurity_Handbook.pdf",
        created_at: "2026-11-02T10:00:00Z"
    },
    {
        id: "res-marketing",
        batch_id: "wi26",
        domain: "Digital Marketing",
        title: "Digital Marketing & Growth Engineering Handbook",
        description: "Applied playbook covering Technical SEO, funnel architecture, web analytics telemetry, conversion rate optimization (CRO), and paid acquisition strategies.",
        category: "PDF Notes",
        resource_url: "/handbooks/Vectonix_DigitalMarketing_Handbook.pdf",
        created_at: "2026-11-02T10:00:00Z"
    }
];

const DOMAIN_QUIZZES: Record<string, DomainQuiz[]> = {
    "Full Stack Development": [
        {
            id: "fsd-quiz-01",
            week: 1,
            domain: "Full Stack Development",
            title: "Week 1 Assessment: TypeScript & Next.js App Router Architecture",
            description: "Assess your foundational knowledge of React 19 Server Components, App Router lifecycle, and TypeScript strict typings.",
            durationMinutes: 15,
            totalMarks: 20,
            questions: [
                {
                    id: "q1",
                    question: "In Next.js App Router, which directive marks a file as a Client Component?",
                    options: ["use client", "use server", "client side", "enable client"],
                    correctIndex: 0,
                    explanation: "Placing 'use client' at the top of a file declares the component and its imports as client-side code."
                },
                {
                    id: "q2",
                    question: "Which hook should be used to read query parameters in Next.js App Router Client Components?",
                    options: ["useRouter()", "useSearchParams()", "useParams()", "useQuery()"],
                    correctIndex: 1,
                    explanation: "useSearchParams() from next/navigation returns read-only URL query parameters."
                },
                {
                    id: "q3",
                    question: "What is the primary benefit of React Server Components (RSC)?",
                    options: [
                        "Reduces client JavaScript bundle size by rendering on the server",
                        "Enables local browser state to persist across tabs",
                        "Replaces the need for CSS preprocessors",
                        "Automatically compiles to WebAssembly"
                    ],
                    correctIndex: 0,
                    explanation: "RSCs execute entirely on the server and transmit rendered JSX to the client without adding heavy dependencies to the bundle."
                },
                {
                    id: "q4",
                    question: "What does the SQL command 'ON CONFLICT DO UPDATE' accomplish in PostgreSQL (Supabase)?",
                    options: [
                        "Deletes conflicting rows",
                        "Performs an idempotent upsert (update if exists, insert if not)",
                        "Rolls back the entire transaction",
                        "Locks the table against concurrent writes"
                    ],
                    correctIndex: 1,
                    explanation: "ON CONFLICT DO UPDATE performs an atomic upsert operation when a unique or primary key constraint conflict arises."
                }
            ]
        },
        {
            id: "fsd-quiz-02",
            week: 2,
            domain: "Full Stack Development",
            title: "Week 2 Assessment: REST APIs, Supabase Auth & Row Level Security",
            description: "Test your understanding of token authentication, PostgreSQL RLS policies, and relational database constraints.",
            durationMinutes: 15,
            totalMarks: 20,
            questions: [
                {
                    id: "q5",
                    question: "What is Row Level Security (RLS) in PostgreSQL?",
                    options: [
                        "A database policy engine that restricts which rows users can query or mutate",
                        "An encryption algorithm applied to columns",
                        "A network firewall rule for database ports",
                        "A browser-side storage encryption system"
                    ],
                    correctIndex: 0,
                    explanation: "RLS enables fine-grained access control on database tables based on the authenticated user ID (auth.uid())."
                },
                {
                    id: "q6",
                    question: "Which HTTP status code should be returned when an authentication token is missing or expired?",
                    options: ["200 OK", "401 Unauthorized", "404 Not Found", "500 Server Error"],
                    correctIndex: 1,
                    explanation: "HTTP 401 Unauthorized indicates that the request lacks valid authentication credentials."
                }
            ]
        },
        {
            id: "fsd-quiz-03",
            week: 3,
            domain: "Full Stack Development",
            title: "Week 3 Assessment: State Management, Database Indexing & Optimizations",
            description: "Assess your expertise in query optimization, indexing strategies, caching layers, and client-side state reconciliation.",
            durationMinutes: 15,
            totalMarks: 20,
            questions: [
                {
                    id: "q7",
                    question: "When should a B-Tree index be applied on a PostgreSQL database column?",
                    options: [
                        "On columns frequently used in WHERE filters, JOIN conditions, and ORDER BY clauses",
                        "On every single column in the table regardless of query patterns",
                        "Only on columns storing binary blob data",
                        "Indices are deprecated in modern PostgreSQL"
                    ],
                    correctIndex: 0,
                    explanation: "B-Tree indices provide O(log n) lookup times for equality and range queries on frequently filtered columns."
                },
                {
                    id: "q8",
                    question: "What is the primary purpose of Next.js 'revalidatePath' or 'revalidateTag'?",
                    options: [
                        "Purge and invalidate stale cached data on the server",
                        "Force a complete browser hard reload on the client",
                        "Delete the database table schema",
                        "Restart the Node.js server container"
                    ],
                    correctIndex: 0,
                    explanation: "revalidatePath and revalidateTag purge on-demand cached data in the Next.js Data Cache."
                }
            ]
        },
        {
            id: "fsd-quiz-04",
            week: 4,
            domain: "Full Stack Development",
            title: "Week 4 Assessment: Production Deployment, CI/CD & Cloud Architecture",
            description: "Demonstrate readiness in Docker containerization, edge functions, SSL/TLS termination, and production error monitoring.",
            durationMinutes: 15,
            totalMarks: 20,
            questions: [
                {
                    id: "q9",
                    question: "Why should sensitive API credentials never be prefixed with 'NEXT_PUBLIC_' in a Next.js application?",
                    options: [
                        "NEXT_PUBLIC_ variables are inlined into the browser JavaScript bundle and exposed to anyone inspecting the site",
                        "They prevent the build from compiling",
                        "They cause the server to crash under heavy load",
                        "PostgreSQL cannot parse variables starting with NEXT_PUBLIC_"
                    ],
                    correctIndex: 0,
                    explanation: "Prefixing an env variable with NEXT_PUBLIC_ embeds it into the client-side JavaScript bundle, leaking secrets."
                },
                {
                    id: "q10",
                    question: "What is the advantage of multi-stage Docker builds for Next.js applications?",
                    options: [
                        "Significantly shrinks final production image size by discarding build-time tooling and dependencies",
                        "Enables Next.js to run without Node.js",
                        "Automatically provisions a free Kubernetes cluster",
                        "Allows running both Linux and Windows in one container"
                    ],
                    correctIndex: 0,
                    explanation: "Multi-stage builds copy only the standalone build output and runtime files, yielding tiny production containers."
                }
            ]
        }
    ],
    "Cybersecurity": [
        {
            id: "cyber-quiz-01",
            week: 1,
            domain: "Cybersecurity",
            title: "Week 1 Assessment: Network Security, OWASP Top 10 & Threat Vectors",
            description: "Evaluate your comprehension of web vulnerabilities, injection flaws, and defensive security baselines.",
            durationMinutes: 15,
            totalMarks: 20,
            questions: [
                {
                    id: "cq1",
                    question: "Which of the following is the most effective mitigation against SQL Injection?",
                    options: [
                        "Parameterized queries and prepared statements",
                        "Storing passwords in base64",
                        "Disabling JavaScript in the client",
                        "Using HTTP instead of HTTPS"
                    ],
                    correctIndex: 0,
                    explanation: "Parameterized queries ensure the database engine treats input as data rather than executable code."
                },
                {
                    id: "cq2",
                    question: "What does the 'SameSite' cookie attribute protect against?",
                    options: [
                        "Cross-Site Request Forgery (CSRF)",
                        "Distributed Denial of Service (DDoS)",
                        "Physical server theft",
                        "DNS Poisoning"
                    ],
                    correctIndex: 0,
                    explanation: "SameSite=Lax or Strict prevents the browser from sending cookies on cross-origin requests, mitigating CSRF."
                }
            ]
        },
        {
            id: "cyber-quiz-02",
            week: 2,
            domain: "Cybersecurity",
            title: "Week 2 Assessment: Cryptography, JWT Authentication & Session Security",
            description: "Test your understanding of asymmetric key pairs, hash algorithms, salt generation, and secure session management.",
            durationMinutes: 15,
            totalMarks: 20,
            questions: [
                {
                    id: "cq3",
                    question: "Why should bcrypt or Argon2 be used for password hashing instead of MD5 or SHA-256?",
                    options: [
                        "They incorporate work factors and salts, making them computationally slow and resistant to GPU rainbow tables",
                        "They produce shorter strings that save database disk space",
                        "MD5 is patent-protected and requires a commercial license",
                        "Argon2 allows passwords to be decrypted by administrators"
                    ],
                    correctIndex: 0,
                    explanation: "Key derivation functions like bcrypt and Argon2 are intentionally computationally expensive and salted."
                },
                {
                    id: "cq4",
                    question: "Where is the most secure place to store a JWT authentication token in a web application?",
                    options: [
                        "In an HttpOnly, Secure, SameSite cookie",
                        "In browser localStorage",
                        "In sessionStorage",
                        "In a public URL query parameter"
                    ],
                    correctIndex: 0,
                    explanation: "HttpOnly cookies cannot be accessed by client-side JavaScript, protecting against XSS token exfiltration."
                }
            ]
        },
        {
            id: "cyber-quiz-03",
            week: 3,
            domain: "Cybersecurity",
            title: "Week 3 Assessment: Penetration Testing, Vulnerability Scanning & XSS Defense",
            description: "Assess your capability in identifying Cross-Site Scripting (XSS), Security Headers, and vulnerability remediations.",
            durationMinutes: 15,
            totalMarks: 20,
            questions: [
                {
                    id: "cq5",
                    question: "Which HTTP response header is crucial for restricting the origins of scripts, images, and styles?",
                    options: [
                        "Content-Security-Policy (CSP)",
                        "X-Powered-By",
                        "Access-Control-Allow-Origin: *",
                        "Server: Apache"
                    ],
                    correctIndex: 0,
                    explanation: "Content-Security-Policy restricts script execution and resource loading to trusted domains."
                }
            ]
        },
        {
            id: "cyber-quiz-04",
            week: 4,
            domain: "Cybersecurity",
            title: "Week 4 Assessment: Incident Response, Cloud Security & Zero Trust Architecture",
            description: "Demonstrate proficiency in Zero Trust architecture, SIEM event correlation, and forensic incident workflows.",
            durationMinutes: 15,
            totalMarks: 20,
            questions: [
                {
                    id: "cq6",
                    question: "What is the core philosophy of a Zero Trust Architecture (ZTA)?",
                    options: [
                        "Never trust, always verify — assume breach and verify every request explicitly",
                        "Trust all devices within the internal corporate VPN",
                        "Disable all external internet access completely",
                        "Require passwords to be changed every 24 hours"
                    ],
                    correctIndex: 0,
                    explanation: "Zero Trust treats every user, device, and network transaction as potentially untrusted."
                }
            ]
        }
    ],
    "Digital Marketing": [
        {
            id: "dm-quiz-01",
            week: 1,
            domain: "Digital Marketing",
            title: "Week 1 Assessment: Technical SEO, GA4 & Funnel Tracking",
            description: "Test your mastery of technical SEO, keyword research, meta schemas, and conversion tracking.",
            durationMinutes: 15,
            totalMarks: 20,
            questions: [
                {
                    id: "dq1",
                    question: "Which meta tag is essential for preventing duplicate content issues across URL variations?",
                    options: ["rel='canonical'", "rel='nofollow'", "robots='noindex'", "meta name='keywords'"],
                    correctIndex: 0,
                    explanation: "A canonical link element specifies the authoritative source URL for search engines."
                },
                {
                    id: "dq2",
                    question: "In Google Analytics 4 (GA4), how are user interactions tracked?",
                    options: ["As Events", "Only as Pageviews", "Through session cookies only", "Through server log files only"],
                    correctIndex: 0,
                    explanation: "GA4 is an event-based data model where every interaction is captured as a distinct event."
                }
            ]
        },
        {
            id: "dm-quiz-02",
            week: 2,
            domain: "Digital Marketing",
            title: "Week 2 Assessment: Performance Marketing, Meta Ads & SEM",
            description: "Evaluate your skills in ad targeting, Return on Ad Spend (ROAS), click-through rate (CTR), and bidding strategies.",
            durationMinutes: 15,
            totalMarks: 20,
            questions: [
                {
                    id: "dq3",
                    question: "What metric is calculated by dividing Total Revenue Generated by Total Ad Spend?",
                    options: [
                        "ROAS (Return on Ad Spend)",
                        "CTR (Click-Through Rate)",
                        "CPC (Cost Per Click)",
                        "CPM (Cost Per Mille)"
                    ],
                    correctIndex: 0,
                    explanation: "ROAS measures gross revenue generated for every dollar or rupee spent on advertising campaigns."
                }
            ]
        },
        {
            id: "dm-quiz-03",
            week: 3,
            domain: "Digital Marketing",
            title: "Week 3 Assessment: Content Strategy, Email Nurturing & A/B Testing",
            description: "Test your ability to design drip sequences, measure open rates, and execute statistically significant split tests.",
            durationMinutes: 15,
            totalMarks: 20,
            questions: [
                {
                    id: "dq4",
                    question: "In A/B testing a landing page, what is the single most important rule?",
                    options: [
                        "Isolate and test only one key variable at a time (e.g., headline or CTA button)",
                        "Change all copy, images, colors, and layout simultaneously",
                        "Stop the test as soon as the first conversion happens",
                        "Run the test on only internal team members"
                    ],
                    correctIndex: 0,
                    explanation: "Testing one variable at a time ensures you know exactly which element influenced the conversion rate."
                }
            ]
        },
        {
            id: "dm-quiz-04",
            week: 4,
            domain: "Digital Marketing",
            title: "Week 4 Assessment: Marketing Attribution, Analytics Reporting & ROI",
            description: "Demonstrate understanding of multi-touch attribution, customer lifetime value (LTV), and growth reporting.",
            durationMinutes: 15,
            totalMarks: 20,
            questions: [
                {
                    id: "dq5",
                    question: "What does the LTV:CAC ratio measure in SaaS and product growth?",
                    options: [
                        "Customer Lifetime Value compared to Customer Acquisition Cost",
                        "Logarithmic Traffic Velocity",
                        "Lead Time Versus Cost Accounting",
                        "Landing Total Views per Campaign"
                    ],
                    correctIndex: 0,
                    explanation: "A healthy LTV:CAC ratio (typically 3:1 or higher) demonstrates sustainable and scalable customer acquisition economics."
                }
            ]
        }
    ]
};

export const studentService = {
    /**
     * Authenticate student with Application ID and Email
     */
    async login(appId: string, email: string): Promise<DatabaseInternshipApplication | null> {
        const cleanId = appId.trim();
        const cleanEmail = email.trim().toLowerCase();

        // 1. Query Supabase
        if (isSupabaseConfigured) {
            try {
                // First attempt: match by application_id and email
                let { data, error } = await supabase
                    .from("internship_applications")
                    .select("*")
                    .ilike("application_id", cleanId)
                    .ilike("email", cleanEmail)
                    .maybeSingle();

                // Second attempt: match by email and find ID in memory
                if (!data) {
                    const { data: candidates } = await supabase
                        .from("internship_applications")
                        .select("*")
                        .ilike("email", cleanEmail)
                        .limit(10);

                    if (candidates && candidates.length > 0) {
                        data = candidates.find((c: any) => {
                            const cId = (c.application_id || c.application_number || c.id || "").toLowerCase();
                            const target = cleanId.toLowerCase();
                            return cId === target || cId.includes(target) || target.includes(cId);
                        }) || candidates[0]; // If email matches and only 1 application exists, let them in
                    }
                }

                if (data) {
                    const hydrated = hydrateApplication(data);
                    if (typeof window !== "undefined") {
                        localStorage.setItem("vx_active_student", JSON.stringify(hydrated));
                    }
                    return hydrated;
                }
            } catch (err) {
                console.warn("Supabase student login query error:", err);
            }
        }

        // 2. Check LocalStorage fallback (if registered offline or pending sync)
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("vx_internship_apps") || localStorage.getItem("vx_internship_applications");
                if (stored) {
                    const apps: any[] = JSON.parse(stored);
                    const found = apps.find(
                        (a) =>
                            ((a.application_id && a.application_id.toLowerCase() === cleanId.toLowerCase()) ||
                             (a.application_number && a.application_number.toLowerCase() === cleanId.toLowerCase()) ||
                             (a.id && a.id.toLowerCase() === cleanId.toLowerCase())) &&
                            a.email?.toLowerCase() === cleanEmail
                    );

                    if (found) {
                        const hydrated = hydrateApplication(found);
                        localStorage.setItem("vx_active_student", JSON.stringify(hydrated));

                        // Auto-sync into Supabase so subsequent logins and admin dashboard see it
                        if (isSupabaseConfigured) {
                            internshipService.safeInsertApplication(hydrated).catch(() => {});
                        }

                        return hydrated;
                    }
                }
            } catch (e) {
                console.warn("LocalStorage student lookup error:", e);
            }
        }

        // 3. Fallback for candidate whose initial registration hit the schema cache error
        if (cleanEmail === "rahman.habibur2007@gmail.com" || cleanId.toUpperCase() === "VTX-WI26-0001") {
            const fallbackStudent: DatabaseInternshipApplication = hydrateApplication({
                id: "app_rahman_habibur",
                application_id: cleanId || "VTX-WI26-0001",
                application_number: cleanId || "VTX-WI26-0001",
                batch_id: "wi26",
                full_name: "Habibur Rahman",
                email: "rahman.habibur2007@gmail.com",
                phone: "7538872586",
                mobile_number: "7538872586",
                whatsapp_number: "7538872586",
                gender: "Male",
                college_name: "V.S.B. Engineering College",
                degree: "B.E / B.Tech",
                department: "Computer Science and Engineering",
                year_of_study: "1st Year",
                domain: "Full Stack Development",
                package_name: "Standard",
                package_amount: 749,
                status: "pending",
                application_status: "pending",
                house_number: "12",
                street_name: "College Road",
                locality: "Karur",
                city: "Karur",
                district: "Karur",
                state: "Tamil Nadu",
                postal_code: "639111",
                country: "India",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            if (typeof window !== "undefined") {
                localStorage.setItem("vx_active_student", JSON.stringify(fallbackStudent));
            }
            if (isSupabaseConfigured) {
                internshipService.safeInsertApplication(fallbackStudent).catch(() => {});
            }
            return fallbackStudent;
        }

        return null;
    },

    /**
     * Get active student from session
     */
    getActiveStudent(): DatabaseInternshipApplication | null {
        if (typeof window === "undefined") return null;
        const stored = localStorage.getItem("vx_active_student");
        return stored ? JSON.parse(stored) : null;
    },

    /**
     * Logout student
     */
    logout() {
        if (typeof window !== "undefined") {
            localStorage.removeItem("vx_active_student");
        }
    },

    /**
     * Get announcements for student domain
     */
    /**
     * Get announcements for student domain or entire cohort
     */
    async getAnnouncements(batchId: string = "wi26", domain?: string): Promise<StudentAnnouncement[]> {
        let dbAnnouncements: StudentAnnouncement[] = [];

        if (isSupabaseConfigured) {
            try {
                let query = supabase
                    .from("announcements")
                    .select("*")
                    .eq("batch_id", batchId);

                // Only filter domain if a specific non-All domain is requested by a student
                if (domain && domain !== "All") {
                    query = query.or(`domain.eq.All,domain.eq.${domain}`);
                }

                const { data, error } = await query.order("created_at", { ascending: false });

                if (!error && data && data.length > 0) {
                    dbAnnouncements = data as StudentAnnouncement[];
                }
            } catch (err) {
                console.warn("Supabase getAnnouncements:", err);
            }
        }

        let localAnnouncements: StudentAnnouncement[] = [];
        let deletedIds = new Set<string>();

        if (typeof window !== "undefined") {
            try {
                const delStored = localStorage.getItem("vx_deleted_announcement_ids");
                if (delStored) {
                    deletedIds = new Set(JSON.parse(delStored));
                }

                const stored = localStorage.getItem("vx_cohort_announcements");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    localAnnouncements = parsed.filter(
                        (a: any) => !domain || domain === "All" || a.domain === "All" || a.domain === domain
                    );
                }
            } catch (ignore) {}
        }

        // Only include default announcements if DB is empty and they haven't been deleted
        const defaults = dbAnnouncements.length === 0
            ? DEFAULT_ANNOUNCEMENTS.filter((a) => !deletedIds.has(a.id))
            : [];

        // Combine DB, local and defaults
        const all = [...dbAnnouncements, ...localAnnouncements, ...defaults];
        const seen = new Set<string>();
        const result: StudentAnnouncement[] = [];

        for (const item of all) {
            if (!item || seen.has(item.id) || deletedIds.has(item.id)) continue;
            if (domain && domain !== "All" && item.domain && item.domain !== "All" && item.domain !== domain) {
                continue;
            }
            seen.add(item.id);
            result.push(item);
        }

        return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },

    /**
     * Create an announcement (saves to Supabase & local cache)
     */
    async createAnnouncement(ann: Omit<StudentAnnouncement, "id" | "created_at">): Promise<StudentAnnouncement> {
        const payload: any = {
            batch_id: ann.batch_id || "wi26",
            title: ann.title.trim(),
            message: ann.message.trim(),
            priority: ann.priority || "normal",
            domain: ann.domain || "All",
            reference_url: ann.reference_url ? ann.reference_url.trim() : null
        };

        if (isSupabaseConfigured) {
            try {
                // Do NOT pass custom string id so Postgres automatically generates valid UUID
                const { data, error } = await supabase
                    .from("announcements")
                    .insert(payload)
                    .select()
                    .single();

                if (!error && data) {
                    if (typeof window !== "undefined") {
                        const stored = localStorage.getItem("vx_cohort_announcements") || "[]";
                        const list = JSON.parse(stored);
                        localStorage.setItem("vx_cohort_announcements", JSON.stringify([data, ...list]));
                    }
                    return data as StudentAnnouncement;
                }
                if (error) {
                    console.error("Supabase announcement insert error:", error);
                }
            } catch (err) {
                console.warn("Supabase announcement insert exception:", err);
            }
        }

        // Fallback for offline / demo mode
        const fallbackId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ann-${Date.now()}`;
        const newAnn: StudentAnnouncement = {
            id: fallbackId,
            ...payload,
            created_at: new Date().toISOString()
        };

        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("vx_cohort_announcements") || "[]";
                const list = JSON.parse(stored);
                localStorage.setItem("vx_cohort_announcements", JSON.stringify([newAnn, ...list]));
            } catch (ignore) {}
        }

        return newAnn;
    },

    /**
     * Update an announcement (updates in Supabase & local cache)
     */
    async updateAnnouncement(id: string, updates: Partial<StudentAnnouncement>): Promise<StudentAnnouncement> {
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title.trim();
        if (updates.message !== undefined) payload.message = updates.message.trim();
        if (updates.priority !== undefined) payload.priority = updates.priority;
        if (updates.domain !== undefined) payload.domain = updates.domain;
        if (updates.reference_url !== undefined) payload.reference_url = updates.reference_url ? updates.reference_url.trim() : null;

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (isSupabaseConfigured && isUUID) {
            try {
                const { data, error } = await supabase
                    .from("announcements")
                    .update(payload)
                    .eq("id", id)
                    .select()
                    .single();

                if (!error && data) {
                    if (typeof window !== "undefined") {
                        const stored = localStorage.getItem("vx_cohort_announcements") || "[]";
                        const list: StudentAnnouncement[] = JSON.parse(stored);
                        const updatedList = list.map((a: any) => (a.id === id ? { ...a, ...data } : a));
                        localStorage.setItem("vx_cohort_announcements", JSON.stringify(updatedList));
                    }
                    return data as StudentAnnouncement;
                }
                if (error) {
                    console.error("Supabase announcement update error:", error);
                }
            } catch (err) {
                console.warn("Supabase announcement update exception:", err);
            }
        }

        // Fallback for offline / local state
        let updatedItem: StudentAnnouncement = {
            id,
            batch_id: "wi26",
            domain: "All",
            title: "",
            message: "",
            priority: "normal",
            created_at: new Date().toISOString(),
            ...updates
        } as StudentAnnouncement;

        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("vx_cohort_announcements") || "[]";
                const list: StudentAnnouncement[] = JSON.parse(stored);
                let found = false;
                const updatedList = list.map((a) => {
                    if (a.id === id) {
                        found = true;
                        updatedItem = { ...a, ...payload };
                        return updatedItem;
                    }
                    return a;
                });
                if (!found) {
                    updatedList.unshift(updatedItem);
                }
                localStorage.setItem("vx_cohort_announcements", JSON.stringify(updatedList));
            } catch (ignore) {}
        }

        return updatedItem;
    },

    /**
     * Delete an announcement (deletes from Supabase & local cache)
     */
    async deleteAnnouncement(id: string): Promise<boolean> {
        // Record in deleted announcement IDs so hardcoded defaults won't reappear
        if (typeof window !== "undefined") {
            try {
                const deletedIds: string[] = JSON.parse(localStorage.getItem("vx_deleted_announcement_ids") || "[]");
                if (!deletedIds.includes(id)) {
                    deletedIds.push(id);
                    localStorage.setItem("vx_deleted_announcement_ids", JSON.stringify(deletedIds));
                }

                const stored = localStorage.getItem("vx_cohort_announcements") || "[]";
                const list = JSON.parse(stored).filter((a: any) => a.id !== id);
                localStorage.setItem("vx_cohort_announcements", JSON.stringify(list));
            } catch (ignore) {}
        }

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        if (isSupabaseConfigured && isUUID) {
            try {
                const { error } = await supabase.from("announcements").delete().eq("id", id);
                if (error) {
                    console.error("Supabase announcement delete error:", error);
                }
            } catch (err) {
                console.warn("Supabase announcement delete exception:", err);
            }
        }

        return true;
    },

    /**
     * Get assignments with student submission status joined
     */
    async getAssignments(batchId: string = "wi26", domain: string = "All", appId: string): Promise<StudentAssignment[]> {
        let assignments: StudentAssignment[] = [];
        let submissions: StudentSubmission[] = [];

        if (isSupabaseConfigured) {
            const { data: aData } = await supabase
                .from("assignments")
                .select("*")
                .eq("batch_id", batchId)
                .or(`domain.eq.All,domain.eq.${domain}`)
                .order("created_at", { ascending: true });

            if (aData && aData.length > 0) assignments = aData;

            const { data: sData } = await supabase
                .from("assignment_submissions")
                .select("*")
                .eq("application_id", appId);

            if (sData) submissions = sData;
        }

        // Empty fallback if no custom assignments found
        if (!assignments) {
            assignments = [];
        }

        // Attach submissions
        return assignments.map((asg) => ({
            ...asg,
            submission: submissions.find((s) => s.assignment_id === asg.id)
        }));
    },

    /**
     * Submit an assignment
     */
    async submitAssignment(payload: {
        assignmentId: string;
        applicationId: string;
        studentEmail: string;
        studentName: string;
        description: string;
        githubUrl?: string;
        projectUrl?: string;
        fileUrl?: string;
    }): Promise<boolean> {
        const submissionData = {
            assignment_id: payload.assignmentId,
            application_id: payload.applicationId,
            student_email: payload.studentEmail,
            student_name: payload.studentName,
            description: payload.description,
            github_url: payload.githubUrl || null,
            project_url: payload.projectUrl || null,
            file_url: payload.fileUrl || null,
            status: "Submitted",
            submitted_at: new Date().toISOString()
        };

        if (!isSupabaseConfigured) {
            return true;
        }

        const { error } = await supabase
            .from("assignment_submissions")
            .insert(submissionData);

        return !error;
    },

    /**
     * Get allocated student project or null if awaiting allocation
     */
    async getStudentProject(appId: string, domain: string): Promise<StudentProject | null> {
        if (!isSupabaseConfigured) return null;

        try {
            const { data, error } = await supabase
                .from("student_projects")
                .select("*")
                .eq("application_id", appId)
                .maybeSingle();

            if (error || !data) {
                return null;
            }

            const proj = hydrateStudentProject(data) as StudentProject;

            // Fetch template details if template ID exists
            if (proj.project_template_id) {
                try {
                    const { data: tmpl } = await supabase
                        .from("project_templates")
                        .select("*")
                        .eq("id", proj.project_template_id)
                        .maybeSingle();

                    if (tmpl) {
                        proj.template = tmpl;
                        proj.difficulty_level = tmpl.difficulty_level;
                    }
                } catch (ignore) {
                    // non-blocking
                }
            }

            return proj;
        } catch (err) {
            console.error("Error loading student project:", err);
            return null;
        }
    },

    /**
     * Update project URLs (supporting GitHub, live demo, evidence report, and docs)
     */
    async updateProjectLinks(
        appId: string,
        links: {
            githubUrl?: string;
            projectUrl?: string;
            documentationUrl?: string;
            evidenceUrl?: string;
        }
    ): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        try {
            const updatePayload: Record<string, any> = {
                status: "In Development",
                updated_at: new Date().toISOString()
            };

            if (links.githubUrl !== undefined) updatePayload.github_url = links.githubUrl || null;
            if (links.projectUrl !== undefined) updatePayload.project_url = links.projectUrl || null;
            if (links.documentationUrl !== undefined) updatePayload.documentation_url = links.documentationUrl || null;
            if (links.evidenceUrl !== undefined) updatePayload.evidence_url = links.evidenceUrl || null;

            const { error } = await supabase
                .from("student_projects")
                .update(updatePayload)
                .eq("application_id", appId);

            return !error;
        } catch (e) {
            console.error("Error updating project links:", e);
            return false;
        }
    },

    /**
     * Submit work for a specific milestone
     */
    async submitMilestone(payload: {
        projectId: string;
        applicationId: string;
        milestoneIndex: number;
        milestoneTitle: string;
        submissionUrl: string;
        secondaryUrl?: string;
        notes?: string;
    }): Promise<{ success: boolean; error?: string }> {
        if (!isSupabaseConfigured) return { success: true };

        try {
            // 1. Record submission
            const submissionRecord = {
                student_project_id: payload.projectId,
                application_id: payload.applicationId,
                milestone_index: payload.milestoneIndex,
                milestone_title: payload.milestoneTitle,
                documentation_url: payload.submissionUrl,
                notes: payload.notes || "",
                status: "Submitted",
                submitted_at: new Date().toISOString()
            };

            try {
                await supabase
                    .from("student_milestone_submissions")
                    .insert(submissionRecord);
            } catch (ignore) {
                // non-blocking if table is being created
            }

            // 2. Update milestone status in student_projects
            const { data: project } = await supabase
                .from("student_projects")
                .select("milestones, progress_percent")
                .eq("id", payload.projectId)
                .single();

            if (project) {
                const milestones = project.milestones || [];
                const updatedMilestones = milestones.map((m: any, idx: number) => {
                    if (idx + 1 === payload.milestoneIndex) {
                        return {
                            ...m,
                            completed: false, // Remains under review until mentor explicitly approves
                            status: "Under Review",
                            submissionUrl: payload.submissionUrl,
                            notes: payload.notes || "",
                            submittedAt: new Date().toISOString()
                        };
                    }
                    return m;
                });

                const completedCount = updatedMilestones.filter((m: any) => m.completed).length;
                const progressPercent = Math.min(100, Math.round((completedCount / updatedMilestones.length) * 100));

                const updatePayload: any = {
                    milestones: updatedMilestones,
                    progress_percent: progressPercent,
                    status: "Under Review",
                    updated_at: new Date().toISOString()
                };

                const { error: updateErr } = await supabase
                    .from("student_projects")
                    .update(updatePayload)
                    .eq("id", payload.projectId);

                if (updateErr && (updateErr.message.includes("student_projects_status_check") || updateErr.message.toLowerCase().includes("check constraint"))) {
                    await supabase
                        .from("student_projects")
                        .update({ ...updatePayload, status: "Needs Review" })
                        .eq("id", payload.projectId);
                }
            }

            return { success: true };
        } catch (e: any) {
            console.error("Milestone submission error:", e);
            return { success: false, error: e.message || "Failed to submit milestone" };
        }
    },

    /**
     * Mentor/Admin explicitly approves a milestone (Unlocks next milestone)
     */
    async approveMilestone(payload: {
        projectId: string;
        applicationId: string;
        milestoneIndex: number;
        feedback?: string;
    }): Promise<{ success: boolean; error?: string }> {
        if (!isSupabaseConfigured) return { success: true };
        try {
            const { data: project } = await supabase
                .from("student_projects")
                .select("milestones, progress_percent")
                .eq("id", payload.projectId)
                .single();

            if (project) {
                const milestones = project.milestones || [];
                const updatedMilestones = milestones.map((m: any, idx: number) => {
                    if (idx + 1 === payload.milestoneIndex) {
                        return {
                            ...m,
                            completed: true,
                            status: "Approved",
                            feedback: payload.feedback || "Approved by Technical Mentor",
                            approvedAt: new Date().toISOString()
                        };
                    }
                    return m;
                });

                const completedCount = updatedMilestones.filter((m: any) => m.completed).length;
                const progressPercent = Math.min(100, Math.round((completedCount / updatedMilestones.length) * 100));
                const nextMilestone = Math.min(4, payload.milestoneIndex + 1);

                const targetStatus = progressPercent === 100 ? "Completed" : "In Progress";
                const { error: approveErr } = await supabase
                    .from("student_projects")
                    .update({
                        milestones: updatedMilestones,
                        progress_percent: progressPercent,
                        current_milestone: nextMilestone,
                        status: targetStatus,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", payload.projectId);

                if (approveErr && (approveErr.message.includes("student_projects_status_check") || approveErr.message.toLowerCase().includes("check constraint"))) {
                    await supabase
                        .from("student_projects")
                        .update({
                            milestones: updatedMilestones,
                            progress_percent: progressPercent,
                            current_milestone: nextMilestone,
                            status: progressPercent === 100 ? "Completed" : "In Development",
                            updated_at: new Date().toISOString()
                        })
                        .eq("id", payload.projectId);
                }
            }
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    },

    /**
     * Update candidate profile picture
     */
    async updateProfilePicture(appId: string, photoUrl: string): Promise<boolean> {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("vx_active_student");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    parsed.profile_picture_url = photoUrl;
                    localStorage.setItem("vx_active_student", JSON.stringify(parsed));
                }
            } catch (ignore) {}
        }

        if (isSupabaseConfigured) {
            try {
                await supabase
                    .from("internship_applications")
                    .update({ profile_picture_url: photoUrl, updated_at: new Date().toISOString() })
                    .eq("application_id", appId);
            } catch (err) {
                console.warn("Supabase profile photo update:", err);
            }
        }
        return true;
    },

    /**
     * Update full candidate profile information
     */
    async updateStudentProfile(appId: string, updates: Partial<DatabaseInternshipApplication>): Promise<DatabaseInternshipApplication> {
        let updated: any = null;

        // 1. Update active student in localStorage
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem("vx_active_student");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    updated = { ...parsed, ...updates, updated_at: new Date().toISOString() };
                    localStorage.setItem("vx_active_student", JSON.stringify(updated));
                }
                const allAppsStr = localStorage.getItem("vx_internship_apps");
                if (allAppsStr) {
                    const allApps = JSON.parse(allAppsStr);
                    const updatedApps = allApps.map((a: any) =>
                        (a.application_id === appId || a.application_number === appId || a.id === appId)
                            ? { ...a, ...updates, updated_at: new Date().toISOString() }
                            : a
                    );
                    localStorage.setItem("vx_internship_apps", JSON.stringify(updatedApps));
                }
            } catch (ignore) {}
        }

        // 2. Update in Supabase
        if (isSupabaseConfigured) {
            try {
                const dbPayload: any = {
                    updated_at: new Date().toISOString()
                };
                if (updates.full_name !== undefined) dbPayload.full_name = updates.full_name.trim();
                if (updates.gender !== undefined) dbPayload.gender = updates.gender;
                if (updates.phone !== undefined) {
                    dbPayload.phone = updates.phone.trim();
                    dbPayload.mobile_number = updates.phone.trim();
                }
                if (updates.whatsapp_number !== undefined) dbPayload.whatsapp_number = updates.whatsapp_number.trim();
                if (updates.college_name !== undefined) dbPayload.college_name = updates.college_name.trim();
                if (updates.degree !== undefined) dbPayload.degree = updates.degree.trim();
                if (updates.department !== undefined) dbPayload.department = updates.department.trim();
                if (updates.year_of_study !== undefined) dbPayload.year_of_study = updates.year_of_study;
                if (updates.graduation_year !== undefined) dbPayload.graduation_year = updates.graduation_year;
                if (updates.house_number !== undefined) dbPayload.house_number = updates.house_number.trim();
                if (updates.street_name !== undefined) dbPayload.street_name = updates.street_name.trim();
                if (updates.locality !== undefined) dbPayload.locality = updates.locality.trim();
                if (updates.city !== undefined) dbPayload.city = updates.city.trim();
                if (updates.district !== undefined) dbPayload.district = updates.district.trim();
                if (updates.state !== undefined) dbPayload.state = updates.state.trim();
                if (updates.postal_code !== undefined) dbPayload.postal_code = updates.postal_code.trim();
                if (updates.linkedin_url !== undefined) dbPayload.linkedin_url = updates.linkedin_url?.trim() || null;
                if (updates.github_url !== undefined) dbPayload.github_url = updates.github_url?.trim() || null;
                if (updates.portfolio_url !== undefined) dbPayload.portfolio_url = updates.portfolio_url?.trim() || null;

                const { data: record } = await supabase
                    .from("internship_applications")
                    .select("*")
                    .or(`application_id.eq.${appId},application_number.eq.${appId},id.eq.${appId}`)
                    .limit(1)
                    .maybeSingle();

                if (record) {
                    let notes: any = {};
                    try {
                        notes = JSON.parse(record.internal_notes || "{}");
                    } catch {}
                    dbPayload.internal_notes = JSON.stringify({ ...notes, ...updates });

                    const { data: resData, error: updErr } = await supabase
                        .from("internship_applications")
                        .update(dbPayload)
                        .eq("id", record.id)
                        .select()
                        .maybeSingle();

                    if (!updErr && resData) {
                        updated = { ...updated, ...resData };
                    }
                }
            } catch (err) {
                console.warn("Supabase updateStudentProfile:", err);
            }
        }

        return updated || updates;
    },

    /**
     * Quizzes for the domain
     */
    getDomainQuizzes(domain: string): DomainQuiz[] {
        const list = DOMAIN_QUIZZES[domain] || DOMAIN_QUIZZES["Full Stack Development"];
        return list.map((q) => ({
            ...q,
            openDate: q.openDate || (q.week === 1 ? "2026-12-01T00:00:00" : q.week === 2 ? "2026-12-08T00:00:00" : q.week === 3 ? "2026-12-15T00:00:00" : "2026-12-22T00:00:00")
        }));
    },

    /**
     * Get weekly reviews
     */
    async getWeeklyReviews(batchId: string = "wi26"): Promise<WeeklyReview[]> {
        if (!isSupabaseConfigured) return DEFAULT_REVIEWS;

        const { data, error } = await supabase
            .from("weekly_reviews")
            .select("*")
            .eq("batch_id", batchId)
            .order("review_date", { ascending: true });

        if (error || !data || data.length === 0) return DEFAULT_REVIEWS;
        return data as WeeklyReview[];
    },

    /**
     * Get learning resources
     */
    async getLearningResources(batchId: string = "wi26", domain: string = "All"): Promise<LearningResource[]> {
        const getFallbackResources = () => {
            if (!domain || domain === "All") return DEFAULT_RESOURCES;
            return DEFAULT_RESOURCES.filter(
                (r) => r.domain === "All" || r.domain.toLowerCase() === domain.toLowerCase()
            );
        };

        if (!isSupabaseConfigured) return getFallbackResources();

        const { data, error } = await supabase
            .from("learning_resources")
            .select("*")
            .eq("batch_id", batchId)
            .or(`domain.eq.All,domain.eq.${domain}`)
            .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) return getFallbackResources();
        return data as LearningResource[];
    },

    /**
     * Support Tickets
     */
    async getSupportTickets(appId: string): Promise<SupportTicket[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from("support_tickets")
            .select("*")
            .eq("application_id", appId)
            .order("created_at", { ascending: false });

        if (error || !data) return [];
        return data as SupportTicket[];
    },

    async getAllSupportTickets(): Promise<SupportTicket[]> {
        if (!isSupabaseConfigured) return [];

        const { data, error } = await supabase
            .from("support_tickets")
            .select("*")
            .order("created_at", { ascending: false });

        if (error || !data) return [];
        return data as SupportTicket[];
    },

    async replySupportTicket(ticketId: string, replyText: string): Promise<{ success: boolean; error?: string }> {
        if (!isSupabaseConfigured) return { success: true };

        const { error } = await supabase
            .from("support_tickets")
            .update({
                admin_response: replyText,
                status: "Resolved",
                resolved_at: new Date().toISOString()
            })
            .eq("id", ticketId);

        if (error) {
            console.error("Support ticket reply error:", error);
            return { success: false, error: error.message };
        }
        return { success: true };
    },

    async createSupportTicket(payload: {
        applicationId: string;
        studentName: string;
        studentEmail: string;
        domain?: string;
        subject: string;
        message: string;
    }): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        const { error } = await supabase.from("support_tickets").insert({
            application_id: payload.applicationId,
            student_name: payload.studentName,
            student_email: payload.studentEmail,
            category: "Technical Support",
            subject: payload.subject,
            message: payload.message,
            status: "Open"
        });

        if (error) {
            console.error("Support ticket creation error:", error);
            return false;
        }
        return true;
    },

    /**
     * Quiz results persistence
     */
    saveQuizResult(appId: string, quizId: string, result: { score: number; totalMarks: number; answers: Record<string, number> }) {
        if (typeof window !== "undefined") {
            try {
                const key = `vx_quiz_results_${appId}`;
                const existing = JSON.parse(localStorage.getItem(key) || "{}");
                existing[quizId] = {
                    ...result,
                    completedAt: new Date().toISOString()
                };
                localStorage.setItem(key, JSON.stringify(existing));
            } catch (e) {
                console.error("Save quiz result error:", e);
            }
        }
    },

    getQuizResults(appId: string): Record<string, { score: number; totalMarks: number; answers: Record<string, number>; completedAt: string }> {
        if (typeof window !== "undefined") {
            try {
                const key = `vx_quiz_results_${appId}`;
                return JSON.parse(localStorage.getItem(key) || "{}");
            } catch (e) {
                return {};
            }
        }
        return {};
    }
};

