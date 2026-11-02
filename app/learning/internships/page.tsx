'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Section } from "@/components/ui/Section";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { eventsService } from "@/lib/services/eventsService";
import { EventCard } from "@/components/EventCard";
import { Sparkles, ArrowRight, Calendar, Award, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function InternshipsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const allEvents = await eventsService.getAll();
                const internshipEvents = allEvents.filter(e => e.category === "Internship");
                setEvents(internshipEvents);
            } catch (error) {
                console.error("Error fetching internships:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-20">
            <Section className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[120px] -z-10" />

                <div className="text-center max-w-4xl mx-auto mb-16">
                    <MotionWrapper>
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
                            Career <span className="text-emerald-600">Internships</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
                            Gain real-world experience and kickstart your tech career.
                            <span className="block mt-2 text-slate-900 font-medium">Work on live projects.</span>
                        </p>
                    </MotionWrapper>
                </div>

                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Featured Winter Internship 2026 Card - Light Theme */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/60 p-8 sm:p-10 shadow-xl border border-indigo-100/90">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-200/20 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="space-y-4 max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-xs">
                                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                                    <span>Applications Open • Batch WI26</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                                    Vectonix Winter Internship <span className="text-indigo-600">2026</span>
                                </h2>
                                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                    Build industry-ready projects in Web Development, AI/ML, IoT, and Cloud with direct mentorship, verified completion certificates, and placement assistance.
                                </p>
                                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700 pt-1">
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200/80 shadow-xs">
                                        <Calendar className="h-4 w-4 text-emerald-600" /> Dec 2026 – Jan 2027
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200/80 shadow-xs">
                                        <Award className="h-4 w-4 text-indigo-600" /> Verified Certificate
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200/80 shadow-xs">
                                        <CheckCircle className="h-4 w-4 text-emerald-600" /> Live Industry Projects
                                    </span>
                                </div>
                            </div>

                            <div className="flex-shrink-0 w-full md:w-auto">
                                <Link href="/apply/internships/wi26">
                                    <Button size="lg" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl hover:shadow-indigo-600/30 font-semibold gap-2 py-6 px-8 rounded-xl text-sm">
                                        Apply for Batch WI26
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center text-slate-400">Loading internships...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center text-slate-400">No internships listed. Check back soon!</div>
                    ) : (
                        events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))
                    )}
                </div>
            </Section>
        </div>
    );
}
