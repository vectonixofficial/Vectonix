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
    Trash2
} from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { internshipService, INTERNSHIP_DOMAINS, PACKAGES_CONFIG } from "@/lib/services/internshipService";
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
    const [activeTab, setActiveTab] = useState<"applications" | "analytics" | "reports">("applications");

    // Filter & Search
    const [searchTerm, setSearchTerm] = useState("");
    const [domainFilter, setDomainFilter] = useState("all");
    const [packageFilter, setPackageFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal / Drawer states
    const [selectedApp, setSelectedApp] = useState<DatabaseInternshipApplication | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");

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
            "Package Amount (INR)": app.package_amount || (app.package_name === "Premium" ? 999 : 749),
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

                {/* Email management quick link */}
                <Link
                    href={`/admin/internships/${batchId}/emails`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 pr-2"
                >
                    <Mail className="h-4 w-4" />
                    <span>Open Email Center &rarr;</span>
                </Link>
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

                    {/* Applications Table */}
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                        <th className="px-4 py-3.5">Application ID</th>
                                        <th className="px-4 py-3.5">Candidate Details</th>
                                        <th className="px-4 py-3.5">College & Location</th>
                                        <th className="px-4 py-3.5">Domain</th>
                                        <th className="px-4 py-3.5">Package</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredApps.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-16 text-center">
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

                                            return (
                                                <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
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
                                                                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                            }`}
                                                        >
                                                            {app.package_name} (₹{app.package_amount || (app.package_name === "Premium" ? 999 : 749)})
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
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
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
                                        {selectedApp.package_name} (₹{selectedApp.package_amount || (selectedApp.package_name === "Premium" ? 999 : 749)})
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
        </div>
    );
}
