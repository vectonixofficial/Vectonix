"use client";

import { useState, useEffect } from "react";
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
    Target,
    PlaySquare,
    X,
    PanelLeftClose,
    PanelLeft
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface SubNavItem {
    name: string;
    href: string;
    icon: any;
}

export const internshipSubLinks: SubNavItem[] = [
    { name: "Batches & Cohorts", href: "/admin/internships/wi26", icon: Briefcase },
    { name: "Student Applications", href: "/admin/internships/wi26#students", icon: Users },
    { name: "Student Simulation Center", href: "/admin/internships/wi26/simulation", icon: PlaySquare },
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

export interface SidebarProps {
    isCollapsed?: boolean;
    isMobileOpen?: boolean;
    onToggleCollapse?: () => void;
    onCloseMobile?: () => void;
}

export const Sidebar = ({
    isCollapsed = false,
    isMobileOpen = false,
    onToggleCollapse,
    onCloseMobile
}: SidebarProps) => {
    const pathname = usePathname();
    const isInternshipRoute = pathname.startsWith("/admin/internships");
    const [internshipsOpen, setInternshipsOpen] = useState(true);

    // Auto close drawer on navigation
    useEffect(() => {
        if (onCloseMobile) {
            onCloseMobile();
        }
    }, [pathname]);

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

    const renderNavContent = (isMobileView = false) => {
        const collapsed = !isMobileView && isCollapsed;

        return (
            <div className="flex flex-col justify-between h-full">
                <div className="overflow-y-auto pr-1 space-y-1.5 flex-1 custom-scrollbar">
                    {!collapsed && (
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                            Admin Menu
                        </p>
                    )}

                    {/* 1. Overview */}
                    <div className="relative group">
                        <Link
                            href="/admin"
                            onClick={() => isMobileView && onCloseMobile?.()}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                pathname === "/admin"
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            } ${collapsed ? "justify-center px-0" : ""}`}
                        >
                            <LayoutDashboard className="h-4 w-4 shrink-0" />
                            {!collapsed && <span>Overview</span>}
                        </Link>
                        {collapsed && (
                            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                Overview
                            </div>
                        )}
                    </div>

                    {/* 2. Collapsible Internship Management Group */}
                    <div className="pt-1">
                        <div className="relative group">
                            <button
                                onClick={() => {
                                    if (collapsed && onToggleCollapse) {
                                        onToggleCollapse();
                                        setInternshipsOpen(true);
                                    } else {
                                        setInternshipsOpen(!internshipsOpen);
                                    }
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                    isInternshipRoute
                                        ? "bg-indigo-50/80 text-indigo-800 border border-indigo-100"
                                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                                } ${collapsed ? "justify-center px-0" : ""}`}
                            >
                                <div className="flex items-center gap-3">
                                    <FolderKanban className="h-4 w-4 shrink-0 text-indigo-600" />
                                    {!collapsed && <span>Internships</span>}
                                </div>
                                {!collapsed && (
                                    internshipsOpen ? (
                                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                    ) : (
                                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                                    )
                                )}
                            </button>
                            {collapsed && (
                                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    Internship Management
                                </div>
                            )}
                        </div>

                        {/* Sub links */}
                        {(internshipsOpen || isMobileView) && !collapsed && (
                            <div className="ml-3 pl-3 border-l-2 border-indigo-100 mt-1 space-y-0.5 animate-in fade-in duration-150">
                                {internshipSubLinks.map((item) => {
                                    const Icon = item.icon;
                                    const isActive =
                                        pathname === item.href ||
                                        (item.href.includes("#") && pathname === item.href.split("#")[0]);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => isMobileView && onCloseMobile?.()}
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                                                isActive
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

                    {/* 3. Event Management & Certificates */}
                    <div className="pt-2 border-t border-slate-100 space-y-1">
                        {!collapsed && (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1">
                                Events & Offers
                            </p>
                        )}

                        <div className="relative group">
                            <Link
                                href="/admin/events/create"
                                onClick={() => isMobileView && onCloseMobile?.()}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                                    pathname === "/admin/events/create"
                                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                } ${collapsed ? "justify-center px-0" : ""}`}
                            >
                                <CalendarPlus className="h-4 w-4 shrink-0" />
                                {!collapsed && <span>Create Event</span>}
                            </Link>
                            {collapsed && (
                                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    Create Event
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <Link
                                href="/admin/responses"
                                onClick={() => isMobileView && onCloseMobile?.()}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                                    pathname === "/admin/responses"
                                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                } ${collapsed ? "justify-center px-0" : ""}`}
                            >
                                <FileText className="h-4 w-4 shrink-0" />
                                {!collapsed && <span>View Responses</span>}
                            </Link>
                            {collapsed && (
                                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    View Responses
                                </div>
                            )}
                        </div>

                        <div className="relative group">
                            <Link
                                href="/admin/certificates"
                                onClick={() => isMobileView && onCloseMobile?.()}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                                    pathname === "/admin/certificates"
                                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                } ${collapsed ? "justify-center px-0" : ""}`}
                            >
                                <Award className="h-4 w-4 shrink-0" />
                                {!collapsed && <span>Certificates & Offers</span>}
                            </Link>
                            {collapsed && (
                                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    Certificates & Offers
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer / Toggle & Logout */}
                <div className="pt-3 border-t border-slate-100 space-y-1 mt-2">
                    {onToggleCollapse && !isMobileView && (
                        <button
                            onClick={onToggleCollapse}
                            className={`flex items-center gap-3 w-full px-3 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl text-xs font-semibold transition-colors ${
                                collapsed ? "justify-center px-0" : ""
                            }`}
                            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            {collapsed ? (
                                <PanelLeft className="h-4 w-4 shrink-0" />
                            ) : (
                                <>
                                    <PanelLeftClose className="h-4 w-4 shrink-0" />
                                    <span>Collapse Sidebar</span>
                                </>
                            )}
                        </button>
                    )}

                    <div className="relative group">
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-3 w-full px-3 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                                collapsed ? "justify-center px-0" : ""
                            }`}
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            {!collapsed && <span>Logout</span>}
                        </button>
                        {collapsed && (
                            <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-red-600 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                Logout
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Desktop Collapsible Sidebar */}
            <aside
                className={`hidden md:flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 bg-white/90 backdrop-blur-xl border-r border-slate-200 p-3.5 transition-all duration-300 ease-in-out shrink-0 z-20 ${
                    isCollapsed ? "w-20" : "w-64"
                }`}
            >
                {renderNavContent(false)}
            </aside>

            {/* Mobile Drawer Slide-in & Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
                    onClick={onCloseMobile}
                    aria-hidden="true"
                />
            )}

            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col justify-between p-4 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                }`}
                role="dialog"
                aria-modal="true"
                aria-label="Admin Navigation"
            >
                {/* Mobile Drawer Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                            VX
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 text-xs">Vectonix Admin</span>
                            <span className="block text-[10px] text-indigo-600 font-semibold font-mono">
                                Winter Internship 2026
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onCloseMobile}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Mobile Nav Links */}
                <div className="flex-1 overflow-hidden">
                    {renderNavContent(true)}
                </div>
            </div>
        </>
    );
};