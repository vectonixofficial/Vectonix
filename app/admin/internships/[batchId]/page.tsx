"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    Users,
    CreditCard,
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
    Plus,
    RefreshCw,
    TrendingUp,
    ChevronDown,
    Building2,
    Calendar,
    AlertTriangle,
    Check,
    X,
    FileText
} from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { internshipService } from "@/lib/services/internshipService";
import {
    DatabaseInternshipBatch,
    DatabaseInternshipApplication,
    DatabaseInternshipPayment,
    InternshipApplicationStatus,
    InternshipPaymentStatus
} from "@/lib/supabase";

export default function AdminInternshipsBatchPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const batchId = (params?.batchId as string) || "wi26";

    // Batch & Batches State
    const [batches, setBatches] = useState<DatabaseInternshipBatch[]>([]);
    const [currentBatch, setCurrentBatch] = useState<DatabaseInternshipBatch | null>(null);

    // Applications & Payments
    const [applications, setApplications] = useState<DatabaseInternshipApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"applications" | "payments" | "analytics" | "reports">("applications");

    // Filter & Search
    const [searchTerm, setSearchTerm] = useState("");
    const [domainFilter, setDomainFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal / Drawer states
    const [selectedApp, setSelectedApp] = useState<DatabaseInternshipApplication | null>(null);
    const [inspectingProofUrl, setInspectingProofUrl] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");

    // Create New Batch Modal State
    const [showNewBatchModal, setShowNewBatchModal] = useState(false);
    const [newBatchForm, setNewBatchForm] = useState({
        id: "",
        title: "",
        prefix: "",
        fee_amount: 499,
        domains: "Full Stack Web Development, AI / Machine Learning, IoT & Embedded Systems, Cybersecurity",
    });

    // Analytics State
    const [analytics, setAnalytics] = useState<{
        total: number;
        verifiedCount: number;
        pendingPaymentCount: number;
        totalRevenue: number;
        conversionRate: number;
        domainBreakdown: Record<string, number>;
        statusBreakdown: Record<string, number>;
    }>({
        total: 0,
        verifiedCount: 0,
        pendingPaymentCount: 0,
        totalRevenue: 0,
        conversionRate: 0,
        domainBreakdown: {},
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
        } catch (error) {
            console.error("Error loading internship admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [batchId]);

    // Handle Status Change
    const handleUpdateStatus = async (appId: string, newStatus: InternshipApplicationStatus) => {
        setActionLoading(true);
        try {
            await internshipService.updateApplicationStatus(appId, newStatus, adminNotes);
            await loadData();
            if (selectedApp && selectedApp.id === appId) {
                setSelectedApp({ ...selectedApp, status: newStatus, internal_notes: adminNotes });
            }
        } catch (error) {
            console.error("Status update error:", error);
        } finally {
            setActionLoading(false);
        }
    };

    // Handle Payment Verification
    const handleVerifyPayment = async (
        payment: DatabaseInternshipPayment,
        appId: string,
        newStatus: InternshipPaymentStatus,
        reason?: string
    ) => {
        setActionLoading(true);
        try {
            await internshipService.verifyPayment(
                payment.id,
                appId,
                newStatus,
                user?.email || "admin@vectonix.com",
                reason
            );
            await loadData();
            if (selectedApp && selectedApp.id === appId) {
                setSelectedApp(null);
            }
        } catch (error) {
            console.error("Payment verification error:", error);
        } finally {
            setActionLoading(false);
        }
    };

    // Export to Excel
    const handleExportExcel = (exportType: "all" | "verified" | "accepted") => {
        let exportData = applications;
        if (exportType === "verified") {
            exportData = applications.filter((a) => a.payment?.payment_status === "verified");
        } else if (exportType === "accepted") {
            exportData = applications.filter((a) => a.status === "accepted");
        }

        const rows = exportData.map((app) => ({
            "Application ID": app.application_id,
            "Full Name": app.full_name,
            "Email Address": app.email,
            "Phone Number": app.phone,
            "WhatsApp": app.whatsapp_number || app.phone,
            "College Name": app.college_name,
            "Degree": app.degree,
            "Department": app.department,
            "Year": app.year_of_study,
            "Domain Track": app.domain,
            "Application Status": app.status.toUpperCase(),
            "Resume Link": app.resume_url,
            "LinkedIn": app.linkedin_url || "N/A",
            "GitHub": app.github_url || "N/A",
            "Fee (INR)": app.payment?.amount || 0,
            "UTR / Transaction ID": app.payment?.transaction_id_utr || "N/A",
            "Payment Status": app.payment?.payment_status || "N/A",
            "Payment Proof URL": app.payment?.screenshot_url || "N/A",
            "Payment Verified By": app.payment?.verified_by || "N/A",
            "Application Date": app.created_at ? new Date(app.created_at).toLocaleDateString() : "N/A",
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
        const matchesStatus = statusFilter === "all" || app.status === statusFilter;
        const s = searchTerm.toLowerCase();
        const matchesSearch =
            !searchTerm ||
            app.full_name.toLowerCase().includes(s) ||
            app.application_id.toLowerCase().includes(s) ||
            app.email.toLowerCase().includes(s) ||
            app.college_name.toLowerCase().includes(s) ||
            (app.payment?.transaction_id_utr && app.payment.transaction_id_utr.toLowerCase().includes(s));

        return matchesDomain && matchesStatus && matchesSearch;
    });

    // Payment Pending Queue
    const pendingPayments = applications.filter(
        (app) => app.payment && app.payment.payment_status === "pending_verification"
    );

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
                                Manage candidate intakes, verify payments, and export cohort reports.
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

            {/* Metric KPI Cards */}
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
                        <span className="text-xs text-slate-400">candidates</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Verified Payments
                        </span>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-emerald-600">{analytics.verifiedCount}</span>
                        <span className="text-xs text-emerald-700 font-medium">({analytics.conversionRate}% verified)</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Pending Verification
                        </span>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <Clock className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-amber-600">{analytics.pendingPaymentCount}</span>
                        <span className="text-xs text-slate-400">awaiting review</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Verified Revenue
                        </span>
                        <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                            <CreditCard className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">₹{analytics.totalRevenue.toLocaleString()}</span>
                        <span className="text-xs text-slate-400">INR</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200">
                {[
                    { id: "applications", label: "Manage Applications", icon: Users, badge: applications.length },
                    { id: "payments", label: "Verify Payments", icon: CreditCard, badge: pendingPayments.length },
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

            {/* TAB 1: APPLICATIONS LIST */}
            {activeTab === "applications" && (
                <div className="space-y-4">
                    {/* Filter Bar */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
                        <div className="relative w-full md:w-80">
                            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search Name, App ID, Email, College, UTR..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <select
                                value={domainFilter}
                                onChange={(e) => setDomainFilter(e.target.value)}
                                className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Domains</option>
                                {(currentBatch?.domains || []).map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                    {/* Applications Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                        <th className="px-4 py-3.5">Application ID</th>
                                        <th className="px-4 py-3.5">Candidate</th>
                                        <th className="px-4 py-3.5">College & Branch</th>
                                        <th className="px-4 py-3.5">Domain</th>
                                        <th className="px-4 py-3.5">Application Status</th>
                                        <th className="px-4 py-3.5">Payment</th>
                                        <th className="px-4 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredApps.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                                                No internship applications found for this filter.
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

                                            const paymentStatus = app.payment?.payment_status || "pending_verification";
                                            const paymentColors: Record<string, string> = {
                                                verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                pending_verification: "bg-amber-50 text-amber-700 border-amber-200",
                                                rejected: "bg-red-50 text-red-700 border-red-200",
                                            };

                                            return (
                                                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                                        {app.application_id}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-slate-900">{app.full_name}</div>
                                                        <div className="text-slate-400 text-[11px]">{app.email}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        <div className="font-medium truncate max-w-xs">{app.college_name}</div>
                                                        <div className="text-slate-400 text-[11px]">
                                                            {app.degree} • {app.department}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                                            {app.domain}
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
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase ${
                                                                paymentColors[paymentStatus]
                                                            }`}
                                                        >
                                                            {paymentStatus.replace("_", " ")}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right space-x-1">
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

            {/* TAB 2: VERIFY PAYMENTS */}
            {activeTab === "payments" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Payment Verification Desk</h2>
                            <p className="text-xs text-slate-500">
                                Inspect candidate transaction screenshots against submitted UTR numbers to approve or flag.
                            </p>
                        </div>
                    </div>

                    {pendingPayments.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-slate-900">All payments are up to date!</h3>
                            <p className="text-xs text-slate-500 mt-1">No pending verification requests in this batch.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {pendingPayments.map((app) => {
                                const payment = app.payment!;
                                return (
                                    <div
                                        key={app.id}
                                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                    {app.application_id}
                                                </span>
                                                <h3 className="font-bold text-slate-900 text-sm mt-1">{app.full_name}</h3>
                                                <p className="text-xs text-slate-500">{app.email} • {app.phone}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-extrabold text-slate-900">₹{payment.amount}</span>
                                                <span className="block text-[10px] text-amber-600 font-bold uppercase">
                                                    Pending Review
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">UTR / Transaction ID:</span>
                                                <span className="font-mono font-bold text-slate-900 select-all">
                                                    {payment.transaction_id_utr}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Submitted:</span>
                                                <span>{payment.created_at ? new Date(payment.created_at).toLocaleString() : "N/A"}</span>
                                            </div>
                                        </div>

                                        {/* Screenshot Preview */}
                                        <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center h-48 group">
                                            <img
                                                src={payment.screenshot_url}
                                                alt="Receipt Proof"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                            <button
                                                onClick={() => setInspectingProofUrl(payment.screenshot_url)}
                                                className="absolute inset-0 bg-slate-900/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 text-xs font-semibold cursor-pointer"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Click to enlarge proof
                                            </button>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleVerifyPayment(payment, app.id, "verified")}
                                                disabled={actionLoading}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                                            >
                                                <Check className="h-3.5 w-3.5" />
                                                Verify & Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const reason = prompt("Enter reason for rejection (e.g. Invalid UTR, duplicate receipt):");
                                                    if (reason) {
                                                        handleVerifyPayment(payment, app.id, "rejected", reason);
                                                    }
                                                }}
                                                disabled={actionLoading}
                                                className="text-red-600 hover:bg-red-50 hover:border-red-300 gap-1 text-xs"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                                Reject Proof
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: COHORT ANALYTICS */}
            {activeTab === "analytics" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Domain Distribution */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-indigo-600" />
                                Domain Registration Breakdown
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

                        {/* Status Breakdown */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                                <Users className="h-4 w-4 text-indigo-600" />
                                Application Status Distribution
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { key: "pending", label: "Pending", color: "bg-slate-400" },
                                    { key: "under_review", label: "Under Review", color: "bg-blue-500" },
                                    { key: "accepted", label: "Accepted", color: "bg-emerald-500" },
                                    { key: "waitlisted", label: "Waitlisted", color: "bg-purple-500" },
                                    { key: "rejected", label: "Rejected", color: "bg-red-500" },
                                ].map((st) => {
                                    const count = analytics.statusBreakdown[st.key] || 0;
                                    const pct = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                                    return (
                                        <div key={st.key} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium text-slate-700">{st.label}</span>
                                                <span className="font-bold text-slate-900">
                                                    {count} ({pct}%)
                                                </span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                                <div
                                                    className={`h-full ${st.color} rounded-full transition-all`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: EXPORT REPORTS */}
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
                                    Download detailed candidate rosters in Microsoft Excel (.xlsx) format including contact details, college names, domain tracks, and UTR proofs.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Full Batch Roster</h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        All {applications.length} submitted applications across all statuses.
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

                            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col justify-between space-y-3">
                                <div>
                                    <h4 className="font-bold text-emerald-950 text-sm">Verified Candidates Only</h4>
                                    <p className="text-xs text-emerald-700 mt-1">
                                        Only applicants whose payments have been verified ({analytics.verifiedCount} records).
                                    </p>
                                </div>
                                <Button
                                    onClick={() => handleExportExcel("verified")}
                                    className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Verified (.xlsx)
                                </Button>
                            </div>

                            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex flex-col justify-between space-y-3">
                                <div>
                                    <h4 className="font-bold text-indigo-950 text-sm">Accepted Students</h4>
                                    <p className="text-xs text-indigo-700 mt-1">
                                        Shortlisted students accepted into the internship cohort.
                                    </p>
                                </div>
                                <Button
                                    onClick={() => handleExportExcel("accepted")}
                                    className="gap-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Accepted (.xlsx)
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                        {selectedApp.application_id}
                                    </span>
                                    <h2 className="text-xl font-bold text-slate-900 mt-1">{selectedApp.full_name}</h2>
                                    <p className="text-xs text-slate-500">{selectedApp.college_name}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedApp(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Contact & Links */}
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
                                    <span className="text-slate-400 uppercase font-semibold block">Program & Year</span>
                                    <span className="text-slate-800 font-medium">
                                        {selectedApp.degree} • {selectedApp.department} ({selectedApp.year_of_study})
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 uppercase font-semibold block">Domain Track</span>
                                    <span className="text-indigo-700 font-bold">{selectedApp.domain}</span>
                                </div>
                            </div>

                            {/* Resume & Profiles */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                                <a
                                    href={selectedApp.resume_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
                                >
                                    <FileText className="h-4 w-4" />
                                    Open Candidate Resume (PDF)
                                </a>

                                <div className="flex items-center gap-3">
                                    {selectedApp.linkedin_url && (
                                        <a
                                            href={selectedApp.linkedin_url}
                                            target="_blank"
                                            className="text-indigo-600 hover:underline flex items-center gap-1"
                                        >
                                            LinkedIn <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                    {selectedApp.github_url && (
                                        <a
                                            href={selectedApp.github_url}
                                            target="_blank"
                                            className="text-slate-700 hover:underline flex items-center gap-1"
                                        >
                                            GitHub <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Payment Information */}
                            {selectedApp.payment && (
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-800">Payment Status:</span>
                                        <span className="font-bold uppercase text-indigo-700">
                                            {selectedApp.payment.payment_status} (₹{selectedApp.payment.amount})
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">UTR / Ref Number:</span>
                                        <span className="font-mono font-bold">{selectedApp.payment.transaction_id_utr}</span>
                                    </div>
                                    <button
                                        onClick={() => setInspectingProofUrl(selectedApp.payment!.screenshot_url)}
                                        className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                    >
                                        <Eye className="h-3 w-3" /> View Submitted Payment Proof
                                    </button>
                                </div>
                            )}

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
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Proof Lightbox Modal */}
            <AnimatePresence>
                {inspectingProofUrl && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm">
                        <div className="relative max-w-3xl w-full bg-white rounded-2xl p-4 shadow-2xl">
                            <button
                                onClick={() => setInspectingProofUrl(null)}
                                className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full z-10"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <img
                                src={inspectingProofUrl}
                                alt="Payment Verification Screenshot"
                                className="w-full max-h-[80vh] object-contain rounded-xl"
                            />
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

