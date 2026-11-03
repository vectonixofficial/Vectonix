"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    LayoutDashboard,
    Bell,
    CheckSquare,
    FolderGit2,
    Calendar,
    BookOpen,
    HelpCircle,
    User,
    Award,
    ExternalLink,
    LogOut,
    Clock,
    CheckCircle2,
    AlertCircle,
    Send,
    FileText,
    Github,
    Globe,
    Sparkles,
    Lock,
    MapPin,
    Package,
    Loader2,
    FolderKanban,
    Code,
    Shield,
    TrendingUp,
    Target,
    Layers,
    FileCheck,
    X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
    studentService,
    StudentAnnouncement,
    StudentAssignment,
    StudentProject,
    WeeklyReview,
    LearningResource,
    SupportTicket,
    DomainQuiz
} from "@/lib/services/studentService";
import { DatabaseInternshipApplication } from "@/lib/supabase";

const MILESTONES_SCHEDULE = [
    {
        index: 1,
        title: "Milestone 1: Architectural Blueprint, Schema & Foundation Setup",
        shortTitle: "Milestone 1 Submission",
        startDate: "2026-11-26",
        endDate: "2026-12-02",
        reviewDate: "2026-12-02",
        submissionOpenDate: "2026-12-02",
        scope: "System architecture diagrams, database schema entity-relationships, API specifications, and repository initialization.",
        deliverables: "Design proposal document, Figma wireframes, or architecture rubric link."
    },
    {
        index: 2,
        title: "Milestone 2: Core Engineering, Business Logic & API Development",
        shortTitle: "Milestone 2 Submission",
        startDate: "2026-12-03",
        endDate: "2026-12-09",
        reviewDate: "2026-12-09",
        submissionOpenDate: "2026-12-09",
        scope: "Primary backend models, API routes, user authentication, core workflows or threat scanner logic.",
        deliverables: "Working Git branch commit, API test results, or initial component demo."
    },
    {
        index: 3,
        title: "Milestone 3: Advanced Integration, Automated Testing & Security Hardening",
        shortTitle: "Milestone 3 Submission",
        startDate: "2026-12-10",
        endDate: "2026-12-16",
        reviewDate: "2026-12-16",
        submissionOpenDate: "2026-12-16",
        scope: "End-to-end integration, error boundaries, performance benchmarks, and mobile responsiveness.",
        deliverables: "Staging deployment link, vulnerability check results, or campaign draft."
    },
    {
        index: 4,
        title: "Milestone 4: Cloud Deployment, Comprehensive Documentation & Final Presentation",
        shortTitle: "Milestone 4 Submission",
        startDate: "2026-12-17",
        endDate: "2026-12-23",
        reviewDate: "2026-12-23",
        submissionOpenDate: "2026-12-23",
        scope: "Production release, public hosting, comprehensive README/documentation, and video walkthrough.",
        deliverables: "Live production URL, final report link, and demonstration walkthrough video."
    }
];

function StudentDashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [student, setStudent] = useState<DatabaseInternshipApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<
        "overview" | "announcements" | "assignments" | "project" | "reviews" | "resources" | "support" | "profile" | "certificate"
    >("overview");

    // Module Data
    const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>([]);
    const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
    const [project, setProject] = useState<StudentProject | null>(null);
    const [reviews, setWeeklyReviews] = useState<WeeklyReview[]>([]);
    const [resources, setResources] = useState<LearningResource[]>([]);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);

    // Submission modal state
    const [selectedAssignment, setSelectedAssignment] = useState<StudentAssignment | null>(null);
    const [submissionForm, setSubmissionForm] = useState({
        description: "",
        githubUrl: "",
        projectUrl: ""
    });
    const [isSubmittingWork, setIsSubmittingWork] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    // Support Question state
    const [supportSubject, setSupportSubject] = useState("");
    const [supportMessage, setSupportMessage] = useState("");
    const [isSendingTicket, setIsSendingTicket] = useState(false);

    // Project links state
    const [githubRepoUrl, setGithubRepoUrl] = useState("");
    const [liveDemoUrl, setLiveDemoUrl] = useState("");
    const [documentationUrl, setDocumentationUrl] = useState("");
    const [evidenceUrl, setEvidenceUrl] = useState("");
    const [isSavingProject, setIsSavingProject] = useState(false);

    // Milestone submission modal state
    const [selectedMilestoneForSubmit, setSelectedMilestoneForSubmit] = useState<{
        index: number;
        title: string;
    } | null>(null);
    const [milestoneSubmitUrl, setMilestoneSubmitUrl] = useState("");
    const [milestoneSubmitNotes, setMilestoneSubmitNotes] = useState("");
    const [isSubmittingMilestone, setIsSubmittingMilestone] = useState(false);

    // Profile Picture Upload State
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [isSavingProfilePic, setIsSavingProfilePic] = useState(false);

    // Quizzes & Assessments State
    const [quizzes, setQuizzes] = useState<DomainQuiz[]>([]);
    const [activeQuiz, setActiveQuiz] = useState<DomainQuiz | null>(null);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [assignmentsSubTab, setAssignmentsSubTab] = useState<"deliverables" | "quizzes">("deliverables");

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);

            // 1. Check query parameters first
            const queryAppId = searchParams.get("appId");
            const queryEmail = searchParams.get("email");

            let active: DatabaseInternshipApplication | null = null;

            if (queryAppId && queryEmail) {
                active = await studentService.login(queryAppId, queryEmail);
            } else {
                active = studentService.getActiveStudent();
            }

            if (!active) {
                router.push("/internship/login");
                return;
            }

            setStudent(active);

            // Load module data
            const appId = active.application_id || active.application_number || "WI26-DEMO";
            const domain = active.domain || "Full Stack Development";

            try {
                const [annList, asgList, projData, revList, resList, tickList] = await Promise.all([
                    studentService.getAnnouncements("wi26", domain),
                    studentService.getAssignments("wi26", domain, appId),
                    studentService.getStudentProject(appId, domain),
                    studentService.getWeeklyReviews("wi26"),
                    studentService.getLearningResources("wi26", domain),
                    studentService.getSupportTickets(appId)
                ]);

                setAnnouncements(annList);
                setAssignments(asgList);
                setProject(projData);
                if (projData) {
                    setGithubRepoUrl(projData.github_url || "");
                    setLiveDemoUrl(projData.project_url || "");
                    setDocumentationUrl(projData.documentation_url || "");
                    setEvidenceUrl(projData.evidence_url || "");
                }
                setWeeklyReviews(revList);
                setResources(resList);
                setSupportTickets(tickList);
                setQuizzes(studentService.getDomainQuizzes(domain));
            } catch (err) {
                console.error("Dashboard data load error:", err);
            } finally {
                setLoading(false);
            }
        };

        initDashboard();
    }, [searchParams, router]);

    const handleLogout = () => {
        studentService.logout();
        if (typeof window !== "undefined") {
            window.location.replace("/internship/login");
        }
    };

    const handleProfilePicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("File size exceeds 2MB limit. Please select an image under 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfilePic = async () => {
        if (!student || !profileImagePreview) return;
        setIsSavingProfilePic(true);
        try {
            const appId = student.application_id || student.application_number || student.id;
            await studentService.updateProfilePicture(appId, profileImagePreview);
            setStudent({ ...student, profile_picture_url: profileImagePreview });
            setProfileImagePreview(null);
            alert("Profile picture updated successfully!");
        } catch (err) {
            console.error("Profile picture upload failure:", err);
            alert("Failed to save profile picture.");
        } finally {
            setIsSavingProfilePic(false);
        }
    };

    const handleQuizOptionSelect = (questionId: string, optionIndex: number) => {
        if (quizSubmitted) return;
        setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmitQuiz = () => {
        if (!activeQuiz) return;
        let score = 0;
        activeQuiz.questions.forEach((q) => {
            if (quizAnswers[q.id] === q.correctIndex) {
                score += activeQuiz.totalMarks / activeQuiz.questions.length;
            }
        });
        setQuizScore(Math.round(score));
        setQuizSubmitted(true);
    };

    const handleSubmitAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAssignment || !student) return;

        setIsSubmittingWork(true);
        try {
            const appId = student.application_id || student.application_number || "";
            await studentService.submitAssignment({
                assignmentId: selectedAssignment.id,
                applicationId: appId,
                studentEmail: student.email,
                studentName: student.full_name,
                description: submissionForm.description,
                githubUrl: submissionForm.githubUrl,
                projectUrl: submissionForm.projectUrl
            });

            setSubmissionSuccess(true);
            setTimeout(() => {
                setSubmissionSuccess(false);
                setSelectedAssignment(null);
                setSubmissionForm({ description: "", githubUrl: "", projectUrl: "" });
            }, 1800);

            // Refresh assignments
            const refreshed = await studentService.getAssignments("wi26", student.domain, appId);
            setAssignments(refreshed);
        } catch (err) {
            console.error("Assignment submission failure:", err);
        } finally {
            setIsSubmittingWork(false);
        }
    };

    const handleSaveProjectLinks = async () => {
        if (!student) return;
        setIsSavingProject(true);
        try {
            const appId = student.application_id || student.application_number || "";
            await studentService.updateProjectLinks(appId, {
                githubUrl: githubRepoUrl,
                projectUrl: liveDemoUrl,
                documentationUrl: documentationUrl,
                evidenceUrl: evidenceUrl
            });
            const proj = await studentService.getStudentProject(appId, student.domain);
            setProject(proj);
            alert("Project links updated successfully!");
        } catch (err) {
            console.error("Save project failure:", err);
        } finally {
            setIsSavingProject(false);
        }
    };

    const handleSubmitMilestone = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMilestoneForSubmit || !project || !student || !milestoneSubmitUrl.trim()) return;

        setIsSubmittingMilestone(true);
        try {
            const appId = student.application_id || student.application_number || "";
            const res = await studentService.submitMilestone({
                projectId: project.id,
                applicationId: appId,
                milestoneIndex: selectedMilestoneForSubmit.index,
                milestoneTitle: selectedMilestoneForSubmit.title,
                submissionUrl: milestoneSubmitUrl.trim(),
                notes: milestoneSubmitNotes.trim()
            });

            if (res.success) {
                alert(`Milestone ${selectedMilestoneForSubmit.index} submitted for mentor review!`);
                setSelectedMilestoneForSubmit(null);
                setMilestoneSubmitUrl("");
                setMilestoneSubmitNotes("");
                const refreshedProj = await studentService.getStudentProject(appId, student.domain);
                setProject(refreshedProj);
            } else {
                alert(`Submission error: ${res.error}`);
            }
        } catch (err: any) {
            alert(`Submission error: ${err.message}`);
        } finally {
            setIsSubmittingMilestone(false);
        }
    };

    const handleCreateSupportTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student || !supportSubject.trim() || !supportMessage.trim()) return;

        setIsSendingTicket(true);
        try {
            const appId = student.application_id || student.application_number || "";
            await studentService.createSupportTicket({
                applicationId: appId,
                studentName: student.full_name,
                studentEmail: student.email,
                domain: student.domain,
                subject: supportSubject,
                message: supportMessage
            });

            setSupportSubject("");
            setSupportMessage("");
            const updated = await studentService.getSupportTickets(appId);
            setSupportTickets(updated);
            alert("Your question has been sent to the technical mentor team!");
        } catch (err) {
            console.error("Support ticket failure:", err);
        } finally {
            setIsSendingTicket(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center space-y-3">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700">Loading your student dashboard...</p>
                    <p className="text-xs text-slate-400">VECTONIX PRIVATE LIMITED</p>
                </div>
            </div>
        );
    }

    if (!student) return null;

    const completedAssignmentsCount = assignments.filter((a) => a.submission && (a.submission.status === "Completed" || a.submission.status === "Submitted")).length;
    const progressPercent = assignments.length > 0 ? Math.round((completedAssignmentsCount / assignments.length) * 100) : 0;

    const isApproved = student.status === "accepted";
    const isRejected = student.status === "rejected";
    const isPending = !isApproved && !isRejected;

    const activeMilestone = MILESTONES_SCHEDULE.find((m) => {
        const existing = project?.milestones?.[m.index - 1];
        return !(existing?.completed || existing?.status === "Approved");
    }) || MILESTONES_SCHEDULE[0];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-16 z-20 px-4 sm:px-8 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {student.profile_picture_url ? (
                        <img
                            src={student.profile_picture_url}
                            alt={student.full_name}
                            className="h-9 w-9 rounded-xl object-cover border border-slate-200 shadow-xs"
                        />
                    ) : (
                        <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                            {student.full_name ? student.full_name.charAt(0).toUpperCase() : "VX"}
                        </div>
                    )}
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 leading-tight">
                            Vectonix Student Dashboard
                        </h2>
                        <span className="text-[11px] text-slate-400">
                            Batch WI26 • {student.domain}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                        {student.application_id || student.application_number}
                    </span>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 text-xs font-semibold text-slate-600 transition-colors"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row">
                {/* Desktop & Tablet Sidebar */}
                <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-4 space-y-1 flex-shrink-0">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
                        Internship Menu
                    </div>

                    {[
                        { id: "overview", label: "Overview", icon: LayoutDashboard },
                        { id: "announcements", label: "Announcements", icon: Bell, badge: announcements.length },
                        { id: "assignments", label: "Assignments", icon: CheckSquare, badge: assignments.length, locked: !isApproved },
                        { id: "project", label: "Project Workspace", icon: FolderGit2, locked: !isApproved },
                        { id: "reviews", label: "Weekly Reviews", icon: Calendar, badge: reviews.length, locked: !isApproved },
                        { id: "resources", label: "Learning Resources", icon: BookOpen },
                        { id: "support", label: "Mentor Support", icon: HelpCircle, locked: !isApproved },
                        { id: "profile", label: "My Profile", icon: User },
                        { id: "certificate", label: "Certificate", icon: Award },
                    ].map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as any)}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Icon className={`h-4 w-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                                    <span>{item.label}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {item.locked && (
                                        <Lock className="h-3 w-3 text-slate-400" />
                                    )}
                                    {item.badge !== undefined && (
                                        <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-8 max-w-6xl">
                    {/* SECTION 1: OVERVIEW */}
                    {activeSection === "overview" && (
                        <div className="space-y-6">
                            {/* Welcome Banner (Light Theme) */}
                            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 text-slate-900 p-6 sm:p-8 shadow-xs">
                                <div className="relative z-10 max-w-2xl space-y-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                                        Winter Internship 2026 (Batch WI26)
                                    </span>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                        Welcome, {student.full_name}!
                                    </h1>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                        Your Vectonix Winter Internship 2026 journey starts here. Build live projects, attend mentor code reviews, and earn your verified industry certificate.
                                    </p>
                                </div>
                            </div>

                            {/* 100% Free Package Disclaimer */}
                            {student.package_name === "Free" && (
                                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3 shadow-2xs">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-emerald-900 font-bold mb-0.5">
                                            100% Free Internship – Learn, Build and Gain Practical Experience
                                        </strong>
                                        <span className="text-emerald-800">
                                            You are enrolled in the 100% Free Learning & Project track. You have complete access to the domain curriculum, capstone project assignments, milestone tracking, weekly reviews, and mentor support. <em>(No verified digital or physical certificate is included in this free plan.)</em>
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Application Status Alert Banner if not accepted */}
                            {isRejected && (
                                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-rose-950 font-bold mb-0.5">
                                            Application Not Accepted for Batch WI26
                                        </strong>
                                        <span>
                                            {student.internal_notes || "Your application did not meet eligibility requirements for this cohort. Contact admissions for assistance."}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {isPending && (
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block text-amber-900 font-bold mb-0.5">
                                            Application Pending Admissions Review
                                        </strong>
                                        <span>
                                            Your application is currently under review by the Vectonix Admissions Team. Once approved, your assigned project, mentor workspace, milestone submissions, and weekly meetings will unlock automatically.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Profile Card & Key Details */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                                    Student Profile & Cohort Details
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                                    <div>
                                        <span className="text-slate-400 block">Student Name</span>
                                        <span className="font-bold text-slate-900 text-sm">{student.full_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Application ID</span>
                                        <span className="font-mono font-bold text-indigo-600 text-sm">
                                            {student.application_id || student.application_number}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Internship Domain</span>
                                        <span className="font-semibold text-slate-900">{student.domain}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Enrolled Package</span>
                                        <span className={`font-bold ${student.package_name === "Free" ? "text-emerald-700" : "text-amber-700"}`}>
                                            {student.package_name} (₹{student.package_name === "Free" ? 0 : (student.package_amount || (student.package_name === "Premium" ? 999 : 749))})
                                        </span>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <span className="text-slate-400 block">College / University</span>
                                        <span className="font-medium text-slate-800">{student.college_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Program Duration</span>
                                        <span className="font-medium text-slate-800">25 Nov 2026 – 25 Dec 2026</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">Application Status</span>
                                        <span className={`font-semibold uppercase ${
                                            isApproved ? "text-emerald-600" : isRejected ? "text-rose-600" : "text-amber-600"
                                        }`}>
                                            {student.status || "Pending"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress & Milestone KPIs */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                        Curriculum Progress
                                    </span>
                                    <div className="flex items-baseline justify-between mb-2">
                                        <span className="text-2xl font-extrabold text-slate-900">{progressPercent}%</span>
                                        <span className="text-xs text-slate-500">
                                            {completedAssignmentsCount} of {assignments.length} completed
                                        </span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full transition-all"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                        Upcoming Deadlines
                                    </span>
                                    <div className="text-2xl font-extrabold text-slate-900">
                                        {activeMilestone.reviewDate}
                                    </div>
                                    <span className="text-xs text-amber-600 font-medium">{activeMilestone.shortTitle}</span>
                                </div>

                                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                        Next Weekly Review
                                    </span>
                                    <div className="text-2xl font-extrabold text-slate-900">Nov 25, 2026</div>
                                    <span className="text-xs text-indigo-600 font-medium">Orientation (6:00 PM IST)</span>
                                </div>
                            </div>

                            {/* Recent Announcements Snippet */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-indigo-600" />
                                        Latest Cohort Announcements
                                    </h3>
                                    <button
                                        onClick={() => setActiveSection("announcements")}
                                        className="text-xs font-semibold text-indigo-600 hover:underline"
                                    >
                                        View All &rarr;
                                    </button>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {announcements.slice(0, 2).map((ann) => (
                                        <div key={ann.id} className="py-3 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                                                    {ann.priority}
                                                </span>
                                                <h4 className="font-semibold text-slate-900 text-xs">{ann.title}</h4>
                                            </div>
                                            <p className="text-xs text-slate-600 mt-1">{ann.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 2: ANNOUNCEMENTS */}
                    {activeSection === "announcements" && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Batch Announcements</h2>
                                <p className="text-xs text-slate-500">Official schedules, notices, and updates from Vectonix Mentors.</p>
                            </div>

                            <div className="space-y-3">
                                {announcements.map((ann) => (
                                    <div
                                        key={ann.id}
                                        className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    ann.priority === "urgent"
                                                        ? "bg-red-50 text-red-700 border border-red-200"
                                                        : ann.priority === "important"
                                                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                                                        : "bg-indigo-50 text-indigo-700"
                                                }`}
                                            >
                                                {ann.priority}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                {new Date(ann.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-sm">{ann.title}</h3>
                                        <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>
                                        {ann.reference_url && (
                                            <a
                                                href={ann.reference_url}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline pt-1"
                                            >
                                                <span>Reference Link</span>
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION 3: ASSIGNMENTS & QUIZZES */}
                    {activeSection === "assignments" && (
                        <div className="space-y-6">
                            {!isApproved ? (
                                /* Application Approval Gate */
                                <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-3xl shadow-sm text-center max-w-2xl mx-auto space-y-6">
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto ${isRejected ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                                        {isRejected ? <AlertCircle className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                                    </div>
                                    <div className="space-y-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase ${isRejected ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                            Status: {isRejected ? "Application Rejected" : "Application Pending Approval"}
                                        </span>
                                        <h2 className="text-2xl font-extrabold text-slate-900">
                                            {isRejected ? "Application Not Accepted" : "Assignments & Quizzes Locked"}
                                        </h2>
                                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                            {isRejected
                                                ? (student.internal_notes || "Your application was not selected for Batch WI26. Contact admissions for inquiries.")
                                                : "Curriculum tasks, weekly evaluations, and domain quizzes unlock immediately once your application is approved by the Vectonix Admissions Team."}
                                        </p>
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        <Button onClick={() => setActiveSection("overview")} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                                            Back to Overview
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">Assignments & Assessments</h2>
                                            <p className="text-xs text-slate-500">
                                                Independent domain tasks and knowledge quizzes separated from your capstone project workspace.
                                            </p>
                                        </div>

                                        {/* Sub-tab switcher */}
                                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                                            <button
                                                onClick={() => setAssignmentsSubTab("deliverables")}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                    assignmentsSubTab === "deliverables"
                                                        ? "bg-white text-indigo-700 shadow-xs"
                                                        : "text-slate-600 hover:text-slate-900"
                                                }`}
                                            >
                                                Practical Deliverables ({assignments.length})
                                            </button>
                                            <button
                                                onClick={() => setAssignmentsSubTab("quizzes")}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                    assignmentsSubTab === "quizzes"
                                                        ? "bg-white text-indigo-700 shadow-xs"
                                                        : "text-slate-600 hover:text-slate-900"
                                                }`}
                                            >
                                                Domain Quizzes ({quizzes.length})
                                            </button>
                                        </div>
                                    </div>

                                    {/* SUB-TAB 1: PRACTICAL TASKS */}
                                    {assignmentsSubTab === "deliverables" && (
                                        <div className="space-y-4">
                                            {assignments.map((asg) => {
                                                const submission = asg.submission;
                                                const isCompleted = submission && (submission.status === "Completed" || submission.status === "Submitted");

                                                return (
                                                    <div
                                                        key={asg.id}
                                                        className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3"
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                            <div>
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 mr-2">
                                                                    {asg.difficulty}
                                                                </span>
                                                                <span className="text-xs text-slate-400">
                                                                    Max Marks: <strong>{asg.max_marks}</strong>
                                                                </span>
                                                                <h3 className="font-bold text-slate-900 text-base mt-1">{asg.title}</h3>
                                                            </div>

                                                            <div>
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                                        isCompleted
                                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                            : "bg-amber-50 text-amber-800 border border-amber-200"
                                                                    }`}
                                                                >
                                                                    {submission ? submission.status : "Pending Submission"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <p className="text-xs text-slate-600 leading-relaxed">{asg.description}</p>
                                                        {asg.instructions && (
                                                            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                                                                <strong>Instructions:</strong> {asg.instructions}
                                                            </div>
                                                        )}

                                                        {/* Submission Details if submitted */}
                                                        {submission && (
                                                            <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 text-xs space-y-1">
                                                                <span className="font-bold text-indigo-900 block">Your Submission:</span>
                                                                {submission.github_url && (
                                                                    <p>
                                                                        GitHub: <a href={submission.github_url} target="_blank" className="text-indigo-600 underline">{submission.github_url}</a>
                                                                    </p>
                                                                )}
                                                                {submission.project_url && (
                                                                    <p>
                                                                        Hosted Demo: <a href={submission.project_url} target="_blank" className="text-indigo-600 underline">{submission.project_url}</a>
                                                                    </p>
                                                                )}
                                                                {submission.mentor_feedback && (
                                                                    <p className="pt-1 text-slate-800">
                                                                        <strong>Mentor Feedback:</strong> {submission.mentor_feedback}
                                                                    </p>
                                                                )}
                                                                {submission.marks !== undefined && (
                                                                    <p className="font-bold text-emerald-700">
                                                                        Score: {submission.marks} / {asg.max_marks}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between pt-2">
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                                <Clock className="h-3.5 w-3.5 text-amber-600" />
                                                                <span>Deadline: {asg.deadline ? new Date(asg.deadline).toLocaleDateString() : "Dec 05, 2026"}</span>
                                                            </div>

                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedAssignment(asg);
                                                                    setSubmissionForm({
                                                                        description: submission?.description || "",
                                                                        githubUrl: submission?.github_url || "",
                                                                        projectUrl: submission?.project_url || ""
                                                                    });
                                                                }}
                                                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                                            >
                                                                {submission ? "Update Submission" : "Submit Work"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* SUB-TAB 2: DOMAIN KNOWLEDGE QUIZZES */}
                                    {assignmentsSubTab === "quizzes" && (
                                        <div className="space-y-4">
                                            {quizzes.map((quiz) => (
                                                <div
                                                    key={quiz.id}
                                                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                        <div>
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 mr-2">
                                                                Week {quiz.week} Quiz
                                                            </span>
                                                            <span className="text-xs text-slate-400">
                                                                {quiz.durationMinutes} Minutes • Total Marks: {quiz.totalMarks}
                                                            </span>
                                                            <h3 className="font-bold text-slate-900 text-base mt-1">{quiz.title}</h3>
                                                        </div>

                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setActiveQuiz(quiz);
                                                                setQuizAnswers({});
                                                                setQuizSubmitted(false);
                                                                setQuizScore(0);
                                                            }}
                                                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white self-start sm:self-auto"
                                                        >
                                                            Take Assessment
                                                        </Button>
                                                    </div>
                                                    <p className="text-xs text-slate-600">{quiz.description}</p>
                                                    <div className="text-[11px] text-slate-400">
                                                        Questions: <strong>{quiz.questions.length} MCQs</strong> • Pass Criteria: 70%
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 4: PROJECT WORKSPACE */}
                    {activeSection === "project" && (
                        <div className="space-y-6">
                            {!isApproved ? (
                                /* Application Approval Gate */
                                <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-3xl shadow-sm text-center max-w-2xl mx-auto space-y-6">
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto ${isRejected ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                                        {isRejected ? <AlertCircle className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                                    </div>
                                    <div className="space-y-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase ${isRejected ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                            Status: {isRejected ? "Application Rejected" : "Application Pending Approval"}
                                        </span>
                                        <h2 className="text-2xl font-extrabold text-slate-900">
                                            {isRejected ? "Application Not Accepted" : "Project Workspace Locked"}
                                        </h2>
                                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                            {isRejected
                                                ? (student.internal_notes || "Your application was not selected for Batch WI26. Contact admissions for inquiries.")
                                                : "Your individual capstone project, repository integration, milestone timelines, and mentor guidance will unlock immediately upon admissions approval."}
                                        </p>
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        <Button onClick={() => setActiveSection("overview")} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                                            Back to Overview
                                        </Button>
                                    </div>
                                </div>
                            ) : !project ? (
                                /* AWAITING ALLOCATION SCREEN */
                                <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-3xl shadow-sm text-center max-w-2xl mx-auto space-y-6">
                                    <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                                        <Clock className="h-8 w-8 animate-pulse" />
                                    </div>

                                    <div className="space-y-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                            Status: Project Awaiting Allocation
                                        </span>
                                        <h2 className="text-2xl font-extrabold text-slate-900">
                                            Project Allocation in Progress
                                        </h2>
                                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                            Welcome to Vectonix Winter Internship 2026! Your technical mentor is reviewing your application details and will assign your individual capstone project before cohort commencement on <strong>25 November 2026</strong>.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-2 max-w-md mx-auto">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Student Name:</span>
                                            <span className="font-semibold text-slate-800">{student.full_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Application ID:</span>
                                            <span className="font-mono font-semibold text-indigo-600">
                                                {student.application_id || student.application_number}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Domain:</span>
                                            <span className="font-semibold text-slate-800">{student.domain}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Batch Duration:</span>
                                            <span className="font-medium text-slate-700">Nov 25, 2026 – Dec 25, 2026</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                        <Button
                                            onClick={() => setActiveSection("resources")}
                                            className="w-full sm:w-auto px-5 py-2.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                                        >
                                            <BookOpen className="h-4 w-4 mr-2" />
                                            Explore Learning Materials
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setActiveSection("support")}
                                            className="w-full sm:w-auto px-5 py-2.5 text-xs border-slate-300 text-slate-700"
                                        >
                                            <HelpCircle className="h-4 w-4 mr-2" />
                                            Contact Mentor Support
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                /* ALLOCATED PROJECT WORKSPACE */
                                <div className="space-y-6">
                                    {/* 1. Project Header Banner */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 pb-5">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        <FolderKanban className="h-3.5 w-3.5" />
                                                        {project.domain}
                                                    </span>

                                                    {project.difficulty_level && (
                                                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                                                            {project.difficulty_level}
                                                        </span>
                                                    )}

                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        Status: {project.status}
                                                    </span>
                                                </div>

                                                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                                    {project.project_title}
                                                </h1>
                                                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                                                    {project.description}
                                                </p>
                                            </div>

                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0 text-xs space-y-1.5 min-w-[220px]">
                                                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                                                    <User className="h-4 w-4 text-indigo-600" />
                                                    <span>{project.assigned_mentor_name || "Lead Technical Mentor"}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-400">Assigned Technical Guide</p>
                                                <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 space-y-0.5">
                                                    <div>Start: <strong>{project.start_date || "25 Nov 2026"}</strong></div>
                                                    <div>Deadline: <strong>{project.deadline || "25 Dec 2026"}</strong></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Personalized Mentor Instructions */}
                                        {project.personalized_instructions && (
                                            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-3">
                                                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <strong className="block text-indigo-900 mb-0.5">Personalized Mentor Instructions:</strong>
                                                    <span>{project.personalized_instructions}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* 2. Dynamic 30-Day Internship Timeline Engine */}
                                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-indigo-600" />
                                                    <span className="font-bold text-slate-900">
                                                        Winter Internship 2026 Timeline
                                                    </span>
                                                    <span className="text-slate-400">•</span>
                                                    <span className="text-slate-600 font-medium">
                                                        25 Nov 2026 – 25 Dec 2026 (Four 7-Day Sprints)
                                                    </span>
                                                </div>
                                                <div className="font-bold text-indigo-700 bg-indigo-100/60 px-3 py-1 rounded-full text-[11px]">
                                                    Active Sprint: Milestone {project.current_milestone || 1} of 4
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                                                    <span>Overall Project Progress</span>
                                                    <span>{project.progress_percent || 0}% Completed</span>
                                                </div>
                                                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.max(5, project.progress_percent || 0)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Four Sequential Milestones (Strict Sequential Unlocking) */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                                Four-Milestone Project Schedule
                                            </h3>
                                            <span className="text-xs text-slate-400">Strict sequential progression • 7 days per sprint</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {MILESTONES_SCHEDULE.map((m) => {
                                                const prevMilestone = m.index > 1 ? project.milestones?.[m.index - 2] : null;
                                                const isPrevApproved = m.index === 1 || prevMilestone?.completed === true || prevMilestone?.status === "Approved";
                                                const existingMilestone = project.milestones?.[m.index - 1];
                                                const isMilestoneApproved = existingMilestone?.completed === true || existingMilestone?.status === "Approved";
                                                const isUnderReview = existingMilestone?.status === "Under Review" || existingMilestone?.status === "Submitted";
                                                const isRevisionRequired = existingMilestone?.status === "Revision Required";

                                                const todayStr = new Date().toISOString().split("T")[0];
                                                const isWindowOpen = todayStr >= m.submissionOpenDate;

                                                let statusLabel = "Locked";
                                                let statusClass = "bg-slate-100 text-slate-500 border border-slate-200";
                                                let canSubmit = false;
                                                let statusMessage = "";

                                                if (!isPrevApproved) {
                                                    statusLabel = "Locked";
                                                    statusClass = "bg-slate-100 text-slate-500 border border-slate-200";
                                                    statusMessage = `Locked until Milestone ${m.index - 1} is approved by mentor.`;
                                                    canSubmit = false;
                                                } else if (isMilestoneApproved) {
                                                    statusLabel = "Approved";
                                                    statusClass = "bg-emerald-100 text-emerald-800 border border-emerald-300";
                                                    statusMessage = "Milestone evaluated and approved by mentor.";
                                                    canSubmit = false;
                                                } else if (isUnderReview) {
                                                    statusLabel = "Under Review";
                                                    statusClass = "bg-blue-100 text-blue-800 border border-blue-300";
                                                    statusMessage = "Work submitted and currently under mentor review.";
                                                    canSubmit = true;
                                                } else if (isRevisionRequired) {
                                                    statusLabel = "Revision Required";
                                                    statusClass = "bg-rose-100 text-rose-800 border border-rose-300";
                                                    statusMessage = "Mentor requested revisions before approval.";
                                                    canSubmit = true;
                                                } else if (!isWindowOpen) {
                                                    statusLabel = "In Progress";
                                                    statusClass = "bg-amber-100 text-amber-800 border border-amber-300";
                                                    statusMessage = `7-Day sprint in progress. Submission window opens on ${m.submissionOpenDate} (Day 7).`;
                                                    canSubmit = false;
                                                } else {
                                                    statusLabel = "Awaiting Submission";
                                                    statusClass = "bg-indigo-100 text-indigo-800 border border-indigo-300";
                                                    statusMessage = "Submission window is open! Submit your deliverable.";
                                                    canSubmit = true;
                                                }

                                                return (
                                                    <div
                                                        key={m.index}
                                                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                                                            isMilestoneApproved
                                                                ? "bg-emerald-50/20 border-emerald-200"
                                                                : !isPrevApproved
                                                                ? "bg-slate-50/60 border-slate-200 opacity-80"
                                                                : "bg-white border-slate-200 shadow-sm"
                                                        }`}
                                                    >
                                                        <div className="space-y-3">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                                                                    {m.startDate} – {m.endDate}
                                                                </span>
                                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusClass}`}>
                                                                    {statusLabel}
                                                                </span>
                                                            </div>

                                                            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                                                {!isPrevApproved && <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                                                                {m.title}
                                                            </h4>

                                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                                {m.scope}
                                                            </p>

                                                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600">
                                                                <strong className="text-slate-800">Deliverables: </strong>
                                                                {m.deliverables}
                                                            </div>

                                                            {statusMessage && (
                                                                <div className="text-[11px] text-slate-500 italic">
                                                                    {statusMessage}
                                                                </div>
                                                            )}

                                                            {existingMilestone?.feedback && (
                                                                <div className="p-2.5 rounded-xl bg-violet-50 text-[11px] text-violet-900 border border-violet-100">
                                                                    <strong>Mentor Feedback: </strong>
                                                                    {existingMilestone.feedback}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                            {existingMilestone?.submissionUrl ? (
                                                                <a
                                                                    href={existingMilestone.submissionUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-indigo-600 hover:underline font-semibold flex items-center gap-1"
                                                                >
                                                                    <span>View Submission</span>
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            ) : (
                                                                <span className="text-[11px] text-slate-400">
                                                                    Review: {m.reviewDate}
                                                                </span>
                                                            )}

                                                            {isMilestoneApproved ? (
                                                                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                                    Approved
                                                                </span>
                                                            ) : !isPrevApproved ? (
                                                                <Button disabled size="sm" className="text-xs bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed">
                                                                    <Lock className="h-3 w-3 mr-1" />
                                                                    Locked
                                                                </Button>
                                                            ) : !isWindowOpen && !canSubmit ? (
                                                                <Button disabled size="sm" className="text-xs bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed">
                                                                    Opens {m.submissionOpenDate}
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        setSelectedMilestoneForSubmit({
                                                                            index: m.index,
                                                                            title: m.title
                                                                        })
                                                                    }
                                                                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5"
                                                                >
                                                                    {isUnderReview ? "Update Deliverable" : isRevisionRequired ? "Resubmit Work" : "Submit Deliverable"}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 4. Domain-Tailored Project Repository & Evidence Links */}
                                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900">
                                                Project Evidence & Submission Links
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Provide access links to your work. Reviewers and mentors evaluate these links during weekly review checkpoints.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            {/* Software Project inputs */}
                                            {project.domain?.toLowerCase().includes("full") || project.domain?.toLowerCase().includes("stack") ? (
                                                <>
                                                    <div>
                                                        <label className="block font-semibold text-slate-700 mb-1">
                                                            GitHub Repository URL *
                                                        </label>
                                                        <div className="relative">
                                                            <Github className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                                            <input
                                                                type="url"
                                                                placeholder="https://github.com/your-username/capstone-project"
                                                                value={githubRepoUrl}
                                                                onChange={(e) => setGithubRepoUrl(e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block font-semibold text-slate-700 mb-1">
                                                            Live Hosted Demo (Vercel / Netlify / Render)
                                                        </label>
                                                        <div className="relative">
                                                            <Globe className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                                            <input
                                                                type="url"
                                                                placeholder="https://your-project.vercel.app"
                                                                value={liveDemoUrl}
                                                                onChange={(e) => setLiveDemoUrl(e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : project.domain?.toLowerCase().includes("cyber") || project.domain?.toLowerCase().includes("sec") ? (
                                                /* Cybersecurity inputs */
                                                <>
                                                    <div>
                                                        <label className="block font-semibold text-slate-700 mb-1">
                                                            Evidence / Vulnerability Report URL (Google Drive / Notion) *
                                                        </label>
                                                        <div className="relative">
                                                            <Shield className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                                            <input
                                                                type="url"
                                                                placeholder="https://drive.google.com/... or https://notion.so/..."
                                                                value={evidenceUrl}
                                                                onChange={(e) => setEvidenceUrl(e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block font-semibold text-slate-700 mb-1">
                                                            Tool Repository / Source Link (Optional)
                                                        </label>
                                                        <div className="relative">
                                                            <Github className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                                            <input
                                                                type="url"
                                                                placeholder="https://github.com/..."
                                                                value={githubRepoUrl}
                                                                onChange={(e) => setGithubRepoUrl(e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                /* Digital Marketing inputs */
                                                <>
                                                    <div>
                                                        <label className="block font-semibold text-slate-700 mb-1">
                                                            Campaign Strategy Deck / Report Link (Google Slides / Docs) *
                                                        </label>
                                                        <div className="relative">
                                                            <TrendingUp className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                                            <input
                                                                type="url"
                                                                placeholder="https://docs.google.com/presentation/..."
                                                                value={documentationUrl}
                                                                onChange={(e) => setDocumentationUrl(e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block font-semibold text-slate-700 mb-1">
                                                            Figma / Canva / Content Calendar Link
                                                        </label>
                                                        <div className="relative">
                                                            <Globe className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                                            <input
                                                                type="url"
                                                                placeholder="https://www.canva.com/design/... or Notion link"
                                                                value={evidenceUrl}
                                                                onChange={(e) => setEvidenceUrl(e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            <div className="sm:col-span-2">
                                                <label className="block font-semibold text-slate-700 mb-1">
                                                    Technical Documentation & Walkthrough Video URL (Optional)
                                                </label>
                                                <input
                                                    type="url"
                                                    placeholder="https://loom.com/share/... or YouTube unlisted / Google Drive link"
                                                    value={documentationUrl}
                                                    onChange={(e) => setDocumentationUrl(e.target.value)}
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end pt-2">
                                            <Button
                                                onClick={handleSaveProjectLinks}
                                                disabled={isSavingProject}
                                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-xl shadow-sm"
                                            >
                                                {isSavingProject ? "Saving..." : "Save Project Links"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 5: WEEKLY REVIEWS */}
                    {activeSection === "reviews" && (
                        <div className="space-y-4">
                            {!isApproved ? (
                                /* Application Approval Gate */
                                <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-3xl shadow-sm text-center max-w-2xl mx-auto space-y-6">
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto ${isRejected ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                                        {isRejected ? <AlertCircle className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                                    </div>
                                    <div className="space-y-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase ${isRejected ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                            Status: {isRejected ? "Application Rejected" : "Application Pending Approval"}
                                        </span>
                                        <h2 className="text-2xl font-extrabold text-slate-900">
                                            Weekly Reviews Locked
                                        </h2>
                                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                            {isRejected
                                                ? (student.internal_notes || "Your application was not selected for Batch WI26. Contact admissions for inquiries.")
                                                : "Scheduled mentor meeting links and weekly review sessions unlock once your application is approved by Vectonix Admissions."}
                                        </p>
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        <Button onClick={() => setActiveSection("overview")} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                                            Back to Overview
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Weekly Project Reviews</h2>
                                        <p className="text-xs text-slate-500">Scheduled Google Meet review sessions with technical leads.</p>
                                    </div>

                                    <div className="space-y-3">
                                        {reviews.map((rev) => {
                                            const todayStr = new Date().toISOString().split("T")[0];
                                            const isVisible = rev.is_always_visible || (rev.visible_from && todayStr >= rev.visible_from);

                                            return (
                                                <div
                                                    key={rev.id}
                                                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                        <div>
                                                            <span className="text-[11px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                                Session Review
                                                            </span>
                                                            <h3 className="font-bold text-slate-900 text-sm mt-1">{rev.topic}</h3>
                                                            <p className="text-xs text-slate-400">Assigned Mentor: {rev.assigned_mentor}</p>
                                                        </div>

                                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 w-fit">
                                                            {rev.status}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Calendar className="h-4 w-4 text-indigo-600" />
                                                            <span>{new Date(rev.review_date).toLocaleString()}</span>
                                                        </div>

                                                        {isVisible && rev.meeting_link ? (
                                                            <a
                                                                href={rev.meeting_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 w-fit shadow-xs"
                                                            >
                                                                <span>Join Google Meet</span>
                                                                <ExternalLink className="h-3.5 w-3.5" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
                                                                Meeting link activates on Nov 30, 2026
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 6: LEARNING RESOURCES */}
                    {activeSection === "resources" && (
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Learning Materials & Handbooks</h2>
                                <p className="text-xs text-slate-500">Official starter codes, PDF notes, and documentation for {student.domain}.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {resources.map((res) => (
                                    <div
                                        key={res.id}
                                        className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 flex flex-col justify-between"
                                    >
                                        <div>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                                {res.category}
                                            </span>
                                            <h3 className="font-bold text-slate-900 text-sm mt-2">{res.title}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{res.description}</p>
                                        </div>

                                        <a
                                            href={res.resource_url}
                                            target="_blank"
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline pt-2"
                                        >
                                            <span>Open Resource</span>
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION 7: MENTOR SUPPORT */}
                    {activeSection === "support" && (
                        <div className="space-y-6">
                            {!isApproved ? (
                                /* Application Approval Gate */
                                <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-3xl shadow-sm text-center max-w-2xl mx-auto space-y-6">
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto ${isRejected ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                                        {isRejected ? <AlertCircle className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                                    </div>
                                    <div className="space-y-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase ${isRejected ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                            Status: {isRejected ? "Application Rejected" : "Application Pending Approval"}
                                        </span>
                                        <h2 className="text-2xl font-extrabold text-slate-900">
                                            Mentor Support Locked
                                        </h2>
                                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                            Direct 1-on-1 mentor guidance unlocks once your application is approved by the Vectonix Admissions Team.
                                        </p>
                                    </div>
                                    <div className="flex justify-center gap-3">
                                        <Button onClick={() => setActiveSection("overview")} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                                            Back to Overview
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Direct Mentor Technical Support</h2>
                                        <p className="text-xs text-slate-500">
                                            Have a technical doubt or blockers with an assignment? Submit your query directly to your domain mentors.
                                        </p>
                                    </div>

                                    {/* Question Form */}
                                    <form onSubmit={handleCreateSupportTicket} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                Subject / Doubt Topic *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Issue connecting Supabase auth token in Next.js"
                                                value={supportSubject}
                                                onChange={(e) => setSupportSubject(e.target.value)}
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                                Detailed Description *
                                            </label>
                                            <textarea
                                                rows={4}
                                                required
                                                placeholder="Describe what you tried, the error message, and repository branch..."
                                                value={supportMessage}
                                                onChange={(e) => setSupportMessage(e.target.value)}
                                                className="w-full p-4 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSendingTicket}
                                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                            {isSendingTicket ? "Submitting..." : "Send Question to Mentors"}
                                        </Button>
                                    </form>

                                    {/* Ticket History */}
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Support Requests</h3>
                                        {supportTickets.length === 0 ? (
                                            <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                                                No questions raised yet. Feel free to reach out anytime!
                                            </div>
                                        ) : (
                                            supportTickets.map((t) => (
                                                <div key={t.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-bold text-slate-900">{t.subject}</h4>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                            t.status === "Answered" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                                        }`}>
                                                            {t.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600">{t.message}</p>
                                                    {t.reply && (
                                                        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-slate-800">
                                                            <strong>Mentor Reply:</strong> {t.reply}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 8: MY PROFILE */}
                    {activeSection === "profile" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Student Profile & Registration Info</h2>
                                <p className="text-xs text-slate-500">Your official record on file with Vectonix Technologies.</p>
                            </div>

                            {/* Profile Photo Uploader */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <User className="h-4 w-4 text-indigo-600" />
                                    Student Profile Picture
                                </h3>
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative">
                                        {profileImagePreview || student.profile_picture_url ? (
                                            <img
                                                src={profileImagePreview || student.profile_picture_url!}
                                                alt={student.full_name}
                                                className="h-24 w-24 rounded-2xl object-cover border-2 border-indigo-200 shadow-sm"
                                            />
                                        ) : (
                                            <div className="h-24 w-24 rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex items-center justify-center text-indigo-600 font-extrabold text-2xl">
                                                {student.full_name?.charAt(0).toUpperCase() || "VX"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2 text-xs text-slate-600 text-center sm:text-left">
                                        <p className="font-medium text-slate-800">Upload a professional headshot</p>
                                        <p className="text-[11px] text-slate-400">Supported formats: JPG, JPEG, PNG, WEBP (Max: 2MB)</p>
                                        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                                            <input
                                                type="file"
                                                id="profile-pic-input"
                                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                                className="hidden"
                                                onChange={handleProfilePicSelect}
                                            />
                                            <label
                                                htmlFor="profile-pic-input"
                                                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer text-slate-700 inline-block"
                                            >
                                                Choose Photo
                                            </label>
                                            {profileImagePreview && (
                                                <Button
                                                    size="sm"
                                                    disabled={isSavingProfilePic}
                                                    onClick={handleSaveProfilePic}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                                                >
                                                    {isSavingProfilePic ? "Saving..." : "Save Picture"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-slate-400 block uppercase font-semibold">Full Legal Name</span>
                                        <span className="font-bold text-slate-900 text-sm">{student.full_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block uppercase font-semibold">Gender</span>
                                        <span className="font-medium text-slate-800">{student.gender || "Not specified"}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block uppercase font-semibold">Email Address</span>
                                        <span className="font-medium text-slate-800">{student.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block uppercase font-semibold">Mobile Number</span>
                                        <span className="font-medium text-slate-800">{student.phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block uppercase font-semibold">Institution</span>
                                        <span className="font-medium text-slate-800">{student.college_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block uppercase font-semibold">Degree & Department</span>
                                        <span className="font-medium text-slate-800">{student.degree} • {student.department}</span>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4">
                                    <span className="text-slate-400 block uppercase font-semibold mb-1">
                                        Residential Shipping Address
                                    </span>
                                    <p className="text-slate-800 font-medium">
                                        {student.house_number}, {student.street_name}, {student.locality}
                                    </p>
                                    <p className="text-slate-800 font-medium">
                                        {student.city}, {student.district}, {student.state} — {student.postal_code} ({student.country || "India"})
                                    </p>
                                </div>

                                <div className="border-t border-slate-100 pt-4">
                                    <span className="text-slate-400 block uppercase font-semibold mb-1 flex items-center gap-1">
                                        <Lock className="h-3 w-3" /> Locked Administrative Fields
                                    </span>
                                    <p className="text-[11px] text-slate-500">
                                        Application ID ({student.application_id || student.application_number}), Domain ({student.domain}), and Package ({student.package_name}) cannot be altered. Contact <a href="mailto:vectonixofficial@gmail.com" className="text-indigo-600 underline">vectonixofficial@gmail.com</a> for authorized changes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION 9: CERTIFICATE */}
                    {activeSection === "certificate" && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Internship Completion Certificate</h2>
                                <p className="text-xs text-slate-500">
                                    Tamper-proof verifiable credentials issued by VECTONIX PRIVATE LIMITED.
                                </p>
                            </div>

                            {student.package_name === "Free" ? (
                                /* Free Package Certificate Notice */
                                <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center max-w-xl mx-auto space-y-5">
                                    <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                                        <Award className="h-8 w-8" />
                                    </div>

                                    <div className="space-y-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            100% Free Internship Tier
                                        </span>
                                        <h3 className="text-xl font-extrabold text-slate-900">
                                            No Certificate Included with Free Plan
                                        </h3>
                                        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                            Your Free enrollment includes full access to learning curriculum, live capstone project assignments, milestone feedback, weekly reviews, and mentor assistance. Verified digital and physical framed certificates are exclusively provided to candidates enrolled in the Standard (₹749) or Premium (₹999) packages.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-2 max-w-md mx-auto">
                                        <span className="font-bold text-slate-800 block">Features in your tier:</span>
                                        <p className="flex items-center gap-2 text-slate-600">
                                            <span className="text-emerald-600 font-bold">✓</span> Full curriculum & live project access
                                        </p>
                                        <p className="flex items-center gap-2 text-slate-600">
                                            <span className="text-emerald-600 font-bold">✓</span> Weekly Google Meet mentor reviews
                                        </p>
                                        <p className="flex items-center gap-2 text-slate-600">
                                            <span className="text-emerald-600 font-bold">✓</span> Direct technical mentorship & tickets
                                        </p>
                                        <p className="flex items-center gap-2 text-slate-400 italic">
                                            <span>✕</span> No Verified Industry Certificate Included
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center max-w-xl mx-auto space-y-4">
                                    <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                                        <Award className="h-8 w-8" />
                                    </div>

                                    <div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                                                (assignments.length > 0 ? Math.round((completedAssignmentsCount / assignments.length) * 100) : 0) >= 80 &&
                                                (project ? project.progress_percent >= 80 || project.status === "Approved" || project.status === "Completed" : false)
                                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                    : "bg-amber-50 text-amber-800 border border-amber-200"
                                            }`}
                                        >
                                            Status:{" "}
                                            {(assignments.length > 0 ? Math.round((completedAssignmentsCount / assignments.length) * 100) : 0) >= 80 &&
                                            (project ? project.progress_percent >= 80 || project.status === "Approved" || project.status === "Completed" : false)
                                                ? "Eligible for Certification"
                                                : "Cohort In Progress"}
                                        </span>
                                        <h3 className="text-lg font-bold text-slate-900 mt-3">
                                            Vectonix Certificate of Internship
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                                            Certificates are issued at the conclusion of the cohort (after December 25, 2026) following evaluation of your milestone assignments and capstone project.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-2">
                                        <span className="font-bold text-slate-800 block">Eligibility Criteria:</span>
                                        <p className="flex items-center gap-2 text-slate-600">
                                            <span className="text-emerald-600 font-bold">✓</span> Registration confirmed ({student.application_id || student.application_number})
                                        </p>
                                        <p className="flex items-center gap-2 text-slate-600">
                                            <span className={(assignments.length > 0 ? Math.round((completedAssignmentsCount / assignments.length) * 100) : 0) >= 80 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                                                {(assignments.length > 0 ? Math.round((completedAssignmentsCount / assignments.length) * 100) : 0) >= 80 ? "✓" : "○"}
                                            </span>{" "}
                                            Complete at least 80% of milestone assignments (Current: {assignments.length > 0 ? Math.round((completedAssignmentsCount / assignments.length) * 100) : 0}%)
                                        </p>
                                        <p className="flex items-center gap-2 text-slate-600">
                                            <span className={(project ? project.progress_percent >= 80 || project.status === "Approved" || project.status === "Completed" : false) ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                                                {(project ? project.progress_percent >= 80 || project.status === "Approved" || project.status === "Completed" : false) ? "✓" : "○"}
                                            </span>{" "}
                                            Deliver capstone project in {student.domain} (Current: {project?.progress_percent || 0}%)
                                        </p>
                                    </div>

                                    <div className="pt-2">
                                        {(assignments.length > 0 ? Math.round((completedAssignmentsCount / assignments.length) * 100) : 0) >= 80 &&
                                        (project ? project.progress_percent >= 80 || project.status === "Approved" || project.status === "Completed" : false) ? (
                                            <Link
                                                href={`/verify/${student.application_id || student.application_number}`}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                            >
                                                <Award className="h-4 w-4" />
                                                <span>View Certificate Record</span>
                                            </Link>
                                        ) : (
                                            <Button disabled className="text-xs cursor-not-allowed">
                                                Download Certificate (Available upon completion)
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Assignment Submission Modal */}
            <AnimatePresence>
                {selectedAssignment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="font-bold text-slate-900 text-sm">
                                    Submit Work: {selectedAssignment.title}
                                </h3>
                                <button onClick={() => setSelectedAssignment(null)} className="text-slate-400 hover:text-slate-600">
                                    ✕
                                </button>
                            </div>

                            {submissionSuccess ? (
                                <div className="py-8 text-center space-y-2">
                                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                                    <h4 className="font-bold text-slate-900 text-base">Work Submitted Successfully!</h4>
                                    <p className="text-xs text-slate-500">Your mentor will review your code shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
                                    <div>
                                        <label className="block font-semibold text-slate-700 uppercase mb-1">
                                            GitHub Repository Link *
                                        </label>
                                        <input
                                            type="url"
                                            required
                                            placeholder="https://github.com/username/project-repo"
                                            value={submissionForm.githubUrl}
                                            onChange={(e) => setSubmissionForm({ ...submissionForm, githubUrl: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 uppercase mb-1">
                                            Live Hosted URL (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://your-demo.vercel.app"
                                            value={submissionForm.projectUrl}
                                            onChange={(e) => setSubmissionForm({ ...submissionForm, projectUrl: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 uppercase mb-1">
                                            Implementation Notes & Description *
                                        </label>
                                        <textarea
                                            rows={3}
                                            required
                                            placeholder="Explain what features you implemented, libraries used, and how to test..."
                                            value={submissionForm.description}
                                            onChange={(e) => setSubmissionForm({ ...submissionForm, description: e.target.value })}
                                            className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setSelectedAssignment(null)}
                                            className="text-xs"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmittingWork}
                                            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            {isSubmittingWork ? "Submitting..." : "Confirm & Submit"}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Milestone Submission Modal */}
            <AnimatePresence>
                {selectedMilestoneForSubmit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-slate-200"
                        >
                            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                                        Milestone {selectedMilestoneForSubmit.index} Submission
                                    </span>
                                    <h3 className="font-bold text-slate-900 text-sm mt-1">
                                        {selectedMilestoneForSubmit.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedMilestoneForSubmit(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitMilestone} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Deliverable Access URL (Drive / GitHub / Figma / Vercel) *
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://drive.google.com/... or https://github.com/..."
                                        value={milestoneSubmitUrl}
                                        onChange={(e) => setMilestoneSubmitUrl(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Ensure sharing permissions are set to "Anyone with the link can view".
                                    </p>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Submission Summary & Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Summarize key tasks completed, tools used, or questions for your mentor..."
                                        value={milestoneSubmitNotes}
                                        onChange={(e) => setMilestoneSubmitNotes(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSelectedMilestoneForSubmit(null)}
                                        className="text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmittingMilestone}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2"
                                    >
                                        {isSubmittingMilestone ? "Submitting..." : "Submit for Mentor Review"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Interactive Domain Quiz Modal */}
            <AnimatePresence>
                {activeQuiz && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 my-8 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                                        Week {activeQuiz.week} Assessment • {activeQuiz.domain}
                                    </span>
                                    <h3 className="font-extrabold text-slate-900 text-lg mt-1">
                                        {activeQuiz.title}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {activeQuiz.questions.length} Questions • Total: {activeQuiz.totalMarks} Marks
                                    </p>
                                </div>
                                <button
                                    onClick={() => setActiveQuiz(null)}
                                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Score Display Banner if Submitted */}
                            {quizSubmitted && (
                                <div className={`p-4 rounded-2xl border text-center space-y-1 ${
                                    quizScore >= Math.round(activeQuiz.totalMarks * 0.7)
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                                        : "bg-amber-50 border-amber-200 text-amber-950"
                                }`}>
                                    <div className="text-2xl font-extrabold">
                                        {quizScore} / {activeQuiz.totalMarks} Marks
                                    </div>
                                    <p className="text-xs font-semibold">
                                        {quizScore >= Math.round(activeQuiz.totalMarks * 0.7)
                                            ? "🎉 Excellent work! You passed the weekly assessment."
                                            : "Assessment completed. Review the explanations below."}
                                    </p>
                                </div>
                            )}

                            {/* Questions List */}
                            <div className="space-y-6">
                                {activeQuiz.questions.map((q, qIdx) => {
                                    const selectedOption = quizAnswers[q.id];
                                    const isAnswered = selectedOption !== undefined;
                                    const isCorrect = isAnswered && selectedOption === q.correctIndex;

                                    return (
                                        <div key={q.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                                            <div className="flex items-start gap-2">
                                                <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                                    {qIdx + 1}
                                                </span>
                                                <h4 className="font-semibold text-slate-900 text-xs leading-relaxed">
                                                    {q.question}
                                                </h4>
                                            </div>

                                            <div className="space-y-2 pl-8">
                                                {q.options.map((opt, optIdx) => {
                                                    const isSelected = selectedOption === optIdx;
                                                    let optClass = "border-slate-200 bg-white hover:border-slate-300";

                                                    if (quizSubmitted) {
                                                        if (optIdx === q.correctIndex) {
                                                            optClass = "border-emerald-500 bg-emerald-50/60 text-emerald-900 font-semibold";
                                                        } else if (isSelected) {
                                                            optClass = "border-rose-400 bg-rose-50/60 text-rose-900";
                                                        }
                                                    } else if (isSelected) {
                                                        optClass = "border-indigo-600 bg-indigo-50/40 text-indigo-900 ring-1 ring-indigo-500";
                                                    }

                                                    return (
                                                        <label
                                                            key={optIdx}
                                                            onClick={() => handleQuizOptionSelect(q.id, optIdx)}
                                                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${optClass}`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-${q.id}`}
                                                                checked={isSelected}
                                                                onChange={() => handleQuizOptionSelect(q.id, optIdx)}
                                                                disabled={quizSubmitted}
                                                                className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                                                            />
                                                            <span className="flex-1">{opt}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>

                                            {/* Explanation after submission */}
                                            {quizSubmitted && (
                                                <div className="mt-2 pl-8 text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                                                    <strong className="text-slate-800">Explanation: </strong>
                                                    {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    onClick={() => setActiveQuiz(null)}
                                    className="text-xs"
                                >
                                    {quizSubmitted ? "Close" : "Cancel"}
                                </Button>
                                {!quizSubmitted && (
                                    <Button
                                        onClick={handleSubmitQuiz}
                                        disabled={Object.keys(quizAnswers).length === 0}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                                    >
                                        Submit Assessment
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function StudentDashboardPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">Loading Student Dashboard...</p>
                    </div>
                </div>
            }
        >
            <StudentDashboardContent />
        </Suspense>
    );
}
