"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Calendar,
    Users,
    FileText,
    CheckCircle,
    Briefcase,
    TrendingUp,
    ArrowUpRight,
    ExternalLink,
    Mail,
    Clock,
    Sparkles,
    User
} from "lucide-react";
import { eventsService } from "@/lib/services/eventsService";
import { responsesService } from "@/lib/services/responsesService";
import { certificatesService } from "@/lib/services/certificatesService";
import { internshipService } from "@/lib/services/internshipService";
import { DatabaseInternshipApplication } from "@/lib/supabase";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState([
        { name: "Winter Internship (WI26)", value: "0", subtext: "Applications received", icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
        { name: "Total Registrations", value: "0", subtext: "Internships & Workshops", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
        { name: "Certificates Issued", value: "0", subtext: "Unique digital credentials", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
        { name: "Projected Revenue", value: "₹0", subtext: "From selected packages", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    ]);

    const [recentInternships, setRecentInternships] = useState<DatabaseInternshipApplication[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            setLoading(true);
            try {
                const [events, responses, certs, internshipApps] = await Promise.all([
                    eventsService.getAll().catch(() => []),
                    responsesService.getAll().catch(() => []),
                    certificatesService.getAll().catch(() => []),
                    internshipService.getApplications("wi26").catch(() => []),
                ]);

                // Calculate projected revenue from internship applications
                const totalRevenue = internshipApps.reduce(
                    (sum, app) => sum + (Number(app.package_amount) || (app.package_name === "Premium" ? 999 : 749)),
                    0
                );

                const totalRegs = responses.length + internshipApps.length;

                setStats([
                    {
                        name: "Winter Internship (WI26)",
                        value: String(internshipApps.length),
                        subtext: `${internshipApps.filter(a => a.package_name === "Premium").length} Premium • ${internshipApps.filter(a => a.package_name === "Standard").length} Standard`,
                        icon: Briefcase,
                        color: "text-indigo-600",
                        bg: "bg-indigo-50"
                    },
                    {
                        name: "Total Registrations",
                        value: String(totalRegs),
                        subtext: `${internshipApps.length} Internships • ${responses.length} Events`,
                        icon: Users,
                        color: "text-emerald-600",
                        bg: "bg-emerald-50"
                    },
                    {
                        name: "Certificates Issued",
                        value: String(certs.length),
                        subtext: `${certs.filter(c => c.verificationStatus === "verified").length} verified credentials`,
                        icon: FileText,
                        color: "text-purple-600",
                        bg: "bg-purple-50"
                    },
                    {
                        name: "Projected Revenue",
                        value: `₹${totalRevenue.toLocaleString()}`,
                        subtext: `From ${internshipApps.length} enrolled candidates`,
                        icon: TrendingUp,
                        color: "text-amber-600",
                        bg: "bg-amber-50"
                    },
                ]);

                setRecentInternships(internshipApps.slice(0, 8));
            } catch (e) {
                console.error("Dashboard stats error:", e);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header with Quick Jump */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Manage winter internships, candidate registrations, events and credentials.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/internships/wi26"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                    >
                        <Briefcase className="h-4 w-4" />
                        <span>Manage WI26 Cohort &rarr;</span>
                    </Link>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-slate-200/80 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">{stat.name}</p>
                                    <p className="text-3xl font-extrabold text-slate-900 mt-2">{stat.value}</p>
                                    <p className="text-[11px] text-slate-400 mt-1">{stat.subtext}</p>
                                </div>
                                <div className={`p-3.5 rounded-xl border border-slate-100 ${stat.bg} ${stat.color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Recent Registrations & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Registrations Card (2 cols) */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Recent Internship Registrations</h2>
                            <p className="text-slate-500 text-xs">Candidates registered for Winter Internship 2026 (WI26)</p>
                        </div>
                        <Link
                            href="/admin/internships/wi26"
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                            <span>View All ({recentInternships.length})</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-slate-400 text-sm">
                            Loading registrations...
                        </div>
                    ) : recentInternships.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                                <Users className="h-6 w-6" />
                            </div>
                            <p className="text-slate-700 font-semibold text-sm">No applications registered yet</p>
                            <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                                When students submit their application on the portal, their details will immediately appear here.
                            </p>
                            <div className="mt-4">
                                <Link
                                    href="/apply/internships/wi26"
                                    target="_blank"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                                >
                                    <span>Test Application Portal</span>
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 overflow-x-auto">
                            {recentInternships.map((app) => (
                                <div key={app.id} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100/70 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                            {app.full_name?.charAt(0) || "U"}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{app.full_name}</p>
                                                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {app.application_id || app.application_number}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">
                                                {app.domain} • <span className="text-slate-400">{app.college_name}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <span
                                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                app.package_name === "Premium"
                                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                            }`}
                                        >
                                            {app.package_name || "Standard"}
                                        </span>
                                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions (1 col) */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">Quick Actions</h2>
                        <p className="text-slate-500 text-xs mb-4">Direct links to cohort management tools</p>

                        <div className="space-y-2.5">
                            <Link
                                href="/admin/internships/wi26"
                                className="w-full text-left p-3 hover:bg-indigo-50/60 border border-slate-200/70 hover:border-indigo-200 rounded-xl transition-all text-xs flex items-center justify-between text-slate-800 group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Briefcase className="h-4 w-4 text-indigo-600" />
                                    <div>
                                        <p className="font-semibold text-slate-900">Winter Internship 2026 (WI26)</p>
                                        <p className="text-slate-500 text-[10px]">Review applications & export rosters</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </Link>

                            <Link
                                href="/admin/internships/wi26/emails"
                                className="w-full text-left p-3 hover:bg-purple-50/60 border border-slate-200/70 hover:border-purple-200 rounded-xl transition-all text-xs flex items-center justify-between text-slate-800 group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Mail className="h-4 w-4 text-purple-600" />
                                    <div>
                                        <p className="font-semibold text-slate-900">Bulk Email Center</p>
                                        <p className="text-slate-500 text-[10px]">Send notifications to cohort</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
                            </Link>

                            <Link
                                href="/apply/internships/wi26"
                                target="_blank"
                                className="w-full text-left p-3 hover:bg-emerald-50/60 border border-slate-200/70 hover:border-emerald-200 rounded-xl transition-all text-xs flex items-center justify-between text-slate-800 group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <ExternalLink className="h-4 w-4 text-emerald-600" />
                                    <div>
                                        <p className="font-semibold text-slate-900">Public Application Portal</p>
                                        <p className="text-slate-500 text-[10px]">Open registration form</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            </Link>

                            <Link
                                href="/admin/events/create"
                                className="w-full text-left p-3 hover:bg-slate-50 border border-slate-200/70 rounded-xl transition-all text-xs flex items-center justify-between text-slate-800 group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Calendar className="h-4 w-4 text-sky-600" />
                                    <div>
                                        <p className="font-semibold text-slate-900">Create New Event / Workshop</p>
                                        <p className="text-slate-500 text-[10px]">Publish workshops & tech talks</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
                            </Link>

                            <Link
                                href="/admin/responses"
                                className="w-full text-left p-3 hover:bg-slate-50 border border-slate-200/70 rounded-xl transition-all text-xs flex items-center justify-between text-slate-800 group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <FileText className="h-4 w-4 text-slate-600" />
                                    <div>
                                        <p className="font-semibold text-slate-900">Event Form Responses</p>
                                        <p className="text-slate-500 text-[10px]">View Google Forms / event data</p>
                                    </div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                            </Link>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Vectonix Management Suite</span>
                        <span className="font-mono">v2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
