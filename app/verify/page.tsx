"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    XCircle,
    Shield,
    Calendar,
    User,
    BookOpen,
    GraduationCap,
    Hash,
    QrCode,
    Search,
    RefreshCw,
    ArrowRight,
    AlertCircle,
    Info
} from "lucide-react";
import { getCertificates, Certificate, DEFAULT_CERTIFICATES } from "@/lib/certificates";
import Image from "next/image";
import Link from "next/link";
import jsQR from "jsqr";

function formatDate(iso: string) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const MOCK_CERTIFICATES: Certificate[] = [
    {
        certificateId: "VTX2024-001",
        studentName: "Rahman S",
        collegeName: "Adhiyamaan College of Engineering",
        domain: "Full Stack Web Development",
        startDate: "2024-05-01",
        endDate: "2024-06-01",
        issueDate: "2024-06-05",
        verificationStatus: "verified",
    },
    {
        certificateId: "VTX2024-002",
        studentName: "Priya Sharma",
        collegeName: "Anna University",
        domain: "Data Science & AI",
        startDate: "2024-05-15",
        endDate: "2024-06-15",
        issueDate: "2024-06-18",
        verificationStatus: "verified",
    },
    {
        certificateId: "VTX2024-003",
        studentName: "Vikram R",
        collegeName: "PSG College of Technology",
        domain: "UI/UX Design",
        startDate: "2024-04-01",
        endDate: "2024-05-01",
        issueDate: "2024-05-05",
        verificationStatus: "revoked",
    },
    ...(DEFAULT_CERTIFICATES as Certificate[])
];

export default function VerifyPortalPage() {
    // Search filter inputs
    const [filters, setFilters] = useState({
        certificateId: "",
        studentName: "",
        collegeName: "",
        domain: "",
    });

    // Database & state
    const [allCerts, setAllCerts] = useState<Certificate[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [isFallbackMode, setIsFallbackMode] = useState(false);

    // Search results state
    const [searchResults, setSearchResults] = useState<Certificate[]>([]);
    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

    // QR scanner state
    const [qrError, setQrError] = useState<string | null>(null);
    const [qrSuccess, setQrSuccess] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Toast/Feedback state
    const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

    const showToast = (text: string, type: "success" | "error" | "info" = "info") => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Load certificates (on demand or on search)
    const loadCertificatesDatabase = async (): Promise<Certificate[]> => {
        if (allCerts) return allCerts;
        
        setIsLoading(true);
        try {
            const data = await getCertificates();
            setAllCerts(data);
            setIsFallbackMode(false);
            setIsLoading(false);
            return data;
        } catch (error) {
            console.warn("Could not query Firebase collection, using fallback sample data:", error);
            setAllCerts(MOCK_CERTIFICATES);
            setIsFallbackMode(true);
            setIsLoading(false);
            return MOCK_CERTIFICATES;
        }
    };

    // Process searches
    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const hasAnyFilter = Object.values(filters).some(val => val.trim().length > 0);
        if (!hasAnyFilter) {
            showToast("Please enter at least one detail or upload a QR code to verify.", "error");
            return;
        }

        setIsLoading(true);
        const certs = await loadCertificatesDatabase();

        const filtered = certs.filter(cert => {
            if (filters.certificateId && !cert.certificateId.toLowerCase().includes(filters.certificateId.trim().toLowerCase())) {
                return false;
            }
            if (filters.studentName && !cert.studentName.toLowerCase().includes(filters.studentName.trim().toLowerCase())) {
                return false;
            }
            if (filters.collegeName && !cert.collegeName.toLowerCase().includes(filters.collegeName.trim().toLowerCase())) {
                return false;
            }
            if (filters.domain && !cert.domain.toLowerCase().includes(filters.domain.trim().toLowerCase())) {
                return false;
            }
            return true;
        });

        setSearchResults(filtered);
        setHasSearched(true);
        setIsLoading(false);

        if (filtered.length === 1) {
            setSelectedCert(filtered[0]);
            showToast("Matching certificate verified!", "success");
        } else if (filtered.length > 1) {
            setSelectedCert(null);
            showToast(`Found ${filtered.length} matching certificates. Please select one.`, "info");
        } else {
            setSelectedCert(null);
            showToast("No certificate found with matching details.", "error");
        }
    };

    const handleClear = () => {
        setFilters({
            certificateId: "",
            studentName: "",
            collegeName: "",
            domain: "",
        });
        setSearchResults([]);
        setSelectedCert(null);
        setHasSearched(false);
        setQrError(null);
        setQrSuccess(null);
    };

    // QR Image processing function
    const scanQRCodeFromImage = (file: File) => {
        setQrError(null);
        setQrSuccess(null);

        if (!file.type.startsWith("image/")) {
            setQrError("Invalid file type. Please upload an image of a QR code.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    setQrError("Failed to initialize decoder canvas context.");
                    return;
                }

                // Scale canvas to image size
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                try {
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (code) {
                        let codeText = code.data.trim();
                        // Extract certificateId from URL if present
                        if (codeText.includes("/verify/")) {
                            const parts = codeText.split("/verify/");
                            codeText = parts[parts.length - 1].split("?")[0].trim();
                        }
                        
                        setFilters(prev => ({ ...prev, certificateId: codeText }));
                        setQrSuccess(`Successfully scanned certificate: ${codeText}`);
                        showToast(`QR Code Decoded: ${codeText}`, "success");
                        
                        // Automatically trigger search with this code
                        triggerSearchWithCode(codeText);
                    } else {
                        setQrError("Could not detect any QR code. Make sure the QR code is centered and clear.");
                        showToast("QR code detection failed.", "error");
                    }
                } catch (err) {
                    console.error("jsQR error: ", err);
                    setQrError("Error occurred during QR code decoding.");
                }
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    const triggerSearchWithCode = async (codeText: string) => {
        setIsLoading(true);
        const certs = await loadCertificatesDatabase();
        const filtered = certs.filter(c => c.certificateId.toLowerCase() === codeText.toLowerCase());
        setSearchResults(filtered);
        setHasSearched(true);
        setIsLoading(false);
        if (filtered.length > 0) {
            setSelectedCert(filtered[0]);
            showToast("Certificate successfully verified via QR code!", "success");
        } else {
            setSelectedCert(null);
            showToast(`Scanned ID ${codeText} was not found in records.`, "error");
        }
    };

    // Listen to global paste event (Ctrl+V)
    useEffect(() => {
        const handleGlobalPaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.startsWith("image/")) {
                    const file = items[i].getAsFile();
                    if (file) {
                        scanQRCodeFromImage(file);
                        e.preventDefault();
                        break;
                    }
                }
            }
        };

        window.addEventListener("paste", handleGlobalPaste);
        return () => window.removeEventListener("paste", handleGlobalPaste);
    }, [allCerts, filters]);

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            scanQRCodeFromImage(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            scanQRCodeFromImage(file);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/20 to-sky-50/20 flex flex-col items-center justify-start p-4 pt-24 pb-12 font-sans relative">
            {/* Ambient background glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-sky-100/30 rounded-full blur-3xl" />
            </div>

            {/* Toast feedback */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className={`fixed top-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border backdrop-blur-lg ${
                            toastMessage.type === "success"
                                ? "bg-green-50 border-green-200 text-green-700"
                                : toastMessage.type === "error"
                                ? "bg-red-50 border-red-200 text-red-700"
                                : "bg-indigo-50 border-indigo-200 text-indigo-700"
                        }`}
                    >
                        {toastMessage.type === "success" && <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />}
                        {toastMessage.type === "error" && <XCircle className="h-5 w-5 text-red-600 shrink-0" />}
                        {toastMessage.type === "info" && <Info className="h-5 w-5 text-indigo-600 shrink-0" />}
                        <span className="text-sm font-medium">{toastMessage.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 w-full max-w-6xl flex flex-col items-center">
                {/* Header Section */}
                <div className="text-center mb-10 max-w-2xl">
                    <Link href="/" className="inline-block hover:scale-105 transition-transform duration-300">
                        <Image
                            src="/logo.png"
                            alt="Vectonix Technologies"
                            width={72}
                            height={72}
                            className="mx-auto rounded-xl object-contain shadow-md shadow-indigo-500/10"
                        />
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-4 text-slate-900">
                        Certificate Verification Portal
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm sm:text-base">
                        Verify internship completion certificates issued by Vectonix Technologies. Enter any details below or scan a QR code.
                    </p>
                </div>

                {isFallbackMode && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full max-w-4xl mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex items-center gap-3 text-xs sm:text-sm backdrop-blur-md"
                    >
                        <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                        <div>
                            <span className="font-bold">Offline / Fallback Database Active:</span> Using preloaded sample records for local testing. Try searching for <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-semibold">Rahman S</span> or ID <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-semibold">VTX2024-001</span>.
                        </div>
                    </motion.div>
                )}

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
                    
                    {/* Left Column: Form & QR Code scanner (6 columns) */}
                    <div className="lg:col-span-6 space-y-6">
                        
                        {/* Form Card */}
                        <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden group">
                            {/* Card glow effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/30 rounded-full blur-2xl group-hover:bg-indigo-100/40 transition-all duration-700" />
                            
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                                <Search className="h-5 w-5 text-indigo-600" />
                                Search Details
                            </h2>

                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Certificate ID */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                            <Hash className="h-3.5 w-3.5 text-slate-400" />
                                            Certificate ID
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. VTX2024-001"
                                            value={filters.certificateId}
                                            onChange={(e) => setFilters(prev => ({ ...prev, certificateId: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>

                                    {/* Student Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                            <User className="h-3.5 w-3.5 text-slate-400" />
                                            Student Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Rahman"
                                            value={filters.studentName}
                                            onChange={(e) => setFilters(prev => ({ ...prev, studentName: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>

                                    {/* College Name */}
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                            <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                                            College / University
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Adhiyamaan College"
                                            value={filters.collegeName}
                                            onChange={(e) => setFilters(prev => ({ ...prev, collegeName: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>

                                    {/* Domain */}
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                                            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                                            Domain / Topic
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Full Stack Web Development"
                                            value={filters.domain}
                                            onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        Reset Fields
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {isLoading ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                        Search Database
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* QR Code Paste & Upload Box */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer group relative overflow-hidden ${
                                isDragging
                                    ? "border-indigo-500 bg-indigo-50 shadow-md scale-[0.99]"
                                    : qrSuccess
                                    ? "border-green-500 bg-green-50"
                                    : qrError
                                    ? "border-red-500 bg-red-50"
                                    : "border-slate-300 bg-white/70 hover:border-indigo-300 hover:bg-white/90"
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />

                            <div className="relative z-10 flex flex-col items-center">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border transition-transform duration-300 group-hover:scale-110 ${
                                    qrSuccess
                                        ? "bg-green-100 border-green-200 text-green-600"
                                        : qrError
                                        ? "bg-red-100 border-red-200 text-red-600"
                                        : "bg-indigo-50 border-indigo-100 text-indigo-600"
                                }`}>
                                    <QrCode className="h-7 w-7" />
                                </div>

                                <h3 className="text-sm font-bold text-slate-900 mb-1">
                                    {qrSuccess ? "QR Decoded!" : "Verify via QR Code"}
                                </h3>
                                <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-4">
                                    Drag & drop QR image here, <span className="text-indigo-600 underline font-semibold">click to browse</span>, or copy & <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-[10px] font-mono border border-slate-200">Ctrl + V</kbd> paste directly from clipboard!
                                </p>

                                {/* Decoded results inside QR Zone */}
                                {qrSuccess && (
                                    <span className="text-xs bg-green-100 border border-green-200 text-green-700 px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
                                        <CheckCircle className="h-3 w-3" />
                                        Decoded
                                    </span>
                                )}

                                {qrError && (
                                    <span className="text-xs bg-red-100 border border-red-200 text-red-700 px-3 py-1 rounded-full flex items-center gap-1.5 max-w-xs text-center">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                        {qrError}
                                    </span>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Search Results & Detailed display card (6 columns) */}
                    <div className="lg:col-span-6 min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {/* Loading State */}
                            {isLoading && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="glass-panel p-10 text-center h-full flex flex-col justify-center items-center min-h-[400px]"
                                >
                                    <div className="relative mb-6">
                                        <div className="animate-spin h-14 w-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
                                        <Shield className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Verifying Certificates</h3>
                                    <p className="text-slate-500 text-xs font-mono">Querying database registry...</p>
                                </motion.div>
                            )}

                            {/* Default / Unsearched State */}
                            {!isLoading && !hasSearched && (
                                <motion.div
                                    key="default"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-slate-50/50 border border-dashed border-slate-300 rounded-3xl p-10 text-center backdrop-blur-xl h-full flex flex-col justify-center items-center min-h-[400px]"
                                >
                                    <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-5">
                                        <Shield className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">No Verification Query</h3>
                                    <p className="text-slate-500 text-sm max-w-sm">
                                        Fill in any detail on the left (e.g. Student Name or Certificate ID) or drop/paste a QR code image to look up details.
                                    </p>
                                </motion.div>
                            )}

                            {/* Searched and Not Found */}
                            {!isLoading && hasSearched && searchResults.length === 0 && (
                                <motion.div
                                    key="not-found"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="glass-panel border-red-200 p-10 text-center h-full flex flex-col justify-center items-center min-h-[400px] shadow-lg shadow-red-500/5"
                                >
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-200 mb-5 text-red-600">
                                        <XCircle className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-red-600 mb-2">Verification Failed</h3>
                                    <p className="text-slate-500 text-sm max-w-xs mb-6">
                                        We could not find any certificate matching the details you provided. Please verify spelling or ID format.
                                    </p>
                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full text-left space-y-2 text-xs text-slate-500">
                                        <p className="font-bold text-slate-700 flex items-center gap-1.5">
                                            <Info className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                                            Troubleshooting Tips:
                                        </p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Check if Certificate ID matches <span className="font-mono">VTX2024-XXX</span></li>
                                            <li>Use shorter names (e.g. searching &quot;John&quot; instead of &quot;Johnathan&quot;)</li>
                                            <li>Make sure QR code contains a valid Vectonix verification URL</li>
                                        </ul>
                                    </div>
                                    <p className="text-slate-500 text-xs mt-6">
                                        Need help? Contact support at{" "}
                                        <a href="mailto:vectonixofficial@gmail.com" className="text-indigo-600 underline">
                                            vectonixofficial@gmail.com
                                        </a>
                                    </p>
                                </motion.div>
                            )}

                            {/* Multiple Matches List */}
                            {!isLoading && hasSearched && searchResults.length > 1 && !selectedCert && (
                                <motion.div
                                    key="multiple-results"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="glass-panel p-6 h-full flex flex-col min-h-[400px] overflow-hidden"
                                >
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-slate-900">Multiple Certificates Found</h3>
                                        <p className="text-xs text-slate-500 mt-1">
                                            We found {searchResults.length} matching certificates. Select one to verify details.
                                        </p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[360px] scrollbar-thin scrollbar-thumb-slate-200">
                                        {searchResults.map((cert) => (
                                            <div
                                                key={cert.certificateId}
                                                onClick={() => setSelectedCert(cert)}
                                                className="bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 transition-all duration-300 cursor-pointer flex justify-between items-center group shadow-sm"
                                            >
                                                <div className="space-y-1">
                                                    <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                        {cert.certificateId}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-slate-900 mt-1.5 group-hover:text-indigo-600 transition-colors">
                                                        {cert.studentName}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 font-medium">
                                                        {cert.domain} · {cert.collegeName}
                                                    </p>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Detailed Certificate View */}
                            {!isLoading && hasSearched && selectedCert && (
                                <motion.div
                                    key="detail-view"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="relative"
                                >
                                    {/* Back button (only shown if there were multiple results originally) */}
                                    {searchResults.length > 1 && (
                                        <button
                                            onClick={() => setSelectedCert(null)}
                                            className="mb-4 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                                        >
                                            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                                            Back to Multiple Results ({searchResults.length})
                                        </button>
                                    )}

                                    {/* Holographic Verification Badge Card */}
                                    <div
                                        className={`rounded-3xl p-6 sm:p-8 shadow-xl border backdrop-blur-xl relative overflow-hidden bg-white/80 ${
                                            selectedCert.verificationStatus === "verified"
                                                ? "border-green-200 shadow-green-500/5"
                                                : "border-red-200 shadow-red-500/5"
                                        }`}
                                    >
                                        {/* Status Header */}
                                        <div className="text-center mb-6">
                                            <div
                                                className={`inline-flex items-center justify-center w-16 h-16 rounded-full border mb-3 ${
                                                    selectedCert.verificationStatus === "verified"
                                                        ? "bg-green-50 border-green-200 text-green-600"
                                                        : "bg-red-50 border-red-200 text-red-600"
                                                }`}
                                            >
                                                {selectedCert.verificationStatus === "verified" ? (
                                                    <CheckCircle className="h-8 w-8" />
                                                ) : (
                                                    <XCircle className="h-8 w-8" />
                                                )}
                                            </div>

                                            <div
                                                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black tracking-wide mb-2 ${
                                                    selectedCert.verificationStatus === "verified"
                                                        ? "bg-green-50 text-green-700 border border-green-200"
                                                        : "bg-red-50 text-red-700 border border-red-200"
                                                }`}
                                            >
                                                <Shield className="h-3.5 w-3.5" />
                                                {selectedCert.verificationStatus === "verified"
                                                    ? "VERIFIED CERTIFICATE"
                                                    : "REVOKED CERTIFICATE"}
                                            </div>
                                            <p className="text-slate-500 text-[11px] leading-relaxed">
                                                This certificate credential has been officially registered and validated by Vectonix Technologies
                                            </p>
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t border-slate-200 mb-5" />

                                        {/* Details Grid */}
                                        <div className="space-y-3">
                                            {[
                                                {
                                                    icon: Hash,
                                                    label: "Certificate ID",
                                                    value: selectedCert.certificateId,
                                                    mono: true,
                                                    color: "text-indigo-600 font-bold",
                                                },
                                                {
                                                    icon: User,
                                                    label: "Student Name",
                                                    value: selectedCert.studentName,
                                                    mono: false,
                                                    color: "text-slate-900 font-semibold text-base",
                                                },
                                                {
                                                    icon: GraduationCap,
                                                    label: "College / University",
                                                    value: selectedCert.collegeName,
                                                    mono: false,
                                                    color: "text-slate-700 text-sm",
                                                },
                                                {
                                                    icon: BookOpen,
                                                    label: "Domain",
                                                    value: selectedCert.domain,
                                                    mono: false,
                                                    color: "text-indigo-600 text-sm",
                                                },
                                                {
                                                    icon: Calendar,
                                                    label: "Internship Duration",
                                                    value: `${formatDate(selectedCert.startDate)} — ${formatDate(
                                                        selectedCert.endDate
                                                    )}`,
                                                    mono: false,
                                                    color: "text-slate-700 text-xs sm:text-sm",
                                                },
                                                {
                                                    icon: Calendar,
                                                    label: "Issue Date",
                                                    value: formatDate(selectedCert.issueDate),
                                                    mono: false,
                                                    color: "text-slate-500 text-xs",
                                                },
                                            ].map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <div
                                                        key={item.label}
                                                        className="flex items-start gap-3 bg-slate-50 rounded-2xl px-4 py-2.5"
                                                    >
                                                        <Icon className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                                                        <div className="min-w-0">
                                                            <p className="text-[10px] text-slate-500 mb-0.5 font-bold uppercase tracking-wider">
                                                                {item.label}
                                                            </p>
                                                            <p
                                                                className={`leading-tight ${item.color} ${
                                                                    item.mono ? "font-mono" : ""
                                                                } break-words`}
                                                            >
                                                                {item.value}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Direct link button */}
                                        <div className="mt-5 pt-4 border-t border-slate-200">
                                            <Link
                                                href={`/verify/${selectedCert.certificateId}`}
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                                            >
                                                <span>View Full Verification Webpage</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

                {/* Info and help section */}
                <div className="w-full max-w-4xl mt-12 glass-panel p-6 text-center">
                    <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center justify-center gap-1.5">
                        <Info className="h-4 w-4 text-indigo-600" />
                        About Certificate Verification
                    </h3>
                    <p className="text-slate-500 text-xs max-w-2xl mx-auto leading-relaxed">
                        Every official internship certificate issued by Vectonix Technologies is assigned a unique Certificate ID and a secure verification QR code. 
                        If you encounter any validation issues or require physical authentication services, please mail us at{" "}
                        <a href="mailto:vectonixofficial@gmail.com" className="text-indigo-600 underline">
                            vectonixofficial@gmail.com
                        </a>.
                    </p>
                    <p className="text-slate-400 text-[11px] mt-6">
                        © 2024 Vectonix Technologies. All rights reserved. · Hosur, Tamil Nadu 635109
                    </p>
                </div>

            </div>
        </div>
    );
}
