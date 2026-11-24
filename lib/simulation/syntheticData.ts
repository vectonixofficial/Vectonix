import { DatabaseInternshipApplication, ProjectTemplate } from "@/lib/supabase";
import {
    StudentProject,
    StudentAnnouncement,
    StudentAssignment,
    LearningResource,
    WeeklyReview,
    SupportTicket,
    DomainQuiz
} from "@/lib/services/studentService";
import { INITIAL_PROJECT_TEMPLATES, normalizeDomain } from "@/lib/project-bank";

export type ApplicationStatusType = "Accepted" | "Pending" | "Rejected";
export type ProjectStatusType = "Not Allocated" | "Allocated" | "In Progress" | "Completed";
export type MilestoneStatusType = "Not Started" | "Submitted" | "Under Review" | "Approved" | "Revision Requested";

export interface SimulationConfig {
    domain: string;
    applicationStatus: ApplicationStatusType;
    projectStatus: ProjectStatusType;
    milestoneStatus: MilestoneStatusType;
    projectTemplateId?: string;
    scenarioName?: string;
}

export const SIMULATION_DOMAINS = [
    {
        id: "full-stack",
        name: "Full Stack Development",
        shortName: "Full Stack",
        icon: "Code",
        color: "indigo",
        defaultTemplateId: "vtx-fs-01",
        description: "Modern web architecture, responsive React/Next.js frontend, REST/GraphQL APIs, and database engineering."
    },
    {
        id: "ai-ml",
        name: "AI / Machine Learning",
        shortName: "AI/ML",
        icon: "Brain",
        color: "purple",
        defaultTemplateId: "AI-ML-01",
        description: "Applied machine learning, NLP, computer vision pipelines, and intelligent retrieval systems."
    },
    {
        id: "cybersecurity",
        name: "Cybersecurity",
        shortName: "Cybersecurity",
        icon: "Shield",
        color: "rose",
        defaultTemplateId: "vtx-cs-01",
        description: "Vulnerability analysis, secure authentication, API penetration testing, and defensive posture."
    },
    {
        id: "robotics",
        name: "Robotics",
        shortName: "Robotics & IoT",
        icon: "Bot",
        color: "emerald",
        defaultTemplateId: "ROB-01",
        description: "Autonomous navigation, kinematic simulations, sensor fusion, and ROS 2 / Gazebo / Webots workflows."
    },
    {
        id: "sta",
        name: "Software Testing and Automation",
        shortName: "STA",
        icon: "FlaskConical",
        color: "amber",
        defaultTemplateId: "STA-01",
        description: "Automated end-to-end testing, API verification, load & performance benchmarks, and CI/CD pipelines."
    },
    {
        id: "digital-marketing",
        name: "Digital Marketing",
        shortName: "Marketing",
        icon: "TrendingUp",
        color: "blue",
        defaultTemplateId: "vtx-dm-01",
        description: "Growth engineering, technical SEO auditing, multi-channel performance campaigns, and conversion analytics."
    }
];

export const SCENARIO_PRESETS: { name: string; description: string; config: SimulationConfig }[] = [
    {
        name: "Newly Accepted Student",
        description: "Student has been approved but no project has been assigned yet. Shows project onboarding state.",
        config: {
            domain: "Full Stack Development",
            applicationStatus: "Accepted",
            projectStatus: "Not Allocated",
            milestoneStatus: "Not Started"
        }
    },
    {
        name: "Allocated Project (Day 1)",
        description: "Project assigned. Milestone 1 is open for submission. Milestones 2-4 are locked.",
        config: {
            domain: "AI / Machine Learning",
            applicationStatus: "Accepted",
            projectStatus: "Allocated",
            milestoneStatus: "Not Started"
        }
    },
    {
        name: "Milestone 1 Submitted (Pending Review)",
        description: "Student submitted Milestone 1 with GitHub and architecture links. Awaiting mentor feedback.",
        config: {
            domain: "Robotics",
            applicationStatus: "Accepted",
            projectStatus: "In Progress",
            milestoneStatus: "Submitted"
        }
    },
    {
        name: "Milestone 1 Revision Requested",
        description: "Mentor reviewed Milestone 1 and requested changes with detailed constructive feedback.",
        config: {
            domain: "Software Testing and Automation",
            applicationStatus: "Accepted",
            projectStatus: "In Progress",
            milestoneStatus: "Revision Requested"
        }
    },
    {
        name: "Mid-Term Progress (Milestones 1 & 2 Approved)",
        description: "Milestones 1 and 2 completed and approved (50% progress). Milestone 3 is currently in development.",
        config: {
            domain: "Cybersecurity",
            applicationStatus: "Accepted",
            projectStatus: "In Progress",
            milestoneStatus: "Approved"
        }
    },
    {
        name: "Final Internship Completion (100% Progress)",
        description: "All 4 milestones approved by mentor. Final evaluation marks awarded and certificate unlocked.",
        config: {
            domain: "Digital Marketing",
            applicationStatus: "Accepted",
            projectStatus: "Completed",
            milestoneStatus: "Approved"
        }
    },
    {
        name: "Pending Applicant (Pre-Acceptance)",
        description: "Student application is under review. Restricted project and milestone details remain sealed.",
        config: {
            domain: "AI / Machine Learning",
            applicationStatus: "Pending",
            projectStatus: "Not Allocated",
            milestoneStatus: "Not Started"
        }
    },
    {
        name: "Rejected Applicant",
        description: "Application was not accepted. System explains decision and locks dashboard modules.",
        config: {
            domain: "Full Stack Development",
            applicationStatus: "Rejected",
            projectStatus: "Not Allocated",
            milestoneStatus: "Not Started"
        }
    }
];

export function generateSyntheticStudent(config: SimulationConfig): DatabaseInternshipApplication {
    const domainNorm = normalizeDomain(config.domain);
    const domainMeta = SIMULATION_DOMAINS.find(d => normalizeDomain(d.name) === domainNorm) || SIMULATION_DOMAINS[0];

    const studentNames: Record<string, string> = {
        "Full Stack Development": "Alex Rivera [Simulated Student]",
        "AI / Machine Learning": "Dr. Sarah Chen [Simulated Student]",
        "Cybersecurity": "Marcus Vance [Simulated Student]",
        "Robotics": "Kavita Raman [Simulated Student]",
        "Software Testing and Automation": "David Kim [Simulated Student]",
        "Digital Marketing": "Elena Rostova [Simulated Student]"
    };

    const colleges: Record<string, string> = {
        "Full Stack Development": "National Institute of Technology (NIT)",
        "AI / Machine Learning": "Indian Institute of Science (IISc)",
        "Cybersecurity": "Birla Institute of Technology and Science (BITS)",
        "Robotics": "Indian Institute of Technology (IIT Bombay)",
        "Software Testing and Automation": "Delhi Technological University (DTU)",
        "Digital Marketing": "Symbiosis Institute of Media & Communication"
    };

    const appId = `SIM-WI26-${domainMeta.id.toUpperCase()}-001`;

    return {
        id: `sim-user-${domainMeta.id}`,
        application_id: appId,
        application_number: appId,
        batch_id: "wi26",
        full_name: studentNames[domainNorm] || "Jordan Blake [Simulated Student]",
        email: `student.sim.${domainMeta.id}@vectonix.test`,
        phone: "+91 9876543210",
        whatsapp_number: "+91 9876543210",
        college_name: colleges[domainNorm] || "Vectonix Engineering Institute",
        degree: "Bachelor of Technology (B.Tech)",
        department: "Computer Science and Engineering",
        year_of_study: "3rd Year",
        graduation_year: "2027",
        domain: domainNorm,
        status: config.applicationStatus,
        payment_status: config.applicationStatus === "Accepted" ? "Verified" : "Pending",
        duration: "4 Weeks",
        linkedin_url: "https://linkedin.com/in/simulated-student",
        github_url: "https://github.com/vectonix-simulated-student",
        portfolio_url: "https://vectonix.in",
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        updated_at: new Date().toISOString()
    } as any;
}

export function generateSyntheticProject(
    config: SimulationConfig,
    student: DatabaseInternshipApplication
): StudentProject | null {
    if (config.projectStatus === "Not Allocated" || config.applicationStatus !== "Accepted") {
        return null;
    }

    const domainNorm = normalizeDomain(config.domain);
    const domainTemplates = INITIAL_PROJECT_TEMPLATES.filter(
        t => normalizeDomain(t.domain) === domainNorm
    );

    const template: ProjectTemplate =
        (config.projectTemplateId
            ? domainTemplates.find(t => t.id === config.projectTemplateId)
            : null) ||
        domainTemplates[0] ||
        INITIAL_PROJECT_TEMPLATES[0];

    // Compute milestone states based on config
    const milestones = [
        {
            title: "Milestone 1 — Architecture, System Blueprint & Environment Setup",
            completed: false,
            status: "Not Started",
            feedback: ""
        },
        {
            title: "Milestone 2 — Core Algorithm, Business Logic & Functional Features",
            completed: false,
            status: "Not Started",
            feedback: ""
        },
        {
            title: "Milestone 3 — Advanced Capabilities, Optimization & Integration",
            completed: false,
            status: "Not Started",
            feedback: ""
        },
        {
            title: "Milestone 4 — Rigorous Verification, Documentation & Video Demonstration",
            completed: false,
            status: "Not Started",
            feedback: ""
        }
    ];

    let currentMilestone = 1;
    let progressPercent = 0;
    let projectStatusText = "In Progress";
    let mentorFeedback = "";

    if (config.projectStatus === "Allocated" && config.milestoneStatus === "Not Started") {
        currentMilestone = 1;
        progressPercent = 0;
        projectStatusText = "Not Started";
    } else if (config.milestoneStatus === "Submitted") {
        currentMilestone = 1;
        progressPercent = 10;
        projectStatusText = "Under Review";
        milestones[0].status = "Submitted";
    } else if (config.milestoneStatus === "Under Review") {
        currentMilestone = 1;
        progressPercent = 15;
        projectStatusText = "Under Review";
        milestones[0].status = "Under Review";
    } else if (config.milestoneStatus === "Revision Requested") {
        currentMilestone = 1;
        progressPercent = 15;
        projectStatusText = "Revision Required";
        milestones[0].status = "Revision Required";
        milestones[0].feedback = "Please add unit test coverage for edge cases and ensure responsive viewport styling is verified on mobile.";
        mentorFeedback = "Mentor revision note: Address test failure cases in Milestone 1 before progressing to Milestone 2.";
    } else if (config.milestoneStatus === "Approved" && config.projectStatus !== "Completed") {
        currentMilestone = 3;
        progressPercent = 50;
        projectStatusText = "In Development";
        milestones[0].completed = true;
        milestones[0].status = "Approved";
        milestones[0].feedback = "Excellent architecture blueprint and component hierarchy. Clean code structure.";
        milestones[1].completed = true;
        milestones[1].status = "Approved";
        milestones[1].feedback = "Core functional logic verified and running smoothly without regressions.";
        milestones[2].status = "In Progress";
    } else if (config.projectStatus === "Completed") {
        currentMilestone = 4;
        progressPercent = 100;
        projectStatusText = "Completed";
        milestones.forEach((m, idx) => {
            m.completed = true;
            m.status = "Approved";
            m.feedback = `Milestone ${idx + 1} reviewed and approved with distinction.`;
        });
        mentorFeedback = "Outstanding work across all four sprints. Intern demonstrated strong problem-solving and architectural rigor.";
    }

    const mentorsByDomain: Record<string, { name: string; email: string }> = {
        "Full Stack Development": { name: "Senior Full Stack Mentor", email: "mentor.fullstack@vectonix.in" },
        "AI / Machine Learning": { name: "AI & Machine Learning Research Lead", email: "mentor.aiml@vectonix.in" },
        "Robotics": { name: "Robotics & Embedded Systems Lead", email: "mentor.robotics@vectonix.in" },
        "Cybersecurity": { name: "Cybersecurity Specialist", email: "mentor.security@vectonix.in" },
        "Software Testing and Automation": { name: "QA & Test Automation Lead", email: "mentor.testing@vectonix.in" },
        "Digital Marketing": { name: "Digital Marketing Director", email: "mentor.marketing@vectonix.in" }
    };

    const mentor = mentorsByDomain[domainNorm] || mentorsByDomain["Full Stack Development"];

    return {
        id: `sim-proj-${template.id.toLowerCase()}`,
        application_id: student.application_id || student.id,
        batch_id: "wi26",
        domain: domainNorm,
        project_template_id: template.id,
        project_title: template.title,
        description: template.short_description,
        assigned_mentor_id: "sim-mentor-id",
        assigned_mentor_name: mentor.name,
        start_date: "2026-11-25",
        deadline: "2026-12-23",
        status: projectStatusText as any,
        progress_percent: progressPercent,
        current_milestone: currentMilestone,
        milestones,
        mentor_feedback: mentorFeedback,
        evaluation_marks: progressPercent === 100 ? 94 : undefined,
        github_url: "https://github.com/vectonix-simulated-student/internship-project",
        project_url: "https://vectonix-simulated-demo.vercel.app",
        documentation_url: "https://docs.vectonix.in/simulation-specs",
        evidence_url: "https://drive.google.com/file/d/simulated-evidence/view",
        template,
        difficulty_level: template.difficulty_level
    };
}

export function generateSyntheticAnnouncements(domain: string): StudentAnnouncement[] {
    const domainNorm = normalizeDomain(domain);
    return [
        {
            id: "sim-ann-1",
            batch_id: "wi26",
            domain: "All",
            title: "Welcome to Vectonix Winter Internship 2026!",
            message: "We are thrilled to commence the WI26 cohort. Please review your four-milestone timeline and attend the weekly sync on Google Meet every Wednesday at 18:00 IST.",
            priority: "important",
            created_at: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
            id: "sim-ann-2",
            batch_id: "wi26",
            domain: domainNorm,
            title: `${domainNorm} — Milestone Submission Guidelines & Sprint Advice`,
            message: `Ensure that all deliverables for ${domainNorm} strictly follow official coding conventions and contain comprehensive test validation before submitting for mentor review.`,
            priority: "normal",
            reference_url: "https://vectonix.in/internship/dashboard",
            created_at: new Date(Date.now() - 1 * 86400000).toISOString()
        }
    ];
}

export function generateSyntheticAssignments(domain: string, appId: string): StudentAssignment[] {
    const domainNorm = normalizeDomain(domain);
    return [
        {
            id: `sim-asg-${domainNorm.toLowerCase().replace(/[^a-z0-9]/g, "-")}-1`,
            batch_id: "wi26",
            domain: domainNorm,
            title: `${domainNorm} Foundation & Architecture Quiz`,
            description: "Assess fundamental engineering principles, toolchains, and design patterns required for your domain.",
            deadline: "2026-12-05",
            max_marks: 100,
            difficulty: "Intermediate",
            is_active: true
        }
    ];
}

export function generateSyntheticReviews(): WeeklyReview[] {
    return [
        {
            id: "sim-rev-1",
            batch_id: "wi26",
            domain: "All",
            topic: "Sprint 1 Technical Kickoff & Architecture Review",
            review_date: "2026-12-02",
            assigned_mentor: "Senior Technical Mentor",
            meeting_link: "https://meet.google.com/sim-vtx-sync",
            status: "Upcoming"
        },
        {
            id: "sim-rev-2",
            batch_id: "wi26",
            domain: "All",
            topic: "Sprint 2 Mid-Term Progress & Code Review",
            review_date: "2026-12-09",
            assigned_mentor: "Senior Technical Mentor",
            meeting_link: "https://meet.google.com/sim-vtx-sync",
            status: "Upcoming"
        }
    ];
}

export function generateSyntheticTickets(appId: string): SupportTicket[] {
    return [
        {
            id: "sim-tkt-1",
            application_id: appId,
            student_name: "Simulated Student",
            student_email: "student.sim@vectonix.test",
            domain: "Engineering",
            subject: "Clarification on Milestone 2 unit test coverage rubric",
            message: "Should our test suite include mock API failures in addition to standard 200 OK responses?",
            status: "Resolved",
            admin_response: "Yes, testing edge cases like 400 Bad Request and 500 server errors is highly recommended and earns bonus marks in the evaluation.",
            created_at: new Date(Date.now() - 2 * 86400000).toISOString()
        }
    ];
}
