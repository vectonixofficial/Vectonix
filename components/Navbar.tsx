'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut, LayoutDashboard, ExternalLink, ShieldCheck, GraduationCap, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Products', href: '/products' },
    { name: 'Learning', href: '/learning' },
    { name: 'Careers', href: '/careers' },
    { name: 'Contact', href: '/contact' },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showLoginDropdown, setShowLoginDropdown] = useState(false);
    const pathname = usePathname();
    const { user, isAdmin, loading } = useAuth();

    const isAdminRoute = pathname?.startsWith('/admin');

    const handleLogout = async () => {
        try {
            await signOut(auth);
            if (typeof window !== "undefined") {
                localStorage.removeItem("vx_active_student");
                localStorage.removeItem("vx_active_student_token");
                sessionStorage.clear();
                window.location.replace(isAdminRoute ? "/login" : "/internship/login");
            }
        } catch (error) {
            console.error("Logout error", error);
            if (typeof window !== "undefined") {
                window.location.replace("/login");
            }
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 15) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Get current section name for Admin Header
    const getAdminSectionTitle = () => {
        if (!pathname) return 'Admin Dashboard';
        if (pathname.includes('/admin/certificates')) return 'Certificates & Offer Letters';
        if (pathname.includes('/admin/events')) return 'Events';
        if (pathname.includes('/admin/responses')) return 'Form Responses';
        return 'Overview';
    };

    return (
        <motion.header
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
                isAdminRoute
                    ? 'bg-slate-900/95 text-white backdrop-blur-md border-b border-slate-800 shadow-md py-2.5'
                    : scrolled
                    ? 'bg-white/90 backdrop-blur-xl shadow-xs border-b border-slate-200/70 py-2'
                    : 'bg-white/70 backdrop-blur-md border-b border-slate-100 py-3'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-12">

                    {/* Left: Brand Logo & Title */}
                    <div className="flex items-center gap-3">
                        <Link href={isAdminRoute ? "/admin" : "/"} className="flex items-center gap-2.5 group">
                            <Image
                                src="/logo.png"
                                alt="Vectonix Logo"
                                width={40}
                                height={40}
                                className="h-10 w-10 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-transform"
                            />
                            <div className="flex flex-col">
                                <span className={`font-bold text-xl tracking-tight leading-none ${
                                    isAdminRoute ? 'text-white' : 'text-slate-900'
                                }`}>
                                    Vectonix
                                </span>
                                {isAdminRoute ? (
                                    <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-400 mt-0.5 flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" /> Admin Control
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase mt-0.5">
                                        Technologies
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* Admin Route Section Title */}
                        {isAdminRoute && (
                            <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-slate-800 text-xs font-medium text-slate-400">
                                <span className="text-slate-500">Admin</span>
                                <span>/</span>
                                <span className="text-indigo-400 font-semibold">{getAdminSectionTitle()}</span>
                            </div>
                        )}
                    </div>

                    {/* Desktop Navigation */}
                    {isAdminRoute ? (
                        /* ADMIN TOP BAR RIGHT CONTROLS */
                        <div className="hidden md:flex items-center gap-3">
                            <Link
                                href="/"
                                className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <ExternalLink className="h-3.5 w-3.5 text-indigo-400" />
                                View Website
                            </Link>

                            <div className="h-4 w-px bg-slate-800" />

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-900/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        /* PUBLIC WEBSITE DESKTOP MENU */
                        <div className="hidden md:flex items-center space-x-6">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`relative py-1.5 text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'text-indigo-600 font-semibold'
                                                : 'text-slate-600 hover:text-indigo-600'
                                        }`}
                                    >
                                        {link.name}
                                        {isActive && (
                                            <motion.span
                                                layoutId="activeNavIndicator"
                                                className="absolute left-0 right-0 bottom-0 h-0.5 bg-indigo-600 rounded-full"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}

                            {/* Auth Actions */}
                            {!loading && (
                                <div className="pl-2 border-l border-slate-200/80 flex items-center gap-3">
                                    {user ? (
                                        <>
                                            {isAdmin && (
                                                <Link href="/admin">
                                                    <Button variant="outline" size="sm" className="flex items-center gap-1.5 border-indigo-500 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold">
                                                        <LayoutDashboard className="h-3.5 w-3.5" />
                                                        Admin Panel
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button onClick={handleLogout} variant="ghost" size="sm" className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs">
                                                <LogOut className="h-3.5 w-3.5" />
                                                Logout
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowLoginDropdown((prev) => !prev)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                                            >
                                                <LogIn className="h-3.5 w-3.5" />
                                                <span>Login</span>
                                                <ChevronDown className="h-3 w-3 opacity-80" />
                                            </button>

                                            <AnimatePresence>
                                                {showLoginDropdown && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-left"
                                                    >
                                                        <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                Choose Portal
                                                            </p>
                                                        </div>

                                                        {/* Student Login */}
                                                        <Link
                                                            href="/login?tab=student"
                                                            onClick={() => setShowLoginDropdown(false)}
                                                            className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-indigo-50/80 transition-colors group cursor-pointer"
                                                        >
                                                            <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors mt-0.5">
                                                                <GraduationCap className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                                                                    Student Login
                                                                </p>
                                                                <p className="text-[11px] text-slate-500">
                                                                    App ID & registered email
                                                                </p>
                                                            </div>
                                                        </Link>

                                                        {/* Admin Login */}
                                                        <Link
                                                            href="/login?tab=admin"
                                                            onClick={() => setShowLoginDropdown(false)}
                                                            className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
                                                        >
                                                            <div className="p-1.5 rounded-md bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-colors mt-0.5">
                                                                <Shield className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-900 group-hover:text-slate-800">
                                                                    Admin Login
                                                                </p>
                                                                <p className="text-[11px] text-slate-500">
                                                                    Management dashboard sign-in
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <div className="-mr-1 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                                isAdminRoute
                                    ? 'bg-slate-800 text-slate-200 hover:text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                            aria-label="Toggle Navigation"
                        >
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 top-[60px] bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
                        />

                        {/* Drawer Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`relative z-50 md:hidden border-b shadow-xl ${
                                isAdminRoute
                                    ? 'bg-slate-900 text-white border-slate-800'
                                    : 'bg-white/95 backdrop-blur-2xl text-slate-800 border-slate-200'
                            }`}
                        >
                            <div className="px-4 pt-3 pb-5 space-y-1 sm:px-6">
                                {isAdminRoute ? (
                                    /* Admin Mobile Links */
                                    <div className="space-y-2 py-1">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                                            Admin Navigation
                                        </div>
                                        {[
                                            { name: "Overview", href: "/admin" },
                                            { name: "Certificates & Offer Letters", href: "/admin/certificates" },
                                            { name: "Form Responses", href: "/admin/responses" },
                                            { name: "Create Event", href: "/admin/events/create" },
                                        ].map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                                    pathname === item.href
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'text-slate-300 hover:bg-slate-800'
                                                }`}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}

                                        <div className="pt-3 border-t border-slate-800 mt-3 space-y-2">
                                            <Link
                                                href="/"
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-2 text-indigo-400 hover:bg-slate-800 px-3 py-2.5 rounded-lg text-sm font-semibold"
                                            >
                                                <ExternalLink className="h-4 w-4" /> View Live Website
                                            </Link>
                                            <button
                                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                                className="flex items-center gap-2 text-red-400 hover:bg-red-950/50 w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold"
                                            >
                                                <LogOut className="h-4 w-4" /> Logout
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Public Mobile Links */
                                    <>
                                        {navLinks.map((link) => {
                                            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
                                            return (
                                                <Link
                                                    key={link.name}
                                                    href={link.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`block px-3 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                                                        isActive
                                                            ? 'bg-indigo-50 text-indigo-600'
                                                            : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {link.name}
                                                </Link>
                                            );
                                        })}

                                        {!loading && (
                                            <div className="pt-4 border-t border-slate-200/80 mt-2 space-y-2">
                                                {user ? (
                                                    <>
                                                        {isAdmin && (
                                                            <Link
                                                                href="/admin"
                                                                onClick={() => setIsOpen(false)}
                                                                className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-3 py-2.5 rounded-lg text-base font-semibold"
                                                            >
                                                                <LayoutDashboard className="h-5 w-5" />
                                                                Admin Dashboard
                                                            </Link>
                                                        )}
                                                        <button
                                                            onClick={() => { handleLogout(); setIsOpen(false); }}
                                                            className="flex items-center gap-2 text-red-500 hover:bg-red-50 w-full text-left px-3 py-2.5 rounded-lg text-base font-semibold"
                                                        >
                                                            <LogOut className="h-5 w-5" />
                                                            Logout
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="space-y-2 pt-1">
                                                        <Link
                                                            href="/login?tab=student"
                                                            onClick={() => setIsOpen(false)}
                                                            className="flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-3 rounded-xl text-sm font-semibold text-center shadow-xs"
                                                        >
                                                            <GraduationCap className="h-4 w-4" />
                                                            <span>Student Login (Internship)</span>
                                                        </Link>

                                                        <Link
                                                            href="/login?tab=admin"
                                                            onClick={() => setIsOpen(false)}
                                                            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-800 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-center border border-slate-200"
                                                        >
                                                            <Shield className="h-4 w-4 text-slate-600" />
                                                            <span>Admin Login</span>
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Navbar;
