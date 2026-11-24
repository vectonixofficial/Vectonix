"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    PlaySquare,
    Sparkles,
    Shield,
    Bot,
    FlaskConical,
    Brain,
    Code,
    TrendingUp,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Info,
    RefreshCw,
    Download,
    Eye,
    Maximize2,
    Smartphone,
    Tablet,
    Monitor,
    ExternalLink,
    Filter,
    Check,
    Layers,
    ChevronRight,
    ArrowLeft,
    Sliders,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
    SIMULATION_DOMAINS,
    SCENARIO_PRESETS,
    SimulationConfig,
    ApplicationStatusType,
    ProjectStatusType,
    MilestoneStatusType
} from "@/lib/simulation/syntheticData";
import { SimulationProvider } from "@/lib/simulation/simulationContext";
import { StudentDashboardContent } from "@/app/internship/dashboard/page";
import { diagnosticEngine, DiagnosticIssue, DiagnosticCheckSummary, IssueStatus } from "@/lib/simulation/diagnosticEngine";
import { INITIAL_PROJECT_TEMPLATES, normalizeDomain } from "@/lib/project-bank";

type ViewportMode = "desktop" | "tablet" | "mobile";

export default function StudentSimulationCenterPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = (params?.batchId as string) || "wi26";

    // Active Simulation Configuration
    const [config, setConfig] = useState<SimulationConfig>({
        domain: "AI / Machine Learning",
        applicationStatus: "Accepted",
        projectStatus: "In Progress",
        milestoneStatus: "Approved",
        projectTemplateId: "AI-ML-01",
        scenarioName: "Mid-Term Progress (Milestones 1 & 2 Approved)"
    });

    const [activeTab, setActiveTab] = useState<"preview" | "diagnostics">("preview");
    const [viewport, setViewport] = useState<ViewportMode>("desktop");
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Diagnostics State
    const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
    const [diagnosticsResult, setDiagnosticsResult] = useState<DiagnosticCheckSummary | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [severityFilter, setSeverityFilter] = useState<string>("All");
    const [issuesList, setIssuesList] = useState<DiagnosticIssue[]>([]);
    const [lastTestedTimes, setLastTestedTimes] = useState<Record<string, string>>({});

    // Available project templates for active domain
    const activeDomainTemplates = INITIAL_PROJECT_TEMPLATES.filter(
        (t) => normalizeDomain(t.domain) === normalizeDomain(config.domain)
    );

    // Run initial diagnostic check on mount
    useEffect(() => {
        const runInitial = async () => {
            const res = await diagnosticEngine.runDiagnostics();
            setDiagnosticsResult(res);
            setIssuesList(res.issues);
            const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const times: Record<string, string> = {};
            SIMULATION_DOMAINS.forEach((d) => (times[d.name] = now));
            setLastTestedTimes(times);
        };
        runInitial();
    }, []);

    const handleRunDiagnostics = async () => {
        setDiagnosticsRunning(true);
        try {
            const res = await diagnosticEngine.runDiagnostics();
            setDiagnosticsResult(res);
            setIssuesList(res.issues);
            const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const times: Record<string, string> = {};
            SIMULATION_DOMAINS.forEach((d) => (times[d.name] = now));
            setLastTestedTimes(times);
        } finally {
            setDiagnosticsRunning(false);
        }
    };

    const handleSelectDomain = (domainName: string) => {
        const templates = INITIAL_PROJECT_TEMPLATES.filter(
            (t) => normalizeDomain(t.domain) === normalizeDomain(domainName)
        );
        setConfig((prev) => ({
            ...prev,
            domain: domainName,
            projectTemplateId: templates[0]?.id || undefined
        }));
    };

    const handleApplyPreset = (presetName: string) => {
        const match = SCENARIO_PRESETS.find((p) => p.name === presetName);
        if (match) {
            const templates = INITIAL_PROJECT_TEMPLATES.filter(
                (t) => normalizeDomain(t.domain) === normalizeDomain(match.config.domain)
            );
            setConfig({
                ...match.config,
                scenarioName: match.name,
                projectTemplateId: templates[0]?.id || undefined
            });
        }
    };

    const handleUpdateIssueStatus = (issueId: string, newStatus: IssueStatus) => {
        setIssuesList((prev) =>
            prev.map((iss) => (iss.id === issueId ? { ...iss, status: newStatus } : iss))
        );
    };

    const handleExportCSV = () => {
        const csv = diagnosticEngine.exportToCSV(issuesList);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `vectonix-student-simulation-audit-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getDomainIcon = (iconName: string) => {
        switch (iconName) {
            case "Brain":
                return <Brain className="h-5 w-5 text-purple-600" />;
            case "Bot":
                return <Bot className="h-5 w-5 text-emerald-600" />;
            case "FlaskConical":
                return <FlaskConical className="h-5 w-5 text-amber-600" />;
            case "Shield":
                return <Shield className="h-5 w-5 text-rose-600" />;
            case "TrendingUp":
                return <TrendingUp className="h-5 w-5 text-blue-600" />;
            case "Code":
            default:
                return <Code className="h-5 w-5 text-indigo-600" />;
        }
    };

    // Filter issues for display
    const filteredIssues = issuesList.filter((iss) => {
        if (statusFilter !== "All" && iss.status !== statusFilter) return false;
        if (severityFilter !== "All" && iss.severity !== severityFilter) return false;
        return true;
    });

    const issuesByDomainCount: Record<string, number> = {};
    issuesList.forEach((iss) => {
        const norm = normalizeDomain(iss.domain);
        issuesByDomainCount[norm] = (issuesByDomainCount[norm] || 0) + 1;
    });

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
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
                            Testing & QA Tools
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                            <PlaySquare className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Student Simulation Center
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Explore, test, and audit the complete student dashboard across all 6 domains without real logins or database alterations.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Button
                        onClick={handleRunDiagnostics}
                        disabled={diagnosticsRunning}
                        variant="outline"
                        className="text-xs font-semibold flex items-center gap-1.5 border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 text-indigo-600 ${diagnosticsRunning ? "animate-spin" : ""}`} />
                        <span>{diagnosticsRunning ? "Running Diagnostics..." : "Run Diagnostic Suite"}</span>
                    </Button>
                    <a
                        href={`/internship/dashboard?simulation=true&domain=${encodeURIComponent(config.domain)}&appStatus=${config.applicationStatus}&projStatus=${config.projectStatus}&mlstStatus=${config.milestoneStatus}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Launch in Dedicated Tab</span>
                    </a>
                </div>
            </div>

            {/* Domain Overview Cards (All 6 Domains) */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Layers className="h-4 w-4 text-indigo-600" />
                        <span>Internship Domains (6 Active Portals)</span>
                    </h2>
                    <span className="text-xs text-slate-400">
                        Select a domain to inspect its dashboard and specifications
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SIMULATION_DOMAINS.map((dom) => {
                        const isSelected = normalizeDomain(config.domain) === normalizeDomain(dom.name);
                        const norm = normalizeDomain(dom.name);
                        const issueCount = issuesByDomainCount[norm] || 0;
                        const lastTested = lastTestedTimes[dom.name] || "Recently";

                        return (
                            <div
                                key={dom.id}
                                onClick={() => handleSelectDomain(dom.name)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                                    isSelected
                                        ? "bg-indigo-50/50 border-indigo-400 shadow-sm ring-2 ring-indigo-500/20"
                                        : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xs"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                            {getDomainIcon(dom.icon)}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">{dom.name}</h3>
                                            <span className="text-[11px] font-mono text-slate-400">{dom.defaultTemplateId}</span>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            isSelected
                                                ? "bg-indigo-600 text-white"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        {isSelected ? "Active in Sim" : "Ready"}
                                    </span>
                                </div>

                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                                    {dom.description}
                                </p>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <span>Tested:</span>
                                        <strong className="text-slate-600">{lastTested}</strong>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {issueCount === 0 ? (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span>0 Issues</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                                                <AlertTriangle className="h-3 w-3" />
                                                <span>{issueCount} {issueCount === 1 ? "Issue" : "Issues"}</span>
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectDomain(dom.name);
                                                setActiveTab("preview");
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                                        >
                                            Preview
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Tabs (Interactive Dashboard Preview vs Automated Diagnostics) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-6 pt-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab("preview")}
                            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                                activeTab === "preview"
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                        >
                            <Eye className="h-4 w-4" />
                            <span>Interactive Dashboard Preview</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("diagnostics")}
                            className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                                activeTab === "diagnostics"
                                    ? "bg-slate-900 text-white shadow-xs"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                            }`}
                        >
                            <Sparkles className="h-4 w-4" />
                            <span>Diagnostic Audit &amp; Bug Report</span>
                            {issuesList.length > 0 && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {issuesList.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {activeTab === "preview" && (
                        <div className="flex items-center gap-2 pb-2">
                            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1">
                                Device Viewport:
                            </span>
                            <button
                                type="button"
                                onClick={() => setViewport("desktop")}
                                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    viewport === "desktop"
                                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                        : "text-slate-500 hover:bg-slate-100"
                                }`}
                                title="Desktop (100%)"
                            >
                                <Monitor className="h-4 w-4" />
                                <span className="hidden sm:inline">Desktop</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewport("tablet")}
                                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    viewport === "tablet"
                                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                        : "text-slate-500 hover:bg-slate-100"
                                }`}
                                title="Tablet (768px)"
                            >
                                <Tablet className="h-4 w-4" />
                                <span className="hidden sm:inline">Tablet</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewport("mobile")}
                                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    viewport === "mobile"
                                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                        : "text-slate-500 hover:bg-slate-100"
                                }`}
                                title="Mobile (375px)"
                            >
                                <Smartphone className="h-4 w-4" />
                                <span className="hidden sm:inline">Mobile</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Tab 1: Interactive Dashboard Preview */}
                {activeTab === "preview" && (
                    <div className="p-6 space-y-6">
                        {/* Simulation Configurator Bar */}
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Sliders className="h-4 w-4 text-indigo-600" />
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                        Simulated Student Scenario Configuration
                                    </h3>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[11px] text-slate-400 font-semibold mr-1">Presets:</span>
                                    {SCENARIO_PRESETS.map((p) => (
                                        <button
                                            key={p.name}
                                            type="button"
                                            onClick={() => handleApplyPreset(p.name)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                                                config.scenarioName === p.name
                                                    ? "bg-indigo-600 text-white shadow-2xs"
                                                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                                            }`}
                                        >
                                            {p.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                {/* 1. Domain */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Internship Domain
                                    </label>
                                    <select
                                        value={config.domain}
                                        onChange={(e) => handleSelectDomain(e.target.value)}
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        {SIMULATION_DOMAINS.map((d) => (
                                            <option key={d.id} value={d.name}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 2. Application Status */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Application Status
                                    </label>
                                    <select
                                        value={config.applicationStatus}
                                        onChange={(e) =>
                                            setConfig({ ...config, applicationStatus: e.target.value as ApplicationStatusType })
                                        }
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="Accepted">Accepted (Approved Student)</option>
                                        <option value="Pending">Pending (Under Review)</option>
                                        <option value="Rejected">Rejected (Unsuccessful)</option>
                                    </select>
                                </div>

                                {/* 3. Project Status & Template */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Project Allocation
                                    </label>
                                    <select
                                        value={config.projectStatus}
                                        onChange={(e) =>
                                            setConfig({ ...config, projectStatus: e.target.value as ProjectStatusType })
                                        }
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="Not Allocated">Project Not Allocated</option>
                                        <option value="Allocated">Project Allocated</option>
                                        <option value="In Progress">Project In Progress</option>
                                        <option value="Completed">Project Completed (100%)</option>
                                    </select>
                                </div>

                                {/* 4. Milestone 1 State */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                        Milestone 1 State
                                    </label>
                                    <select
                                        value={config.milestoneStatus}
                                        onChange={(e) =>
                                            setConfig({ ...config, milestoneStatus: e.target.value as MilestoneStatusType })
                                        }
                                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="Not Started">Not Started</option>
                                        <option value="Submitted">Submitted (Under Review)</option>
                                        <option value="Under Review">Under Review by Mentor</option>
                                        <option value="Revision Requested">Revision Requested</option>
                                        <option value="Approved">Approved (Progress Unlocked)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Specific Project Template Selector */}
                            {config.projectStatus !== "Not Allocated" && (
                                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2 flex-1">
                                        <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                                            Assigned Project:
                                        </span>
                                        <select
                                            value={config.projectTemplateId || activeDomainTemplates[0]?.id}
                                            onChange={(e) => setConfig({ ...config, projectTemplateId: e.target.value })}
                                            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none flex-1 max-w-lg"
                                        >
                                            {activeDomainTemplates.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    [{t.id}] {t.title} ({t.difficulty_level})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-mono">
                                        Zero database records modified • Isolated in session
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Interactive Frame Rendering Actual Student Dashboard */}
                        <div className="flex justify-center bg-slate-100/70 p-4 rounded-3xl border border-slate-200 min-h-[600px] overflow-hidden">
                            <div
                                className={`transition-all duration-300 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 flex flex-col ${
                                    viewport === "desktop"
                                        ? "w-full max-w-6xl"
                                        : viewport === "tablet"
                                        ? "w-[768px] max-w-full"
                                        : "w-[375px] max-w-full"
                                }`}
                                style={{ minHeight: "750px" }}
                            >
                                {/* Window Mock Chrome */}
                                <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs select-none">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                                            <div className="h-2.5 w-2.5 rounded-full bg-amber-500"></div>
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                                        </div>
                                        <span className="font-mono text-[11px] text-slate-400 ml-2">
                                            https://vectonix.in/internship/dashboard [Simulation Mode: {config.domain}]
                                        </span>
                                    </div>
                                    <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
                                        Active Simulator
                                    </span>
                                </div>

                                {/* Reused Production Student Dashboard Component */}
                                <div className="flex-1 overflow-y-auto">
                                    <SimulationProvider initialConfig={config}>
                                        <StudentDashboardContent />
                                    </SimulationProvider>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Diagnostic Audit & Bug Report */}
                {activeTab === "diagnostics" && (
                    <div className="p-6 space-y-6">
                        {/* Summary Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Passed Checks</span>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div className="text-2xl font-black text-emerald-900 mt-2">
                                    {diagnosticsResult?.passed ?? 0}
                                </div>
                                <span className="text-[11px] text-emerald-600 mt-1 block">Architecture &amp; specs verified</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Warnings</span>
                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                </div>
                                <div className="text-2xl font-black text-amber-900 mt-2">
                                    {diagnosticsResult?.warning ?? 0}
                                </div>
                                <span className="text-[11px] text-amber-600 mt-1 block">Non-blocking notices</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Failed Checks</span>
                                    <XCircle className="h-4 w-4 text-rose-600" />
                                </div>
                                <div className="text-2xl font-black text-rose-900 mt-2">
                                    {diagnosticsResult?.failed ?? 0}
                                </div>
                                <span className="text-[11px] text-rose-600 mt-1 block">Actionable defects</span>
                            </div>

                            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Total Tests</span>
                                    <Layers className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="text-2xl font-black text-indigo-900 mt-2">
                                    {diagnosticsResult?.totalChecks ?? 0}
                                </div>
                                <span className="text-[11px] text-indigo-600 mt-1 block">Across 6 domains</span>
                            </div>
                        </div>

                        {/* Controls Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                            <div className="flex items-center gap-3 flex-wrap text-xs">
                                <div className="flex items-center gap-1.5">
                                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="font-semibold text-slate-500">Status:</span>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-none"
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Open">Open</option>
                                        <option value="In progress">In Progress</option>
                                        <option value="Fixed">Fixed</option>
                                        <option value="Verified">Verified</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-slate-500">Severity:</span>
                                    <select
                                        value={severityFilter}
                                        onChange={(e) => setSeverityFilter(e.target.value)}
                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 outline-none"
                                    >
                                        <option value="All">All Severities</option>
                                        <option value="Critical">Critical</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleExportCSV}
                                    variant="outline"
                                    className="text-xs font-semibold flex items-center gap-1.5 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Export Audit Report (CSV)</span>
                                </Button>
                                <Button
                                    onClick={handleRunDiagnostics}
                                    disabled={diagnosticsRunning}
                                    className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 cursor-pointer"
                                >
                                    <RefreshCw className={`h-3.5 w-3.5 ${diagnosticsRunning ? "animate-spin" : ""}`} />
                                    <span>Re-Run All Checks</span>
                                </Button>
                            </div>
                        </div>

                        {/* Audit Issues Table */}
                        {filteredIssues.length === 0 ? (
                            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
                                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-900">Zero Detected Defects</h4>
                                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                                    All simulated checks across UI layouts, navigation, domain isolation, and milestone plans passed verification.
                                </p>
                            </div>
                        ) : (
                            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                                            <tr>
                                                <th className="py-3 px-4">Issue ID / Domain</th>
                                                <th className="py-3 px-4">Component &amp; Category</th>
                                                <th className="py-3 px-4">Description &amp; Suggested Fix</th>
                                                <th className="py-3 px-4">Severity</th>
                                                <th className="py-3 px-4">Status</th>
                                                <th className="py-3 px-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredIssues.map((iss) => (
                                                <tr key={iss.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="py-3.5 px-4 align-top">
                                                        <span className="font-mono font-bold text-slate-800 block text-[11px]">
                                                            {iss.id}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-indigo-600">
                                                            {iss.domain}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 align-top">
                                                        <span className="font-bold text-slate-800 block">{iss.component}</span>
                                                        <span className="text-[11px] text-slate-400">{iss.category}</span>
                                                    </td>
                                                    <td className="py-3.5 px-4 align-top max-w-md">
                                                        <p className="text-slate-800 font-medium leading-relaxed">
                                                            {iss.description}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 mt-1 italic">
                                                            Fix: {iss.suggestedFix}
                                                        </p>
                                                    </td>
                                                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                iss.severity === "Critical"
                                                                    ? "bg-red-100 text-red-800"
                                                                    : iss.severity === "High"
                                                                    ? "bg-amber-100 text-amber-800"
                                                                    : iss.severity === "Medium"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-slate-100 text-slate-700"
                                                            }`}
                                                        >
                                                            {iss.severity}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                                                        <select
                                                            value={iss.status}
                                                            onChange={(e) =>
                                                                handleUpdateIssueStatus(iss.id, e.target.value as IssueStatus)
                                                            }
                                                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 outline-none"
                                                        >
                                                            <option value="Open">Open</option>
                                                            <option value="In progress">In Progress</option>
                                                            <option value="Fixed">Fixed</option>
                                                            <option value="Verified">Verified</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleSelectDomain(iss.domain);
                                                                setActiveTab("preview");
                                                            }}
                                                            className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs transition-colors cursor-pointer"
                                                        >
                                                            Inspect in Sim &rarr;
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
