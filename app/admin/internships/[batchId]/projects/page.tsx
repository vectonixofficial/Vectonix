"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    FolderKanban,
    Plus,
    Search,
    Filter,
    Edit3,
    Trash2,
    Eye,
    ChevronDown,
    ExternalLink,
    Code,
    Shield,
    TrendingUp,
    Sparkles,
    CheckCircle2,
    Clock,
    FileText,
    ArrowLeft,
    X,
    BookOpen,
    Layers,
    Target,
    Brain,
    Bot,
    FlaskConical,
    Copy,
    Cpu,
    CheckSquare,
    ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { projectBankService, normalizeDomain } from "@/lib/project-bank";
import { ProjectTemplate, ProjectDifficulty } from "@/lib/supabase";

export default function AdminProjectBankPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = (params?.batchId as string) || "wi26";

    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [domainFilter, setDomainFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [difficultyFilter, setDifficultyFilter] = useState("all");

    // Modals
    const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
    const [editingTemplate, setEditingTemplate] = useState<Partial<ProjectTemplate> | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const data = await projectBankService.getProjectTemplates();
            setTemplates(data);
        } catch (err) {
            console.error("Error loading project templates:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const handleSaveTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTemplate?.title || !editingTemplate?.domain) {
            alert("Please provide both title and domain.");
            return;
        }

        setSaveLoading(true);
        try {
            const res = await projectBankService.saveProjectTemplate(editingTemplate as any);
            if (res.success) {
                showToast(isCreating ? "Project template created successfully!" : "Project template updated!");
                setEditingTemplate(null);
                setIsCreating(false);
                await loadTemplates();
            } else {
                alert(`Error saving template: ${res.error}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDeleteTemplate = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete or archive project template "${title}"?`)) {
            return;
        }
        try {
            const res = await projectBankService.deleteProjectTemplate(id);
            if (res.success) {
                showToast("Project template archived / deleted.");
                await loadTemplates();
                if (selectedTemplate?.id === id) setSelectedTemplate(null);
            } else {
                alert(`Could not delete: ${res.error}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDuplicateTemplate = async (id: string, title: string) => {
        try {
            const res = await projectBankService.duplicateProjectTemplate(id);
            if (res.success) {
                showToast(`Project "${title}" duplicated successfully!`);
                await loadTemplates();
            } else {
                alert(`Could not duplicate: ${res.error}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        }
    };

    // Filter logic
    const filteredTemplates = templates.filter((t) => {
        const matchesDomain =
            domainFilter === "all" ||
            normalizeDomain(t.domain) === normalizeDomain(domainFilter);

        const matchesDifficulty =
            difficultyFilter === "all" ||
            t.difficulty_level.toLowerCase() === difficultyFilter.toLowerCase();

        const search = searchTerm.toLowerCase();
        const matchesSearch =
            !search ||
            t.id.toLowerCase().includes(search) ||
            t.title.toLowerCase().includes(search) ||
            t.short_description.toLowerCase().includes(search) ||
            t.domain.toLowerCase().includes(search) ||
            (t.tech_stack && t.tech_stack.some((k) => k.toLowerCase().includes(search)));

        return matchesDomain && matchesDifficulty && matchesSearch;
    });

    const getDomainBadge = (domain: string) => {
        const norm = normalizeDomain(domain);
        if (norm === "Full Stack Development") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <Code className="h-3 w-3" />
                    Full Stack
                </span>
            );
        }
        if (norm === "AI / Machine Learning") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                    <Brain className="h-3 w-3" />
                    AI / ML
                </span>
            );
        }
        if (norm === "Cybersecurity") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Shield className="h-3 w-3" />
                    Cybersecurity
                </span>
            );
        }
        if (norm === "Robotics") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                    <Bot className="h-3 w-3" />
                    Robotics
                </span>
            );
        }
        if (norm === "Software Testing and Automation") {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                    <FlaskConical className="h-3 w-3" />
                    Software Testing
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                <TrendingUp className="h-3 w-3" />
                Digital Marketing
            </span>
        );
    };

    const getDifficultyBadge = (difficulty: ProjectDifficulty) => {
        if (difficulty === "Beginner") {
            return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">Beginner</span>;
        }
        if (difficulty === "Advanced") {
            return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 text-rose-800">Advanced</span>;
        }
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-100 text-blue-800">Intermediate</span>;
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Toast notification */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 text-sm animate-in fade-in slide-in-from-bottom-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Top Navigation & Breadcrumbs */}
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
                                <FolderKanban className="h-5 w-5" />
                            </span>
                            <h1 className="text-2xl font-bold text-slate-900">Project Bank</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                WI26
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Standardized bank of {templates.length} industry-grade capstone projects across AI/ML, Robotics, Software Testing, Full Stack, Cybersecurity, and Digital Marketing.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/internships/${batchId}/allocations`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
                    >
                        <Layers className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Project Allocations</span>
                    </Link>

                    <Button
                        onClick={() => {
                            setEditingTemplate({
                                title: "",
                                domain: "AI / Machine Learning",
                                short_description: "",
                                problem_statement: "",
                                objectives: [],
                                requirements: [],
                                expected_features: [],
                                tech_stack: [],
                                difficulty_level: "Intermediate",
                                expected_deliverables: [],
                                duration_weeks: 4,
                                evaluation_criteria: [],
                                reference_materials: [],
                                is_active: true
                            });
                            setIsCreating(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Project Template</span>
                    </Button>
                </div>
            </div>

            {/* Quick Domain Counters Grid (6 Domains) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <button
                    onClick={() => setDomainFilter(domainFilter === "Full Stack Development" ? "all" : "Full Stack Development")}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                        normalizeDomain(domainFilter) === "Full Stack Development"
                            ? "border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Full Stack</span>
                        <Code className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="mt-1.5 text-xl font-bold text-slate-900">
                        {templates.filter((t) => normalizeDomain(t.domain) === "Full Stack Development").length}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">Campus portals, queues, SaaS</p>
                </button>

                <button
                    onClick={() => setDomainFilter(domainFilter === "AI / Machine Learning" ? "all" : "AI / Machine Learning")}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                        normalizeDomain(domainFilter) === "AI / Machine Learning"
                            ? "border-violet-600 bg-violet-50/70 shadow-sm ring-1 ring-violet-500"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AI / ML</span>
                        <Brain className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="mt-1.5 text-xl font-bold text-slate-900">
                        {templates.filter((t) => normalizeDomain(t.domain) === "AI / Machine Learning").length}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">NLP, Chatbots, YOLO, RAG</p>
                </button>

                <button
                    onClick={() => setDomainFilter(domainFilter === "Robotics" ? "all" : "Robotics")}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                        normalizeDomain(domainFilter) === "Robotics"
                            ? "border-cyan-600 bg-cyan-50/70 shadow-sm ring-1 ring-cyan-500"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Robotics</span>
                        <Bot className="h-4 w-4 text-cyan-600" />
                    </div>
                    <div className="mt-1.5 text-xl font-bold text-slate-900">
                        {templates.filter((t) => normalizeDomain(t.domain) === "Robotics").length}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">ROS 2, Gazebo, SLAM, Arms</p>
                </button>

                <button
                    onClick={() => setDomainFilter(domainFilter === "Software Testing and Automation" ? "all" : "Software Testing and Automation")}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                        normalizeDomain(domainFilter) === "Software Testing and Automation"
                            ? "border-amber-600 bg-amber-50/70 shadow-sm ring-1 ring-amber-500"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Testing & QA</span>
                        <FlaskConical className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="mt-1.5 text-xl font-bold text-slate-900">
                        {templates.filter((t) => normalizeDomain(t.domain) === "Software Testing and Automation").length}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">Selenium, Pytest, JMeter, CI</p>
                </button>

                <button
                    onClick={() => setDomainFilter(domainFilter === "Cybersecurity" ? "all" : "Cybersecurity")}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                        normalizeDomain(domainFilter) === "Cybersecurity"
                            ? "border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cybersecurity</span>
                        <Shield className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="mt-1.5 text-xl font-bold text-slate-900">
                        {templates.filter((t) => normalizeDomain(t.domain) === "Cybersecurity").length}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">Phishing, SIEM, FIM, Scanner</p>
                </button>

                <button
                    onClick={() => setDomainFilter(domainFilter === "Digital Marketing" ? "all" : "Digital Marketing")}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                        normalizeDomain(domainFilter) === "Digital Marketing"
                            ? "border-rose-600 bg-rose-50/70 shadow-sm ring-1 ring-rose-500"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Marketing</span>
                        <TrendingUp className="h-4 w-4 text-rose-600" />
                    </div>
                    <div className="mt-1.5 text-xl font-bold text-slate-900">
                        {templates.filter((t) => normalizeDomain(t.domain) === "Digital Marketing").length}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">Growth, SEO, Funnels, Ads</p>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1">
                    <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search project ID (e.g. AI-ML-01, ROB-02, STA-04), title, tech stack..."
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
                            <option value="all">All Domains ({templates.length})</option>
                            <option value="AI / Machine Learning">AI / Machine Learning (6)</option>
                            <option value="Robotics">Robotics (6)</option>
                            <option value="Software Testing and Automation">Software Testing & Automation (6)</option>
                            <option value="Full Stack Development">Full Stack Development (6)</option>
                            <option value="Cybersecurity">Cybersecurity (6)</option>
                            <option value="Digital Marketing">Digital Marketing (6)</option>
                        </select>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={difficultyFilter}
                            onChange={(e) => setDifficultyFilter(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 py-2 pr-8 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="all">All Difficulties</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>

                    {(domainFilter !== "all" || difficultyFilter !== "all" || searchTerm) && (
                        <button
                            onClick={() => {
                                setDomainFilter("all");
                                setDifficultyFilter("all");
                                setSearchTerm("");
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Project Templates Grid */}
            {loading ? (
                <div className="py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-r-transparent"></div>
                    <p className="mt-3 text-xs text-slate-500">Loading project bank...</p>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                    <FolderKanban className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-slate-800">No project templates found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        No projects match your current filters. Clear the search filters or add a new project template.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    {getDomainBadge(template.domain)}
                                    {getDifficultyBadge(template.difficulty_level)}
                                </div>

                                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                    {template.title}
                                </h3>

                                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                                    {template.short_description || template.problem_statement}
                                </p>

                                {/* Tech Stack Tags */}
                                {template.tech_stack && template.tech_stack.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {template.tech_stack.slice(0, 3).map((tech, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                        {template.tech_stack.length > 3 && (
                                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500">
                                                +{template.tech_stack.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{template.duration_weeks || 4} Weeks</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setSelectedTemplate(template)}
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        title="View Full Specification"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>

                                    <button
                                        onClick={() => handleDuplicateTemplate(template.id, template.title)}
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        title="Duplicate Project"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEditingTemplate(template);
                                            setIsCreating(false);
                                        }}
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        title="Edit Project"
                                    >
                                        <Edit3 className="h-4 w-4" />
                                    </button>

                                    <button
                                        onClick={() => handleDeleteTemplate(template.id, template.title)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                        title="Archive/Delete Project"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FULL SPECIFICATION MODAL */}
            <AnimatePresence>
                {selectedTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        {getDomainBadge(selectedTemplate.domain)}
                                        {getDifficultyBadge(selectedTemplate.difficulty_level)}
                                        <span className="text-xs text-slate-500 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">
                                            ID: {selectedTemplate.id}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">{selectedTemplate.title}</h2>
                                    <p className="text-xs text-slate-500 mt-1">{selectedTemplate.short_description}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-6 py-6 text-xs text-slate-700">
                                {/* Problem Statement */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Target className="h-4 w-4 text-indigo-600" />
                                        Problem Statement
                                    </h4>
                                    <p className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed font-sans">
                                        {selectedTemplate.problem_statement}
                                    </p>
                                </div>

                                {/* Objectives & Deliverables */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                            Project Objectives
                                        </h4>
                                        <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                                            {selectedTemplate.objectives?.map((obj, i) => (
                                                <li key={i}>{obj}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                                            Expected Deliverables
                                        </h4>
                                        <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                                            {selectedTemplate.expected_deliverables?.map((del, i) => (
                                                <li key={i}>{del}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Learning Outcomes & Prerequisites */}
                                {(selectedTemplate.learning_outcomes?.length || selectedTemplate.prerequisites?.length) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedTemplate.learning_outcomes && selectedTemplate.learning_outcomes.length > 0 && (
                                            <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/70">
                                                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                    <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                                                    Learning Outcomes
                                                </h4>
                                                <ul className="list-disc list-inside space-y-1.5 text-emerald-900">
                                                    {selectedTemplate.learning_outcomes.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {selectedTemplate.prerequisites && selectedTemplate.prerequisites.length > 0 && (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                    <ListChecks className="h-3.5 w-3.5 text-indigo-600" />
                                                    Prerequisites & Skill Requirements
                                                </h4>
                                                <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                                                    {selectedTemplate.prerequisites.map((req, i) => (
                                                        <li key={i}>{req}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Functional & Non-Functional Requirements */}
                                {(selectedTemplate.functional_requirements?.length || selectedTemplate.non_functional_requirements?.length) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedTemplate.functional_requirements && selectedTemplate.functional_requirements.length > 0 && (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                                                    Functional Requirements
                                                </h4>
                                                <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                                                    {selectedTemplate.functional_requirements.map((fr, i) => (
                                                        <li key={i}>{fr}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {selectedTemplate.non_functional_requirements && selectedTemplate.non_functional_requirements.length > 0 && (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                                                    Non-Functional Requirements & Safety
                                                </h4>
                                                <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                                                    {selectedTemplate.non_functional_requirements.map((nfr, i) => (
                                                        <li key={i}>{nfr}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Robotics Simulation & Hardware Policy */}
                                {selectedTemplate.simulation_policy && (
                                    <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 text-cyan-950 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Bot className="h-4 w-4 text-cyan-700" />
                                            <h4 className="text-xs font-bold text-cyan-900 uppercase tracking-wider">
                                                Robotics Hardware & Simulation Policy (Simulation-First)
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                                            <div className="bg-white/80 p-2.5 rounded-xl border border-cyan-200/50">
                                                <strong className="block text-cyan-900 mb-0.5">Free Simulation Alternative:</strong>
                                                <span>{selectedTemplate.simulation_policy.free_simulation_alternative}</span>
                                            </div>
                                            <div className="bg-white/80 p-2.5 rounded-xl border border-cyan-200/50">
                                                <strong className="block text-cyan-900 mb-0.5">Minimum Software Requirements:</strong>
                                                <span>{selectedTemplate.simulation_policy.minimum_software}</span>
                                            </div>
                                            <div className="bg-white/80 p-2.5 rounded-xl border border-cyan-200/50">
                                                <strong className="block text-cyan-900 mb-0.5">Expected Simulation Output:</strong>
                                                <span>{selectedTemplate.simulation_policy.expected_simulation_output}</span>
                                            </div>
                                            <div className="bg-white/80 p-2.5 rounded-xl border border-cyan-200/50">
                                                <strong className="block text-cyan-900 mb-0.5">Optional Hardware Extension:</strong>
                                                <span>{selectedTemplate.simulation_policy.optional_hardware}</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-cyan-800 italic">
                                            Note: Interns are NOT required to purchase hardware. Complete evaluation can be achieved using 100% free simulation software.
                                        </p>
                                    </div>
                                )}

                                {/* Four-Milestone Internship Structure Preview */}
                                {selectedTemplate.milestone_descriptions && selectedTemplate.milestone_descriptions.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-indigo-600" />
                                            Four-Milestone Internship Plan Preview
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {selectedTemplate.milestone_descriptions.map((m) => (
                                                <div key={m.milestone} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-indigo-700 text-xs">Milestone {m.milestone}</span>
                                                        <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-medium">Sprint {m.milestone}</span>
                                                    </div>
                                                    <p className="font-semibold text-slate-800 text-[11px]">{m.title}</p>
                                                    <p className="text-[11px] text-slate-500">{m.description}</p>
                                                    {m.tasks && m.tasks.length > 0 && (
                                                        <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5 pt-1">
                                                            {m.tasks.slice(0, 3).map((task, idx) => (
                                                                <li key={idx} className="truncate">{task}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    <div className="pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-500">
                                                        <strong>Deliverables: </strong>{m.deliverables}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Expected Features */}
                                {selectedTemplate.expected_features && selectedTemplate.expected_features.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                                            Detailed Feature Requirements & Scope
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {selectedTemplate.expected_features.map((feat, i) => (
                                                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-50/40 border border-indigo-100/60 text-slate-700">
                                                    <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                                                    <span>{feat}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommended Tech Stack */}
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                                        Recommended Tech Stack / Tools
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTemplate.tech_stack?.map((t, i) => (
                                            <span key={i} className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Evaluation Rubrics */}
                                {selectedTemplate.evaluation_criteria && selectedTemplate.evaluation_criteria.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                                            Evaluation Rubrics
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {selectedTemplate.evaluation_criteria.map((crit, i) => (
                                                <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">
                                                    {crit}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reference Materials (Official Documentation) */}
                                {selectedTemplate.reference_materials && selectedTemplate.reference_materials.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <ExternalLink className="h-3.5 w-3.5 text-indigo-600" />
                                            Reference Documentation & Resources
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTemplate.reference_materials.map((ref, i) => (
                                                <a
                                                    key={i}
                                                    href={ref}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition-colors"
                                                >
                                                    <span>{ref.replace("https://", "")}</span>
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                                <Link
                                    href={`/admin/internships/${batchId}/allocations?project=${selectedTemplate.id}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                                >
                                    <Layers className="h-3.5 w-3.5" />
                                    <span>Assign to Candidate</span>
                                </Link>

                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedTemplate(null)}
                                    className="px-4 py-2 text-xs"
                                >
                                    Close
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CREATE / EDIT PROJECT TEMPLATE MODAL */}
            <AnimatePresence>
                {editingTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                                <h2 className="text-lg font-bold text-slate-900">
                                    {isCreating ? "Create Project Template" : "Edit Project Template"}
                                </h2>
                                <button
                                    onClick={() => setEditingTemplate(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Project Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingTemplate.title || ""}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                                        placeholder="e.g. Smart Queue & Appointment Management"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Domain *</label>
                                        <select
                                            value={editingTemplate.domain || "AI / Machine Learning"}
                                            onChange={(e) => setEditingTemplate({ ...editingTemplate, domain: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none bg-white"
                                        >
                                            <option value="AI / Machine Learning">AI / Machine Learning</option>
                                            <option value="Robotics">Robotics</option>
                                            <option value="Software Testing and Automation">Software Testing and Automation</option>
                                            <option value="Full Stack Development">Full Stack Development</option>
                                            <option value="Cybersecurity">Cybersecurity</option>
                                            <option value="Digital Marketing">Digital Marketing</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">Difficulty Level</label>
                                        <select
                                            value={editingTemplate.difficulty_level || "Intermediate"}
                                            onChange={(e) => setEditingTemplate({ ...editingTemplate, difficulty_level: e.target.value as any })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none bg-white"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
                                    <textarea
                                        rows={2}
                                        value={editingTemplate.short_description || ""}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, short_description: e.target.value })}
                                        placeholder="A one-sentence summary for the student card..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Problem Statement</label>
                                    <textarea
                                        rows={3}
                                        value={editingTemplate.problem_statement || ""}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, problem_statement: e.target.value })}
                                        placeholder="Detailed industrial problem this project addresses..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">Tech Stack (comma separated)</label>
                                    <input
                                        type="text"
                                        value={(editingTemplate.tech_stack || []).join(", ")}
                                        onChange={(e) => setEditingTemplate({
                                            ...editingTemplate,
                                            tech_stack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                                        })}
                                        placeholder="e.g. Next.js, TypeScript, Tailwind CSS, Supabase"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingTemplate(null)}
                                        className="px-4 py-2 text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={saveLoading}
                                        className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {saveLoading ? "Saving..." : isCreating ? "Create Template" : "Save Changes"}
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

