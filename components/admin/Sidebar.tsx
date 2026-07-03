"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarPlus, FileText, LogOut, Award } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const sidebarLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Create Event", href: "/admin/events/create", icon: CalendarPlus },
    { name: "View Responses", href: "/admin/responses", icon: FileText },
    { name: "Certificates & Offers", href: "/admin/certificates", icon: Award },
];

export const Sidebar = () => {
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <div className="h-full w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col justify-between p-4 pt-20">
            <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-4">
                    Admin Menu
                </p>
                {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            {link.name}
                        </Link>
                    );
                })}
            </div>

            <div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
};
