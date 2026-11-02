"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    Send,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    ArrowLeft,
    Eye,
    RefreshCw,
    Sparkles,
    AlertCircle,
    ChevronDown,
    Building2,
    Calendar,
    Briefcase,
    FileText,
    Check,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { internshipService, INTERNSHIP_DOMAINS } from "@/lib/services/internshipService";
import { DatabaseInternshipBatch, DatabaseInternshipApplication, DatabaseEmailCampaign } from "@/lib/supabase";
import { INDIAN_STATES } from "@/lib/data/geoData";

export default function AdminInternshipEmailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const batchId = (params?.batchId as string) || "wi26";

    const [batch, setBatch] = useState<DatabaseInternshipBatch | null>(null);
    const [applications, setApplications] = useState<DatabaseInternshipApplication[]>([]);
    const [campaigns, setCampaigns] = useState<DatabaseEmailCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [searchTerm, setSearchTerm] = useState("");
    const [domainFilter, setDomainFilter] = useState("all");
    const [packageFilter, setPackageFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [stateFilter, setStateFilter] = useState("all");
    const [consentFilterOnly, setConsentFilterOnly] = useState(false);

    // Recipient Selection state
    const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

    // Composer state
    const [emailSubject, setEmailSubject] = useState("Welcome to Vectonix Winter Internship 2026! (Application ID: {{application_id}})");
    const [emailMessage, setEmailMessage] = useState(
`Hello {{student_name}},

Congratulations!
Your application for the Vectonix Winter Internship 2026 has been received.

Application ID: {{application_id}}
Selected Domain: {{internship_domain}}
Selected Package: {{package_name}}
College: {{college_name}}

We look forward to having you as part of Vectonix Technologies.

Regards,
Team Vectonix Technologies
vectonixofficial@gmail.com
6382340278 / 7538872586`
    );
    const [isPromotional, setIsPromotional] = useState(false);

    // Sending & Modal state
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState<{ sent: number; failed: number; total: number } | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [statusBanner, setStatusBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const b = await internshipService.getBatch(batchId);
            setBatch(b);

            const apps = await internshipService.getApplications(batchId);
            setApplications(apps);

            const camps = await internshipService.getEmailCampaigns();
            setCampaigns(camps);
        } catch (err) {
            console.error("Error loading email management data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [batchId]);

    // Filtering applicants
    const filteredApps = applications.filter((app) => {
        const matchesDomain = domainFilter === "all" || app.domain === domainFilter;
        const matchesPackage = packageFilter === "all" || app.package_name === packageFilter;
        const matchesStatus = statusFilter === "all" || app.status === statusFilter;
        const matchesState = stateFilter === "all" || app.state === stateFilter;
        const matchesConsent = !consentFilterOnly || app.marketing_consent;

        const s = searchTerm.toLowerCase();
        const matchesSearch =
            !searchTerm ||
            app.full_name.toLowerCase().includes(s) ||
            (app.application_id && app.application_id.toLowerCase().includes(s)) ||
            app.email.toLowerCase().includes(s) ||
            app.college_name.toLowerCase().includes(s);

        return matchesDomain && matchesPackage && matchesStatus && matchesState && matchesConsent && matchesSearch;
    });

    // Select/Deselect handlers
    const handleSelectAllFiltered = () => {
        const filteredIds = filteredApps.map((a) => a.id);
        const uniqueSet = new Set([...selectedAppIds, ...filteredIds]);
        setSelectedAppIds(Array.from(uniqueSet));
    };

    const handleDeselectAll = () => {
        setSelectedAppIds([]);
    };

    const toggleSelectApp = (id: string) => {
        if (selectedAppIds.includes(id)) {
            setSelectedAppIds(selectedAppIds.filter((item) => item !== id));
        } else {
            setSelectedAppIds([...selectedAppIds, id]);
        }
    };

    // Quick Templates
    const handleApplyTemplate = (type: "welcome" | "orientation" | "shortlist") => {
        if (type === "welcome") {
            setEmailSubject("Welcome to Vectonix Winter Internship 2026! (Application ID: {{application_id}})");
            setEmailMessage(
`Hello {{student_name}},

Congratulations!
Your application for the Vectonix Winter Internship 2026 has been received.

Application ID: {{application_id}}
Selected Domain: {{internship_domain}}
Selected Package: {{package_name}}
College: {{college_name}}

We look forward to having you as part of Vectonix Technologies.

Regards,
Team Vectonix Technologies
vectonixofficial@gmail.com
6382340278 / 7538872586`
            );
        } else if (type === "orientation") {
            setEmailSubject("Orientation & Technical Batch Schedule – Vectonix WI26 ({{internship_domain}})");
            setEmailMessage(
`Hello {{student_name}},

This is an important update regarding your upcoming orientation session for the {{internship_domain}} internship track.

Your Application ID: {{application_id}}
Allocated Package: {{package_name}}

Please ensure you have joined our developer Discord community and installed your track prerequisites before the inaugural session.

Best regards,
Vectonix Academic Mentorship Team`
            );
        } else if (type === "shortlist") {
            setEmailSubject("Offer Letter & Batch Allocation: Vectonix Winter Internship 2026");
            setEmailMessage(
`Dear {{student_name}},

We are pleased to inform you that your application (ID: {{application_id}}) has been shortlisted for the Winter Internship 2026 program at Vectonix Technologies.

Institution: {{college_name}}
Domain: {{internship_domain}}
Selected Package: {{package_name}}

Detailed onboarding instructions will be shared shortly. Welcome aboard!

Warm regards,
Habibur Rahman
Managing Director, Vectonix Technologies`
            );
        }
    };

    // Send Test Email
    const handleSendTest = async () => {
        const testEmail = prompt("Enter email address to send a preview test email:", user?.email || "vectonixofficial@gmail.com");
        if (!testEmail) return;

        setIsSending(true);
        setStatusBanner(null);
        try {
            const res = await fetch("/api/admin/emails/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: emailSubject,
                    message: emailMessage,
                    testEmailOnly: testEmail,
                    isPromotional
                })
            });
            const data = await res.json();
            if (data.success) {
                setStatusBanner({ type: "success", text: `Test email successfully dispatched to ${testEmail}!` });
            } else {
                setStatusBanner({ type: "error", text: data.error || "Failed to send test email" });
            }
        } catch (err: any) {
            setStatusBanner({ type: "error", text: err.message || "Failed to dispatch test email" });
        } finally {
            setIsSending(false);
        }
    };

    // Send Bulk Email
    const handleSendBulk = async () => {
        if (selectedAppIds.length === 0) {
            alert("Please select at least one recipient student.");
            return;
        }

        const selectedApps = applications.filter((a) => selectedAppIds.includes(a.id));
        const confirmMsg = `Are you sure you want to send this personalized email to ${selectedApps.length} student(s)? Each student will receive their own individual copy.`;
        if (!window.confirm(confirmMsg)) return;

        setIsSending(true);
        setStatusBanner(null);
        setSendProgress({ sent: 0, failed: 0, total: selectedApps.length });

        try {
            const recipientsPayload = selectedApps.map((a) => ({
                applicationIdDb: a.id,
                applicationId: a.application_id || a.application_number,
                studentName: a.full_name,
                email: a.email,
                collegeName: a.college_name,
                domain: a.domain,
                packageName: a.package_name
            }));

            const res = await fetch("/api/admin/emails/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: emailSubject,
                    message: emailMessage,
                    recipients: recipientsPayload,
                    filterCriteria: {
                        domain: domainFilter,
                        package: packageFilter,
                        status: statusFilter
                    },
                    isPromotional,
                    adminUser: user?.email || "admin@vectonix.in"
                })
            });

            const data = await res.json();
            if (data.success) {
                setSendProgress({
                    sent: data.sentCount,
                    failed: data.failedCount,
                    total: recipientsPayload.length
                });
                setStatusBanner({
                    type: "success",
                    text: `Bulk dispatch completed: ${data.sentCount} sent, ${data.failedCount} failed.`
                });
                loadData();
            } else {
                setStatusBanner({ type: "error", text: data.error || "Bulk email dispatch failed" });
            }
        } catch (err: any) {
            setStatusBanner({ type: "error", text: err.message || "Bulk dispatch failure" });
        } finally {
            setIsSending(false);
        }
    };

    // Calculate Email Stats
    const totalEmailAddresses = applications.length;
    let totalSentCampaigns = 0;
    campaigns.forEach((c) => {
        totalSentCampaigns += c.sent_count || 0;
    });

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/internships/${batchId}`}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                        title="Back to Batch Overview"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                                <Mail className="h-5 w-5" />
                            </span>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Bulk Email Management System
                            </h1>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Group applicants, personalize templates with dynamic variables, and dispatch individual bulk emails.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        title="Refresh data"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <Link
                        href={`/admin/internships/${batchId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                        <span>Internship Cohort</span>
                    </Link>
                </div>
            </div>

            {/* Notification Banner */}
            {statusBanner && (
                <div
                    className={`p-4 rounded-xl flex items-center justify-between text-xs font-medium border ${
                        statusBanner.type === "success"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-red-50 text-red-800 border-red-200"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {statusBanner.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        <span>{statusBanner.text}</span>
                    </div>
                    <button onClick={() => setStatusBanner(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
            )}

            {/* Section A: Email Dashboard KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Total Students
                        </span>
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                            <Users className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">{applications.length}</span>
                        <span className="text-xs text-slate-400">registered</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Valid Emails
                        </span>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <Mail className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-emerald-600">{totalEmailAddresses}</span>
                        <span className="text-xs text-slate-400">addresses</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Selected Recipients
                        </span>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-amber-600">{selectedAppIds.length}</span>
                        <span className="text-xs text-slate-400">of {filteredApps.length} filtered</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Campaign History
                        </span>
                        <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                            <Clock className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">{campaigns.length}</span>
                        <span className="text-xs text-slate-400">campaigns</span>
                    </div>
                </div>
            </div>

            {/* Section D & E: Email Composer with Dynamic Placeholders */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-indigo-600" />
                            Email Composition & Personalization Studio
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Use dynamic placeholders to generate individualized emails. Each recipient receives their own private copy.
                        </p>
                    </div>

                    {/* Quick Template Picker */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium hidden sm:inline">Templates:</span>
                        <button
                            type="button"
                            onClick={() => handleApplyTemplate("welcome")}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        >
                            Welcome
                        </button>
                        <button
                            type="button"
                            onClick={() => handleApplyTemplate("orientation")}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                            Orientation
                        </button>
                        <button
                            type="button"
                            onClick={() => handleApplyTemplate("shortlist")}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                            Shortlist
                        </button>
                    </div>
                </div>

                {/* Available Placeholders Pills */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                    <span className="font-semibold text-slate-600 block mb-1.5">
                        Supported Personalization Variables (Click to insert):
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { tag: "{{student_name}}", label: "Student Name" },
                            { tag: "{{application_id}}", label: "Application ID" },
                            { tag: "{{email}}", label: "Email Address" },
                            { tag: "{{college_name}}", label: "College Name" },
                            { tag: "{{internship_domain}}", label: "Internship Domain" },
                            { tag: "{{package_name}}", label: "Selected Package" }
                        ].map((ph) => (
                            <button
                                key={ph.tag}
                                type="button"
                                onClick={() => setEmailMessage((prev) => prev + " " + ph.tag)}
                                className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-800 font-mono text-[11px] hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-2xs"
                                title={`Insert ${ph.label}`}
                            >
                                {ph.tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Subject Input */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Email Subject *
                    </label>
                    <input
                        type="text"
                        required
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Message Textarea / Editor */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Email Message Body *
                    </label>
                    <textarea
                        rows={8}
                        required
                        value={emailMessage}
                        onChange={(e) => setEmailMessage(e.target.value)}
                        className="w-full p-4 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans leading-relaxed"
                    />
                </div>

                {/* Promotional vs Transactional Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="promo-toggle"
                            checked={isPromotional}
                            onChange={(e) => setIsPromotional(e.target.checked)}
                            className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="promo-toggle" className="font-semibold text-slate-700 cursor-pointer">
                            Mark as Promotional / Marketing Campaign
                        </label>
                    </div>
                    <span className="text-slate-500 text-[11px]">
                        {isPromotional
                            ? "Will include mandatory unsubscribe footer"
                            : "Essential registration / transactional message"}
                    </span>
                </div>

                {/* Composer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPreviewModal(true)}
                            className="text-xs gap-1.5"
                        >
                            <Eye className="h-4 w-4" />
                            Preview Sample Email
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleSendTest}
                            disabled={isSending}
                            className="text-xs gap-1.5"
                        >
                            <Mail className="h-4 w-4" />
                            Send Test Email
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-700">
                            Recipients Ready: <strong className="text-indigo-600 text-sm">{selectedAppIds.length}</strong>
                        </span>
                        <Button
                            type="button"
                            onClick={handleSendBulk}
                            disabled={isSending || selectedAppIds.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs font-semibold shadow-md px-5"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Dispatching Emails...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Send Bulk Email ({selectedAppIds.length})
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Section B & C: Recipient Filter & Selection Table */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Select Recipients from Registered Cohort
                        </h2>
                        <p className="text-xs text-slate-500">
                            Filter candidates by domain, package, or state and choose recipients for the campaign.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSelectAllFiltered}
                            className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold"
                        >
                            Select All ({filteredApps.length})
                        </button>
                        <button
                            type="button"
                            onClick={handleDeselectAll}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                        >
                            Deselect All
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search */}
                    <div className="relative lg:col-span-1">
                        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search Name, ID, College..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Domain Filter */}
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

                    {/* Package Filter */}
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

                    {/* State Filter */}
                    <div>
                        <select
                            value={stateFilter}
                            onChange={(e) => setStateFilter(e.target.value)}
                            className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All States</option>
                            {INDIAN_STATES.slice(0, 15).map((st) => (
                                <option key={st} value={st}>{st}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
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

                {/* Recipient Table */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="px-4 py-3.5 w-10">
                                        <input
                                            type="checkbox"
                                            checked={
                                                filteredApps.length > 0 &&
                                                filteredApps.every((a) => selectedAppIds.includes(a.id))
                                            }
                                            onChange={(e) => {
                                                if (e.target.checked) handleSelectAllFiltered();
                                                else handleDeselectAll();
                                            }}
                                            className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="px-4 py-3.5">Application ID</th>
                                    <th className="px-4 py-3.5">Student Name</th>
                                    <th className="px-4 py-3.5">Email Address</th>
                                    <th className="px-4 py-3.5">College & State</th>
                                    <th className="px-4 py-3.5">Selected Track</th>
                                    <th className="px-4 py-3.5">Package</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredApps.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                                            No registered students match the active filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredApps.map((app) => {
                                        const isSelected = selectedAppIds.includes(app.id);
                                        return (
                                            <tr
                                                key={app.id}
                                                onClick={() => toggleSelectApp(app.id)}
                                                className={`cursor-pointer transition-colors ${
                                                    isSelected ? "bg-indigo-50/40" : "hover:bg-slate-50/80"
                                                }`}
                                            >
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleSelectApp(app.id)}
                                                        className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 font-mono font-bold text-slate-900">
                                                    {app.application_id || app.application_number}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-slate-900">
                                                    {app.full_name}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {app.email}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    <div className="truncate max-w-xs">{app.college_name}</div>
                                                    <div className="text-slate-400 text-[11px]">{app.state || "India"}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                                                        {app.domain}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                                                            app.package_name === "Premium"
                                                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                        }`}
                                                    >
                                                        {app.package_name} (₹{app.package_amount || (app.package_name === "Premium" ? 999 : 749)})
                                                    </span>
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

            {/* Preview Modal */}
            <AnimatePresence>
                {showPreviewModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="font-bold text-slate-900 text-base">Sample Email Preview</h3>
                                <button
                                    onClick={() => setShowPreviewModal(false)}
                                    className="p-1 text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                                <p><strong>Subject:</strong> {emailSubject.replace("{{application_id}}", "VTX-WI26-0001")}</p>
                                <p><strong>Recipient (Sample):</strong> Rahul Sharma &lt;rahul.sharma@example.com&gt;</p>
                            </div>

                            <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                                {emailMessage
                                    .replace(/\{\{student_name\}\}/g, "Rahul Sharma")
                                    .replace(/\{\{application_id\}\}/g, "VTX-WI26-0001")
                                    .replace(/\{\{internship_domain\}\}/g, "Full Stack Development")
                                    .replace(/\{\{package_name\}\}/g, "Premium (₹999)")
                                    .replace(/\{\{college_name\}\}/g, "V.S.B. Engineering College")}
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={() => setShowPreviewModal(false)} className="text-xs">
                                    Close Preview
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

