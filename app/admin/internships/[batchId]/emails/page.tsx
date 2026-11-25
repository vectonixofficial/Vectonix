"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
    Loader2,
    Smartphone,
    Monitor,
    Copy,
    Plus,
    Trash2,
    RotateCcw,
    Bookmark,
    ExternalLink,
    HelpCircle,
    AlertTriangle,
    Layers,
    ChevronRight,
    Sliders,
    X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/context/AuthContext";
import { internshipService, INTERNSHIP_DOMAINS } from "@/lib/services/internshipService";
import { DatabaseInternshipBatch, DatabaseInternshipApplication, DatabaseEmailCampaign } from "@/lib/supabase";
import { INDIAN_STATES } from "@/lib/data/geoData";
import {
    VectonixEmailContent,
    DEFAULT_VECTONIX_TEMPLATES,
    SUPPORTED_VARIABLES,
    SAMPLE_CANDIDATE_DATA,
    emailTemplateService,
    validateVariables,
    renderVectonixBrandedEmail,
    EmailDetailItem
} from "@/lib/services/emailTemplateService";

export default function AdminInternshipEmailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const batchId = (params?.batchId as string) || "wi26";

    // Main Tab State
    const [activeTab, setActiveTab] = useState<"compose" | "templates" | "campaigns">("compose");

    // Database Data
    const [batch, setBatch] = useState<DatabaseInternshipBatch | null>(null);
    const [applications, setApplications] = useState<DatabaseInternshipApplication[]>([]);
    const [campaigns, setCampaigns] = useState<DatabaseEmailCampaign[]>([]);
    const [loading, setLoading] = useState(true);

    // Template System State
    const [templates, setTemplates] = useState<VectonixEmailContent[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("tpl_app_accepted");
    const [currentContent, setCurrentContent] = useState<VectonixEmailContent>(DEFAULT_VECTONIX_TEMPLATES[1]);

    // Live Preview State
    const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
    const [sampleProfileKey, setSampleProfileKey] = useState<"full_stack" | "aiml" | "robotics">("full_stack");

    // Recipient Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [domainFilter, setDomainFilter] = useState("all");
    const [packageFilter, setPackageFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [stateFilter, setStateFilter] = useState("all");
    const [consentFilterOnly, setConsentFilterOnly] = useState(false);
    const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
    const [showRecipientsList, setShowRecipientsList] = useState(false);

    // Collapsible Sections in Editor
    const [openSection, setOpenSection] = useState<"core" | "details" | "info" | "meeting" | "cta">("core");

    // Modals & Feedback
    const [isSending, setIsSending] = useState(false);
    const [sendProgress, setSendProgress] = useState<{ sent: number; failed: number; total: number } | null>(null);
    const [testEmailAddress, setTestEmailAddress] = useState(user?.email || "vectonixofficial@gmail.com");
    const [showTestModal, setShowTestModal] = useState(false);
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [statusBanner, setStatusBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Load initial data
    const loadData = async () => {
        setLoading(true);
        try {
            const [b, apps, camps] = await Promise.all([
                internshipService.getBatch(batchId).catch(() => null),
                internshipService.getApplications(batchId).catch(() => []),
                internshipService.getEmailCampaigns().catch(() => [])
            ]);
            setBatch(b);
            setApplications(apps);
            setCampaigns(camps);

            const loadedTemplates = emailTemplateService.getTemplates();
            setTemplates(loadedTemplates);

            const initialTpl = loadedTemplates.find((t) => t.isDefault) || loadedTemplates[0];
            if (initialTpl) {
                setSelectedTemplateId(initialTpl.id || "tpl_app_accepted");
                setCurrentContent(initialTpl);
            }
        } catch (err) {
            console.error("Error loading email management data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [batchId]);

    // Active sample candidate variables for live preview
    const sampleVariables = useMemo(() => {
        return SAMPLE_CANDIDATE_DATA[sampleProfileKey] || SAMPLE_CANDIDATE_DATA.full_stack;
    }, [sampleProfileKey]);

    // Real-time rendered HTML for live preview
    const renderedPreview = useMemo(() => {
        return renderVectonixBrandedEmail(currentContent, sampleVariables, {
            isPreview: true
        });
    }, [currentContent, sampleVariables]);

    // Real-time variable validation
    const validationResult = useMemo(() => {
        return validateVariables(currentContent, sampleVariables);
    }, [currentContent, sampleVariables]);

    // Filtered applications
    const filteredApps = useMemo(() => {
        return applications.filter((app) => {
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
    }, [applications, domainFilter, packageFilter, statusFilter, stateFilter, consentFilterOnly, searchTerm]);

    // Recipient Selection Helpers
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

    // Load a selected template into editor
    const handleSelectTemplate = (templateId: string) => {
        const tpl = templates.find((t) => t.id === templateId);
        if (tpl) {
            setSelectedTemplateId(templateId);
            setCurrentContent(JSON.parse(JSON.stringify(tpl)));
            setStatusBanner({
                type: "success",
                text: `Template "${tpl.templateName}" loaded into composer.`
            });
            setTimeout(() => setStatusBanner(null), 3000);
        }
    };

    // Insert dynamic variable at cursor position or append to focused field
    const handleInsertVariable = (variableKey: string) => {
        setCurrentContent((prev) => ({
            ...prev,
            messageBody: prev.messageBody + " " + variableKey
        }));
    };

    // Save current content as custom template
    const handleSaveAsTemplate = () => {
        if (!newTemplateName.trim()) {
            alert("Please enter a template name.");
            return;
        }

        const toSave: VectonixEmailContent = {
            ...currentContent,
            id: `tpl_custom_${Date.now()}`,
            templateName: newTemplateName.trim(),
            category: "Custom",
            isDefault: false,
            isSystem: false,
            updatedAt: new Date().toISOString()
        };

        const updatedList = emailTemplateService.saveTemplate(toSave);
        setTemplates(updatedList);
        setSelectedTemplateId(toSave.id!);
        setShowSaveModal(false);
        setNewTemplateName("");
        setStatusBanner({
            type: "success",
            text: `Template "${toSave.templateName}" saved successfully!`
        });
        setTimeout(() => setStatusBanner(null), 3500);
    };

    // Duplicate a template
    const handleDuplicateTemplate = (id: string) => {
        const updatedList = emailTemplateService.duplicateTemplate(id);
        setTemplates(updatedList);
        setStatusBanner({
            type: "success",
            text: "Template duplicated successfully."
        });
        setTimeout(() => setStatusBanner(null), 3000);
    };

    // Set a template as default
    const handleSetDefaultTemplate = (id: string) => {
        const updatedList = emailTemplateService.setDefaultTemplate(id);
        setTemplates(updatedList);
        setStatusBanner({
            type: "success",
            text: "Default template updated."
        });
        setTimeout(() => setStatusBanner(null), 3000);
    };

    // Restore factory default templates
    const handleRestoreFactoryDefaults = () => {
        if (window.confirm("Are you sure you want to restore the factory default templates? Your custom templates will be preserved.")) {
            const restored = emailTemplateService.restoreDefaultTemplates();
            setTemplates(restored);
            setCurrentContent(DEFAULT_VECTONIX_TEMPLATES[1]);
            setSelectedTemplateId("tpl_app_accepted");
            setStatusBanner({
                type: "success",
                text: "Default Vectonix branded templates restored successfully."
            });
            setTimeout(() => setStatusBanner(null), 3500);
        }
    };

    // Send Test Email Action
    const handleSendTestEmail = async () => {
        if (!testEmailAddress || !testEmailAddress.includes("@")) {
            alert("Please enter a valid email address.");
            return;
        }

        setIsSendingTest(true);
        setStatusBanner(null);

        try {
            const res = await fetch("/api/admin/emails/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templateContent: currentContent,
                    testEmailOnly: testEmailAddress.trim()
                })
            });

            const data = await res.json();
            if (data.success) {
                setStatusBanner({
                    type: "success",
                    text: `Test email successfully dispatched to ${testEmailAddress}!`
                });
                setShowTestModal(false);
            } else {
                setStatusBanner({
                    type: "error",
                    text: data.error || "Failed to send test email"
                });
            }
        } catch (err: any) {
            setStatusBanner({
                type: "error",
                text: err.message || "Network error while dispatching test email"
            });
        } finally {
            setIsSendingTest(false);
            setTimeout(() => setStatusBanner(null), 5000);
        }
    };

    // Broadcast Campaign to Selected Students
    const handleSendBulkCampaign = async () => {
        if (selectedAppIds.length === 0) {
            alert("Please select at least one recipient student.");
            return;
        }

        const selectedApps = applications.filter((a) => selectedAppIds.includes(a.id));
        const confirmMsg = `Are you sure you want to broadcast this Vectonix branded email to ${selectedApps.length} student(s)? Each student will receive an individual personalized copy.`;
        if (!window.confirm(confirmMsg)) return;

        setIsSending(true);
        setStatusBanner(null);
        setSendProgress({ sent: 0, failed: 0, total: selectedApps.length });

        try {
            const recipientsPayload = selectedApps.map((a) => ({
                applicationIdDb: a.id,
                applicationId: a.application_id || a.application_number || "VTX-WI26",
                email: a.email,
                studentName: a.full_name,
                collegeName: a.college_name,
                domain: a.domain,
                packageName: a.package_name,
                status: a.status
            }));

            const res = await fetch("/api/admin/emails/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templateContent: currentContent,
                    recipients: recipientsPayload,
                    adminUser: user?.email || "admin@vectonix.in"
                })
            });

            const data = await res.json();
            if (data.success) {
                setStatusBanner({
                    type: "success",
                    text: `Campaign broadcast completed! Sent: ${data.sent}, Failed: ${data.failed}`
                });
                setSelectedAppIds([]);
                const camps = await internshipService.getEmailCampaigns();
                setCampaigns(camps);
            } else {
                setStatusBanner({
                    type: "error",
                    text: data.error || "Campaign broadcast encountered an error."
                });
            }
        } catch (err: any) {
            setStatusBanner({
                type: "error",
                text: err.message || "Failed to send email broadcast."
            });
        } finally {
            setIsSending(false);
            setSendProgress(null);
            setTimeout(() => setStatusBanner(null), 6000);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-16">
            {/* Top Navigation & Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            href={`/admin/internships/${batchId}`}
                            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            <span>Internship Dashboard</span>
                        </Link>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                            Communication Suite
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Email Management & Broadcast
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Vectonix branded template system for student notifications, milestones, orientations, and announcements.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sub-Tabs Selector */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                    <button
                        onClick={() => setActiveTab("compose")}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                            activeTab === "compose"
                                ? "bg-white text-indigo-700 shadow-2xs font-bold"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Send className="h-3.5 w-3.5" />
                        <span>Compose & Broadcast</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("templates")}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                            activeTab === "templates"
                                ? "bg-white text-indigo-700 shadow-2xs font-bold"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Bookmark className="h-3.5 w-3.5" />
                        <span>Templates ({templates.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("campaigns")}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                            activeTab === "campaigns"
                                ? "bg-white text-indigo-700 shadow-2xs font-bold"
                                : "text-slate-600 hover:text-slate-900"
                        }`}
                    >
                        <Clock className="h-3.5 w-3.5" />
                        <span>History & Logs ({campaigns.length})</span>
                    </button>
                </div>
            </div>

            {/* Global Status Notification Banner */}
            {statusBanner && (
                <div
                    className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200 ${
                        statusBanner.type === "success"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {statusBanner.type === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                        )}
                        <span>{statusBanner.text}</span>
                    </div>
                    <button
                        onClick={() => setStatusBanner(null)}
                        className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 1: COMPOSE & BROADCAST WITH LIVE DESKTOP / MOBILE PREVIEW             */}
            {/* ========================================================================= */}
            {activeTab === "compose" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: Structured Email Content Editor (7 Cols) */}
                    <div className="lg:col-span-7 space-y-5">
                        {/* 1. Quick Template Selector & Actions */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Base Email Template
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowSaveModal(true)}
                                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="h-3 w-3" /> Save as New
                                    </button>
                                    <span className="text-slate-300">•</span>
                                    <button
                                        type="button"
                                        onClick={handleRestoreFactoryDefaults}
                                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                                        title="Restore default Vectonix branded templates"
                                    >
                                        <RotateCcw className="h-3 w-3" /> Reset
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <select
                                    value={selectedTemplateId}
                                    onChange={(e) => handleSelectTemplate(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                                >
                                    {templates.map((tpl) => (
                                        <option key={tpl.id} value={tpl.id}>
                                            [{tpl.category || "General"}] {tpl.templateName} {tpl.isDefault ? "★ (Default)" : ""}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="h-4 w-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                            </div>
                        </div>

                        {/* 2. Recipient Selector Accordion */}
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
                            <div
                                onClick={() => setShowRecipientsList(!showRecipientsList)}
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Users className="h-4 w-4 text-indigo-600" />
                                    <span className="text-xs font-bold text-slate-900">
                                        Target Recipients:
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                        {selectedAppIds.length} of {applications.length} selected
                                    </span>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showRecipientsList ? "rotate-180" : ""}`} />
                            </div>

                            {showRecipientsList && (
                                <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50 animate-in fade-in duration-150">
                                    {/* Filters */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                        <input
                                            type="text"
                                            placeholder="Search name, email, ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        />
                                        <select
                                            value={domainFilter}
                                            onChange={(e) => setDomainFilter(e.target.value)}
                                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        >
                                            <option value="all">All Domains</option>
                                            {INTERNSHIP_DOMAINS.map((d) => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                                        >
                                            <option value="all">All Statuses</option>
                                            <option value="pending">Pending</option>
                                            <option value="accepted">Accepted</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] pt-1">
                                        <div className="space-x-2">
                                            <button
                                                type="button"
                                                onClick={handleSelectAllFiltered}
                                                className="text-indigo-600 font-bold hover:underline cursor-pointer"
                                            >
                                                Select All Filtered ({filteredApps.length})
                                            </button>
                                            <span>•</span>
                                            <button
                                                type="button"
                                                onClick={handleDeselectAll}
                                                className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                                            >
                                                Clear Selection
                                            </button>
                                        </div>
                                        <span className="text-slate-400">
                                            Showing {filteredApps.length} candidates
                                        </span>
                                    </div>

                                    {/* Candidate Checkboxes List */}
                                    <div className="max-h-48 overflow-y-auto space-y-1 bg-white p-2 border border-slate-200 rounded-xl custom-scrollbar">
                                        {filteredApps.length === 0 ? (
                                            <p className="text-center text-slate-400 py-4 text-xs">No students match current filters.</p>
                                        ) : (
                                            filteredApps.map((app) => {
                                                const isChecked = selectedAppIds.includes(app.id);
                                                return (
                                                    <label
                                                        key={app.id}
                                                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                                            isChecked ? "bg-indigo-50/70" : "hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => toggleSelectApp(app.id)}
                                                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <span className="font-semibold text-slate-800">{app.full_name}</span>
                                                            <span className="text-slate-400 font-mono text-[10px]">
                                                                ({app.application_id || app.application_number})
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 font-medium">
                                                            {app.domain}
                                                        </span>
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Core Message Fields */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-indigo-600" />
                                    <span>Editable Email Message</span>
                                </h3>
                                <span className="text-[11px] text-slate-400">
                                    Branded card, logo & footer remain fixed
                                </span>
                            </div>

                            {/* Email Subject */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Email Subject Line *
                                </label>
                                <input
                                    type="text"
                                    value={currentContent.subject}
                                    onChange={(e) => setCurrentContent({ ...currentContent, subject: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition-colors"
                                    placeholder="e.g. Welcome to Vectonix Winter Internship 2026! (ID: {{application_id}})"
                                />
                            </div>

                            {/* Status Badge & Variant */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Status Badge Text
                                    </label>
                                    <input
                                        type="text"
                                        value={currentContent.badgeText || ""}
                                        onChange={(e) => setCurrentContent({ ...currentContent, badgeText: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                                        placeholder="e.g. Application Accepted / Announcement"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Badge Accent Color
                                    </label>
                                    <select
                                        value={currentContent.badgeVariant || "info"}
                                        onChange={(e) =>
                                            setCurrentContent({
                                                ...currentContent,
                                                badgeVariant: e.target.value as any
                                            })
                                        }
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none cursor-pointer"
                                    >
                                        <option value="info">Indigo / Blue (Standard)</option>
                                        <option value="success">Emerald / Green (Accepted / Verified)</option>
                                        <option value="warning">Amber / Yellow (Reminder / Urgency)</option>
                                        <option value="danger">Rose / Red (Action Required)</option>
                                        <option value="neutral">Slate / Grey (Neutral Notice)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Greeting & Headline */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Greeting Salutation
                                    </label>
                                    <input
                                        type="text"
                                        value={currentContent.greeting || ""}
                                        onChange={(e) => setCurrentContent({ ...currentContent, greeting: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                                        placeholder="Dear {{student_name}},"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Email Heading / Title
                                    </label>
                                    <input
                                        type="text"
                                        value={currentContent.title || ""}
                                        onChange={(e) => setCurrentContent({ ...currentContent, title: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                                        placeholder="Congratulations! Welcome to Vectonix"
                                    />
                                </div>
                            </div>

                            {/* Main Message Body */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Main Message Body *
                                </label>
                                <textarea
                                    rows={5}
                                    value={currentContent.messageBody}
                                    onChange={(e) => setCurrentContent({ ...currentContent, messageBody: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl p-3 text-xs font-normal text-slate-900 leading-relaxed outline-none"
                                    placeholder="Write your email body here. Double newline creates a new paragraph."
                                />
                            </div>

                            {/* Dynamic Variable Chips Palette */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-slate-600 flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                                        <span>Click to Insert Dynamic Variable:</span>
                                    </span>
                                    <span className="text-slate-400 text-[10px]">Auto-resolves per candidate</span>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {SUPPORTED_VARIABLES.map((v) => (
                                        <button
                                            key={v.key}
                                            type="button"
                                            onClick={() => handleInsertVariable(v.key)}
                                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-[10px] font-mono text-slate-700 hover:text-indigo-700 transition-colors cursor-pointer shadow-2xs"
                                            title={`Sample value: ${v.sample}`}
                                        >
                                            {v.key}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 4. Optional Sections Toggles (Accordion) */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                                <Sliders className="h-4 w-4 text-indigo-600" />
                                <span>Optional Dynamic Email Sections</span>
                            </h3>

                            {/* Section A: Details Card Toggle */}
                            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={currentContent.showDetailsCard || false}
                                            onChange={(e) =>
                                                setCurrentContent({
                                                    ...currentContent,
                                                    showDetailsCard: e.target.checked
                                                })
                                            }
                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <span className="text-xs font-bold text-slate-800">
                                            Include Internship Details Card
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Key-value table</span>
                                </label>

                                {currentContent.showDetailsCard && (
                                    <div className="space-y-2 pt-2 border-t border-slate-200">
                                        <input
                                            type="text"
                                            value={currentContent.detailsCardTitle || ""}
                                            onChange={(e) =>
                                                setCurrentContent({
                                                    ...currentContent,
                                                    detailsCardTitle: e.target.value
                                                })
                                            }
                                            placeholder="Card Header (e.g. Internship Information)"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                                        />
                                        <p className="text-[11px] text-slate-500">
                                            Renders standard candidate summary (Application ID, Track, Domain, Package, College, Status).
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Section B: Highlight Info Box / Bullets */}
                            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={currentContent.showInfoCard || false}
                                            onChange={(e) =>
                                                setCurrentContent({
                                                    ...currentContent,
                                                    showInfoCard: e.target.checked
                                                })
                                            }
                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <span className="text-xs font-bold text-slate-800">
                                            Include Highlight Box ("What happens next?" / Notice)
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Callout box with bullets</span>
                                </label>

                                {currentContent.showInfoCard && (
                                    <div className="space-y-2 pt-2 border-t border-slate-200">
                                        <input
                                            type="text"
                                            value={currentContent.infoCardTitle || ""}
                                            onChange={(e) =>
                                                setCurrentContent({
                                                    ...currentContent,
                                                    infoCardTitle: e.target.value
                                                })
                                            }
                                            placeholder="Highlight Box Title (e.g. What happens next?)"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold"
                                        />

                                        <label className="block text-[11px] font-semibold text-slate-600">
                                            Bullet Points (one per line):
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={(currentContent.infoCardBullets || []).join("\n")}
                                            onChange={(e) =>
                                                setCurrentContent({
                                                    ...currentContent,
                                                    infoCardBullets: e.target.value.split("\n").filter(Boolean)
                                                })
                                            }
                                            placeholder="Bullet point 1&#10;Bullet point 2&#10;Bullet point 3"
                                            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Section C: Meeting Card */}
                            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={currentContent.showMeetingCard || false}
                                            onChange={(e) =>
                                                setCurrentContent({
                                                    ...currentContent,
                                                    showMeetingCard: e.target.checked,
                                                    meetingDetails: e.target.checked
                                                        ? currentContent.meetingDetails || {
                                                              date: "November 25, 2026",
                                                              time: "6:00 PM – 7:00 PM IST",
                                                              platform: "Google Meet",
                                                              link: "https://meet.google.com/vtx-wi26-ind"
                                                          }
                                                        : undefined
                                                })
                                            }
                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <span className="text-xs font-bold text-slate-800">
                                            Include Meeting / Review Details Card
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Date, time, video link</span>
                                </label>

                                {currentContent.showMeetingCard && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Meeting Date</label>
                                            <input
                                                type="text"
                                                value={currentContent.meetingDetails?.date || ""}
                                                onChange={(e) =>
                                                    setCurrentContent({
                                                        ...currentContent,
                                                        meetingDetails: {
                                                            ...currentContent.meetingDetails!,
                                                            date: e.target.value
                                                        }
                                                    })
                                                }
                                                placeholder="e.g. November 25, 2026"
                                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Meeting Time</label>
                                            <input
                                                type="text"
                                                value={currentContent.meetingDetails?.time || ""}
                                                onChange={(e) =>
                                                    setCurrentContent({
                                                        ...currentContent,
                                                        meetingDetails: {
                                                            ...currentContent.meetingDetails!,
                                                            time: e.target.value
                                                        }
                                                    })
                                                }
                                                placeholder="e.g. 6:00 PM – 7:00 PM IST"
                                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Meeting Join Link</label>
                                            <input
                                                type="url"
                                                value={currentContent.meetingDetails?.link || ""}
                                                onChange={(e) =>
                                                    setCurrentContent({
                                                        ...currentContent,
                                                        meetingDetails: {
                                                            ...currentContent.meetingDetails!,
                                                            link: e.target.value
                                                        }
                                                    })
                                                }
                                                placeholder="https://meet.google.com/..."
                                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section D: CTA Button */}
                            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={currentContent.showCtaButton !== false}
                                            onChange={(e) =>
                                                setCurrentContent({
                                                    ...currentContent,
                                                    showCtaButton: e.target.checked
                                                })
                                            }
                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <span className="text-xs font-bold text-slate-800">
                                            Include Primary Call-To-Action Button
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Brand Indigo button</span>
                                </label>

                                {currentContent.showCtaButton !== false && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Button Label</label>
                                            <input
                                                type="text"
                                                value={currentContent.ctaButtonText || ""}
                                                onChange={(e) =>
                                                    setCurrentContent({
                                                        ...currentContent,
                                                        ctaButtonText: e.target.value
                                                    })
                                                }
                                                placeholder="Access Student Dashboard →"
                                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Target URL</label>
                                            <input
                                                type="text"
                                                value={currentContent.ctaButtonUrl || ""}
                                                onChange={(e) =>
                                                    setCurrentContent({
                                                        ...currentContent,
                                                        ctaButtonUrl: e.target.value
                                                    })
                                                }
                                                placeholder="{{dashboard_link}} or https://vectonix.in"
                                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section E: Closing Message */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Closing Statement
                                </label>
                                <input
                                    type="text"
                                    value={currentContent.closingMessage || ""}
                                    onChange={(e) => setCurrentContent({ ...currentContent, closingMessage: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
                                    placeholder="e.g. Welcome to Vectonix! We look forward to seeing your contributions."
                                />
                            </div>
                        </div>

                        {/* 5. Validation Alert & Broadcast Action Bar */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                            {!validationResult.isValid && (
                                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block font-bold">Unresolved Placeholders Detected:</strong>
                                        <span>
                                            The template currently contains {validationResult.missingVariables.join(", ")}. Make sure all recipients have values for these fields.
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                                <div className="text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">
                                            {selectedAppIds.length} Recipient(s) Selected
                                        </span>
                                        {selectedAppIds.length === 0 && (
                                            <span className="text-rose-500 font-semibold">(Select students above)</span>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-slate-400">
                                        Each student receives a personalized email
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setShowTestModal(true)}
                                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                                    >
                                        <Eye className="h-3.5 w-3.5 text-indigo-600" />
                                        <span>Send Test Email</span>
                                    </button>

                                    <Button
                                        onClick={handleSendBulkCampaign}
                                        disabled={isSending || selectedAppIds.length === 0}
                                        className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer flex items-center gap-2"
                                    >
                                        {isSending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Broadcasting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-3.5 w-3.5" />
                                                <span>Broadcast Campaign</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {sendProgress && (
                                <div className="space-y-1 pt-2 border-t border-slate-100">
                                    <div className="flex justify-between text-xs text-slate-600">
                                        <span>Progress: {sendProgress.sent} sent, {sendProgress.failed} failed</span>
                                        <span>{Math.round(((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Real-Time Live Email Preview Panel (5 Cols) */}
                    <div className="lg:col-span-5 sticky top-24 space-y-4">
                        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden flex flex-col">
                            {/* Preview Toolbar */}
                            <div className="bg-slate-900 text-white p-3.5 px-4 flex items-center justify-between gap-2 border-b border-slate-800">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                                        Live Email Preview
                                    </span>
                                </div>

                                {/* Device Switcher (Desktop vs Mobile) */}
                                <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewDevice("desktop")}
                                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                            previewDevice === "desktop"
                                                ? "bg-indigo-600 text-white"
                                                : "text-slate-400 hover:text-white"
                                        }`}
                                        title="Desktop View (600px)"
                                    >
                                        <Monitor className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewDevice("mobile")}
                                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                            previewDevice === "mobile"
                                                ? "bg-indigo-600 text-white"
                                                : "text-slate-400 hover:text-white"
                                        }`}
                                        title="Mobile View (375px)"
                                    >
                                        <Smartphone className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Candidate Sample Switcher */}
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
                                <span className="font-medium text-[11px] text-slate-500">Preview Profile:</span>
                                <select
                                    value={sampleProfileKey}
                                    onChange={(e) => setSampleProfileKey(e.target.value as any)}
                                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-semibold outline-none cursor-pointer"
                                >
                                    <option value="full_stack">Rahul Sharma (Full Stack)</option>
                                    <option value="aiml">Priya Patel (AI/ML)</option>
                                    <option value="robotics">Arjun Verma (Robotics)</option>
                                </select>
                            </div>

                            {/* Simulated Subject Display */}
                            <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs">
                                <span className="font-bold text-slate-500">Subject: </span>
                                <span className="font-semibold text-slate-900">{renderedPreview.subject}</span>
                            </div>

                            {/* HTML Email Canvas Container */}
                            <div className="p-3 sm:p-4 bg-slate-100/70 overflow-x-auto flex justify-center max-h-[calc(100vh-22rem)] overflow-y-auto">
                                <div
                                    className={`transition-all duration-300 shadow-md rounded-2xl overflow-hidden bg-white ${
                                        previewDevice === "mobile" ? "w-[360px] max-w-full" : "w-full max-w-[560px]"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: renderedPreview.html }}
                                />
                            </div>

                            {/* Preview Footer Quick Actions */}
                            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
                                <span className="text-[11px] text-slate-500">
                                    Vectonix Branded Layout • Learn • Build • Grow
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowTestModal(true)}
                                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                    <Send className="h-3 w-3" />
                                    <span>Send Live Test</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 2: EMAIL TEMPLATES MANAGEMENT                                         */}
            {/* ========================================================================= */}
            {activeTab === "templates" && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Vectonix Standard Email Templates
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Pre-configured and custom message templates for the entire internship lifecycle.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleRestoreFactoryDefaults}
                                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Reset Factory Templates</span>
                            </button>
                            <Button
                                onClick={() => {
                                    setNewTemplateName("Custom Announcement");
                                    setShowSaveModal(true);
                                }}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer flex items-center gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Create New Template</span>
                            </Button>
                        </div>
                    </div>

                    {/* Template Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {templates.map((tpl) => {
                            const isDefault = tpl.isDefault;
                            return (
                                <div
                                    key={tpl.id}
                                    className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-sm ${
                                        isDefault
                                            ? "border-indigo-400 ring-2 ring-indigo-500/10"
                                            : "border-slate-200 hover:border-slate-300"
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                                {tpl.category || "General"}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {isDefault && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        ★ Default
                                                    </span>
                                                )}
                                                {tpl.isSystem ? (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 uppercase">
                                                        System
                                                    </span>
                                                ) : (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 uppercase">
                                                        Custom
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                            {tpl.templateName}
                                        </h3>

                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-mono text-slate-600 line-clamp-2">
                                            {tpl.subject}
                                        </div>

                                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                            {tpl.messageBody}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleSelectTemplate(tpl.id!);
                                                setActiveTab("compose");
                                            }}
                                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                                        >
                                            <Send className="h-3 w-3" />
                                            <span>Use in Composer</span>
                                        </button>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleDuplicateTemplate(tpl.id!)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                title="Duplicate Template"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>

                                            {!isDefault && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetDefaultTemplate(tpl.id!)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer text-xs font-semibold"
                                                    title="Set as Default"
                                                >
                                                    ★
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* TAB 3: CAMPAIGN HISTORY & DELIVERY LOGS                                   */}
            {/* ========================================================================= */}
            {activeTab === "campaigns" && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">
                                Past Email Broadcasts & Logs
                            </h2>
                            <p className="text-xs text-slate-500">
                                Track delivery status, timestamps, and recipient metrics.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={loadData}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Refresh logs"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                                    <th className="py-3 px-4">Campaign ID</th>
                                    <th className="py-3 px-4">Subject</th>
                                    <th className="py-3 px-4">Recipients</th>
                                    <th className="py-3 px-4">Sent / Failed</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {campaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400">
                                            No campaigns sent yet. Use the composer tab to launch your first broadcast.
                                        </td>
                                    </tr>
                                ) : (
                                    campaigns.map((camp) => (
                                        <tr key={camp.id} className="hover:bg-slate-50/60">
                                            <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-700">
                                                {camp.campaign_id}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                                                {camp.subject}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-slate-700">
                                                {camp.total_recipients}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-emerald-700 font-bold">{camp.sent_count} sent</span>
                                                {camp.failed_count > 0 && (
                                                    <span className="text-rose-600 font-bold ml-1.5">• {camp.failed_count} failed</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                        camp.status === "completed"
                                                            ? "bg-emerald-50 text-emerald-800"
                                                            : camp.status === "failed"
                                                            ? "bg-rose-50 text-rose-800"
                                                            : "bg-amber-50 text-amber-800"
                                                    }`}
                                                >
                                                    {camp.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 text-[11px]">
                                                {camp.created_at ? new Date(camp.created_at).toLocaleString() : "Just now"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL: SEND TEST EMAIL                                                    */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {showTestModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <Send className="h-4 w-4 text-indigo-600" />
                                    <h3 className="font-bold text-slate-900 text-sm">Send Preview Test Email</h3>
                                </div>
                                <button
                                    onClick={() => setShowTestModal(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                                Sends an actual rendered test copy of the current Vectonix branded email to your email address to verify rendering across Gmail, Outlook, and mobile apps.
                            </p>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Recipient Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={testEmailAddress}
                                    onChange={(e) => setTestEmailAddress(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium outline-none"
                                    placeholder="your-email@gmail.com"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowTestModal(false)}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSendTestEmail}
                                    disabled={isSendingTest}
                                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                >
                                    {isSendingTest ? "Dispatching..." : "Send Test Now"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* MODAL: SAVE AS NEW TEMPLATE                                               */}
            {/* ========================================================================= */}
            <AnimatePresence>
                {showSaveModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <Bookmark className="h-4 w-4 text-indigo-600" />
                                    <h3 className="font-bold text-slate-900 text-sm">Save Custom Template</h3>
                                </div>
                                <button
                                    onClick={() => setShowSaveModal(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Template Name *
                                </label>
                                <input
                                    type="text"
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium outline-none"
                                    placeholder="e.g. Mid-Term Review Invitation"
                                />
                            </div>

                            <p className="text-[11px] text-slate-500">
                                This template will be stored in your Email Management catalog and can be reused for any batch broadcast.
                            </p>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowSaveModal(false)}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSaveAsTemplate}
                                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                                >
                                    Save Template
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
