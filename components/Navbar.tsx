'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
    const { user, isAdmin, loading } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed w-full z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/80 backdrop-blur-xl shadow-sm py-1.5'
                : 'bg-white/60 backdrop-blur-sm py-3'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-0">
                            <Image
                                src="/logo.png"
                                alt="Vectonix Logo"
                                width={48}
                                height={48}
                                className="h-12 w-12 object-contain rounded-full"
                            />
                            <span className="font-bold text-2xl tracking-tighter text-slate-900">
                                Vectonix
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="relative group text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    {link.name}
                                    <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ))}

                            {/* Auth Buttons */}
                            {!loading && (
                                <>
                                    {user ? (
                                        <div className="flex items-center gap-4">
                                            {isAdmin && (
                                                <Link href="/admin">
                                                    <Button variant="outline" size="sm" className="flex items-center gap-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50">
                                                        <LayoutDashboard className="h-4 w-4" />
                                                        Dashboard
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button onClick={handleLogout} variant="ghost" size="sm" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </Button>
                                        </div>
                                    ) : (
                                        <Link href="/login">
                                            <Button size="sm" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                                                <LogIn className="h-4 w-4" />
                                                Login
                                            </Button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>



                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="bg-slate-100 inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 overflow-hidden"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 block px-3 py-2 rounded-md text-base font-medium"
                                >
                                    {link.name}
                                </Link>
                            ))}

                            {/* Mobile Auth Buttons */}
                            {!loading && (
                                <div className="pt-4 border-t border-slate-200 mt-2 space-y-2">
                                    {user ? (
                                        <>
                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 block px-3 py-2 rounded-md text-base font-medium"
                                                >
                                                    <LayoutDashboard className="h-5 w-5" />
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                                className="flex items-center gap-2 text-red-500 hover:bg-red-50 w-full text-left px-3 py-2 rounded-md text-base font-medium"
                                            >
                                                <LogOut className="h-5 w-5" />
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            href="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 block px-3 py-2 rounded-md text-base font-medium"
                                        >
                                            <LogIn className="h-5 w-5" />
                                            Login
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
