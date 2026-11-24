"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DatabaseInternshipApplication } from "@/lib/supabase";
import {
    StudentProject,
    StudentAnnouncement,
    StudentAssignment,
    LearningResource,
    WeeklyReview,
    SupportTicket,
    DomainQuiz,
    studentService
} from "@/lib/services/studentService";
import {
    SimulationConfig,
    generateSyntheticStudent,
    generateSyntheticProject,
    generateSyntheticAnnouncements,
    generateSyntheticAssignments,
    generateSyntheticReviews,
    generateSyntheticTickets,
    SCENARIO_PRESETS,
    SIMULATION_DOMAINS
} from "./syntheticData";
import { normalizeDomain } from "@/lib/project-bank";

export interface SimulationContextType {
    isSimulation: boolean;
    config: SimulationConfig;
    student: DatabaseInternshipApplication;
    project: StudentProject | null;
    announcements: StudentAnnouncement[];
    assignments: StudentAssignment[];
    resources: LearningResource[];
    reviews: WeeklyReview[];
    supportTickets: SupportTicket[];
    quizzes: DomainQuiz[];
    quizResults: Record<string, any>;
    // Actions
    setConfig: (config: SimulationConfig) => void;
    applyScenarioPreset: (presetName: string) => void;
    updateProjectLinks: (links: {
        githubUrl?: string;
        projectUrl?: string;
        documentationUrl?: string;
        evidenceUrl?: string;
    }) => void;
    submitMilestone: (payload: {
        milestoneIndex: number;
        milestoneTitle: string;
        submissionUrl: string;
        notes?: string;
    }) => { success: boolean; error?: string };
    submitQuiz: (quizId: string, answers: Record<string, number>, score: number) => void;
    createSupportTicket: (subject: string, message: string) => void;
    updateProfile: (profileData: Record<string, any>) => void;
    resetSimulation: () => void;
    exitSimulation: () => void;
}

const DEFAULT_CONFIG: SimulationConfig = {
    domain: "Full Stack Development",
    applicationStatus: "Accepted",
    projectStatus: "In Progress",
    milestoneStatus: "Approved",
    scenarioName: "Mid-Term Progress (Milestones 1 & 2 Approved)"
};

const SimulationContext = createContext<SimulationContextType | null>(null);

const STORAGE_KEY = "vectonix_sim_session_state_v1";

export function SimulationProvider({
    children,
    initialConfig,
    onExit
}: {
    children: React.ReactNode;
    initialConfig?: SimulationConfig;
    onExit?: () => void;
}) {
    const router = useRouter();

    const [config, setConfigState] = useState<SimulationConfig>(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = sessionStorage.getItem(STORAGE_KEY);
                if (stored) {
                    return JSON.parse(stored).config || initialConfig || DEFAULT_CONFIG;
                }
            } catch (ignore) {}
        }
        return initialConfig || DEFAULT_CONFIG;
    });

    const [student, setStudent] = useState<DatabaseInternshipApplication>(() =>
        generateSyntheticStudent(config)
    );
    const [project, setProject] = useState<StudentProject | null>(() =>
        generateSyntheticProject(config, student)
    );
    const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>(() =>
        generateSyntheticAnnouncements(config.domain)
    );
    const [assignments, setAssignments] = useState<StudentAssignment[]>(() =>
        generateSyntheticAssignments(config.domain, student.application_id || student.id)
    );
    const [resources, setResources] = useState<LearningResource[]>([]);
    const [reviews, setReviews] = useState<WeeklyReview[]>(() => generateSyntheticReviews());
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() =>
        generateSyntheticTickets(student.application_id || student.id)
    );
    const [quizzes, setQuizzes] = useState<DomainQuiz[]>([]);
    const [quizResults, setQuizResults] = useState<Record<string, any>>({});

    // Load domain resources and quizzes when domain changes
    useEffect(() => {
        let isMounted = true;
        const loadDomainData = async () => {
            const domainNorm = normalizeDomain(config.domain);
            const res = await studentService.getLearningResources("wi26", domainNorm);
            const qz = studentService.getDomainQuizzes(domainNorm);
            if (isMounted) {
                setResources(res);
                setQuizzes(qz);
            }
        };
        loadDomainData();
        return () => {
            isMounted = false;
        };
    }, [config.domain]);

    // Recompute synthetic entities whenever config changes
    const applyConfig = useCallback((newConfig: SimulationConfig) => {
        setConfigState(newConfig);
        const newStudent = generateSyntheticStudent(newConfig);
        const newProject = generateSyntheticProject(newConfig, newStudent);
        const newAnnouncements = generateSyntheticAnnouncements(newConfig.domain);
        const newAssignments = generateSyntheticAssignments(
            newConfig.domain,
            newStudent.application_id || newStudent.id
        );
        const newReviews = generateSyntheticReviews();
        const newTickets = generateSyntheticTickets(
            newStudent.application_id || newStudent.id
        );

        setStudent(newStudent);
        setProject(newProject);
        setAnnouncements(newAnnouncements);
        setAssignments(newAssignments);
        setReviews(newReviews);
        setSupportTickets(newTickets);

        // Persist to session storage
        if (typeof window !== "undefined") {
            try {
                sessionStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ config: newConfig })
                );
            } catch (ignore) {}
        }
    }, []);

    const applyScenarioPreset = useCallback(
        (presetName: string) => {
            const match = SCENARIO_PRESETS.find((p) => p.name === presetName);
            if (match) {
                applyConfig({ ...match.config, scenarioName: match.name });
            }
        },
        [applyConfig]
    );

    // Mock project link updater
    const updateProjectLinks = useCallback(
        (links: {
            githubUrl?: string;
            projectUrl?: string;
            documentationUrl?: string;
            evidenceUrl?: string;
        }) => {
            setProject((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    github_url: links.githubUrl ?? prev.github_url,
                    project_url: links.projectUrl ?? prev.project_url,
                    documentation_url: links.documentationUrl ?? prev.documentation_url,
                    evidence_url: links.evidenceUrl ?? prev.evidence_url,
                    status: "In Development" as any
                };
            });
        },
        []
    );

    // Mock milestone submission handler
    const submitMilestone = useCallback(
        (payload: {
            milestoneIndex: number;
            milestoneTitle: string;
            submissionUrl: string;
            notes?: string;
        }) => {
            setProject((prev) => {
                if (!prev) return null;
                const updatedMilestones = [...prev.milestones];
                const targetIdx = payload.milestoneIndex - 1;
                if (updatedMilestones[targetIdx]) {
                    updatedMilestones[targetIdx] = {
                        ...updatedMilestones[targetIdx],
                        status: "Submitted",
                        feedback: "Submitted for mentor review in simulation mode. Notes: " + (payload.notes || "None")
                    };
                }
                return {
                    ...prev,
                    milestones: updatedMilestones,
                    status: "Under Review" as any
                };
            });
            return { success: true };
        },
        []
    );

    // Mock quiz submission handler
    const submitQuiz = useCallback(
        (quizId: string, answers: Record<string, number>, score: number) => {
            setQuizResults((prev) => ({
                ...prev,
                [quizId]: {
                    score,
                    totalQuestions: Object.keys(answers).length,
                    percentage: score,
                    submittedAt: new Date().toISOString(),
                    passed: score >= 60
                }
            }));
        },
        []
    );

    // Mock support ticket creator
    const createSupportTicket = useCallback((subject: string, message: string) => {
        const newTicket: SupportTicket = {
            id: `sim-tkt-${Date.now().toString(36)}`,
            application_id: student.application_id || student.id,
            student_name: student.full_name,
            student_email: student.email,
            domain: student.domain,
            subject,
            message,
            status: "Open",
            created_at: new Date().toISOString(),
            admin_response: "Thank you for reaching out! In this simulation mode, your inquiry has been logged successfully without dispatching live emails."
        };
        setSupportTickets((prev) => [newTicket, ...prev]);
    }, [student]);

    // Mock profile updater
    const updateProfile = useCallback((profileData: Record<string, any>) => {
        setStudent((prev) => ({
            ...prev,
            ...profileData,
            updated_at: new Date().toISOString()
        }));
    }, []);

    // Reset simulation data back to default
    const resetSimulation = useCallback(() => {
        if (typeof window !== "undefined") {
            sessionStorage.removeItem(STORAGE_KEY);
        }
        applyConfig(DEFAULT_CONFIG);
    }, [applyConfig]);

    // Exit simulation and return to Admin
    const exitSimulation = useCallback(() => {
        if (onExit) {
            onExit();
        } else {
            router.push("/admin/internships/wi26/simulation");
        }
    }, [onExit, router]);

    const value: SimulationContextType = {
        isSimulation: true,
        config,
        student,
        project,
        announcements,
        assignments,
        resources,
        reviews,
        supportTickets,
        quizzes,
        quizResults,
        setConfig: applyConfig,
        applyScenarioPreset,
        updateProjectLinks,
        submitMilestone,
        submitQuiz,
        createSupportTicket,
        updateProfile,
        resetSimulation,
        exitSimulation
    };

    return (
        <SimulationContext.Provider value={value}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulation() {
    const context = useContext(SimulationContext);
    return context; // May be null if rendered in standard student production mode
}
