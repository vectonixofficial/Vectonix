"use client";

import { useState, useEffect, Suspense } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
    LogIn,
    Mail,
    Lock,
    KeyRound,
    Briefcase,
    Shield,
    GraduationCap,
    ArrowRight,
    Loader2,
    AlertCircle
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { studentService } from "@/lib/services/studentService";

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { signInWithGoogle } = useAuth();

    // Default tab: 'student' if tab=student, or 'admin' if tab=admin
    const initialTab = searchParams.get("tab") === "admin" ? "admin" : "student";
    const [activeTab, setActiveTab] = useState<"student" | "admin">(initialTab);

    // Student Login State
    const [studentAppId, setStudentAppId] = useState("");
    const [studentEmail, setStudentEmail] = useState("");
    const [studentLoading, setStudentLoading] = useState(false);
    const [studentError, setStudentError] = useState("");

    // Admin Login State
    const [adminEmail, setAdminEmail] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [adminError, setAdminError] = useState("");
    const [adminLoading, setAdminLoading] = useState(false);

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam === "admin" || tabParam === "student") {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // Handle Student Login
    const handleStudentLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStudentError("");

        const cleanAppId = studentAppId.trim();
        const cleanEmail = studentEmail.trim();

        if (!cleanAppId || !cleanEmail) {
            setStudentError("Please enter both your Application / Registration ID and registered email.");
            return;
        }

        setStudentLoading(true);
        try {
            const student = await studentService.login(cleanAppId, cleanEmail);
            if (!student) {
                setStudentError("No registration found matching this Application ID and Email. Please check your confirmation email.");
                return;
            }

            const verifiedId = student.application_id || student.application_number || cleanAppId;
            router.push(`/internship/dashboard?appId=${encodeURIComponent(verifiedId)}&email=${encodeURIComponent(cleanEmail)}`);
        } catch (err: any) {
            setStudentError(err.message || "Failed to log in. Please try again.");
        } finally {
            setStudentLoading(false);
        }
    };

    // Handle Admin Login
    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!auth) {
            setAdminError("Firebase authentication is not configured. Please check your environment configuration.");
            return;
        }

        setAdminError("");
        setAdminLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            const user = userCredential.user;

            if (user.email === "rahman.habibur2007@gmail.com" || user.email === "vectonixofficial@gmail.com") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } catch (err: any) {
            setAdminError(err.message || "Failed to login. Please check admin credentials.");
        } finally {
            setAdminLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setAdminError("");
        setAdminLoading(true);
        try {
            const userCredential = await signInWithGoogle();
            const user = userCredential.user;
            if (user?.email === "rahman.habibur2007@gmail.com" || user?.email === "vectonixofficial@gmail.com") {
                router.push("/admin");
            } else {
                router.push("/");
            }
        } catch (err: any) {
            setAdminError(err.message || "Google Authentication failed.");
        } finally {
            setAdminLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden pt-28 pb-16">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[100px] z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-sky-100/30 rounded-full blur-[100px] z-0" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md z-10"
            >
                <div className="glass-panel p-8 rounded-2xl border border-slate-200 shadow-xl bg-white/95">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-50 border border-indigo-100 mb-3 text-indigo-600 shadow-xs">
                            {activeTab === "student" ? (
                                <GraduationCap className="h-7 w-7" />
                            ) : (
                                <Shield className="h-7 w-7" />
                            )}
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {activeTab === "student" ? "Student Internship Login" : "Administrator Sign In"}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            {activeTab === "student"
                                ? "Access your assignments, weekly reviews & learning dashboard"
                                : "Secure management portal for authorized Vectonix staff"}
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200">
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("student");
                                setStudentError("");
                            }}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === "student"
                                    ? "bg-white text-indigo-600 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <GraduationCap className="h-4 w-4" />
                            <span>Student Login</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("admin");
                                setAdminError("");
                            }}
                            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeTab === "admin"
                                    ? "bg-white text-indigo-600 shadow-xs"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <Shield className="h-4 w-4" />
                            <span>Admin Login</span>
                        </button>
                    </div>

                    {/* TAB 1: STUDENT LOGIN */}
                    {activeTab === "student" && (
                        <div>
                            {studentError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>{studentError}</span>
                                </div>
                            )}

                            <form onSubmit={handleStudentLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Internship Registration Number / App ID *
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                                        <input
                                            type="text"
                                            required
                                            value={studentAppId}
                                            onChange={(e) => setStudentAppId(e.target.value)}
                                            placeholder="e.g. VTX-WI26-0001"
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Sent to your email after completing internship registration.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Registered Email Address *
                                    </label>
                                    <div className="relative">
                                        <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                                        <input
                                            type="email"
                                            required
                                            value={studentEmail}
                                            onChange={(e) => setStudentEmail(e.target.value)}
                                            placeholder="student@example.com"
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={studentLoading}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 font-semibold text-white rounded-lg transition-all flex items-center justify-center gap-2 text-xs shadow-md shadow-indigo-100"
                                >
                                    {studentLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Verifying Credentials...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Access Student Dashboard</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-500">
                                    Haven&apos;t registered yet?{" "}
                                    <Link href="/apply/internships/wi26" className="text-indigo-600 font-semibold hover:underline">
                                        Apply for Winter Internship 2026
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: ADMIN LOGIN */}
                    {activeTab === "admin" && (
                        <div>
                            {adminError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">
                                    {adminError}
                                </div>
                            )}

                            <form onSubmit={handleAdminLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Admin Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                                        <input
                                            type="email"
                                            required
                                            value={adminEmail}
                                            onChange={(e) => setAdminEmail(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="admin@vectonix.in"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                                        <input
                                            type="password"
                                            required
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={adminLoading}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 font-semibold text-white rounded-lg transition-all flex items-center justify-center gap-2 text-xs shadow-md shadow-indigo-100"
                                >
                                    {adminLoading ? "Logging in..." : "Login as Admin"}
                                </Button>
                            </form>

                            <div className="relative my-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-[11px]">
                                    <span className="px-2 bg-white text-slate-400">Or continue with</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                disabled={adminLoading}
                                onClick={handleGoogleLogin}
                                className="w-full py-2 bg-white hover:bg-slate-50 font-semibold text-slate-800 rounded-lg transition-all flex items-center justify-center gap-2 border border-slate-200 text-xs"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path
                                        fill="#EA4335"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                                    />
                                    <path
                                        fill="#4285F4"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Sign in with Google</span>
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-50">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    );
}
