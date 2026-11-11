"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    Users,
    Package,
    CheckCircle2,
    Clock,
    XCircle,
    FileSpreadsheet,
    Download,
    ExternalLink,
    Search,
    Filter,
    Eye,
    MessageCircle,
    RefreshCw,
    TrendingUp,
    ChevronDown,
    Building2,
    Calendar,
    AlertTriangle,
    Check,
    X,
    FileText,
    Mail,
    MapPin,
    Sparkles,
    User,
    Trash2,
    FolderKanban,
    Layers,
    CheckSquare,
    Bell,
    Plus,
    Send,
    BarChart3,
    Edit3
} from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { internshipService, INTERNSHIP_DOMAINS, PACKAGES_CONFIG } from "@/lib/services/internshipService";
import { studentService, StudentAnnouncement, SupportTicket } from "@/lib/services/studentService";
import {
    DatabaseInternshipBatch,
    DatabaseInternshipApplication,
    InternshipApplicationStatus
} from "@/lib/supabase";

export default function AdminInternshipsBatchPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const batchId = (params?.batchId as string) || "wi26";

    // Batch & Batches State
    const [batches, setBatches] = useState<DatabaseInternshipBatch[]>([]);
    const [currentBatch, setCurrentBatch] = useState<DatabaseInternshipBatch | null>(null);

    // Applications & Analytics
    const [applications, setApplications] = useState<DatabaseInternshipApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"applications" | "analytics" | "reports" | "announcements" | "support" | "quiz-analytics">("applications");

    // Quiz Results & Analytics State
    const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
    const [quizSearch, setQuizSearch] = useState("");
    const [quizDomainFilter, setQuizDomainFilter] = useState("all");
    const [quizWeekFilter, setQuizWeekFilter] = useState("all");
    const [quizStatusFilter, setQuizStatusFilter] = useState<"all" | "pass" | "fail">("all");
    const [selectedAttemptForSheet, setSelectedAttemptForSheet] = useState<any | null>(null);
    const [selectedAttemptForAdjustment, setSelectedAttemptForAdjustment] = useState<any | null>(null);
    const [adjustScore, setAdjustScore] = useState<number>(0);
    const [adjustFeedback, setAdjustFeedback] = useState<string>("");

    // Support Tickets & Mentor Queries State
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [supportFilter, setSupportFilter] = useState<"all" | "open" | "resolved">("all");
    const [supportSearch, setSupportSearch] = useState("");
    const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});
    const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);

    // Filter & Search
    const [searchTerm, setSearchTerm] = useState("");
    const [domainFilter, setDomainFilter] = useState("all");
    const [packageFilter, setPackageFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Bulk selection state
    const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

    // Modal / Drawer states
    const [selectedApp, setSelectedApp] = useState<DatabaseInternshipApplication | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");

    // Email Notification & Testing State
    const [showTestEmailModal, setShowTestEmailModal] = useState(false);
    const [testEmailTarget, setTestEmailTarget] = useState("");
    const [testEmailType, setTestEmailType] = useState<"accepted" | "rejected">("accepted");
    const [testEmailLoading, setTestEmailLoading] = useState(false);

    const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);
    const [previewEmailData, setPreviewEmailData] = useState<{
        subject: string;
        html: string;
        text: string;
        recipient: string;
        studentName: string;
        domain?: string;
        applicationId?: string;
        type?: string;
    } | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Announcements Management State
    const [announcementsList, setAnnouncementsList] = useState<StudentAnnouncement[]>([]);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<StudentAnnouncement | null>(null);
    const [annForm, setAnnForm] = useState({
        title: "",
        message: "",
        priority: "normal" as "normal" | "important" | "urgent",
        domain: "All",
        reference_url: ""
    });

    // Analytics State
    const [analytics, setAnalytics] = useState<{
        total: number;
        standardCount: number;
        premiumCount: number;
        totalProjectedRevenue: number;
        domainBreakdown: Record<string, number>;
        packageBreakdown: Record<string, number>;
        statusBreakdown: Record<string, number>;
    }>({
        total: 0,
        standardCount: 0,
        premiumCount: 0,
        totalProjectedRevenue: 0,
        domainBreakdown: {},
        packageBreakdown: {},
        statusBreakdown: {},
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const allBatches = await internshipService.getAllBatches();
            setBatches(allBatches);

            const batch = await internshipService.getBatch(batchId);
            setCurrentBatch(batch);

            const apps = await internshipService.getApplications(batchId);
            setApplications(apps);

            const stats = await internshipService.getBatchAnalytics(batchId);
            setAnalytics(stats);

            const anns = await studentService.getAnnouncements(batchId);
            setAnnouncementsList(anns);

            const tickets = await studentService.getAllSupportTickets();
            setSupportTickets(tickets);

            // Populate Quiz Attempts across candidates
            const attemptsList: any[] = [];
            apps.forEach((app) => {
                const appId = app.application_id || app.application_number || app.id;
                const localResults = studentService.getQuizResults(appId);
                const domainQuizzes = studentService.getDomainQuizzes(app.domain || "Full Stack Development");

                Object.entries(localResults).forEach(([quizId, res]: [string, any]) => {
                    const quizMeta = domainQuizzes.find((q) => q.id === quizId) || {
                        title: `Week Assessment (${quizId})`,
                        week: 1,
                        totalMarks: 20,
                        questions: []
                    };
                    const percentage = Math.round((res.score / (res.totalMarks || quizMeta.totalMarks || 20)) * 100);
                    attemptsList.push({
                        id: `${appId}-${quizId}`,
                        application_id: appId,
                        full_name: app.full_name,
                        email: app.email,
                        phone: app.phone,
                        domain: app.domain,
                        college_name: app.college_name,
                        package_name: app.package_name || "Free",
                        quiz_id: quizId,
                        quiz_title: quizMeta.title,
                        week: quizMeta.week,
                        score: res.score,
                        total_marks: res.totalMarks || quizMeta.totalMarks || 20,
                        percentage,
                        status: percentage >= 50 ? "Pass" : "Needs Review",
                        submitted_at: res.completedAt || new Date().toISOString(),
                        answers: res.answers || {},
                        mentor_feedback: res.mentorFeedback || "",
                        questions: quizMeta.questions || []
                    });
                });
            });
            setQuizAttempts(attemptsList);
        } catch (error) {
            console.error("Error loading internship admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [batchId]);

    // Handle Status Change with Automatic Server-Side Email Trigger
    const handleUpdateStatus = async (
        appId: string,
        newStatus: InternshipApplicationStatus,
        customNotes?: string,
        forceResend: boolean = false
    ) => {
        setActionLoading(true);
        try {
            const res = await internshipService.updateApplicationStatus(
                appId,
                newStatus,
                customNotes !== undefined ? customNotes : adminNotes,
                forceResend
            );
            await loadData();
            if (selectedApp && selectedApp.id === appId) {
                setSelectedApp({ ...selectedApp, status: newStatus, internal_notes: customNotes || adminNotes });
            }
            if (res.message) {
                alert(res.message);
            }
        } catch (error: any) {
            console.error("Status update error:", error);
            alert(`Status update error: ${error.message || "Failed to update"}`);
        } finally {
            setActionLoading(false);
        }
    };

    // Preview Rendered Decision Email Modal
    const handlePreviewEmail = async (app: DatabaseInternshipApplication, targetStatus: "accepted" | "rejected") => {
        setPreviewLoading(true);
        try {
            const preview = await internshipService.previewDecisionEmail(app.application_id || app.id, targetStatus);
            if (preview) {
                setPreviewEmailData(preview);
                setShowEmailPreviewModal(true);
            } else {
                alert("Could not render email preview.");
            }
        } catch (e: any) {
            alert(`Preview error: ${e.message}`);
        } finally {
            setPreviewLoading(false);
        }
    };

    // Resend Decision Email Action
    const handleResendEmail = async (app: DatabaseInternshipApplication, targetStatus: "accepted" | "rejected") => {
        const idDisplay = app.application_id || app.application_number || app.id;
        if (!window.confirm(`Resend ${targetStatus.toUpperCase()} notification email to ${app.full_name} (${app.email}) for application ${idDisplay}?`)) {
            return;
        }

        setActionLoading(true);
        try {
            const res = await internshipService.resendDecisionEmail(app.id, targetStatus);
            await loadData();
            if (res.message) {
                alert(res.message);
            }
        } catch (e: any) {
            alert(`Resend failed: ${e.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    // Dispatch Test Email to Admin
    const handleSendTestDecisionEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testEmailTarget.trim()) {
            alert("Please provide a valid test recipient email address.");
            return;
        }
        setTestEmailLoading(true);
        try {
            const res = await internshipService.sendTestDecisionEmail(testEmailTarget.trim(), testEmailType);
            if (res.success) {
                alert(`Test ${testEmailType.toUpperCase()} email successfully dispatched to ${testEmailTarget}! Please verify your inbox/spam folder.`);
                setShowTestEmailModal(false);
            } else {
                alert(`Test email failed: ${res.error || res.message || "Unknown error"}`);
            }
        } catch (e: any) {
            alert(`Test email execution error: ${e.message}`);
        } finally {
            setTestEmailLoading(false);
        }
    };

    // Permanently Delete Application
    const handleDeleteApp = async (app: DatabaseInternshipApplication) => {
        const idDisplay = app.application_id || app.application_number || app.id;
        if (!window.confirm(`Are you sure you want to permanently delete application ${idDisplay} for ${app.full_name}?`)) {
            return;
        }

        setActionLoading(true);
        try {
            await internshipService.deleteApplication(app.id, app.application_id);
            if (selectedApp && (selectedApp.id === app.id || selectedApp.application_id === app.application_id)) {
                setSelectedApp(null);
            }
            await loadData();
        } catch (error) {
            console.error("Delete application error:", error);
            alert("Could not delete application. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedAppIds(filteredApps.map((a) => a.id));
        } else {
            setSelectedAppIds([]);
        }
    };

    const handleToggleSelectApp = (id: string) => {
        setSelectedAppIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleBulkAccept = async () => {
        if (selectedAppIds.length === 0) return;
        if (!window.confirm(`Accept ${selectedAppIds.length} selected candidate(s)? This will unlock their student workspace and dispatch acceptance emails automatically.`)) return;

        setActionLoading(true);
        let sentCount = 0;
        let failCount = 0;
        try {
            for (const id of selectedAppIds) {
                const res = await internshipService.updateApplicationStatus(id, "accepted", "Bulk approved by administrator");
                if (res?.emailDelivery?.success) sentCount++;
                else if (res?.emailDelivery?.error) failCount++;
            }
            setSelectedAppIds([]);
            await loadData();
            alert(`Bulk acceptance complete! ${selectedAppIds.length} candidates accepted. Automatic decision emails: ${sentCount} sent${failCount > 0 ? `, ${failCount} failed` : ""}.`);
        } catch (err) {
            console.error("Bulk accept error:", err);
            alert("Failed to bulk approve applications.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleBulkReject = async () => {
        if (selectedAppIds.length === 0) return;
        const reason = window.prompt("Enter rejection note for selected candidates:", "Application criteria not met for Batch WI26.");
        if (reason === null) return;

        setActionLoading(true);
        let sentCount = 0;
        let failCount = 0;
        try {
            for (const id of selectedAppIds) {
                const res = await internshipService.updateApplicationStatus(id, "rejected", reason);
                if (res?.emailDelivery?.success) sentCount++;
                else if (res?.emailDelivery?.error) failCount++;
            }
            setSelectedAppIds([]);
            await loadData();
            alert(`Bulk rejection complete! Decision emails: ${sentCount} sent${failCount > 0 ? `, ${failCount} failed` : ""}.`);
        } catch (err) {
            console.error("Bulk reject error:", err);
            alert("Failed to bulk reject applications.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleOpenCreateAnnouncement = () => {
        setEditingAnnouncement(null);
        setAnnForm({
            title: "",
            message: "",
            priority: "normal",
            domain: "All",
            reference_url: ""
        });
        setShowAnnouncementModal(true);
    };

    const handleOpenEditAnnouncement = (ann: StudentAnnouncement) => {
        setEditingAnnouncement(ann);
        setAnnForm({
            title: ann.title || "",
            message: ann.message || "",
            priority: ann.priority || "normal",
            domain: ann.domain || "All",
            reference_url: ann.reference_url || ""
        });
        setShowAnnouncementModal(true);
    };

    const handleSaveAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!annForm.title.trim() || !annForm.message.trim()) {
            alert("Please provide both a title and message body for the announcement.");
            return;
        }

        setActionLoading(true);
        try {
            if (editingAnnouncement) {
                const updated = await studentService.updateAnnouncement(editingAnnouncement.id, {
                    title: annForm.title.trim(),
                    message: annForm.message.trim(),
                    priority: annForm.priority,
                    domain: annForm.domain,
                    reference_url: annForm.reference_url.trim() || undefined
                });

                setAnnouncementsList((prev) =>
                    prev.map((a) => (a.id === editingAnnouncement.id ? { ...a, ...updated } : a))
                );
                alert("Cohort announcement updated successfully!");
            } else {
                const created = await studentService.createAnnouncement({
                    batch_id: batchId,
                    title: annForm.title.trim(),
                    message: annForm.message.trim(),
                    priority: annForm.priority,
                    domain: annForm.domain,
                    reference_url: annForm.reference_url.trim() || undefined
                });

                setAnnouncementsList((prev) => [created, ...prev.filter((a) => a.id !== created.id)]);
                alert("Cohort announcement published and broadcasted successfully!");
            }

            setShowAnnouncementModal(false);
            setEditingAnnouncement(null);
            setAnnForm({
                title: "",
                message: "",
                priority: "normal",
                domain: "All",
                reference_url: ""
            });
        } catch (err: any) {
            console.error("Error saving announcement:", err);
            alert(`Failed to save announcement: ${err.message || "Unknown error"}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this cohort announcement? This will remove it from all student dashboards.")) return;
        try {
            await studentService.deleteAnnouncement(id);
            setAnnouncementsList((prev) => prev.filter((a) => a.id !== id));
            alert("Announcement removed successfully.");
        } catch (err: any) {
            console.error("Error deleting announcement:", err);
            alert(`Failed to delete announcement: ${err.message || "Unknown error"}`);
        }
    };

    const handleExportQuizResultsCSV = () => {
        if (quizAttempts.length === 0) {
            alert("No quiz results available to export.");
            return;
        }

        const headers = [
            "Application ID",
            "Student Name",
            "Email",
            "Phone",
            "Domain",
            "College",
            "Package",
            "Quiz Title",
            "Week",
            "Score",
            "Total Marks",
            "Percentage (%)",
            "Result Status",
            "Submitted Date"
        ];

        const rows = quizAttempts.map((q) => [
            q.application_id,
            `"${q.full_name.replace(/"/g, '""')}"`,
            q.email,
            q.phone,
            `"${q.domain}"`,
            `"${(q.college_name || "").replace(/"/g, '""')}"`,
            q.package_name,
            `"${q.quiz_title.replace(/"/g, '""')}"`,
            `Week ${q.week}`,
            q.score,
            q.total_marks,
            `${q.percentage}%`,
            q.status,
            new Date(q.submitted_at).toLocaleDateString()
        ]);

        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `vectonix_quiz_results_${batchId}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveAdjustedMarks = () => {
        if (!selectedAttemptForAdjustment) return;
        const updated = quizAttempts.map((item) => {
            if (item.id === selectedAttemptForAdjustment.id) {
                const percentage = Math.round((adjustScore / item.total_marks) * 100);
                return {
                    ...item,
                    score: adjustScore,
                    percentage,
                    status: percentage >= 50 ? "Pass" : "Needs Review",
                    mentor_feedback: adjustFeedback
                };
            }
            return item;
        });
        setQuizAttempts(updated);
        studentService.saveQuizResult(selectedAttemptForAdjustment.application_id, selectedAttemptForAdjustment.quiz_id, {
            score: adjustScore,
            totalMarks: selectedAttemptForAdjustment.total_marks,
            answers: selectedAttemptForAdjustment.answers
        });
        setSelectedAttemptForAdjustment(null);
        alert("Quiz marks and mentor feedback updated successfully!");
    };

    const handleSendTicketReply = async (ticketId: string) => {
        const text = ticketReplies[ticketId]?.trim();
        if (!text) {
            alert("Please type a mentor reply message before sending.");
            return;
        }
        setReplyingTicketId(ticketId);
        try {
            const res = await studentService.replySupportTicket(ticketId, text);
            if (res.success) {
                alert("Mentor reply sent successfully to the student!");
                setTicketReplies((prev) => ({ ...prev, [ticketId]: "" }));
                const refreshed = await studentService.getAllSupportTickets();
                setSupportTickets(refreshed);
            } else {
                alert("Failed to send reply: " + res.error);
            }
        } catch (err: any) {
            alert("Error sending reply: " + err.message);
        } finally {
            setReplyingTicketId(null);
        }
    };

    // Export to Excel with all address & package fields
    const handleExportExcel = (exportType: "all" | "standard" | "premium" | "accepted") => {
        let exportData = applications;
        if (exportType === "standard") {
            exportData = applications.filter((a) => a.package_name === "Standard");
        } else if (exportType === "premium") {
            exportData = applications.filter((a) => a.package_name === "Premium");
        } else if (exportType === "accepted") {
            exportData = applications.filter((a) => a.status === "accepted");
        }

        const rows = exportData.map((app) => ({
            "Application ID": app.application_id || app.application_number,
            "Full Name": app.full_name,
            "Email Address": app.email,
            "Mobile Phone": app.phone,
            "WhatsApp": app.whatsapp_number || app.phone,
            "Gender": app.gender || "N/A",
            "College Name": app.college_name,
            "College City": app.college_city || "N/A",
            "College State": app.college_state || "N/A",
            "College Selection": app.college_selection_type || "N/A",
            "Degree": app.degree,
            "Department": app.department,
            "Year of Study": app.year_of_study,
            "Internship Domain": app.domain,
            "Package Selected": app.package_name,
            "Package Amount (INR)": app.package_name === "Free" ? 0 : (app.package_amount || (app.package_name === "Premium" ? 999 : 749)),
            "Application Status": app.status.toUpperCase(),
            "Door / House No": app.house_number || "N/A",
            "Street Name": app.street_name || "N/A",
            "Locality": app.locality || "N/A",
            "City": app.city || "N/A",
            "District": app.district || "N/A",
            "State": app.state || "N/A",
            "PIN Code": app.postal_code || "N/A",
            "Country": app.country || "India",
            "LinkedIn URL": app.linkedin_url || "N/A",
            "GitHub URL": app.github_url || "N/A",
            "Portfolio URL": app.portfolio_url || "N/A",
            "Registration Date": app.created_at ? new Date(app.created_at).toLocaleDateString() : "N/A",
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Applications");

        const fileName = `Vectonix_${batchId.toUpperCase()}_Internships_${exportType}_${new Date().toISOString().split("T")[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Filter applications
    const filteredApps = applications.filter((app) => {
        const matchesDomain = domainFilter === "all" || app.domain === domainFilter;
        const matchesPackage = packageFilter === "all" || app.package_name === packageFilter;
        const matchesStatus = statusFilter === "all" || app.status === statusFilter;
        const s = searchTerm.toLowerCase();
        const matchesSearch =
            !searchTerm ||
            (app.full_name && app.full_name.toLowerCase().includes(s)) ||
            (app.application_id && app.application_id.toLowerCase().includes(s)) ||
            (app.email && app.email.toLowerCase().includes(s)) ||
            (app.college_name && app.college_name.toLowerCase().includes(s)) ||
            (app.city && app.city.toLowerCase().includes(s));

        return matchesDomain && matchesPackage && matchesStatus && matchesSearch;
    });

    // Filter support tickets
    const filteredSupportTickets = supportTickets.filter((ticket) => {
        const isResolved = ticket.status === "Resolved" || ticket.status === "Answered" || !!(ticket.admin_response || ticket.reply);
        if (supportFilter === "open" && isResolved) return false;
        if (supportFilter === "resolved" && !isResolved) return false;

        if (supportSearch.trim()) {
            const query = supportSearch.toLowerCase();
            const matchName = (ticket.student_name || "").toLowerCase().includes(query);
            const matchEmail = (ticket.student_email || "").toLowerCase().includes(query);
            const matchId = (ticket.application_id || "").toLowerCase().includes(query);
            const matchSub = (ticket.subject || "").toLowerCase().includes(query);
            const matchMsg = (ticket.message || "").toLowerCase().includes(query);
            return matchName || matchEmail || matchId || matchSub || matchMsg;
        }
        return true;
    });

    return (
        <div className="space-y-8 pb-16">
            {/* Header: Batch Selector & Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <Briefcase className="h-6 w-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {currentBatch?.title || "Internship Batch Administration"}
                            </h1>
                            <p className="text-xs text-slate-500">
                                Manage candidate registrations, packages, residential addresses, and export cohort reports.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Batch Switcher */}
                    <div className="relative">
                        <select
                            value={batchId}
                            onChange={(e) => router.push(`/admin/internships/${e.target.value}`)}
                            className="appearance-none bg-white border border-slate-300 hover:border-slate-400 px-4 py-2 pr-9 rounded-xl text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            {batches.map((b) => (
                                <option key={b.id} value={b.id}>
                                    Batch: {b.title} ({b.id.toUpperCase()})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>

                    {/* Project Bank Shortcut */}
                    <Link
                        href={`/admin/internships/${batchId}/projects`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
                    >
                        <FolderKanban className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Project Bank</span>
                    </Link>

                    {/* Project Allocations Shortcut */}
                    <Link
                        href={`/admin/internships/${batchId}/allocations`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
                    >
                        <Layers className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Allocations</span>
                    </Link>

                    {/* Assignments & Submissions Shortcut */}
                    <Link
                        href={`/admin/internships/${batchId}/assignments`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
                    >
                        <CheckSquare className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Assignments</span>
                    </Link>

                    {/* Email Manager Shortcut */}
                    <Link
                        href={`/admin/internships/${batchId}/emails`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                    >
                        <Mail className="h-3.5 w-3.5" />
                        <span>Send Bulk Emails</span>
                    </Link>

                    {/* Refresh Button */}
                    <button
                        onClick={loadData}
                        title="Refresh data"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </button>

                    {/* Public Apply Link shortcut */}
                    <Link
                        href={`/apply/internships/${batchId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                        <span>Public Form</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>

            {/* Metric KPI Cards (Reflecting Package Registrations, No Payment Gateway) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Total Applicants
                        </span>
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">{analytics.total}</span>
                        <span className="text-xs text-slate-400">students</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Premium Package (₹999)
                        </span>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <Sparkles className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-amber-600">{analytics.premiumCount}</span>
                        <span className="text-xs text-slate-400">welcome kits</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Standard Package (₹749)
                        </span>
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                            <Package className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">{analytics.standardCount}</span>
                        <span className="text-xs text-slate-400">candidates</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Projected Intake Value
                        </span>
                        <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">
                            ₹{analytics.totalProjectedRevenue.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400">INR</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-2">
                    {[
                        { id: "applications", label: "Manage Applications", icon: Users, badge: applications.length },
                        { id: "support", label: "Mentor Support & Queries", icon: MessageCircle, badge: supportTickets.filter((t) => t.status === "Open").length },
                        { id: "quiz-analytics", label: "Quiz Results & Analytics", icon: BarChart3, badge: quizAttempts.length },
                        { id: "announcements", label: "Cohort Announcements", icon: Bell, badge: announcementsList.length },
                        { id: "analytics", label: "Cohort Analytics", icon: TrendingUp },
                        { id: "reports", label: "Export Reports", icon: FileSpreadsheet },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                                    isActive
                                        ? "border-indigo-600 text-indigo-600"
                                        : "border-transparent text-slate-500 hover:text-slate-900"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{tab.label}</span>
                                {tab.badge !== undefined && (
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {tab.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-3 pr-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setTestEmailTarget("rahman.habibur2007@gmail.com");
                            setShowTestEmailModal(true);
                        }}
                        className="h-8 text-xs font-semibold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border-indigo-200 gap-1.5"
                    >
                        <Send className="h-3.5 w-3.5" />
                        <span>Test Decision Email</span>
                    </Button>
                    <Link
                        href={`/admin/internships/${batchId}/emails`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                        <Mail className="h-4 w-4" />
                        <span>Open Email Center &rarr;</span>
                    </Link>
                </div>
            </div>

            {/* TAB 1: APPLICATIONS LIST */}
            {activeTab === "applications" && (
                <div className="space-y-4">
                    {/* Filter Bar */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                        <div className="relative">
                            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search Name, App ID, College, City..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <select
                                value={domainFilter}
                                onChange={(e) => setDomainFilter(e.target.value)}
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Domains</option>
                                {INTERNSHIP_DOMAINS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={packageFilter}
                                onChange={(e) => setPackageFilter(e.target.value)}
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Packages</option>
                                <option value="Standard">Standard (₹749)</option>
                                <option value="Premium">Premium (₹999)</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="accepted">Accepted</option>
                                <option value="waitlisted">Waitlisted</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Bulk Selection Action Bar */}
                    {selectedAppIds.length > 0 && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between shadow-xs">
                            <span className="text-xs font-bold text-indigo-900">
                                {selectedAppIds.length} candidate(s) selected for bulk review
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleBulkAccept}
                                    disabled={actionLoading}
                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    Bulk Accept Selected
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleBulkReject}
                                    disabled={actionLoading}
                                    className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200 font-semibold gap-1"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Bulk Reject Selected
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Applications Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                        <th className="w-10 px-3 py-3.5 text-center">
                                            <input
                                                type="checkbox"
                                                onChange={handleSelectAll}
                                                checked={selectedAppIds.length > 0 && selectedAppIds.length === filteredApps.length}
                                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </th>
                                        <th className="px-4 py-3.5">Application ID</th>
                                        <th className="px-4 py-3.5">Candidate Details</th>
                                        <th className="px-4 py-3.5">College & Location</th>
                                        <th className="px-4 py-3.5">Domain</th>
                                        <th className="px-4 py-3.5">Package</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5">Email Notification</th>
                                        <th className="px-4 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredApps.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="px-4 py-16 text-center">
                                                <div className="max-w-md mx-auto">
                                                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                                                        <Users className="h-6 w-6" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800">
                                                        {applications.length === 0 ? "No applications recorded yet" : "No matching applications"}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {applications.length === 0
                                                            ? "Make sure the SQL migration has been executed in Supabase SQL editor. Once an applicant submits the registration form, their details will appear here immediately."
                                                            : "Try clearing your search query or changing domain/package filters to see all candidates."}
                                                    </p>
                                                    <div className="mt-4 flex items-center justify-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={loadData}
                                                            className="text-xs gap-1.5"
                                                        >
                                                            <RefreshCw className="h-3.5 w-3.5" />
                                                            Refresh
                                                        </Button>
                                                        <Link
                                                            href={`/apply/internships/${batchId}`}
                                                            target="_blank"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                                        >
                                                            <span>Open Registration Portal</span>
                                                            <ExternalLink className="h-3 w-3" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredApps.map((app) => {
                                            const statusColors: Record<string, string> = {
                                                pending: "bg-slate-100 text-slate-700 border-slate-200",
                                                under_review: "bg-blue-50 text-blue-700 border-blue-200",
                                                accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                waitlisted: "bg-purple-50 text-purple-700 border-purple-200",
                                                rejected: "bg-red-50 text-red-700 border-red-200",
                                            };

                                            const isSelected = selectedAppIds.includes(app.id);

                                            return (
                                                <tr key={app.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? "bg-indigo-50/30" : ""}`}>
                                                    <td className="w-10 px-3 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleToggleSelectApp(app.id)}
                                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                                        {app.application_id || app.application_number}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-slate-900">{app.full_name}</div>
                                                        <div className="text-slate-400 text-[11px]">{app.email} • {app.gender || "N/A"}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        <div className="font-medium truncate max-w-xs">{app.college_name}</div>
                                                        <div className="text-slate-400 text-[11px]">
                                                            {app.city ? `${app.city}, ${app.state}` : app.degree}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                                            {app.domain}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase ${
                                                                app.package_name === "Premium"
                                                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                                                    : app.package_name === "Free"
                                                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                                                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                            }`}
                                                        >
                                                            {app.package_name} (₹{app.package_name === "Free" ? 0 : (app.package_amount || (app.package_name === "Premium" ? 999 : 749))})
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase ${
                                                                statusColors[app.status] || statusColors.pending
                                                            }`}
                                                        >
                                                            {app.status.replace("_", " ")}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {(() => {
                                                            let emailNote: any = null;
                                                            try {
                                                                const parsed = JSON.parse(app.internal_notes || "{}");
                                                                emailNote = parsed.email_notification;
                                                            } catch {}

                                                            if (emailNote) {
                                                                const isSent = emailNote.status === "sent";
                                                                const isFailed = emailNote.status === "failed";
                                                                const dateStr = emailNote.sent_at
                                                                    ? new Date(emailNote.sent_at).toLocaleDateString("en-US", {
                                                                          month: "short",
                                                                          day: "numeric",
                                                                          hour: "2-digit",
                                                                          minute: "2-digit"
                                                                      })
                                                                    : "";
                                                                return (
                                                                    <div className="space-y-0.5">
                                                                        <span
                                                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                                                                                isSent
                                                                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                                                                    : isFailed
                                                                                    ? "bg-rose-50 text-rose-800 border-rose-200"
                                                                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                                                            }`}
                                                                            title={emailNote.error || emailNote.message_id || ""}
                                                                        >
                                                                            {isSent ? (
                                                                                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                                                                            ) : isFailed ? (
                                                                                <XCircle className="h-2.5 w-2.5 text-rose-600" />
                                                                            ) : (
                                                                                <Clock className="h-2.5 w-2.5 text-amber-600" />
                                                                            )}
                                                                            {isSent
                                                                                ? `Sent (${emailNote.type === "accepted" || emailNote.type === "acceptance" ? "Accepted" : "Rejected"})`
                                                                                : isFailed
                                                                                ? "Delivery Failed"
                                                                                : "Queued"}
                                                                        </span>
                                                                        {dateStr && <div className="text-[10px] text-slate-400 font-mono">{dateStr}</div>}
                                                                        {isFailed && emailNote.error && (
                                                                            <div
                                                                                className="text-[10px] text-rose-600 truncate max-w-[150px]"
                                                                                title={emailNote.error}
                                                                            >
                                                                                {emailNote.error}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }

                                                            if (app.status === "accepted" || app.status === "rejected") {
                                                                return (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border-amber-200">
                                                                        <Clock className="h-2.5 w-2.5 text-amber-600" />
                                                                        Pending Dispatch
                                                                    </span>
                                                                );
                                                            }

                                                            return <span className="text-[11px] text-slate-400 italic">No decision</span>;
                                                        })()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                            {app.status !== "accepted" && (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleUpdateStatus(app.id, "accepted")}
                                                                    disabled={actionLoading}
                                                                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 gap-1"
                                                                    title="Accept Application & Send Acceptance Email Automatically"
                                                                >
                                                                    <Check className="h-3.5 w-3.5" />
                                                                    Accept
                                                                </Button>
                                                            )}
                                                            {app.status !== "rejected" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        const reason = window.prompt(
                                                                            `Enter rejection note for ${app.full_name}:`,
                                                                            "Application criteria not met for Batch WI26."
                                                                        );
                                                                        if (reason !== null) {
                                                                            handleUpdateStatus(app.id, "rejected", reason);
                                                                        }
                                                                    }}
                                                                    disabled={actionLoading}
                                                                    className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 font-semibold px-2.5 gap-1"
                                                                    title="Reject Application & Send Encouraging Rejection Email Automatically"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                    Reject
                                                                </Button>
                                                            )}
                                                            {(app.status === "accepted" || app.status === "rejected") && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            handlePreviewEmail(
                                                                                app,
                                                                                app.status as "accepted" | "rejected"
                                                                            )
                                                                        }
                                                                        disabled={previewLoading || actionLoading}
                                                                        className="h-7 text-xs text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border-indigo-200 gap-1"
                                                                        title="View Email Template Sent to Candidate"
                                                                    >
                                                                        <Mail className="h-3 w-3" />
                                                                        View Email
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            handleResendEmail(
                                                                                app,
                                                                                app.status as "accepted" | "rejected"
                                                                            )
                                                                        }
                                                                        disabled={actionLoading}
                                                                        className="h-7 text-xs text-slate-600 hover:bg-slate-100 border-slate-200 gap-1"
                                                                        title="Resend Decision Notification"
                                                                    >
                                                                        <RefreshCw className="h-3 w-3" />
                                                                        Resend
                                                                    </Button>
                                                                </>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedApp(app);
                                                                    setAdminNotes(app.internal_notes || "");
                                                                }}
                                                                className="h-7 text-xs gap-1"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                                View
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDeleteApp(app)}
                                                                className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 gap-1"
                                                                title="Delete duplicate or test record"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: COHORT ANALYTICS */}
            {activeTab === "analytics" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Package Breakdown */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                                <Package className="h-4 w-4 text-indigo-600" />
                                Registration Package Breakdown
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-amber-950">Premium Package (₹999)</span>
                                        <span className="font-extrabold text-amber-700 text-sm">
                                            {analytics.premiumCount} ({analytics.total > 0 ? Math.round((analytics.premiumCount / analytics.total) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-amber-100 overflow-hidden mt-2">
                                        <div
                                            className="h-full bg-amber-500 rounded-full"
                                            style={{
                                                width: `${analytics.total > 0 ? (analytics.premiumCount / analytics.total) * 100 : 0}%`
                                            }}
                                        />
                                    </div>
                                    <span className="text-[11px] text-amber-700 mt-2 block">
                                        Includes welcome kit dispatch (branded bottle, pen, badge)
                                    </span>
                                </div>

                                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-indigo-950">Standard Package (₹749)</span>
                                        <span className="font-extrabold text-indigo-700 text-sm">
                                            {analytics.standardCount} ({analytics.total > 0 ? Math.round((analytics.standardCount / analytics.total) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-indigo-100 overflow-hidden mt-2">
                                        <div
                                            className="h-full bg-indigo-600 rounded-full"
                                            style={{
                                                width: `${analytics.total > 0 ? (analytics.standardCount / analytics.total) * 100 : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Domain Distribution */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-indigo-600" />
                                Domain Track Distribution
                            </h3>
                            <div className="space-y-3">
                                {Object.keys(analytics.domainBreakdown).length === 0 ? (
                                    <p className="text-xs text-slate-400">No domain registration data yet.</p>
                                ) : (
                                    Object.entries(analytics.domainBreakdown).map(([dom, count]) => {
                                        const pct = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                                        return (
                                            <div key={dom} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="font-medium text-slate-700">{dom}</span>
                                                    <span className="font-bold text-slate-900">
                                                        {count} ({pct}%)
                                                    </span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-600 rounded-full transition-all"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: EXPORT REPORTS */}
            {activeTab === "reports" && (
                <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <FileSpreadsheet className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Export Cohort Spreadsheet</h3>
                                <p className="text-xs text-slate-500">
                                    Download complete rosters in Microsoft Excel (.xlsx) format including full residential address components, chosen packages, contact details, and institutional data.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Full Batch Roster</h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        All {applications.length} submitted registrations with complete addresses.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => handleExportExcel("all")}
                                    className="gap-2 text-xs bg-slate-900 hover:bg-slate-800"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Full Excel (.xlsx)
                                </Button>
                            </div>

                            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between space-y-3">
                                <div>
                                    <h4 className="font-bold text-amber-950 text-sm">Premium Welcome Kit List</h4>
                                    <p className="text-xs text-amber-700 mt-1">
                                        Only applicants who chose Premium package ({analytics.premiumCount} records for shipping kits).
                                    </p>
                                </div>
                                <Button
                                    onClick={() => handleExportExcel("premium")}
                                    className="gap-2 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Kit Orders (.xlsx)
                                </Button>
                            </div>

                            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col justify-between space-y-3">
                                <div>
                                    <h4 className="font-bold text-emerald-950 text-sm">Accepted Students</h4>
                                    <p className="text-xs text-emerald-700 mt-1">
                                        Shortlisted candidates accepted into the winter cohort.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => handleExportExcel("accepted")}
                                    className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Accepted (.xlsx)
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: COHORT ANNOUNCEMENTS */}
            {activeTab === "announcements" && (
                <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-indigo-600" />
                                    Cohort Announcement Broadcasts
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Publish important notices, schedule changes, and orientation updates directly to student dashboards.
                                </p>
                            </div>

                            <Button
                                onClick={handleOpenCreateAnnouncement}
                                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 self-start sm:self-auto"
                            >
                                <Plus className="h-4 w-4" />
                                Create Announcement
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {announcementsList.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 text-xs">
                                    No announcements published yet. Click &quot;Create Announcement&quot; to broadcast your first update.
                                </div>
                            ) : (
                                announcementsList.map((ann) => (
                                    <div
                                        key={ann.id}
                                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    ann.priority === "urgent"
                                                        ? "bg-rose-100 text-rose-800"
                                                        : ann.priority === "important"
                                                        ? "bg-amber-100 text-amber-800"
                                                        : "bg-indigo-100 text-indigo-700"
                                                }`}>
                                                    {ann.priority}
                                                </span>
                                                <span className="font-semibold text-slate-500">Domain: {ann.domain || "All"}</span>
                                                <span className="text-slate-400">• {new Date(ann.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                                            <p className="text-slate-600 max-w-2xl">{ann.message}</p>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            {ann.reference_url && (
                                                <a
                                                    href={ann.reference_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Open Reference Link"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleOpenEditAnnouncement(ann)}
                                                className="text-xs text-indigo-600 hover:bg-indigo-50 border-indigo-200"
                                            >
                                                <Edit3 className="h-3.5 w-3.5 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeleteAnnouncement(ann.id)}
                                                className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: MENTOR SUPPORT & QUERIES */}
            {activeTab === "support" && (
                <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-indigo-600" />
                                    Mentor Technical Support Desk
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Review and answer technical doubts, blockers, and questions submitted by students across all domains.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                    {supportTickets.filter((t) => t.status === "Open").length} Awaiting Reply
                                </span>
                                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    {supportTickets.filter((t) => t.status === "Resolved" || t.status === "Answered" || !!(t.admin_response || t.reply)).length} Resolved
                                </span>
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="relative flex-1 w-full">
                                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search by student name, email, application ID, or subject..."
                                    value={supportSearch}
                                    onChange={(e) => setSupportSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs w-full sm:w-auto">
                                <button
                                    onClick={() => setSupportFilter("all")}
                                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                        supportFilter === "all" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    All ({supportTickets.length})
                                </button>
                                <button
                                    onClick={() => setSupportFilter("open")}
                                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                        supportFilter === "open" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    Open ({supportTickets.filter((t) => t.status === "Open").length})
                                </button>
                                <button
                                    onClick={() => setSupportFilter("resolved")}
                                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                        supportFilter === "resolved" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    Resolved ({supportTickets.filter((t) => t.status === "Resolved" || t.status === "Answered" || !!(t.admin_response || t.reply)).length})
                                </button>
                            </div>
                        </div>

                        {/* Ticket Cards */}
                        <div className="space-y-4 pt-2">
                            {filteredSupportTickets.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 text-xs bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    No support queries match the current filter.
                                </div>
                            ) : (
                                filteredSupportTickets.map((ticket) => {
                                    const isResolved = ticket.status === "Resolved" || ticket.status === "Answered" || !!(ticket.admin_response || ticket.reply);
                                    const replyContent = ticket.admin_response || ticket.reply;

                                    return (
                                        <div
                                            key={ticket.id}
                                            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                                                            {ticket.application_id}
                                                        </span>
                                                        <span className="font-bold text-slate-900 text-sm">
                                                            {ticket.student_name}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            ({ticket.student_email})
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        Category: <strong className="text-slate-600">{ticket.category || "Technical Support"}</strong> • Received: {new Date(ticket.created_at).toLocaleString()}
                                                    </div>
                                                </div>

                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase self-start sm:self-auto ${
                                                    isResolved
                                                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                                        : "bg-amber-50 text-amber-800 border border-amber-200"
                                                }`}>
                                                    {isResolved ? "Resolved" : "Open • Needs Reply"}
                                                </span>
                                            </div>

                                            {/* Query Subject and Message */}
                                            <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                                <h4 className="font-bold text-slate-900 text-xs">
                                                    Subject: {ticket.subject}
                                                </h4>
                                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                    {ticket.message}
                                                </p>
                                            </div>

                                            {/* Mentor Existing Response */}
                                            {replyContent && (
                                                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs space-y-1">
                                                    <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        <span>Current Mentor Reply:</span>
                                                    </div>
                                                    <p className="text-emerald-950 leading-relaxed pl-5 whitespace-pre-wrap">
                                                        {replyContent}
                                                    </p>
                                                    {ticket.resolved_at && (
                                                        <span className="text-[10px] text-emerald-700 pl-5 block">
                                                            Resolved on {new Date(ticket.resolved_at).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Reply Input Box */}
                                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                                    {replyContent ? "Update Mentor Response" : "Write Mentor Response"}
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Type technical advice, guidance, code suggestions, or meet link for student..."
                                                    value={ticketReplies[ticket.id] !== undefined ? ticketReplies[ticket.id] : (replyContent || "")}
                                                    onChange={(e) => setTicketReplies({ ...ticketReplies, [ticket.id]: e.target.value })}
                                                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                                />
                                                <div className="flex justify-end">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSendTicketReply(ticket.id)}
                                                        disabled={replyingTicketId === ticket.id}
                                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5"
                                                    >
                                                        <Send className="h-3.5 w-3.5" />
                                                        <span>{replyingTicketId === ticket.id ? "Sending..." : "Send Mentor Reply"}</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 6: QUIZ RESULTS & ANALYTICS */}
            {activeTab === "quiz-analytics" && (
                <div className="space-y-6">
                    {/* Top KPI Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                Total Quiz Submissions
                            </span>
                            <div className="text-2xl font-extrabold text-slate-900">{quizAttempts.length}</div>
                            <span className="text-xs text-indigo-600 font-medium">Across all domains</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                Cohort Average Score
                            </span>
                            <div className="text-2xl font-extrabold text-slate-900">
                                {quizAttempts.length > 0
                                    ? Math.round(quizAttempts.reduce((acc, q) => acc + q.percentage, 0) / quizAttempts.length)
                                    : 0}%
                            </div>
                            <span className="text-xs text-emerald-600 font-medium">Passing benchmark: 50%</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                Overall Pass Rate
                            </span>
                            <div className="text-2xl font-extrabold text-slate-900">
                                {quizAttempts.length > 0
                                    ? Math.round((quizAttempts.filter((q) => q.percentage >= 50).length / quizAttempts.length) * 100)
                                    : 0}%
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                                {quizAttempts.filter((q) => q.percentage >= 50).length} of {quizAttempts.length} passed
                            </span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                                Highest Score Recorded
                            </span>
                            <div className="text-2xl font-extrabold text-slate-900">
                                {quizAttempts.length > 0 ? Math.max(...quizAttempts.map((q) => q.percentage)) : 0}%
                            </div>
                            <span className="text-xs text-indigo-600 font-medium">Top candidate result</span>
                        </div>
                    </div>

                    {/* Controls & Export Header */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">Candidate Assessment Results</h3>
                                <p className="text-xs text-slate-500">
                                    Review individual MCQ submissions, inspect answer sheets, adjust scores, and download reports.
                                </p>
                            </div>
                            <Button
                                onClick={handleExportQuizResultsCSV}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span>Export Quiz Results (CSV)</span>
                            </Button>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                            <div className="relative">
                                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    placeholder="Search student, App ID, email..."
                                    value={quizSearch}
                                    onChange={(e) => setQuizSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <select
                                value={quizDomainFilter}
                                onChange={(e) => setQuizDomainFilter(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <option value="all">All Domains</option>
                                <option value="Full Stack Development">Full Stack Development</option>
                                <option value="Cybersecurity">Cybersecurity</option>
                                <option value="Digital Marketing">Digital Marketing</option>
                            </select>

                            <select
                                value={quizWeekFilter}
                                onChange={(e) => setQuizWeekFilter(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <option value="all">All Weeks</option>
                                <option value="1">Week 1 Assessment</option>
                                <option value="2">Week 2 Assessment</option>
                                <option value="3">Week 3 Assessment</option>
                                <option value="4">Week 4 Assessment</option>
                            </select>

                            <select
                                value={quizStatusFilter}
                                onChange={(e) => setQuizStatusFilter(e.target.value as any)}
                                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <option value="all">All Result Statuses</option>
                                <option value="pass">Passed (&gt;= 50%)</option>
                                <option value="fail">Needs Review (&lt; 50%)</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                                    <tr>
                                        <th className="py-3.5 px-4">Student &amp; Application ID</th>
                                        <th className="py-3.5 px-4">Contact</th>
                                        <th className="py-3.5 px-4">Domain &amp; Package</th>
                                        <th className="py-3.5 px-4">Assessment</th>
                                        <th className="py-3.5 px-4">Score &amp; %</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {quizAttempts.filter((q) => {
                                        const matchesSearch =
                                            !quizSearch ||
                                            q.full_name?.toLowerCase().includes(quizSearch.toLowerCase()) ||
                                            q.application_id?.toLowerCase().includes(quizSearch.toLowerCase()) ||
                                            q.email?.toLowerCase().includes(quizSearch.toLowerCase());
                                        const matchesDomain = quizDomainFilter === "all" || q.domain === quizDomainFilter;
                                        const matchesWeek = quizWeekFilter === "all" || String(q.week) === quizWeekFilter;
                                        const matchesStatus =
                                            quizStatusFilter === "all" ||
                                            (quizStatusFilter === "pass" && q.percentage >= 50) ||
                                            (quizStatusFilter === "fail" && q.percentage < 50);
                                        return matchesSearch && matchesDomain && matchesWeek && matchesStatus;
                                    }).length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-slate-400">
                                                No quiz attempts match the selected criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        quizAttempts
                                            .filter((q) => {
                                                const matchesSearch =
                                                    !quizSearch ||
                                                    q.full_name?.toLowerCase().includes(quizSearch.toLowerCase()) ||
                                                    q.application_id?.toLowerCase().includes(quizSearch.toLowerCase()) ||
                                                    q.email?.toLowerCase().includes(quizSearch.toLowerCase());
                                                const matchesDomain = quizDomainFilter === "all" || q.domain === quizDomainFilter;
                                                const matchesWeek = quizWeekFilter === "all" || String(q.week) === quizWeekFilter;
                                                const matchesStatus =
                                                    quizStatusFilter === "all" ||
                                                    (quizStatusFilter === "pass" && q.percentage >= 50) ||
                                                    (quizStatusFilter === "fail" && q.percentage < 50);
                                                return matchesSearch && matchesDomain && matchesWeek && matchesStatus;
                                            })
                                            .map((q) => (
                                                <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                                                    <td className="py-3 px-4">
                                                        <div className="font-bold text-slate-900">{q.full_name}</div>
                                                        <span className="font-mono text-[11px] text-indigo-600 font-semibold">
                                                            {q.application_id}
                                                        </span>
                                                        {q.college_name && (
                                                            <div className="text-[10px] text-slate-400 line-clamp-1">{q.college_name}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-slate-800">{q.email}</div>
                                                        <div className="text-slate-400 text-[11px]">{q.phone}</div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                            {q.domain}
                                                        </span>
                                                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                                                            {q.package_name} Track
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-semibold text-slate-800">{q.quiz_title}</div>
                                                        <div className="text-[10px] text-slate-400">
                                                            Week {q.week} • Submitted {new Date(q.submitted_at).toLocaleDateString()}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-extrabold text-slate-900">
                                                            {q.score} / {q.total_marks}
                                                        </div>
                                                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    q.percentage >= 70
                                                                        ? "bg-emerald-500"
                                                                        : q.percentage >= 50
                                                                        ? "bg-amber-500"
                                                                        : "bg-rose-500"
                                                                }`}
                                                                style={{ width: `${q.percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-500">
                                                            {q.percentage}%
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                q.percentage >= 50
                                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                                            }`}
                                                        >
                                                            {q.percentage >= 50 ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                                            {q.status}
                                                        </span>
                                                        {q.mentor_feedback && (
                                                            <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                                                                &ldquo;{q.mentor_feedback}&rdquo;
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                                                        <button
                                                            onClick={() => setSelectedAttemptForSheet(q)}
                                                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] cursor-pointer inline-flex items-center gap-1"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                            <span>Answer Sheet</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAttemptForAdjustment(q);
                                                                setAdjustScore(q.score);
                                                                setAdjustFeedback(q.mentor_feedback || "");
                                                            }}
                                                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] cursor-pointer inline-flex items-center gap-1"
                                                        >
                                                            <Edit3 className="h-3 w-3" />
                                                            <span>Adjust</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Answer Sheet Modal */}
            <AnimatePresence>
                {selectedAttemptForSheet && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">
                                        Answer Sheet: {selectedAttemptForSheet.full_name}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {selectedAttemptForSheet.quiz_title} • Score: {selectedAttemptForSheet.score} / {selectedAttemptForSheet.total_marks} ({selectedAttemptForSheet.percentage}%)
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedAttemptForSheet(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="overflow-y-auto space-y-4 pr-1 flex-1 text-xs">
                                {selectedAttemptForSheet.questions.length === 0 ? (
                                    <p className="text-center py-8 text-slate-400">
                                        Detailed question sheet was completed in a legacy format. Total score recorded: {selectedAttemptForSheet.score} marks.
                                    </p>
                                ) : (
                                    selectedAttemptForSheet.questions.map((q: any, idx: number) => {
                                        const studentChoiceIndex = selectedAttemptForSheet.answers[q.id];
                                        const isCorrect = studentChoiceIndex === q.correctIndex;

                                        return (
                                            <div
                                                key={q.id || idx}
                                                className={`p-4 rounded-2xl border space-y-2.5 ${
                                                    isCorrect
                                                        ? "bg-emerald-50/40 border-emerald-200"
                                                        : studentChoiceIndex !== undefined
                                                        ? "bg-rose-50/40 border-rose-200"
                                                        : "bg-slate-50 border-slate-200"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <span className="font-bold text-slate-900 leading-snug">
                                                        Q{idx + 1}. {q.question}
                                                    </span>
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                            isCorrect
                                                                ? "bg-emerald-100 text-emerald-800"
                                                                : "bg-rose-100 text-rose-800"
                                                        }`}
                                                    >
                                                        {isCorrect ? "Correct (+5)" : "Incorrect (0)"}
                                                    </span>
                                                </div>

                                                <div className="space-y-1 pl-1">
                                                    {q.options.map((opt: string, optIdx: number) => {
                                                        const isSelected = studentChoiceIndex === optIdx;
                                                        const isAnswer = q.correctIndex === optIdx;

                                                        return (
                                                            <div
                                                                key={optIdx}
                                                                className={`p-2 rounded-xl text-xs flex items-center justify-between ${
                                                                    isAnswer
                                                                        ? "bg-emerald-100/70 text-emerald-900 font-semibold border border-emerald-300"
                                                                        : isSelected
                                                                        ? "bg-rose-100/70 text-rose-900 font-semibold border border-rose-300"
                                                                        : "text-slate-600 bg-white border border-slate-100"
                                                                }`}
                                                            >
                                                                <span>{opt}</span>
                                                                {isAnswer && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                                                                {isSelected && !isAnswer && <XCircle className="h-3.5 w-3.5 text-rose-600" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {q.explanation && (
                                                    <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200 text-[11px] text-slate-600">
                                                        <strong>Technical Explanation:</strong> {q.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedAttemptForSheet(null)}
                                    className="text-xs cursor-pointer"
                                >
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Adjust Marks Modal */}
            <AnimatePresence>
                {selectedAttemptForAdjustment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">Adjust Quiz Score</h3>
                                    <p className="text-xs text-slate-500">
                                        {selectedAttemptForAdjustment.full_name} ({selectedAttemptForAdjustment.application_id})
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedAttemptForAdjustment(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Assigned Score (Max: {selectedAttemptForAdjustment.total_marks})
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={selectedAttemptForAdjustment.total_marks}
                                        value={adjustScore}
                                        onChange={(e) => setAdjustScore(Math.max(0, Math.min(selectedAttemptForAdjustment.total_marks, parseInt(e.target.value) || 0)))}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                                        Mentor Evaluation &amp; Feedback Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Add mentor feedback or reason for marks adjustment..."
                                        value={adjustFeedback}
                                        onChange={(e) => setAdjustFeedback(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedAttemptForAdjustment(null)}
                                    className="text-xs cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveAdjustedMarks}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs cursor-pointer"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Create / Edit Announcement Modal */}
            <AnimatePresence>
                {showAnnouncementModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-indigo-600" />
                                    {editingAnnouncement ? "Edit Cohort Announcement" : "Publish Cohort Announcement"}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowAnnouncementModal(false);
                                        setEditingAnnouncement(null);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Announcement Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Milestone 1 Code Review Links Released"
                                        value={annForm.title}
                                        onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Priority Level
                                        </label>
                                        <select
                                            value={annForm.priority}
                                            onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value as any })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="important">Important</option>
                                            <option value="urgent">Critical / Urgent</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Target Domain
                                        </label>
                                        <select
                                            value={annForm.domain}
                                            onChange={(e) => setAnnForm({ ...annForm, domain: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                                        >
                                            <option value="All">All Domains</option>
                                            {INTERNSHIP_DOMAINS.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Announcement Body *
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        placeholder="Write notice details for students..."
                                        value={annForm.message}
                                        onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })}
                                        className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Reference / External URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://meet.google.com/... or https://..."
                                        value={annForm.reference_url}
                                        onChange={(e) => setAnnForm({ ...annForm, reference_url: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowAnnouncementModal(false);
                                            setEditingAnnouncement(null);
                                        }}
                                        className="text-xs cursor-pointer"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={actionLoading}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
                                    >
                                        {actionLoading
                                            ? (editingAnnouncement ? "Saving Changes..." : "Publishing...")
                                            : (editingAnnouncement ? "Save Changes" : "Broadcast Announcement")}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Candidate Detail Drawer / Modal */}
            <AnimatePresence>
                {selectedApp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                        {selectedApp.application_id || selectedApp.application_number}
                                    </span>
                                    <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedApp.full_name}</h2>
                                    <p className="text-xs text-slate-500">Gender: {selectedApp.gender || "N/A"}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedApp(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Contact Details */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold block">Email</span>
                                    <a href={`mailto:${selectedApp.email}`} className="text-indigo-600 font-medium hover:underline">
                                        {selectedApp.email}
                                    </a>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold block">Phone</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-800 font-medium">{selectedApp.phone}</span>
                                        {selectedApp.whatsapp_number && (
                                            <a
                                                href={`https://wa.me/${selectedApp.whatsapp_number.replace(/[^0-9]/g, "")}`}
                                                target="_blank"
                                                className="text-emerald-600 hover:text-emerald-700"
                                                title="WhatsApp Candidate"
                                            >
                                                <MessageCircle className="h-4 w-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold block">Selected Track</span>
                                    <span className="text-indigo-700 font-bold">{selectedApp.domain}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold block">Package Chosen</span>
                                    <span className="font-bold text-amber-700">
                                        {selectedApp.package_name} (₹{selectedApp.package_name === "Free" ? 0 : (selectedApp.package_amount || (selectedApp.package_name === "Premium" ? 999 : 749))})
                                    </span>
                                </div>
                            </div>

                            {/* College & Academic Details */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                                <span className="font-bold text-slate-800 block">Institution Details</span>
                                <p className="text-slate-700 font-semibold">{selectedApp.college_name}</p>
                                <p className="text-slate-500">
                                    {selectedApp.degree} • {selectedApp.department} ({selectedApp.year_of_study})
                                </p>
                                {selectedApp.college_city && (
                                    <p className="text-slate-500">
                                        Location: {selectedApp.college_city}, {selectedApp.college_state} ({selectedApp.college_selection_type})
                                    </p>
                                )}
                            </div>

                            {/* Residential Address Details */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-indigo-600" />
                                    Residential Shipping Address
                                </span>
                                <p className="text-slate-700">
                                    {selectedApp.house_number}, {selectedApp.street_name}, {selectedApp.locality}
                                </p>
                                <p className="text-slate-700">
                                    {selectedApp.city}, {selectedApp.district}, {selectedApp.state} — <strong className="font-mono">{selectedApp.postal_code}</strong>
                                </p>
                                <p className="text-slate-500">Country: {selectedApp.country || "India"}</p>
                            </div>

                            {/* Online Profiles */}
                            <div className="flex items-center gap-4 text-xs">
                                {selectedApp.linkedin_url && (
                                    <a
                                        href={selectedApp.linkedin_url}
                                        target="_blank"
                                        className="text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                                    >
                                        LinkedIn Profile <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {selectedApp.github_url && (
                                    <a
                                        href={selectedApp.github_url}
                                        target="_blank"
                                        className="text-slate-700 hover:underline flex items-center gap-1 font-medium"
                                    >
                                        GitHub Profile <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {selectedApp.portfolio_url && (
                                    <a
                                        href={selectedApp.portfolio_url}
                                        target="_blank"
                                        className="text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                                    >
                                        Portfolio Website <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>

                            {/* Automatic Decision Email Delivery Status Card */}
                            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                        <Mail className="h-4 w-4 text-indigo-600" />
                                        Decision Email Notification
                                    </span>
                                    {(() => {
                                        let note: any = null;
                                        try {
                                            note = JSON.parse(selectedApp.internal_notes || "{}")?.email_notification;
                                        } catch {}
                                        if (note?.status === "sent") {
                                            return (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Sent ({note.type})
                                                </span>
                                            );
                                        }
                                        if (note?.status === "failed") {
                                            return (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase flex items-center gap-1">
                                                    <XCircle className="h-3 w-3 text-rose-600" /> Delivery Failed
                                                </span>
                                            );
                                        }
                                        if (selectedApp.status === "accepted" || selectedApp.status === "rejected") {
                                            return (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-amber-600" /> Queued
                                                </span>
                                            );
                                        }
                                        return <span className="text-slate-400 text-[11px] italic">Not Dispatched</span>;
                                    })()}
                                </div>
                                <p className="text-slate-500 text-[11px] leading-relaxed">
                                    Personalized decision emails are automatically dispatched by the server whenever this application is Accepted or Rejected.
                                </p>
                                <div className="flex items-center gap-2 pt-1 flex-wrap">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            handlePreviewEmail(
                                                selectedApp,
                                                selectedApp.status === "rejected" ? "rejected" : "accepted"
                                            )
                                        }
                                        className="h-7 text-xs text-indigo-600 bg-white border-indigo-200 hover:bg-indigo-50 gap-1"
                                    >
                                        <Eye className="h-3 w-3" />
                                        Preview Email Template
                                    </Button>
                                    {(selectedApp.status === "accepted" || selectedApp.status === "rejected") && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                handleResendEmail(
                                                    selectedApp,
                                                    selectedApp.status as "accepted" | "rejected"
                                                )
                                            }
                                            disabled={actionLoading}
                                            className="h-7 text-xs text-slate-700 bg-white border-slate-200 hover:bg-slate-50 gap-1"
                                        >
                                            <RefreshCw className="h-3 w-3" />
                                            Resend Email
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Internal Review Notes */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Internal Admin Notes
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Add evaluation comments, interview feedback..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* Application Status Actions */}
                            <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs text-slate-500">Update Candidate Status:</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => handleUpdateStatus(selectedApp.id, "accepted")}
                                        disabled={actionLoading}
                                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleUpdateStatus(selectedApp.id, "waitlisted")}
                                        disabled={actionLoading}
                                        className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white"
                                    >
                                        Waitlist
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateStatus(selectedApp.id, "rejected")}
                                        disabled={actionLoading}
                                        className="h-8 text-xs text-red-600 hover:bg-red-50 hover:border-red-300"
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDeleteApp(selectedApp)}
                                        disabled={actionLoading}
                                        className="h-8 text-xs text-rose-600 hover:bg-rose-50 hover:border-rose-300 gap-1"
                                        title="Delete application"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* EMAIL PREVIEW MODAL */}
            <AnimatePresence>
                {showEmailPreviewModal && previewEmailData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <div>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 mb-1">
                                        <Mail className="h-3 w-3" />
                                        Email Preview
                                    </span>
                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                                        {previewEmailData.subject}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Recipient: <strong className="text-slate-800">{previewEmailData.studentName}</strong> &lt;{previewEmailData.recipient}&gt;
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowEmailPreviewModal(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Email HTML Render */}
                            <div className="flex-1 overflow-y-auto p-4 bg-slate-100/70">
                                <iframe
                                    srcDoc={previewEmailData.html}
                                    title="Email Template Preview"
                                    className="w-full h-[480px] bg-white rounded-xl border border-slate-200 shadow-sm"
                                />
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white text-xs">
                                <span className="text-slate-400">
                                    Rendered with live applicant data & official Vectonix template
                                </span>
                                <Button
                                    size="sm"
                                    onClick={() => setShowEmailPreviewModal(false)}
                                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs"
                                >
                                    Close Preview
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* TEST DECISION EMAIL MODAL */}
            <AnimatePresence>
                {showTestEmailModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Send className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm">Send Test Decision Email</h3>
                                        <p className="text-[11px] text-slate-400">Verify SMTP delivery and layout rendering</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowTestEmailModal(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSendTestDecisionEmail} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Email Template Type *
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setTestEmailType("accepted")}
                                            className={`p-2.5 rounded-lg border font-semibold text-xs text-center cursor-pointer transition-colors ${
                                                testEmailType === "accepted"
                                                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-200"
                                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            ✓ Acceptance Email
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTestEmailType("rejected")}
                                            className={`p-2.5 rounded-lg border font-semibold text-xs text-center cursor-pointer transition-colors ${
                                                testEmailType === "rejected"
                                                    ? "bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-200"
                                                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            ✕ Rejection Email
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Test Recipient Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="e.g. admin@vectonix.in"
                                        value={testEmailTarget}
                                        onChange={(e) => setTestEmailTarget(e.target.value)}
                                        className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        A live test email using sample candidate credentials will be dispatched to this inbox.
                                    </p>
                                </div>

                                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowTestEmailModal(false)}
                                        className="text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={testEmailLoading}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                                    >
                                        {testEmailLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                        <span>{testEmailLoading ? "Sending..." : "Dispatch Test Email"}</span>
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
