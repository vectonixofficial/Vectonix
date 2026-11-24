"use client";

import { useAuth } from "@/lib/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/admin/Sidebar";
import {
    Menu,
    PanelLeftClose,
    PanelLeft,
    ExternalLink,
    ShieldCheck,
    Layers,
    ChevronRight
} from "lucide-react";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Redirect unauthenticated users
    useEffect(() => {
        if (!loading) {
            if (!user || !isAdmin) {
                router.push("/login");
            }
        }
    }, [user, isAdmin, loading, router]);

    // Close mobile drawer on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Handle Escape key to close mobile drawer
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isMobileOpen) {
                setIsMobileOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isMobileOpen]);

    // Prevent background scrolling when mobile drawer is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMobileOpen]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return null; // Will redirect via useEffect
    }

    // Determine readable breadcrumb title from pathname
    const getPageTitle = () => {
        if (pathname === "/admin") return "Overview";
        if (pathname.includes("/admin/internships/wi26/projects")) return "Project Bank";
        if (pathname.includes("/admin/internships/wi26/allocations")) return "Project Allocations";
        if (pathname.includes("/admin/internships/wi26/simulation")) return "Student Simulation Center";
        if (pathname.includes("/admin/internships/wi26/emails")) return "Broadcast Emails";
        if (pathname.includes("/admin/internships/wi26")) return "Winter Internship 2026";
        if (pathname.includes("/admin/certificates")) return "Certificates & Offers";
        if (pathname.includes("/admin/events")) return "Event Management";
        if (pathname.includes("/admin/responses")) return "Form Responses";
        return "Admin Portal";
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            {/* Top Admin Sub-Header / Toggle Bar */}
            <header className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5 sm:gap-4">
                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileOpen(true)}
                        className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                        aria-label="Open Admin Menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    {/* Desktop Sidebar Collapse Toggle */}
                    <button
                        type="button"
                        onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                        className="hidden md:flex p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        aria-label={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isDesktopCollapsed ? (
                            <PanelLeft className="h-4 w-4" />
                        ) : (
                            <PanelLeftClose className="h-4 w-4" />
                        )}
                    </button>

                    {/* Page Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-semibold text-slate-400 hidden sm:inline">Admin</span>
                        <ChevronRight className="h-3 w-3 text-slate-300 hidden sm:inline" />
                        <span className="font-bold text-slate-900 text-xs sm:text-sm truncate max-w-[160px] sm:max-w-xs">
                            {getPageTitle()}
                        </span>
                        <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 ml-2">
                            <Layers className="h-2.5 w-2.5" /> WI26
                        </span>
                    </div>
                </div>

                {/* Right Quick Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/internship/dashboard"
                        target="_blank"
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                        title="Open Student Dashboard"
                    >
                        <ExternalLink className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Student View</span>
                    </Link>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50/80 border border-indigo-100 text-[11px] font-bold text-indigo-700">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                        <span className="hidden xs:inline">Admin</span>
                    </div>
                </div>
            </header>

            {/* Layout Body */}
            <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
                <Sidebar
                    isCollapsed={isDesktopCollapsed}
                    isMobileOpen={isMobileOpen}
                    onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                    onCloseMobile={() => setIsMobileOpen(false)}
                />
                <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden min-w-0 max-w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}