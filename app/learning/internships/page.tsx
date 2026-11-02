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
                    {/* Featured Winter Internship 2026 Card */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-8 sm:p-10 shadow-2xl border border-indigo-500/20">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="space-y-4 max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                                    <span>Applications Open • Batch WI26</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                    Vectonix Winter Internship <span className="text-indigo-400">2026</span>
                                </h2>
                                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                    Build industry-ready projects in Web Development, AI/ML, IoT, and Cloud with direct mentorship, verified completion certificates, and placement assistance.
                                </p>
                                <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
                                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-emerald-400" /> Dec 2026 – Jan 2027</span>
                                    <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-indigo-400" /> Verified Certificate</span>
                                    <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-400" /> Live Industry Projects</span>
                                </div>
                            </div>

                            <div className="flex-shrink-0 w-full md:w-auto">
                                <Link href="/apply/internships/wi26">
                                    <Button size="lg" className="w-full md:w-auto bg-indigo-500 hover:bg-indigo-600 text-white shadow-xl hover:shadow-indigo-500/30 font-semibold gap-2">
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
