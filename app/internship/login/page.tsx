"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Briefcase, ArrowRight, AlertCircle, Loader2, Mail, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { studentService } from "@/lib/services/studentService";

export default function StudentLoginPage() {
    const router = useRouter();
    const [appId, setAppId] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!appId.trim() || !email.trim()) {
            setError("Both Application ID and registered email are required.");
            return;
        }

        setIsLoading(true);
        try {
            const student = await studentService.login(appId, email);
            if (!student) {
                setError("No application found matching this Application ID and Email address. Please double check your confirmation email.");
                return;
            }

            router.push(`/internship/dashboard?appId=${encodeURIComponent(student.application_id || student.application_number || "")}&email=${encodeURIComponent(student.email)}`);
        } catch (err: any) {
            setError(err.message || "Failed to log in. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-28 pb-20 px-4 flex items-center justify-center">
            <div className="max-w-md w-full">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3 uppercase tracking-wider">
                        <Briefcase className="h-3.5 w-3.5" />
                        Vectonix Student Portal
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Internship <span className="text-indigo-600">Dashboard Sign In</span>
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-slate-500">
                        Enter your official Application ID and registered email to access your assignments, project reviews, and learning materials.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs leading-relaxed"
                    >
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                        <span>{error}</span>
                    </motion.div>
                )}

                {/* Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 space-y-5">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Application ID *
                            </label>
                            <div className="relative">
                                <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. VTX-WI26-0001"
                                    value={appId}
                                    onChange={(e) => setAppId(e.target.value.toUpperCase())}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                Registered Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                                <input
                                    type="email"
                                    required
                                    placeholder="rahul@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 shadow-md shadow-indigo-600/25 gap-2 mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                <>
                                    <span>Access Dashboard</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
                        Haven&apos;t registered yet?{" "}
                        <Link href="/apply/internships/wi26" className="text-indigo-600 font-semibold hover:underline">
                            Apply for Winter Internship 2026
                        </Link>
                    </div>
                </div>

                <div className="mt-6 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Secure authenticated student access • VECTONIX PRIVATE LIMITED</span>
                </div>
            </div>
        </div>
    );
}
