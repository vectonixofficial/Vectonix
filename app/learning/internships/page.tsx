'use client';

import { useState, useEffect } from 'react';
import { Section } from "@/components/ui/Section";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { eventsService } from "@/lib/services/eventsService";
import { EventCard } from "@/components/EventCard";

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

                <div className="max-w-5xl mx-auto space-y-6">
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
