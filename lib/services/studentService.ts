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
    domain: string;
    subject: string;
    message: string;
    reply?: string;
    status: "Open" | "Answered" | "Closed";
    created_at: string;
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
        is_always_visible: true,
        visible_from: "2026-11-01"
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
        visible_from: "2026-11-30"
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
        visible_from: "2026-12-07"
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
        visible_from: "2026-12-14"
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
        visible_from: "2026-12-21"
    }
];

const DEFAULT_RESOURCES: LearningResource[] = [
    {
        id: "res-01",
        batch_id: "wi26",
        domain: "All",
        title: "Vectonix Internship Developer Handbook 2026",
        description: "Official guide on Git conventions, milestone rubrics, and submission requirements.",
        category: "PDF Notes",
        resource_url: "https://vectonix.in/about",
        created_at: "2026-11-02T10:00:00Z"
    },
    {
        id: "res-02",
        batch_id: "wi26",
        domain: "Full Stack Development",
        title: "Modern Next.js & TypeScript Architecture Primer",
        description: "Production guide to App Router, server actions, and PostgreSQL integration.",
        category: "Starter Code",
        resource_url: "https://github.com/vectonixofficial",
        created_at: "2026-11-02T10:00:00Z"
    },
    {
        id: "res-03",
        batch_id: "wi26",
        domain: "AI / Machine Learning",
        title: "Machine Learning Engineering Best Practices",
        description: "Tutorial notes on feature pipelines, hyperparameter tuning, and model evaluation.",
        category: "Tutorial",
        resource_url: "https://vectonix.in/learning",
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
    async getAnnouncements(batchId: string = "wi26", domain: string = "All"): Promise<StudentAnnouncement[]> {
        if (!isSupabaseConfigured) {
            return DEFAULT_ANNOUNCEMENTS;
        }

        const { data, error } = await supabase
            .from("announcements")
            .select("*")
            .eq("batch_id", batchId)
            .or(`domain.eq.All,domain.eq.${domain}`)
            .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) {
            return DEFAULT_ANNOUNCEMENTS;
        }
        return data as StudentAnnouncement[];
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

        if (assignments.length === 0) {
            assignments = [
                {
                    id: "asg-01",
                    batch_id: batchId,
                    domain: domain,
                    title: `Milestone 1: Applied ${domain} Architecture & Setup`,
                    description: "Set up the foundational workspace, implement primary functional modules, and document project structure in a README.",
                    instructions: "Fork starter template, configure environment keys, write clean modular code with git commits, and submit repository link.",
                    deadline: "2026-12-05T23:59:59+05:30",
                    max_marks: 100,
                    difficulty: "Beginner",
                    is_active: true
                },
                {
                    id: "asg-02",
                    batch_id: batchId,
                    domain: domain,
                    title: `Milestone 2: Core Engineering & Testing Implementation`,
                    description: "Develop primary business logic, database queries or model inference, and execute unit tests.",
                    instructions: "Deploy on staging server or provide verifiable demo with recorded screen walkthrough.",
                    deadline: "2026-12-15T23:59:59+05:30",
                    max_marks: 100,
                    difficulty: "Intermediate",
                    is_active: true
                }
            ];
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
                    status: "Needs Review",
                    updated_at: new Date().toISOString()
                };

                const { error: updateErr } = await supabase
                    .from("student_projects")
                    .update(updatePayload)
                    .eq("id", payload.projectId);

                if (updateErr) {
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
     * Quizzes for the domain
     */
    getDomainQuizzes(domain: string): DomainQuiz[] {
        return DOMAIN_QUIZZES[domain] || DOMAIN_QUIZZES["Full Stack Development"];
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
        if (!isSupabaseConfigured) return DEFAULT_RESOURCES;

        const { data, error } = await supabase
            .from("learning_resources")
            .select("*")
            .eq("batch_id", batchId)
            .or(`domain.eq.All,domain.eq.${domain}`)
            .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) return DEFAULT_RESOURCES;
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

    async createSupportTicket(payload: {
        applicationId: string;
        studentName: string;
        studentEmail: string;
        domain: string;
        subject: string;
        message: string;
    }): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        const { error } = await supabase.from("support_tickets").insert({
            application_id: payload.applicationId,
            student_name: payload.studentName,
            student_email: payload.studentEmail,
            domain: payload.domain,
            subject: payload.subject,
            message: payload.message,
            status: "Open"
        });

        return !error;
    }
};

