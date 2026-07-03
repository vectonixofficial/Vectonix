"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Search, Download, Edit2, Trash2, RefreshCw,
    Award, CheckCircle, XCircle, Eye, X, Upload, FileText, Briefcase
} from "lucide-react";
import CertificateCanvas, { CertificateCanvasRef, CertificateData } from "@/components/admin/CertificateCanvas";
import {
    Certificate,
    getCertificates,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    generateCertificateId,
    syncAllCertificates,
    DEFAULT_CERTIFICATES,
} from "@/lib/certificates";

const EMPTY_FORM: Omit<Certificate, "id" | "createdAt"> = {
    certificateId: "",
    studentName: "",
    collegeName: "",
    domain: "",
    startDate: "",
    endDate: "",
    issueDate: new Date().toISOString().split("T")[0],
    signatureImage: "",
    verificationStatus: "verified",
    type: "completion",
    designation: "Software Engineering Intern",
    stipend: "Performance-Based Stipend",
};

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | "completion" | "offer_letter">("all");
    const [showModal, setShowModal] = useState(false);
    const [previewModal, setPreviewModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importJsonText, setImportJsonText] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [previewData, setPreviewData] = useState<CertificateData | null>(null);
    const canvasRef = useRef<CertificateCanvasRef>(null);

    async function load() {
        setLoading(true);
        try {
            const data = await getCertificates();
            // Automatically seed missing default certificates into Firestore if the database is connected
            const missing = DEFAULT_CERTIFICATES.filter(
                (def) => !data.some((c) => c.certificateId === def.certificateId)
            );
            if (missing.length > 0) {
                console.log("Seeding missing default certificates into Firestore:", missing);
                for (const cert of missing) {
                    await addCertificate(cert);
                }
                const updatedData = await getCertificates();
                setCertificates(updatedData);
            } else {
                setCertificates(data);
            }
        } catch (e) {
            console.error("Firebase fetch error, falling back to local DEFAULT_CERTIFICATES:", e);
            setCertificates(
                DEFAULT_CERTIFICATES.map((c) => ({
                    ...c,
                    id: c.certificateId,
                })) as Certificate[]
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    async function openNew(type: "completion" | "offer_letter" = "completion") {
        const id = await generateCertificateId(type);
        setForm({
            ...EMPTY_FORM,
            type,
            certificateId: id,
            designation: type === "offer_letter" ? "Software Engineering Intern" : "",
            stipend: type === "offer_letter" ? "Performance-Based Stipend" : "",
        });
        setEditingId(null);
        setShowModal(true);
    }

    async function handleTypeChange(newType: "completion" | "offer_letter") {
        if (form.type === newType) return;
        const newId = await generateCertificateId(newType);
        setForm((f) => ({
            ...f,
            type: newType,
            certificateId: newId,
            designation: newType === "offer_letter" ? (f.designation || "Software Engineering Intern") : f.designation,
            stipend: newType === "offer_letter" ? (f.stipend || "Performance-Based Stipend") : f.stipend,
        }));
    }

    function openEdit(cert: Certificate) {
        const certType = cert.type ?? (cert.certificateId.includes("OFF") ? "offer_letter" : "completion");
        setForm({
            certificateId: cert.certificateId,
            studentName: cert.studentName,
            collegeName: cert.collegeName,
            domain: cert.domain,
            startDate: cert.startDate,
            endDate: cert.endDate,
            issueDate: cert.issueDate,
            signatureImage: cert.signatureImage ?? "",
            verificationStatus: cert.verificationStatus,
            type: certType,
            designation: cert.designation ?? (certType === "offer_letter" ? "Software Engineering Intern" : ""),
            stipend: cert.stipend ?? (certType === "offer_letter" ? "Performance-Based Stipend" : ""),
        });
        setEditingId(cert.id!);
        setShowModal(true);
    }

    function handleSigUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setForm((f) => ({ ...f, signatureImage: ev.target?.result as string }));
        };
        reader.readAsDataURL(file);
    }

    async function handleSave() {
        if (!form.studentName || !form.collegeName || !form.domain) return;
        setSaving(true);
        try {
            if (editingId) {
                await updateCertificate(editingId, form);
            } else {
                await addCertificate(form);
            }
            setShowModal(false);
            await load();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(cert: Certificate) {
        const docName = (cert.type === "offer_letter" || cert.certificateId.includes("OFF")) ? "offer letter" : "certificate";
        if (!confirm(`Delete ${docName} for ${cert.studentName}?`)) return;
        await deleteCertificate(cert.id!);
        await load();
    }

    async function handleRegenId(cert: Certificate) {
        const certType = cert.type ?? (cert.certificateId.includes("OFF") ? "offer_letter" : "completion");
        const newId = await generateCertificateId(certType);
        await updateCertificate(cert.id!, { certificateId: newId });
        await load();
    }

    async function handleDownload(cert: Certificate) {
        const certType = cert.type ?? (cert.certificateId.includes("OFF") ? "offer_letter" : "completion");
        setPreviewData({
            studentName: cert.studentName,
            collegeName: cert.collegeName,
            domain: cert.domain,
            startDate: cert.startDate,
            endDate: cert.endDate,
            issueDate: cert.issueDate,
            certificateId: cert.certificateId,
            signatureImage: cert.signatureImage,
            type: certType,
            designation: cert.designation,
            stipend: cert.stipend,
        });
        setPreviewModal(true);
    }

    const filtered = certificates.filter((c) => {
        const certType = c.type ?? (c.certificateId.includes("OFF") ? "offer_letter" : "completion");
        if (activeTab === "completion" && certType !== "completion") return false;
        if (activeTab === "offer_letter" && certType !== "offer_letter") return false;

        return [c.studentName, c.collegeName, c.domain, c.certificateId, c.designation ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase());
    });

    const completionCount = certificates.filter(c => (c.type ?? (c.certificateId.includes("OFF") ? "offer_letter" : "completion")) === "completion").length;
    const offerLetterCount = certificates.filter(c => (c.type ?? (c.certificateId.includes("OFF") ? "offer_letter" : "completion")) === "offer_letter").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-900">
                        <Award className="text-indigo-600 h-8 w-8" />
                        Certificates & Offer Letters
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Generate, manage, preview, and verify internship certificates & official offer letters.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        id="sync-supabase-btn"
                        onClick={async () => {
                            if (certificates.length === 0) return alert("No certificates loaded to sync.");
                            setLoading(true);
                            try {
                                const syncedCount = await syncAllCertificates(certificates);
                                alert(`Successfully synced ${syncedCount} certificates to Supabase!`);
                                await load();
                            } catch (err: any) {
                                alert(`Sync failed: ${err.message}`);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md cursor-pointer text-sm"
                    >
                        <RefreshCw className="h-4 w-4" /> Sync to Supabase ({certificates.length})
                    </button>
                    <button
                        id="import-json-btn"
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md cursor-pointer text-sm"
                    >
                        <Upload className="h-4 w-4" /> Import Batch JSON
                    </button>
                    <button
                        id="add-offer-letter-btn"
                        onClick={() => openNew("offer_letter")}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md cursor-pointer text-sm"
                    >
                        <FileText className="h-4 w-4" /> Add Offer Letter
                    </button>
                    <button
                        id="add-certificate-btn"
                        onClick={() => openNew("completion")}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md cursor-pointer text-sm"
                    >
                        <Plus className="h-4 w-4" /> Add Certificate
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Issued", value: certificates.length, color: "text-indigo-600" },
                    { label: "Completion Certs", value: completionCount, color: "text-sky-600" },
                    { label: "Offer Letters", value: offerLetterCount, color: "text-purple-600" },
                    { label: "Verified", value: certificates.filter(c => c.verificationStatus === "verified").length, color: "text-emerald-600" },
                ].map((s) => (
                    <div key={s.label} className="glass-panel p-5">
                        <p className="text-sm text-slate-500">{s.label}</p>
                        <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Filter Tabs */}
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-fit">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        All Documents ({certificates.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("completion")}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeTab === "completion" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Completion Certificates ({completionCount})
                    </button>
                    <button
                        onClick={() => setActiveTab("offer_letter")}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeTab === "offer_letter" ? "bg-purple-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        Offer Letters ({offerLetterCount})
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        id="cert-search"
                        type="text"
                        placeholder="Search by student, college, domain or ID…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="glass-panel overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600 border-b-2 border-indigo-100" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <Award className="h-12 w-12 mx-auto mb-3 opacity-30 text-slate-300" />
                        <p>No documents found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-500 text-xs uppercase">
                                    <th className="px-5 py-4">Document ID</th>
                                    <th className="px-5 py-4">Type</th>
                                    <th className="px-5 py-4">Student</th>
                                    <th className="px-5 py-4">College</th>
                                    <th className="px-5 py-4">Domain / Position</th>
                                    <th className="px-5 py-4">Duration</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((cert) => {
                                    const certType = cert.type ?? (cert.certificateId.includes("OFF") ? "offer_letter" : "completion");
                                    const isOffer = certType === "offer_letter";
                                    return (
                                        <motion.tr
                                            key={cert.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-slate-50/50 bg-white transition-colors"
                                        >
                                            <td className="px-5 py-4 font-mono text-indigo-600 font-semibold">
                                                {cert.certificateId}
                                            </td>
                                            <td className="px-5 py-4">
                                                {isOffer ? (
                                                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                        <FileText className="h-3 w-3" /> Offer Letter
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                        <Award className="h-3 w-3" /> Certificate
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-slate-900">{cert.studentName}</td>
                                            <td className="px-5 py-4 text-slate-700 max-w-[180px] truncate">{cert.collegeName}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-900 font-medium text-xs">
                                                        {cert.domain}
                                                    </span>
                                                    {isOffer && cert.designation && (
                                                        <span className="text-purple-600 text-[11px] font-medium">
                                                            {cert.designation}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500 text-xs">
                                                {cert.startDate} → {cert.endDate}
                                            </td>
                                            <td className="px-5 py-4">
                                                {cert.verificationStatus === "verified" ? (
                                                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                                                        <CheckCircle className="h-3 w-3" /> Verified
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-600 text-xs font-semibold">
                                                        <XCircle className="h-3 w-3" /> Revoked
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        title="Preview & Download PDF"
                                                        onClick={() => handleDownload(cert)}
                                                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors cursor-pointer"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        title="Edit"
                                                        onClick={() => openEdit(cert)}
                                                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors cursor-pointer"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        title="Re-generate ID"
                                                        onClick={() => handleRegenId(cert)}
                                                        className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors cursor-pointer"
                                                    >
                                                        <RefreshCw className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        title="Delete"
                                                        onClick={() => handleDelete(cert)}
                                                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-200">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingId ? "Edit Document" : form.type === "offer_letter" ? "Add Internship Offer Letter" : "Add Internship Certificate"}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="cursor-pointer">
                                    <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Document Type Switcher */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-2">Document Type *</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange("completion")}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all cursor-pointer ${
                                                form.type === "completion"
                                                    ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            <Award className="h-4 w-4" /> Completion Certificate
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleTypeChange("offer_letter")}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold text-sm transition-all cursor-pointer ${
                                                form.type === "offer_letter"
                                                    ? "bg-purple-50 border-purple-500 text-purple-700 shadow-sm"
                                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            <FileText className="h-4 w-4" /> Internship Offer Letter
                                        </button>
                                    </div>
                                </div>

                                {/* Certificate ID */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Document Reference ID</label>
                                    <input
                                        id="cert-id-input"
                                        value={form.certificateId}
                                        onChange={(e) => setForm((f) => ({ ...f, certificateId: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-indigo-600 font-bold font-mono focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* Student Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Candidate / Student Name *</label>
                                    <input
                                        id="student-name-input"
                                        value={form.studentName}
                                        onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
                                        placeholder="Full Name (e.g. Mr. / Ms. Candidate Name)"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* College */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">College / University *</label>
                                    <input
                                        id="college-input"
                                        value={form.collegeName}
                                        onChange={(e) => setForm((f) => ({ ...f, collegeName: e.target.value }))}
                                        placeholder="College or University Name"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* Domain & Designation */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Domain / Field *</label>
                                        <input
                                            id="domain-input"
                                            value={form.domain}
                                            onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                                            placeholder="e.g. Full Stack Web Development, AI/ML…"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    {form.type === "offer_letter" ? (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Designation / Role Title</label>
                                            <input
                                                id="designation-input"
                                                value={form.designation ?? ""}
                                                onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                                                placeholder="e.g. Software Engineering Intern"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                            />
                                        </div>
                                    ) : null}
                                </div>

                                {/* Offer Letter Stipend Terms */}
                                {form.type === "offer_letter" && (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Stipend & Terms Summary</label>
                                        <input
                                            id="stipend-input"
                                            value={form.stipend ?? ""}
                                            onChange={(e) => setForm((f) => ({ ...f, stipend: e.target.value }))}
                                            placeholder="e.g. Performance-Based Stipend / Unpaid Training Program"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                )}

                                {/* Dates */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                                        <input
                                            id="start-date-input"
                                            type="date"
                                            value={form.startDate}
                                            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                                        <input
                                            id="end-date-input"
                                            type="date"
                                            value={form.endDate}
                                            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Issue Date</label>
                                        <input
                                            id="issue-date-input"
                                            type="date"
                                            value={form.issueDate}
                                            onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                {/* Signature */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Signature Image</label>
                                    <label
                                        id="signature-upload-label"
                                        className="flex items-center gap-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg px-4 py-3 cursor-pointer hover:border-indigo-500 transition-colors"
                                    >
                                        <Upload className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm text-slate-500">
                                            {form.signatureImage ? "✓ Signature loaded" : "Upload PNG/JPG signature"}
                                        </span>
                                        <input
                                            id="signature-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleSigUpload}
                                        />
                                    </label>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Verification Status</label>
                                    <select
                                        id="status-select"
                                        value={form.verificationStatus}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                verificationStatus: e.target.value as "verified" | "revoked",
                                            }))
                                        }
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="verified">Verified</option>
                                        <option value="revoked">Revoked</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    id="save-certificate-btn"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`flex items-center gap-2 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer ${
                                        form.type === "offer_letter" ? "bg-purple-600 hover:bg-purple-700" : "bg-indigo-600 hover:bg-indigo-700"
                                    }`}
                                >
                                    {saving ? (
                                        <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                                    ) : (
                                        <Award className="h-4 w-4" />
                                    )}
                                    {saving ? "Saving…" : editingId ? "Update Document" : form.type === "offer_letter" ? "Generate Offer Letter" : "Generate Certificate"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview / Download Modal */}
            <AnimatePresence>
                {previewModal && previewData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-2xl"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-slate-200">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    {previewData.type === "offer_letter" ? (
                                        <>
                                            <FileText className="h-5 w-5 text-purple-600" /> Offer Letter Preview
                                        </>
                                    ) : (
                                        <>
                                            <Award className="h-5 w-5 text-indigo-600" /> Certificate Preview
                                        </>
                                    )}
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        id="download-pdf-btn"
                                        onClick={() => canvasRef.current?.downloadPDF()}
                                        className={`flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer ${
                                            previewData.type === "offer_letter" ? "bg-purple-600 hover:bg-purple-700" : "bg-indigo-600 hover:bg-indigo-700"
                                        }`}
                                    >
                                        <Download className="h-4 w-4" /> Download PDF
                                    </button>
                                    <button onClick={() => setPreviewModal(false)} className="cursor-pointer p-1">
                                        <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 flex justify-center overflow-x-auto bg-slate-50">
                                <CertificateCanvas
                                    ref={canvasRef}
                                    data={previewData}
                                    scale={0.62}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Batch Import JSON Modal */}
            <AnimatePresence>
                {showImportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-indigo-600" /> Seed & Import Certificates JSON
                                </h2>
                                <button onClick={() => setShowImportModal(false)} className="cursor-pointer p-1">
                                    <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                </button>
                            </div>

                            <p className="text-xs text-slate-500">
                                Paste a JSON array containing all 59 certificates or select a `.json` file from your device to seed them into Supabase immediately.
                            </p>

                            <div className="flex items-center gap-3">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const r = new FileReader();
                                            r.onload = (ev) => setImportJsonText(ev.target?.result as string || "");
                                            r.readAsText(file);
                                        }
                                    }}
                                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                                />
                            </div>

                            <textarea
                                rows={8}
                                placeholder='Paste JSON array here... e.g. [{"certificateId": "VT/INT/FS/2026/0001", "studentName": "...", ...}]'
                                value={importJsonText}
                                onChange={(e) => setImportJsonText(e.target.value)}
                                className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                            />

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const parsed = JSON.parse(importJsonText);
                                            if (!Array.isArray(parsed)) return alert("JSON must be an array of certificate objects.");
                                            setLoading(true);
                                            const count = await syncAllCertificates(parsed);
                                            alert(`Successfully imported & seeded ${count} certificates to Supabase!`);
                                            setShowImportModal(false);
                                            setImportJsonText("");
                                            await load();
                                        } catch (e: any) {
                                            alert("Import error: " + e.message);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer"
                                >
                                    Seed to Supabase
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
