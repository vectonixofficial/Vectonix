"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CalendarPlus,
    FileText,
    LogOut,
    Award,
    Briefcase,
    Mail,
    FolderKanban,
    Layers,
    CheckSquare,
    ChevronDown,
    ChevronRight,
    Users,
    BarChart3,
    Video,
    Bell,
    BookOpen,
    HelpCircle,
    Target
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface SubNavItem {
    name: string;
    href: string;
    icon: any;
}

const internshipSubLinks: SubNavItem[] = [
    { name: "Batches & Cohorts", href: "/admin/internships/wi26", icon: Briefcase },
    { name: "Student Applications", href: "/admin/internships/wi26#students", icon: Users },
    { name: "Project Bank", href: "/admin/internships/wi26/projects", icon: FolderKanban },
    { name: "Project Allocations", href: "/admin/internships/wi26/allocations", icon: Layers },
    { name: "Milestones & Workspace", href: "/admin/internships/wi26#milestones", icon: Target },
    { name: "Quizzes & Assessments", href: "/admin/internships/wi26#quizzes", icon: CheckSquare },
    { name: "Quiz Results & Analytics", href: "/admin/internships/wi26#quiz-analytics", icon: BarChart3 },
    { name: "Weekly Review Meetings", href: "/admin/internships/wi26#reviews", icon: Video },
    { name: "Announcements Broadcast", href: "/admin/internships/wi26#announcements", icon: Bell },
    { name: "Learning Resources", href: "/admin/internships/wi26#resources", icon: BookOpen },
    { name: "Mentor Support Desk", href: "/admin/internships/wi26#mentor-desk", icon: HelpCircle },
    { name: "Internship Broadcast Emails", href: "/admin/internships/wi26/emails", icon: Mail },
    { name: "Certificates & Completions", href: "/admin/certificates", icon: Award }
];

export const Sidebar = () => {
    const pathname = usePathname();
    const isInternshipRoute = pathname.startsWith("/admin/internships");
    const [internshipsOpen, setInternshipsOpen] = useState(true);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            if (typeof window !== "undefined") {
                sessionStorage.clear();
                localStorage.removeItem("admin_token");
                window.location.replace("/login");
            }
        } catch (error) {
            console.error("Logout error", error);
            if (typeof window !== "undefined") {
                window.location.replace("/login");
            }
        }
    };

    return (
        <div className="h-full w-64 bg-white/90 backdrop-blur-xl border-r border-slate-200 flex flex-col justify-between p-4 pt-20">
            <div className="overflow-y-auto pr-1 space-y-1.5 max-h-[calc(100vh-160px)]">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
                    Admin Menu
                </p>

                {/* 1. Overview */}
                <Link
                    href="/admin"
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                        pathname === "/admin"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Overview</span>
                </Link>

                {/* 2. Collapsible Internship Management Group */}
                <div className="pt-1">
                    <button
                        onClick={() => setInternshipsOpen(!internshipsOpen)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                            isInternshipRoute
                                ? "bg-indigo-50/70 text-indigo-800"
                                : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <FolderKanban className="h-4 w-4 text-indigo-600" />
                            <span>Internship Management</span>
                        </div>
                        {internshipsOpen ? (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        )}
                    </button>

                    {internshipsOpen && (
                        <div className="ml-3 pl-3 border-l-2 border-indigo-100 mt-1 space-y-0.5 animate-in fade-in duration-200">
                            {internshipSubLinks.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href || (item.href.includes("#") && pathname === item.href.split("#")[0]);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                                            pathname === item.href
                                                ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                                                : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50"
                                        }`}
                                    >
                                        <Icon className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 3. Event Management */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                    <Link
                        href="/admin/events/create"
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                            pathname === "/admin/events/create"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                    >
                        <CalendarPlus className="h-4 w-4" />
                        <span>Create Event</span>
                    </Link>

                    <Link
                        href="/admin/responses"
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                            pathname === "/admin/responses"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        <span>View Responses</span>
                    </Link>

                    <Link
                        href="/admin/certificates"
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                            pathname === "/admin/certificates"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                    >
                        <Award className="h-4 w-4" />
                        <span>Certificates &amp; Offers</span>
                    </Link>
                </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};
