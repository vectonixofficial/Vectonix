"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Search, Download, Edit2, Trash2, RefreshCw,
    Award, CheckCircle, XCircle, Eye, X, Upload,
} from "lucide-react";
import CertificateCanvas, { CertificateCanvasRef, CertificateData } from "@/components/admin/CertificateCanvas";
import {
    Certificate,
    getCertificates,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    generateCertificateId,
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
};

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [previewModal, setPreviewModal] = useState(false);
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

    async function openNew() {
        const id = await generateCertificateId();
        setForm({ ...EMPTY_FORM, certificateId: id });
        setEditingId(null);
        setShowModal(true);
    }

    function openEdit(cert: Certificate) {
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
        if (!confirm(`Delete certificate for ${cert.studentName}?`)) return;
        await deleteCertificate(cert.id!);
        await load();
    }

    async function handleRegenId(cert: Certificate) {
        const newId = await generateCertificateId();
        await updateCertificate(cert.id!, { certificateId: newId });
        await load();
    }

    async function handleDownload(cert: Certificate) {
        setPreviewData({
            studentName: cert.studentName,
            collegeName: cert.collegeName,
            domain: cert.domain,
            startDate: cert.startDate,
            endDate: cert.endDate,
            issueDate: cert.issueDate,
            certificateId: cert.certificateId,
            signatureImage: cert.signatureImage,
        });
        setPreviewModal(true);
    }

    const filtered = certificates.filter((c) =>
        [c.studentName, c.collegeName, c.domain, c.certificateId]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-900">
                        <Award className="text-indigo-600 h-8 w-8" />
                        Certificates
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Generate, manage and verify internship certificates.
                    </p>
                </div>
                <button
                    id="add-certificate-btn"
                    onClick={openNew}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md cursor-pointer"
                >
                    <Plus className="h-4 w-4" /> Add Student
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Certificates", value: certificates.length, color: "text-indigo-600" },
                    { label: "Verified", value: certificates.filter(c => c.verificationStatus === "verified").length, color: "text-emerald-600" },
                    { label: "Revoked", value: certificates.filter(c => c.verificationStatus === "revoked").length, color: "text-red-600" },
                ].map((s) => (
                    <div key={s.label} className="glass-panel p-5">
                        <p className="text-sm text-slate-500">{s.label}</p>
                        <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    id="cert-search"
                    type="text"
                    placeholder="Search by name, college, domain or ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
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
                        <p>No certificates found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-100 text-slate-500 text-xs uppercase">
                                    <th className="px-5 py-4">Certificate ID</th>
                                    <th className="px-5 py-4">Student</th>
                                    <th className="px-5 py-4">College</th>
                                    <th className="px-5 py-4">Domain</th>
                                    <th className="px-5 py-4">Duration</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((cert) => (
                                    <motion.tr
                                        key={cert.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50/50 bg-white transition-colors"
                                    >
                                        <td className="px-5 py-4 font-mono text-indigo-600 font-semibold">
                                            {cert.certificateId}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-slate-900">{cert.studentName}</td>
                                        <td className="px-5 py-4 text-slate-700 max-w-[180px] truncate">{cert.collegeName}</td>
                                        <td className="px-5 py-4">
                                            <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                {cert.domain}
                                            </span>
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
                                                    title="Preview & Download"
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
                                ))}
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
                                    {editingId ? "Edit Certificate" : "Add New Certificate"}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="cursor-pointer">
                                    <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Certificate ID */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Certificate ID</label>
                                    <input
                                        id="cert-id-input"
                                        value={form.certificateId}
                                        onChange={(e) => setForm((f) => ({ ...f, certificateId: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-indigo-600 font-bold font-mono focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

                                {/* Student Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Student Name *</label>
                                    <input
                                        id="student-name-input"
                                        value={form.studentName}
                                        onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
                                        placeholder="Mr. / Ms. Full Name"
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

                                {/* Domain */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Domain / Field *</label>
                                    <input
                                        id="domain-input"
                                        value={form.domain}
                                        onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                                        placeholder="e.g. Web Development, AI/ML…"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>

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
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
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
                                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
                                >
                                    {saving ? (
                                        <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                                    ) : (
                                        <Award className="h-4 w-4" />
                                    )}
                                    {saving ? "Saving…" : editingId ? "Update" : "Generate Certificate"}
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
                                <h2 className="text-lg font-bold text-slate-900">Certificate Preview</h2>
                                <div className="flex gap-2">
                                    <button
                                        id="download-pdf-btn"
                                        onClick={() => canvasRef.current?.downloadPDF()}
                                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm cursor-pointer"
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
        </div>
    );
}
