"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    CheckSquare,
    Calendar,
    Search,
    Filter,
    Plus,
    ArrowLeft,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
    ExternalLink,
    Award,
    Edit3,
    FileText,
    Video,
    X,
    User,
    ChevronDown,
    Layers,
    FolderKanban
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
    studentService,
    StudentAssignment,
    StudentSubmission,
    WeeklyReview
} from "@/lib/services/studentService";
import { normalizeDomain } from "@/lib/project-bank";

export default function AdminAssignmentsAndReviewsPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = (params?.batchId as string) || "wi26";

    const [activeTab, setActiveTab] = useState<"submissions" | "assignments" | "reviews">("submissions");
    const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
    const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
    const [reviews, setReviews] = useState<WeeklyReview[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [domainFilter, setDomainFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Evaluation modal
    const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
    const [evalMarks, setEvalMarks] = useState<number>(85);
    const [evalFeedback, setEvalFeedback] = useState("");
    const [evalStatus, setEvalStatus] = useState<StudentSubmission["status"]>("Completed");
    const [evalLoading, setEvalLoading] = useState(false);

    // Create Assignment modal
    const [showCreateAsg, setShowCreateAsg] = useState(false);
    const [newAsgTitle, setNewAsgTitle] = useState("");
    const [newAsgDomain, setNewAsgDomain] = useState("All");
    const [newAsgDesc, setNewAsgDesc] = useState("");
    const [newAsgDeadline, setNewAsgDeadline] = useState("2026-12-10");
    const [newAsgMarks, setNewAsgMarks] = useState(100);
    const [newAsgDifficulty, setNewAsgDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
    const [createAsgLoading, setCreateAsgLoading] = useState(false);

    // Schedule Review modal
    const [showCreateReview, setShowCreateReview] = useState(false);
    const [newRevTopic, setNewRevTopic] = useState("");
    const [newRevDate, setNewRevDate] = useState("2026-12-09T18:30");
    const [newRevMentor, setNewRevMentor] = useState("Senior Vectonix Engineering Team");
    const [newRevLink, setNewRevLink] = useState("https://meet.google.com/vectonix-wi26");
    const [createRevLoading, setCreateRevLoading] = useState(false);

    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            if (isSupabaseConfigured) {
                // Fetch assignments
                const { data: aData } = await supabase
                    .from("assignments")
                    .select("*")
                    .eq("batch_id", batchId)
                    .order("created_at", { ascending: true });

                // Fetch submissions
                const { data: sData } = await supabase
                    .from("assignment_submissions")
                    .select("*")
                    .order("submitted_at", { ascending: false });

                // Fetch reviews
                const { data: rData } = await supabase
                    .from("weekly_reviews")
                    .select("*")
                    .eq("batch_id", batchId)
                    .order("review_date", { ascending: true });

                setAssignments(aData || []);
                setSubmissions(sData || []);
                setReviews(rData || []);
            } else {
                setAssignments([]);
                setSubmissions([]);
                setReviews([]);
            }
        } catch (err) {
            console.error("Error loading assignments & reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [batchId]);

    const handleGradeSubmission = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubmission) return;

        setEvalLoading(true);
        try {
            if (isSupabaseConfigured) {
                const { error } = await supabase
                    .from("assignment_submissions")
                    .update({
                        marks: evalMarks,
                        mentor_feedback: evalFeedback,
                        status: evalStatus,
                        reviewed_at: new Date().toISOString()
                    })
                    .eq("id", selectedSubmission.id);

                if (error) throw error;
            }

            showToast(`Grade & feedback saved for ${selectedSubmission.student_name}!`);
            setSelectedSubmission(null);
            await loadData();
        } catch (err: any) {
            alert(`Evaluation error: ${err.message}`);
        } finally {
            setEvalLoading(false);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAsgTitle.trim()) return;

        setCreateAsgLoading(true);
        try {
            if (isSupabaseConfigured) {
                const { error } = await supabase.from("assignments").insert({
                    batch_id: batchId,
                    domain: newAsgDomain,
                    title: newAsgTitle,
                    description: newAsgDesc,
                    deadline: `${newAsgDeadline}T23:59:59+05:30`,
                    max_marks: newAsgMarks,
                    difficulty: newAsgDifficulty,
                    is_active: true
                });

                if (error) throw error;
            }

            showToast("New assignment created successfully!");
            setShowCreateAsg(false);
            setNewAsgTitle("");
            setNewAsgDesc("");
            await loadData();
        } catch (err: any) {
            alert(`Error creating assignment: ${err.message}`);
        } finally {
            setCreateAsgLoading(false);
        }
    };

    const handleCreateReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRevTopic.trim()) return;

        setCreateRevLoading(true);
        try {
            if (isSupabaseConfigured) {
                const { error } = await supabase.from("weekly_reviews").insert({
                    batch_id: batchId,
                    domain: "All",
                    topic: newRevTopic,
                    review_date: new Date(newRevDate).toISOString(),
                    assigned_mentor: newRevMentor,
                    meeting_link: newRevLink,
                    status: "Upcoming"
                });

                if (error) throw error;
            }

            showToast("Weekly review session scheduled!");
            setShowCreateReview(false);
            setNewRevTopic("");
            await loadData();
        } catch (err: any) {
            alert(`Error scheduling review: ${err.message}`);
        } finally {
            setCreateRevLoading(false);
        }
    };

    // Filter submissions
    const filteredSubmissions = submissions.filter((sub) => {
        const matchesStatus = statusFilter === "all" || sub.status.toLowerCase() === statusFilter.toLowerCase();
        const search = searchTerm.toLowerCase();
        const matchesSearch =
            !search ||
            sub.student_name?.toLowerCase().includes(search) ||
            sub.student_email?.toLowerCase().includes(search) ||
            sub.application_id?.toLowerCase().includes(search);

        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-8 pb-20">
            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 text-sm animate-in fade-in slide-in-from-bottom-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/internships/${batchId}`}
                        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        title="Back to Batch Overview"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                                <CheckSquare className="h-5 w-5" />
                            </span>
                            <h1 className="text-2xl font-bold text-slate-900">Assignments & Weekly Reviews</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                WI26
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Evaluate student code deliverables, assign mentor marks, and schedule Google Meet weekly reviews.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setShowCreateAsg(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create Assignment</span>
                    </Button>

                    <Button
                        onClick={() => setShowCreateReview(true)}
                        variant="outline"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-50 text-slate-700"
                    >
                        <Video className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Schedule Review</span>
                    </Button>

                    <button
                        onClick={loadData}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab("submissions")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                        activeTab === "submissions"
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                >
                    <FileText className="h-4 w-4" />
                    <span>Student Submissions</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                        {submissions.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab("assignments")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                        activeTab === "assignments"
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                >
                    <CheckSquare className="h-4 w-4" />
                    <span>Curriculum Assignments</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        {assignments.length}
                    </span>
                </button>

                <button
                    onClick={() => setActiveTab("reviews")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                        activeTab === "reviews"
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                >
                    <Calendar className="h-4 w-4" />
                    <span>Weekly Meet Reviews</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        {reviews.length}
                    </span>
                </button>
            </div>

            {/* TAB 1: SUBMISSIONS & EVALUATION */}
            {activeTab === "submissions" && (
                <div className="space-y-4">
                    {/* Filter bar */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search student name, email, application ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-2 pr-8 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="Submitted">Submitted (Needs Review)</option>
                                    <option value="Completed">Completed / Approved</option>
                                    <option value="Needs Revision">Needs Revision</option>
                                </select>
                                <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Submissions Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                                        <th className="py-3.5 px-4">Application ID</th>
                                        <th className="py-3.5 px-4">Student Details</th>
                                        <th className="py-3.5 px-4">Deliverable Links</th>
                                        <th className="py-3.5 px-4">Submitted At</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4">Score</th>
                                        <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-slate-400">
                                                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-600" />
                                                Loading submissions...
                                            </td>
                                        </tr>
                                    ) : filteredSubmissions.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-slate-400">
                                                No submissions received yet in this cohort.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubmissions.map((sub) => (
                                            <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                                                    {sub.application_id}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="font-semibold text-slate-900">{sub.student_name}</div>
                                                    <div className="text-[11px] text-slate-400">{sub.student_email}</div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex flex-col gap-1 text-[11px]">
                                                        {sub.github_url && (
                                                            <a
                                                                href={sub.github_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                                                            >
                                                                <span>Repository Link</span>
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        )}
                                                        {sub.project_url && (
                                                            <a
                                                                href={sub.project_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                                                            >
                                                                <span>Hosted Demo</span>
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        )}
                                                        {sub.file_url && (
                                                            <a
                                                                href={sub.file_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                                            >
                                                                <span>Evidence / Report</span>
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                                                    {new Date(sub.submitted_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3.5 px-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                            sub.status === "Completed"
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                : sub.status === "Needs Revision"
                                                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                                : "bg-amber-50 text-amber-700 border border-amber-200"
                                                        }`}
                                                    >
                                                        {sub.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-slate-900">
                                                    {sub.marks !== undefined && sub.marks !== null ? `${sub.marks}/100` : "—"}
                                                </td>
                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedSubmission(sub);
                                                            setEvalMarks(sub.marks || 85);
                                                            setEvalFeedback(sub.mentor_feedback || "");
                                                            setEvalStatus(sub.status || "Completed");
                                                        }}
                                                        className="px-3 py-1.5 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                                                    >
                                                        Grade & Feedback
                                                    </Button>
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

            {/* TAB 2: ASSIGNMENTS CURRICULUM */}
            {activeTab === "assignments" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignments.map((asg) => (
                        <div key={asg.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                                    {asg.domain}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">Max Marks: {asg.max_marks}</span>
                            </div>

                            <h3 className="text-base font-bold text-slate-900">{asg.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">{asg.description}</p>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span>Deadline: {asg.deadline ? new Date(asg.deadline).toLocaleDateString() : "Dec 15, 2026"}</span>
                                <span className="font-semibold text-slate-700">{asg.difficulty}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TAB 3: WEEKLY REVIEWS */}
            {activeTab === "reviews" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviews.map((rev) => (
                            <div key={rev.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-50 text-violet-700">
                                        Google Meet Session
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                                        {rev.status}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-slate-900">{rev.topic}</h3>
                                <p className="text-xs text-slate-500">Mentor: {rev.assigned_mentor}</p>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-slate-600">
                                        <Calendar className="h-4 w-4 text-indigo-600" />
                                        <span>{new Date(rev.review_date).toLocaleString()}</span>
                                    </div>

                                    {rev.meeting_link && (
                                        <a
                                            href={rev.meeting_link}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 text-xs shadow-sm"
                                        >
                                            <Video className="h-3.5 w-3.5" />
                                            <span>Join Meet</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* EVALUATION / GRADING MODAL */}
            <AnimatePresence>
                {selectedSubmission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4"
                        >
                            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        Grade Submission: {selectedSubmission.student_name}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        App ID: <span className="font-mono font-semibold">{selectedSubmission.application_id}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedSubmission(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleGradeSubmission} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Deliverable Link Submitted:
                                    </label>
                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 break-all text-indigo-600 font-mono">
                                        <a
                                            href={selectedSubmission.github_url || selectedSubmission.project_url || selectedSubmission.file_url || "#"}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="hover:underline flex items-center gap-1.5"
                                        >
                                            <span>{selectedSubmission.github_url || selectedSubmission.project_url || selectedSubmission.file_url || "No link provided"}</span>
                                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                                        </a>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Score (0 - 100)</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            required
                                            value={evalMarks}
                                            onChange={(e) => setEvalMarks(parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Status</label>
                                        <select
                                            value={evalStatus}
                                            onChange={(e) => setEvalStatus(e.target.value as any)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none bg-white font-medium"
                                        >
                                            <option value="Completed">Approved / Completed</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="Needs Revision">Needs Revision</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Mentor Feedback & Code Review Comments
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={evalFeedback}
                                        onChange={(e) => setEvalFeedback(e.target.value)}
                                        placeholder="Add constructive comments, strengths, and areas to optimize..."
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSelectedSubmission(null)}
                                        className="text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={evalLoading}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2"
                                    >
                                        {evalLoading ? "Saving..." : "Save Grade & Feedback"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CREATE ASSIGNMENT MODAL */}
            <AnimatePresence>
                {showCreateAsg && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900">Create New Cohort Assignment</h3>
                                <button onClick={() => setShowCreateAsg(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Assignment Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newAsgTitle}
                                        onChange={(e) => setNewAsgTitle(e.target.value)}
                                        placeholder="e.g. Milestone 3: End-to-End Security Testing"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Target Domain</label>
                                        <select
                                            value={newAsgDomain}
                                            onChange={(e) => setNewAsgDomain(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none bg-white"
                                        >
                                            <option value="All">All Domains</option>
                                            <option value="Full Stack Development">Full Stack Development</option>
                                            <option value="Cybersecurity">Cybersecurity</option>
                                            <option value="Digital Marketing">Digital Marketing</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Deadline</label>
                                        <input
                                            type="date"
                                            value={newAsgDeadline}
                                            onChange={(e) => setNewAsgDeadline(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Description & Tasks</label>
                                    <textarea
                                        rows={3}
                                        value={newAsgDesc}
                                        onChange={(e) => setNewAsgDesc(e.target.value)}
                                        placeholder="Detailed tasks and expected deliverables..."
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCreateAsg(false)}
                                        className="text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createAsgLoading}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2"
                                    >
                                        {createAsgLoading ? "Creating..." : "Publish Assignment"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SCHEDULE REVIEW MODAL */}
            <AnimatePresence>
                {showCreateReview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-lg font-bold text-slate-900">Schedule Google Meet Review</h3>
                                <button onClick={() => setShowCreateReview(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Session Topic *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newRevTopic}
                                        onChange={(e) => setNewRevTopic(e.target.value)}
                                        placeholder="e.g. Sprint 2: Core Engineering & Architecture Review"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={newRevDate}
                                        onChange={(e) => setNewRevDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Google Meet Link</label>
                                    <input
                                        type="url"
                                        value={newRevLink}
                                        onChange={(e) => setNewRevLink(e.target.value)}
                                        placeholder="https://meet.google.com/..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCreateReview(false)}
                                        className="text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createRevLoading}
                                        className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2"
                                    >
                                        {createRevLoading ? "Scheduling..." : "Schedule Review Session"}
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

