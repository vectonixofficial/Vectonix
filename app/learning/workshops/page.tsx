'use client';

import { useState, useEffect } from 'react';
import { Section } from "@/components/ui/Section";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { motion } from "framer-motion";
import { eventsService } from "@/lib/services/eventsService";
import { EventCard } from "@/components/EventCard";
import Link from "next/link";

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 fill-current">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 414.4c-32 0-63.1-8.5-90.5-24.6l-6.5-3.9-67.4 17.7 18-65.6-4.2-6.8c-17.7-28.5-27-61.9-27-96.1 0-103.5 84.3-187.8 187.8-187.8 51.6 0 100.1 20 136.6 56.6s56.6 85 56.6 136.6c0 103.6-84.3 187.8-187.8 187.8zm102.5 140.2c-5.6-2.8-33.3-16.4-38.5-18.3-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.4 18.3-17.7 22.1-3.3 3.7-6.5 4.2-12.1 1.4-5.6-2.8-23.7-8.8-45.2-28-16.7-15-28-33.5-31.3-39.1-3.3-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.6-6.5 8.4-9.8 2.8-3.3 3.7-5.6 5.6-9.3 1.9-3.7.9-7-4.2-12.6C218 206 206.6 179 201.8 167c-4.7-11.7-9.5-10.1-12.9-10.3-3.3-.2-7-.2-10.7-.2-3.7 0-9.8 1.4-14.9 7S144 183.1 144 206.5c0 23.4 19.5 46.1 22.3 49.8 2.8 3.7 34 52 82.3 72.8 11.5 4.9 20.4 7.9 27.4 10.1 11.5 3.7 22 3.1 30.3 1.9 9.3-1.4 28.5-11.7 32.5-23 4-11.2 4-20.8 2.8-23-1.2-2.3-5-3.7-10.7-6.5z"/>
    </svg>
);

export default function WorkshopsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const allEvents = await eventsService.getAll();
                const workshopEvents = allEvents.filter(e => e.category === "Workshop" || !e.category);
                setEvents(workshopEvents);
            } catch (error) {
                console.error("Error fetching workshops:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-20">
            <Section className="relative overflow-hidden">
                {/* Subtle, Professional Background Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-100/30 rounded-full blur-[120px] -z-10" />

                <div className="text-center max-w-4xl mx-auto mb-16">
                    <MotionWrapper>
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
                            Master Class <span className="text-indigo-600">Series</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
                            Join industry experts for intensive, hands-on technical workshops.
                            <span className="block mt-2 text-slate-900 font-medium">Elevate your craft.</span>
                        </p>

                        {/* WhatsApp Channel Banner */}
                        <Link href="https://whatsapp.com/channel/0029Vb7YFfeKwqSTJmabLy2S" target="_blank" rel="noopener noreferrer">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mt-8 mx-auto max-w-md bg-green-50 border border-green-200 hover:border-green-300 rounded-2xl p-4 flex items-center gap-4 transition-all hover:bg-green-100 group cursor-pointer"
                            >
                                <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-green-500/50 bg-white">
                                    <img src="/logo.png" alt="Vectonix Logo" className="h-full w-full object-cover" />
                                </div>
                                <div className="text-left flex-1">
                                    <p className="text-slate-900 font-bold flex items-center gap-2">
                                        Vectonix Official
                                        <span className="text-green-600"><WhatsAppIcon /></span>
                                    </p>
                                    <p className="text-xs text-green-700">Join our WhatsApp Channel for quick updates and meeting links!</p>
                                </div>
                            </motion.div>
                        </Link>
                    </MotionWrapper>
                </div>

                <div className="max-w-5xl mx-auto space-y-6">
                    {loading ? (
                        <div className="text-center text-slate-400">Loading workshops...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center text-slate-400">No workshops scheduled. Check back soon!</div>
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

