"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Shield, Calendar, User, BookOpen, GraduationCap, Hash } from "lucide-react";
import { getCertificateByCode, Certificate } from "@/lib/certificates";
import Image from "next/image";
import Link from "next/link";

function formatDate(iso: string) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function VerifyPage() {
    const params = useParams();
    const rawId = params?.certificateId;
    const certificateId = Array.isArray(rawId)
        ? rawId.map(decodeURIComponent).join("/")
        : typeof rawId === "string"
        ? decodeURIComponent(rawId)
        : "";

    const [status, setStatus] = useState<"loading" | "found" | "not-found">("loading");
    const [cert, setCert] = useState<Certificate | null>(null);

    useEffect(() => {
        if (!certificateId) return;
        getCertificateByCode(certificateId)
            .then((data) => {
                setCert(data);
                setStatus(data ? "found" : "not-found");
            })
            .catch(() => setStatus("not-found"));
    }, [certificateId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/20 to-sky-50/20 flex flex-col items-center justify-center p-4 pt-24 font-sans relative">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-sky-100/30 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-lg"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block">
                        <Image
                            src="/logo.png"
                            alt="Vectonix Technologies"
                            width={64}
                            height={64}
                            className="mx-auto rounded-xl object-contain shadow-md shadow-indigo-500/10"
                        />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900 mt-3">Vectonix Technologies</h1>
                    <p className="text-slate-500 text-sm">Certificate Verification Portal</p>
                </div>

                {/* Loading */}
                {status === "loading" && (
                    <div className="glass-panel rounded-3xl p-10 text-center">
                        <div className="animate-spin h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4" />
                        <p className="text-slate-700">Verifying certificate…</p>
                        <p className="text-slate-500 text-sm mt-1 font-mono">{certificateId}</p>
                    </div>
                )}

                {/* Not Found */}
                {status === "not-found" && (
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="glass-panel border-red-200 rounded-3xl p-8 text-center shadow-lg shadow-red-500/5"
                    >
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 border border-red-200 mb-5">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Certificate</h2>
                        <p className="text-slate-500 text-sm mb-4">
                            No certificate matching this ID was found in our records.
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 inline-block">
                            <span className="font-mono text-sm text-slate-700">{certificateId}</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-5">
                            If you believe this is an error, contact{" "}
                            <a href="mailto:vectonixofficial@gmail.com" className="text-indigo-600 underline">
                                vectonixofficial@gmail.com
                            </a>
                        </p>
                    </motion.div>
                )}

                {/* Found */}
                {status === "found" && cert && (
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="backdrop-blur-md"
                    >
                        {/* Status badge */}
                        <div
                            className={`rounded-3xl p-8 shadow-xl border bg-white/85 ${cert.verificationStatus === "verified"
                                ? "border-green-200 shadow-green-500/5"
                                : "border-red-200 shadow-red-500/5"
                                }`}
                        >
                            {/* Status header */}
                            <div className="text-center mb-7">
                                <div
                                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full border mb-4 ${cert.verificationStatus === "verified"
                                        ? "bg-green-50 border-green-200"
                                        : "bg-red-50 border-red-200"
                                        }`}
                                >
                                    {cert.verificationStatus === "verified" ? (
                                        <CheckCircle className="h-10 w-10 text-green-600" />
                                    ) : (
                                        <XCircle className="h-10 w-10 text-red-600" />
                                    )}
                                </div>
                                <div
                                    className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold mb-2 ${cert.verificationStatus === "verified"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                        }`}
                                >
                                    <Shield className="h-4 w-4" />
                                    {cert.verificationStatus === "verified" ? "VERIFIED CERTIFICATE" : "REVOKED CERTIFICATE"}
                                </div>
                                <p className="text-slate-500 text-xs">
                                    This certificate has been officially issued by Vectonix Technologies
                                </p>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-200 mb-6" />

                            {/* Details grid */}
                            <div className="space-y-4">
                                {[
                                    { icon: Hash, label: "Certificate ID", value: cert.certificateId, mono: true, color: "text-indigo-600 font-bold" },
                                    { icon: User, label: "Student Name", value: cert.studentName, mono: false, color: "text-slate-900 font-semibold" },
                                    { icon: GraduationCap, label: "College / University", value: cert.collegeName, mono: false, color: "text-slate-700" },
                                    { icon: BookOpen, label: "Domain", value: cert.domain, mono: false, color: "text-indigo-600" },
                                    {
                                        icon: Calendar,
                                        label: "Internship Duration",
                                        value: `${formatDate(cert.startDate)} — ${formatDate(cert.endDate)}`,
                                        mono: false,
                                        color: "text-slate-700",
                                    },
                                    { icon: Calendar, label: "Issue Date", value: formatDate(cert.issueDate), mono: false, color: "text-slate-500 text-xs" },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.label} className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3">
                                            <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs text-slate-500 mb-0.5 font-bold uppercase tracking-wider">{item.label}</p>
                                                <p className={`text-sm font-medium ${item.color} ${item.mono ? "font-mono" : ""} break-words`}>
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="mt-6 pt-5 border-t border-slate-200 text-center">
                                <p className="text-xs text-slate-500">
                                    Issued by{" "}
                                    <span className="text-indigo-600 font-semibold">Vectonix Technologies</span>
                                    {" "}· Hosur, Tamil Nadu 635109
                                </p>
                                <p className="text-xs text-slate-400 mt-1">6382340278 · vectonixofficial@gmail.com</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <p className="text-center text-slate-400 text-xs mt-6">
                    © 2024 Vectonix Technologies. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}
