import { supabase, isSupabaseConfigured, DatabaseInternshipApplication } from "@/lib/supabase";

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
    project_title: string;
    description: string;
    github_url?: string;
    project_url?: string;
    status: "Planning" | "In Development" | "Testing" | "Completed" | "Needs Review";
    progress_percent: number;
    milestones: { title: string; completed: boolean }[];
    mentor_feedback?: string;
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
        id: "rev-01",
        batch_id: "wi26",
        domain: "All",
        review_date: "2026-12-02T18:30:00+05:30",
        topic: "Inaugural Technical Orientation & Workspace Setup",
        assigned_mentor: "Senior Vectonix Engineering Team",
        meeting_link: "https://meet.google.com/vectonix-wi26",
        status: "Upcoming"
    },
    {
        id: "rev-02",
        batch_id: "wi26",
        domain: "All",
        review_date: "2026-12-09T18:30:00+05:30",
        topic: "Sprint 1 Milestone Code Review & Architecture Q&A",
        assigned_mentor: "Lead Technical Mentors",
        meeting_link: "https://meet.google.com/vectonix-wi26",
        status: "Upcoming"
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
                const { data, error } = await supabase
                    .from("internship_applications")
                    .select("*")
                    .or(`application_id.ilike.${cleanId},application_number.ilike.${cleanId}`)
                    .ilike("email", cleanEmail)
                    .maybeSingle();

                if (!error && data) {
                    if (typeof window !== "undefined") {
                        localStorage.setItem("vx_active_student", JSON.stringify(data));
                    }
                    return data as DatabaseInternshipApplication;
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
                    const apps: DatabaseInternshipApplication[] = JSON.parse(stored);
                    const found = apps.find(
                        (a) =>
                            ((a.application_id && a.application_id.toLowerCase() === cleanId.toLowerCase()) ||
                             (a.application_number && a.application_number.toLowerCase() === cleanId.toLowerCase())) &&
                            a.email?.toLowerCase() === cleanEmail
                    );

                    if (found) {
                        localStorage.setItem("vx_active_student", JSON.stringify(found));

                        // Auto-sync into Supabase so subsequent logins and admin dashboard see it!
                        if (isSupabaseConfigured) {
                            (async () => {
                                try {
                                    await supabase.from("internship_applications").insert(found);
                                    console.log("Auto-synced student application to Supabase upon login:", found.application_id);
                                } catch {
                                    // Silent
                                }
                            })();
                        }

                        return found;
                    }
                }
            } catch (e) {
                console.warn("LocalStorage student lookup error:", e);
            }
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
     * Get or initialize student project
     */
    async getStudentProject(appId: string, domain: string): Promise<StudentProject> {
        if (isSupabaseConfigured) {
            const { data } = await supabase
                .from("student_projects")
                .select("*")
                .eq("application_id", appId)
                .single();

            if (data) return data as StudentProject;
        }

        return {
            id: `proj_${appId}`,
            application_id: appId,
            batch_id: "wi26",
            domain: domain,
            project_title: `Capstone Industrial Project (${domain})`,
            description: `Design and deliver an industry-grade project in ${domain} with complete documentation, testing, and deployment.`,
            status: "Planning",
            progress_percent: 25,
            milestones: [
                { title: "Project Proposal & Architecture Design", completed: true },
                { title: "Core Module & API Implementation", completed: false },
                { title: "Integration, Testing & UI Polish", completed: false },
                { title: "Final Deployment & Documentation", completed: false }
            ]
        };
    },

    /**
     * Update project links
     */
    async updateProjectLinks(appId: string, githubUrl: string, projectUrl: string): Promise<boolean> {
        if (!isSupabaseConfigured) return true;

        const { error } = await supabase
            .from("student_projects")
            .update({
                github_url: githubUrl,
                project_url: projectUrl,
                status: "In Development",
                progress_percent: 50,
                updated_at: new Date().toISOString()
            })
            .eq("application_id", appId);

        return !error;
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

