'use client';

import { CountdownTimer } from "@/components/CountdownTimer";
import Image from "next/image";
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Section } from "@/components/ui/Section";
import { Calendar, Clock, Timer, BadgeCheck, Phone, ExternalLink, X, ZoomIn } from 'lucide-react';
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { MotionWrapper } from "@/components/ui/MotionWrapper";



export default function WorkshopsPage() {
    const [isPosterOpen, setIsPosterOpen] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    return (
        <div className="min-h-screen pt-24 pb-20">
            <Section className="relative overflow-hidden">
                {/* Subtle, Professional Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] -z-10" />

                <div className="text-center max-w-4xl mx-auto mb-16">
                    <MotionWrapper>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                            Master Class <span className="text-accent-electric">Series</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto leading-relaxed">
                            Join industry experts for intensive, hands-on technical workshops.
                            <span className="block mt-2 text-white font-medium">Elevate your craft.</span>
                        </p>
                    </MotionWrapper>
                </div>

                <div className="max-w-6xl mx-auto">
                    <MotionWrapper delay={0.1} direction="up">
                        <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl">
                            <div className="grid lg:grid-cols-12 gap-0">
                                {/* Left: Visual / Poster Area */}
                                <div
                                    className="lg:col-span-4 relative h-[500px] lg:h-auto bg-black/40 cursor-zoom-in group/poster overflow-hidden"
                                    onClick={() => setIsPosterOpen(true)}
                                >
                                    <Image
                                        src="/android-workshop.png"
                                        alt="Android App Development Workshop"
                                        fill
                                        className="object-contain p-4 transition-transform duration-500 group-hover/poster:scale-105"
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover/poster:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/poster:opacity-100">
                                        <div className="bg-black/50 backdrop-blur-md p-3 rounded-full text-white">
                                            <ZoomIn size={24} />
                                        </div>
                                    </div>

                                    <div className="absolute top-6 left-6 pointer-events-none z-10">
                                        {isCompleted ? (
                                            <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1.5 rounded-full">
                                                <BadgeCheck size={14} className="text-green-400" />
                                                <span className="text-green-400 text-xs font-bold tracking-widest uppercase">Completed</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-accent-electric/10 backdrop-blur-md border border-accent-electric/20 px-3 py-1.5 rounded-full">
                                                <span className="relative flex h-2.5 w-2.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-electric opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-electric"></span>
                                                </span>
                                                <span className="text-accent-electric text-xs font-bold tracking-widest uppercase">Live Session</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Completion Overlay */}
                                    {isCompleted && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-0">
                                            <div className="bg-black/40 p-4 rounded-full mb-4 border border-green-500/30">
                                                <BadgeCheck size={48} className="text-green-400" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Successfully Completed</h3>
                                            <p className="text-gray-300 text-sm">Thank you for participating!</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Content Area */}
                                <div className="lg:col-span-8 p-8 md:p-12 flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-8 border-b border-white/5">
                                            <div>
                                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Android App Development</h2>
                                                <p className="text-gray-400">with Kotlin & Jetpack Compose</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 text-center">
                                                    {isCompleted ? "Status" : "Starts In"}
                                                </p>
                                                {isCompleted ? (
                                                    <div className="text-center px-4 py-2">
                                                        <span className="text-xl font-bold text-green-400 font-mono">COMPLETED</span>
                                                    </div>
                                                ) : (
                                                    <CountdownTimer
                                                        targetDate="2026-02-18T20:30:00+05:30"
                                                        onComplete={() => setIsCompleted(true)}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-gray-300 leading-relaxed mb-8 text-lg font-light">
                                            Go beyond the basics. Build production-ready Android applications using the latest modern toolkits.
                                            This workshop covers state management, UI design patterns, and app architecture.
                                        </p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                                            <div>
                                                <p className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider mb-1">
                                                    <Calendar size={14} /> Date
                                                </p>
                                                <p className="text-white font-medium">Feb 18, 2026</p>
                                            </div>
                                            <div>
                                                <p className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider mb-1">
                                                    <Clock size={14} /> Time
                                                </p>
                                                <p className="text-white font-medium">8:30 PM IST</p>
                                            </div>
                                            <div>
                                                <p className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider mb-1">
                                                    <Timer size={14} /> Duration
                                                </p>
                                                <p className="text-white font-medium">60 Mins</p>
                                            </div>
                                            <div>
                                                <p className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wider mb-1">
                                                    <BadgeCheck size={14} /> Certification
                                                </p>
                                                <p className="text-accent-electric font-medium">Included</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                        <Link href="https://forms.gle/JYzdpUNph7VdNYeq7" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex-1">
                                            <Button className="w-full bg-white text-black hover:bg-gray-200 font-bold py-6 rounded-xl flex items-center justify-center gap-2 transition-all group">
                                                Reserve Your Spot <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
                                        <div className="flex items-center gap-2 px-6 py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-medium whitespace-nowrap">
                                            <span>Free Registration</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </MotionWrapper>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            Need help? Call us at <span className="text-gray-300 font-mono mx-1">6382340278</span>
                        </p>
                    </div>
                </div>

                {/* Lightbox / Modal */}
                {/* Lightbox / Modal */}
                <AnimatePresence>
                    {isPosterOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-10"
                            onClick={() => setIsPosterOpen(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button near the poster */}
                                <Button
                                    className="absolute -top-12 -right-2 md:top-1/2 md:-right-24 md:-translate-y-1/2 z-[110] bg-white/10 hover:bg-white/20 text-white rounded-full p-2 h-12 w-12 flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
                                    onClick={() => setIsPosterOpen(false)}
                                >
                                    <X size={24} />
                                </Button>
                                <Image
                                    src="/android-workshop.png"
                                    alt="Android App Development Workshop Full"
                                    width={800}
                                    height={1000}
                                    className="max-h-[85vh] w-auto h-auto rounded-lg shadow-2xl object-contain"
                                    priority
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Section>
        </div>
    );
}
