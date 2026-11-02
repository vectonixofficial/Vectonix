"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    Layers,
    Search,
    Filter,
    FolderKanban,
    UserCheck,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowLeft,
    RefreshCw,
    ChevronDown,
    Calendar,
    Sparkles,
    User,
    Shield,
    Code,
    TrendingUp,
    X,
    Eye,
    Settings,
    Edit2,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { internshipService } from "@/lib/services/internshipService";
import { projectBankService, normalizeDomain } from "@/lib/project-bank";
import { allocationService } from "@/lib/services/allocationService";
import {
    DatabaseInternshipApplication,
    DatabaseStudentProject,
    ProjectTemplate,
    DatabaseMentor
} from "@/lib/supabase";

export default function AdminProjectAllocationsPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const batchId = (params?.batchId as string) || "wi26";
    const preselectedProjectId = searchParams.get("project");

    const [applications, setApplications] = useState<DatabaseInternshipApplication[]>([]);
    const [allocations, setAllocations] = useState<DatabaseStudentProject[]>([]);
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [mentors, setMentors] = useState<DatabaseMentor[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [domainFilter, setDomainFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "unassigned" | "assigned">("all");

    // Modal state for manual allocation
    const [targetStudent, setTargetStudent] = useState<DatabaseInternshipApplication | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(preselectedProjectId || "");
    const [selectedMentorId, setSelectedMentorId] = useState<string>("");
    const [startDate, setStartDate] = useState("2026-11-25");
    const [deadline, setDeadline] = useState("2026-12-25");
    const [personalizedInstructions, setPersonalizedInstructions] = useState("");
    const [assignLoading, setAssignLoading] = useState(false);

    // Auto-allocate modal
    const [showAutoModal, setShowAutoModal] = useState(false);
    const [autoLoading, setAutoLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [appsData, allocData, tmplData, mentorData] = await Promise.all([
                internshipService.getApplications(batchId),
                allocationService.getAllocations(batchId),
                projectBankService.getProjectTemplates(),
                projectBankService.getMentors()
            ]);

            setApplications(appsData);
            setAllocations(allocData);
            setTemplates(tmplData);
            setMentors(mentorData);

            if (preselectedProjectId && tmplData.some((t) => t.id === preselectedProjectId)) {
                setSelectedTemplateId(preselectedProjectId);
            }
        } catch (err) {
            console.error("Failed to load allocation data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [batchId]);

    const allocationMap = new Map<string, DatabaseStudentProject>();
    allocations.forEach((a) => {
        if (a.application_id) allocationMap.set(a.application_id.toLowerCase(), a);
    });

    const openAllocationModal = (student: DatabaseInternshipApplication) => {
        setTargetStudent(student);
        const existing = allocationMap.get((student.application_id || student.id).toLowerCase());

        const studentDomainNorm = normalizeDomain(student.domain || student.internship_domain || "Full Stack Development");
        const domainProjects = templates.filter((t) => normalizeDomain(t.domain) === studentDomainNorm);
        const domainMentors = mentors.filter((m) => m.domains.some((d) => normalizeDomain(d) === studentDomainNorm));

        if (existing) {
            setSelectedTemplateId(existing.project_template_id || domainProjects[0]?.id || "");
            setSelectedMentorId(existing.assigned_mentor_id || domainMentors[0]?.id || "");
            setStartDate(existing.start_date || "2026-11-25");
            setDeadline(existing.deadline || "2026-12-25");
            setPersonalizedInstructions(existing.personalized_instructions || "");
        } else {
            setSelectedTemplateId(preselectedProjectId || domainProjects[0]?.id || templates[0]?.id || "");
            setSelectedMentorId(domainMentors[0]?.id || mentors[0]?.id || "");
            setStartDate("2026-11-25");
            setDeadline("2026-12-25");
            setPersonalizedInstructions(
                `Welcome to your Winter Internship 2026 Capstone Project! Please review your project objectives and submit your Milestone 1 proposal.`
            );
        }
    };

    const handleSaveAllocation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetStudent || !selectedTemplateId) {
            alert("Please select a project template.");
            return;
        }

        setAssignLoading(true);
        try {
            const chosenMentor = mentors.find((m) => m.id === selectedMentorId);
            const studentAppId = targetStudent.application_id || targetStudent.id;
            const studentDomain = normalizeDomain(targetStudent.domain || targetStudent.internship_domain || "Full Stack Development");

            const res = await allocationService.assignProject({
                applicationId: studentAppId,
                batchId,
                domain: studentDomain,
                projectTemplateId: selectedTemplateId,
                mentorId: chosenMentor?.id,
                mentorName: chosenMentor?.name,
                startDate,
                deadline,
                personalizedInstructions
            });

            if (res.success) {
                showToast(`Project allocated to ${targetStudent.full_name}!`);
                setTargetStudent(null);
                await loadData();
            } else {
                alert(`Allocation failed: ${res.error}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setAssignLoading(false);
        }
    };

    const handleAutoAllocate = async () => {
        setAutoLoading(true);
        try {
            const res = await allocationService.autoAllocateCohort(batchId);
            if (res.success) {
                showToast(`Successfully allocated projects to ${res.allocatedCount} candidates!`);
                setShowAutoModal(false);
                await loadData();
            } else {
                alert(`Auto-allocation encountered errors:\n${res.errors.join("\n")}`);
            }
        } catch (err: any) {
            alert(`Auto allocation failed: ${err.message}`);
        } finally {
            setAutoLoading(false);
        }
    };

    // Filter applications
    const filteredApps = applications.filter((app) => {
        const appId = (app.application_id || app.id).toLowerCase();
        const alloc = allocationMap.get(appId);
        const isAssigned = !!alloc;

        if (statusFilter === "assigned" && !isAssigned) return false;
        if (statusFilter === "unassigned" && isAssigned) return false;

        const matchesDomain =
            domainFilter === "all" ||
            normalizeDomain(app.domain || app.internship_domain || "") === normalizeDomain(domainFilter);

        const search = searchTerm.toLowerCase();
        const matchesSearch =
            !search ||
            app.full_name?.toLowerCase().includes(search) ||
            app.email?.toLowerCase().includes(search) ||
            app.application_id?.toLowerCase().includes(search) ||
            app.college_name?.toLowerCase().includes(search);

        return matchesDomain && matchesSearch;
    });

    const totalAssigned = applications.filter((a) =>
        allocationMap.has((a.application_id || a.id).toLowerCase())
    ).length;
    const totalUnassigned = applications.length - totalAssigned;

    const getDomainBadge = (domain: string) => {
        const norm = normalizeDomain(domain);
        if (norm === "Full Stack Development") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Code className="h-3 w-3" />
                    Full Stack
                </span>
            );
        }
        if (norm === "Cybersecurity") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Shield className="h-3 w-3" />
                    Cybersecurity
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                <TrendingUp className="h-3 w-3" />
                Digital Marketing
            </span>
        );
    };

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
                                <Layers className="h-5 w-5" />
                            </span>
                            <h1 className="text-2xl font-bold text-slate-900">Project Allocation Engine</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                WI26
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Assign individual capstone projects and technical mentors to enrolled students with personalized instructions.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/internships/${batchId}/projects`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
                    >
                        <FolderKanban className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Project Bank ({templates.length})</span>
                    </Link>

                    {totalUnassigned > 0 && (
                        <Button
                            onClick={() => setShowAutoModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>Auto-Allocate Unassigned ({totalUnassigned})</span>
                        </Button>
                    )}

                    <button
                        onClick={loadData}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Allocation Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                            <Users className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-900">{applications.length}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Students in Winter Internship 2026</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects Allocated</span>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-extrabold text-emerald-600">{totalAssigned}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Candidates actively working on project</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting Allocation</span>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-3xl font-extrabold text-amber-600">{totalUnassigned}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Ready for individual assignment</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search student name, application ID (e.g. VTX-WI26-0004), college..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none transition-colors"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={domainFilter}
                            onChange={(e) => setDomainFilter(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-2 pr-8 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">All Domains</option>
                            <option value="Full Stack Development">Full Stack Development</option>
                            <option value="Cybersecurity">Cybersecurity</option>
                            <option value="Digital Marketing">Digital Marketing</option>
                        </select>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-2 pr-8 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">All Statuses ({applications.length})</option>
                            <option value="unassigned">Awaiting Allocation ({totalUnassigned})</option>
                            <option value="assigned">Allocated ({totalAssigned})</option>
                        </select>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Candidates Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                                <th className="py-3.5 px-4">Application ID</th>
                                <th className="py-3.5 px-4">Student Details</th>
                                <th className="py-3.5 px-4">College</th>
                                <th className="py-3.5 px-4">Domain</th>
                                <th className="py-3.5 px-4">Assigned Project</th>
                                <th className="py-3.5 px-4">Mentor</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-600" />
                                        Loading candidate allocations...
                                    </td>
                                </tr>
                            ) : filteredApps.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        No candidates found matching the filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredApps.map((app) => {
                                    const appId = (app.application_id || app.id).toLowerCase();
                                    const alloc = allocationMap.get(appId);

                                    return (
                                        <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                                                {app.application_id || app.application_number || app.id.slice(0, 8)}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="font-semibold text-slate-900">{app.full_name}</div>
                                                <div className="text-[11px] text-slate-400">{app.email}</div>
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                                                {app.college_name || "N/A"}
                                            </td>
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {getDomainBadge(app.domain || app.internship_domain || "Full Stack Development")}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {alloc ? (
                                                    <div className="max-w-xs">
                                                        <span className="font-semibold text-indigo-700 line-clamp-1">
                                                            {alloc.project_title}
                                                        </span>
                                                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                            Status: {alloc.status}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                        <Clock className="h-3 w-3" />
                                                        Awaiting Allocation
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                                                {alloc?.assigned_mentor_name ? (
                                                    <div className="font-medium text-slate-800">{alloc.assigned_mentor_name}</div>
                                                ) : (
                                                    <span className="text-slate-400 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                <Button
                                                    onClick={() => openAllocationModal(app)}
                                                    variant={alloc ? "outline" : "default"}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                                                        alloc
                                                            ? "border-slate-300 text-slate-700 hover:bg-slate-50"
                                                            : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    }`}
                                                >
                                                    {alloc ? "Reassign" : "Assign Project"}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MANUAL ALLOCATION MODAL */}
            <AnimatePresence>
                {targetStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8"
                        >
                            <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-5">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Project Allocation: {targetStudent.full_name}
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        App ID: <span className="font-mono font-semibold text-slate-700">{targetStudent.application_id || targetStudent.id}</span> • Domain: {targetStudent.domain || targetStudent.internship_domain}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setTargetStudent(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveAllocation} className="space-y-4 text-xs">
                                {/* Project Template Selector */}
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1.5">
                                        Select Project Template *
                                    </label>
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                        {templates
                                            .filter(
                                                (t) =>
                                                    normalizeDomain(t.domain) ===
                                                    normalizeDomain(targetStudent.domain || targetStudent.internship_domain || "")
                                            )
                                            .map((t) => (
                                                <label
                                                    key={t.id}
                                                    onClick={() => setSelectedTemplateId(t.id)}
                                                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                                        selectedTemplateId === t.id
                                                            ? "border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600"
                                                            : "border-slate-200 hover:border-slate-300 bg-white"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="projectTemplate"
                                                        checked={selectedTemplateId === t.id}
                                                        onChange={() => setSelectedTemplateId(t.id)}
                                                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-slate-900">{t.title}</span>
                                                            <span className="text-[10px] font-semibold text-slate-500 px-2 py-0.5 rounded bg-slate-100">
                                                                {t.difficulty_level}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                                            {t.short_description || t.problem_statement}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                    </div>
                                </div>

                                {/* Mentor Selector */}
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1.5">
                                        Assigned Technical Mentor
                                    </label>
                                    <select
                                        value={selectedMentorId}
                                        onChange={(e) => setSelectedMentorId(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none bg-white font-medium text-slate-700"
                                    >
                                        <option value="">Select Mentor</option>
                                        {mentors.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} ({m.designation || "Technical Mentor"}) — {m.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Custom Dates */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            Submission Deadline
                                        </label>
                                        <input
                                            type="date"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Personalized Instructions */}
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Personalized Instructions (Visible to Student)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={personalizedInstructions}
                                        onChange={(e) => setPersonalizedInstructions(e.target.value)}
                                        placeholder="Add special instructions, focus areas, or initial milestones for this student..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setTargetStudent(null)}
                                        className="px-4 py-2 text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={assignLoading}
                                        className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                    >
                                        {assignLoading ? "Saving Allocation..." : "Confirm & Allocate Project"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* AUTO-ALLOCATE COHORT CONFIRMATION MODAL */}
            <AnimatePresence>
                {showAutoModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Auto-Allocate Projects</h3>
                                    <p className="text-xs text-slate-500">Batch WI26 • Winter Internship 2026</p>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2 mb-6">
                                <p className="font-semibold text-slate-900">
                                    Ready to distribute individual projects to {totalUnassigned} candidates:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-slate-600">
                                    <li>Maps each student to projects matching their registered domain.</li>
                                    <li>Rotates templates evenly to prevent duplicate project crowding.</li>
                                    <li>Assigns designated technical mentors for each domain.</li>
                                    <li>Sets timeline: Nov 25, 2026 to Dec 25, 2026.</li>
                                </ul>
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAutoModal(false)}
                                    className="px-4 py-2 text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAutoAllocate}
                                    disabled={autoLoading}
                                    className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    {autoLoading ? "Allocating Cohort..." : "Proceed with Allocation"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

