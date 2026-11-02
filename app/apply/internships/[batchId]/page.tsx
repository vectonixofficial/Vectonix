"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    CheckCircle2,
    UploadCloud,
    FileText,
    CreditCard,
    ArrowRight,
    ArrowLeft,
    Copy,
    Check,
    AlertCircle,
    Building2,
    User,
    GraduationCap,
    Send,
    Loader2
} from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/Button";
import { internshipService } from "@/lib/services/internshipService";
import { DatabaseInternshipBatch, DatabaseInternshipApplication } from "@/lib/supabase";

export default function InternshipApplyPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = (params?.batchId as string) || "wi26";

    const [batch, setBatch] = useState<DatabaseInternshipBatch | null>(null);
    const [loadingBatch, setLoadingBatch] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        whatsappNumber: "",
        collegeName: "",
        degree: "B.Tech",
        department: "",
        yearOfStudy: "3rd Year",
        domain: "",
        linkedinUrl: "",
        githubUrl: "",
        transactionIdUtr: "",
        agreedToTerms: false,
    });

    // File State
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

    // QR Code Data URL State
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [copiedUpi, setCopiedUpi] = useState(false);

    // Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submittedApplication, setSubmittedApplication] = useState<DatabaseInternshipApplication | null>(null);

    // Load Batch
    useEffect(() => {
        const loadBatch = async () => {
            setLoadingBatch(true);
            try {
                const data = await internshipService.getBatch(batchId);
                setBatch(data);
                if (data && data.domains.length > 0) {
                    setFormData((prev) => ({ ...prev, domain: data.domains[0] }));
                }

                // Generate UPI QR Code string
                const upiId = data?.upi_id || "vectonixofficial@okhdfcbank";
                const amount = data?.fee_amount || 499;
                const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Vectonix%20Learning&am=${amount}&cu=INR&tn=${encodeURIComponent(
                    `${data?.prefix || "WI26"} Internship Registration`
                )}`;

                const url = await QRCode.toDataURL(upiString, { width: 220, margin: 1 });
                setQrDataUrl(url);
            } catch (err) {
                console.error("Error loading batch:", err);
            } finally {
                setLoadingBatch(false);
            }
        };
        loadBatch();
    }, [batchId]);

    const handleCopyUpi = () => {
        if (!batch?.upi_id) return;
        navigator.clipboard.writeText(batch.upi_id);
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2500);
    };

    // Validation
    const validateStep1 = () => {
        if (!formData.fullName.trim()) return "Full name is required";
        if (!formData.email.trim() || !formData.email.includes("@")) return "A valid email is required";
        if (!formData.phone.trim() || formData.phone.length < 10) return "A valid 10-digit phone number is required";
        if (!formData.collegeName.trim()) return "College/University name is required";
        if (!formData.department.trim()) return "Department/Branch is required";
        return null;
    };

    const validateStep2 = () => {
        if (!formData.domain) return "Please select an internship domain";
        if (!resumeFile) return "Please upload your resume (PDF or DOCX)";
        return null;
    };

    const validateStep3 = () => {
        if (!formData.transactionIdUtr.trim()) return "Please enter your UPI / Bank Transaction ID (UTR)";
        if (!paymentProofFile) return "Please upload your payment confirmation screenshot";
        if (!formData.agreedToTerms) return "Please accept the terms and conditions to proceed";
        return null;
    };

    const handleNext = () => {
        setSubmitError(null);
        if (currentStep === 1) {
            const err = validateStep1();
            if (err) {
                setSubmitError(err);
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            const err = validateStep2();
            if (err) {
                setSubmitError(err);
                return;
            }
            setCurrentStep(3);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        const err = validateStep3();
        if (err) {
            setSubmitError(err);
            return;
        }

        if (!resumeFile || !paymentProofFile) {
            setSubmitError("Both resume and payment screenshot are required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await internshipService.submitApplication({
                batchId: batch?.id || batchId,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                whatsappNumber: formData.whatsappNumber || formData.phone,
                collegeName: formData.collegeName,
                degree: formData.degree,
                department: formData.department,
                yearOfStudy: formData.yearOfStudy,
                domain: formData.domain,
                linkedinUrl: formData.linkedinUrl,
                githubUrl: formData.githubUrl,
                transactionIdUtr: formData.transactionIdUtr,
                amount: batch?.fee_amount || 499,
                resumeFile,
                paymentProofFile,
            });

            setSubmittedApplication(result.application);
            setCurrentStep(4);
        } catch (error: any) {
            console.error("Submission error:", error);
            setSubmitError(error.message || "Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingBatch) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading internship details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-28 pb-20 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header Banner */}
                <div className="text-center mb-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3 uppercase tracking-wider">
                        <Briefcase className="h-3.5 w-3.5" />
                        {batch?.title || "Winter Internship 2026"} (Batch {batchId.toUpperCase()})
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Internship <span className="text-indigo-600">Application Portal</span>
                    </h1>
                    <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
                        Join Vectonix for hands-on, live-project experience mentored by industry engineers. Complete your registration below.
                    </p>
                </div>

                {/* Stepper Progress Bar */}
                {currentStep < 4 && (
                    <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            {[
                                { step: 1, label: "Personal & Academic" },
                                { step: 2, label: "Track & Resume" },
                                { step: 3, label: "Fee Payment & UTR" },
                            ].map((item, idx) => (
                                <div key={item.step} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                currentStep === item.step
                                                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                                                    : currentStep > item.step
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {currentStep > item.step ? <Check className="h-4 w-4" /> : item.step}
                                        </div>
                                        <span
                                            className={`text-xs sm:text-sm font-medium hidden sm:inline ${
                                                currentStep === item.step ? "text-slate-900 font-semibold" : "text-slate-500"
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                    {idx < 2 && (
                                        <div
                                            className={`flex-1 mx-3 h-1 rounded-full transition-all ${
                                                currentStep > item.step ? "bg-emerald-500" : "bg-slate-200"
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {submitError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm"
                    >
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{submitError}</span>
                    </motion.div>
                )}

                {/* Form Container */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10">
                    {/* STEP 1: Personal & Academic Info */}
                    {currentStep === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-indigo-600" />
                                    Personal & Contact Details
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Please ensure your email and WhatsApp number are accurate for acceptance letters.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Rahul Sharma"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="rahul@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="10-digit mobile number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        WhatsApp Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="If different from phone number"
                                        value={formData.whatsappNumber}
                                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="border-b border-slate-100 pt-4 pb-2">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-indigo-600" />
                                    College & Academic Info
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        College / University Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. National Institute of Technology"
                                        value={formData.collegeName}
                                        onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Degree / Program *
                                    </label>
                                    <select
                                        value={formData.degree}
                                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="B.Tech">B.Tech / B.E.</option>
                                        <option value="BCA">BCA</option>
                                        <option value="MCA">MCA</option>
                                        <option value="M.Tech">M.Tech</option>
                                        <option value="B.Sc">B.Sc Computer Science / IT</option>
                                        <option value="Diploma">Polytechnic Diploma</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Department / Branch *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. CSE, ECE, IT, Mechanical"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Current Year of Study *
                                    </label>
                                    <select
                                        value={formData.yearOfStudy}
                                        onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year (Final Year)</option>
                                        <option value="Graduated">Recent Graduate</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleNext} className="gap-2">
                                    Next: Domain & Resume
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Domain Selection & Resume Upload */}
                    {currentStep === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                                    Choose Your Track & Upload Resume
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Select the domain you wish to specialize in during the {batch?.title || "Winter Internship"}.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                    Internship Domain *
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(batch?.domains || [
                                        "Full Stack Web Development",
                                        "AI / Machine Learning",
                                        "Data Science & Analytics",
                                        "IoT & Embedded Systems",
                                        "Cybersecurity & Cloud",
                                        "UI/UX & Product Design"
                                    ]).map((d) => (
                                        <label
                                            key={d}
                                            className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                                                formData.domain === d
                                                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20"
                                                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="domain"
                                                value={d}
                                                checked={formData.domain === d}
                                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                                className="text-indigo-600 focus:ring-indigo-500"
                                            />
                                            {d}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Resume File Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                    Resume / Curriculum Vitae (PDF or DOCX, Max 5MB) *
                                </label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
                                    <input
                                        type="file"
                                        id="resume-upload"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setResumeFile(e.target.files[0]);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    <label htmlFor="resume-upload" className="cursor-pointer">
                                        <UploadCloud className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
                                        {resumeFile ? (
                                            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600">
                                                <FileText className="h-4 w-4" />
                                                {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    Click to upload or drag & drop
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">PDF, DOC, DOCX up to 5MB</p>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        LinkedIn Profile (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/in/username"
                                        value={formData.linkedinUrl}
                                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        GitHub / Portfolio Link (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://github.com/username"
                                        value={formData.githubUrl}
                                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                                <Button onClick={handleNext} className="gap-2">
                                    Next: Payment & Verification
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Payment Verification & Proof */}
                    {currentStep === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-indigo-600" />
                                    Internship Registration Fee & UTR
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Scan the official Vectonix QR or transfer via UPI, then enter your UTR number and upload the screenshot.
                                </p>
                            </div>

                            {/* Fee Card & QR Code */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                                {qrDataUrl && (
                                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                                        <img src={qrDataUrl} alt="UPI QR Code" className="h-44 w-44 object-contain" />
                                        <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">Scan with any UPI App</span>
                                    </div>
                                )}

                                <div className="flex-1 space-y-3 text-center md:text-left">
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase font-semibold">Total Registration Fee</span>
                                        <div className="text-3xl font-extrabold text-slate-900">
                                            ₹{batch?.fee_amount ?? 499}
                                            <span className="text-xs font-normal text-slate-500 ml-1">one-time</span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-xs text-slate-500 block mb-1">Official Vectonix UPI ID:</span>
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm font-mono text-slate-800">
                                            <span>{batch?.upi_id || "vectonixofficial@okhdfcbank"}</span>
                                            <button
                                                type="button"
                                                onClick={handleCopyUpi}
                                                className="text-indigo-600 hover:text-indigo-800 p-1"
                                                title="Copy UPI ID"
                                            >
                                                {copiedUpi ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-xs text-slate-500 bg-white/80 p-2.5 rounded-lg border border-slate-200/60">
                                        💡 Supported apps: <strong>Google Pay, PhonePe, Paytm, BHIM, Cred</strong>. After paying, copy the 12-digit UTR/UPI Transaction ID.
                                    </div>
                                </div>
                            </div>

                            {/* UTR Input */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    UPI / Bank Transaction ID (UTR Number) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 402918239012"
                                    value={formData.transactionIdUtr}
                                    onChange={(e) => setFormData({ ...formData, transactionIdUtr: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                />
                            </div>

                            {/* Payment Screenshot Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                    Payment Screenshot / Receipt (PNG, JPG, PDF) *
                                </label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
                                    <input
                                        type="file"
                                        id="proof-upload"
                                        accept="image/*,.pdf"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setPaymentProofFile(e.target.files[0]);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    <label htmlFor="proof-upload" className="cursor-pointer">
                                        <UploadCloud className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
                                        {paymentProofFile ? (
                                            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600">
                                                <FileText className="h-4 w-4" />
                                                {paymentProofFile.name} ({(paymentProofFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm font-semibold text-slate-700">
                                                    Click to upload payment screenshot
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">PNG, JPG, JPEG or PDF</p>
                                            </>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Terms & Conditions Agreement */}
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={formData.agreedToTerms}
                                    onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                                    I agree to Vectonix's{" "}
                                    <Link href="/terms-and-conditions" target="_blank" className="text-indigo-600 underline font-medium">
                                        Terms & Conditions
                                    </Link>{" "}
                                    and acknowledge the{" "}
                                    <Link href="/privacy-policy" target="_blank" className="text-indigo-600 underline font-medium">
                                        Privacy Policy
                                    </Link>
                                    . I declare that the submitted transaction details are authentic.
                                </label>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCurrentStep(2)}
                                    disabled={isSubmitting}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Submitting Application...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Submit Application & Verify
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* STEP 4: Success & Confirmation */}
                    {currentStep === 4 && submittedApplication && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6 space-y-6"
                        >
                            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>

                            <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                                    Application Submitted Successfully!
                                </h2>
                                <p className="text-slate-600 mt-2 text-sm sm:text-base">
                                    Welcome to Vectonix, <strong>{submittedApplication.full_name}</strong>. Your application record and payment proof have been received.
                                </p>
                            </div>

                            {/* Application ID Card */}
                            <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 border border-indigo-100 rounded-2xl p-6 max-w-lg mx-auto shadow-sm">
                                <span className="text-xs uppercase font-bold tracking-wider text-indigo-700">Your Official Application ID</span>
                                <div className="text-3xl font-mono font-extrabold text-slate-900 mt-2 tracking-wider">
                                    {submittedApplication.application_id}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Please keep this Application ID safe for tracking and certificate verification.
                                </p>
                            </div>

                            {/* Summary Table */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-lg mx-auto text-xs space-y-2">
                                <div className="flex justify-between py-1 border-b border-slate-200">
                                    <span className="text-slate-500 font-medium">Batch</span>
                                    <span className="font-semibold text-slate-800">{batch?.title || "Winter Internship 2026"}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200">
                                    <span className="text-slate-500 font-medium">Selected Domain</span>
                                    <span className="font-semibold text-slate-800">{submittedApplication.domain}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200">
                                    <span className="text-slate-500 font-medium">College</span>
                                    <span className="font-semibold text-slate-800">{submittedApplication.college_name}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500 font-medium">Payment Verification</span>
                                    <span className="font-semibold text-amber-600">Pending Verification (within 24-48 hrs)</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => window.print()}
                                    className="w-full sm:w-auto"
                                >
                                    Print / Save Confirmation
                                </Button>
                                <Button
                                    onClick={() => router.push("/")}
                                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Return to Home
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

