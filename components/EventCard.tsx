"use client";

import { CountdownTimer } from "@/components/CountdownTimer";
import { BadgeCheck, Calendar, Clock, Timer, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

interface EventCardProps {
    event: {
        id: string;
        title: string;
        subtitle?: string;
        description?: string;
        category: string;
        status: string;
        date: string;
        time: string;
        duration?: string;
        certification?: string;
        imageUrl?: string;
        useInternalForm?: boolean;
        regLink?: string;
    }
}

export const EventCard = ({ event }: EventCardProps) => {
    const [isCompleted, setIsCompleted] = useState(event.status === "Completed");

    const statusColors = {
        Upcoming: "bg-blue-50 border-blue-200 text-blue-600",
        Live: "bg-green-50 border-green-200 text-green-600",
        Completed: "bg-slate-100 border-slate-200 text-slate-500"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-indigo-200"
        >
            <div className="grid md:grid-cols-12 gap-6 p-6">
                {/* Image Section */}
                <div className="md:col-span-4 relative h-52 md:h-full bg-slate-100 rounded-2xl overflow-hidden">
                    {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="object-cover w-full h-full" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-300">
                            <Calendar className="h-12 w-12" />
                        </div>
                    )}
                    
                    <div className="absolute top-4 left-4 z-10">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-wider uppercase backdrop-blur-sm ${statusColors[event.status as keyof typeof statusColors] || statusColors.Upcoming}`}>
                            {event.status === "Live" && (
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                            )}
                            {isCompleted ? "Completed" : event.status}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="md:col-span-8 flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {event.title}
                                </h3>
                                {event.subtitle && <p className="text-slate-500 text-sm mt-1">{event.subtitle}</p>}
                            </div>

                            {!isCompleted && event.status === "Upcoming" && (
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 text-center">Starts In</p>
                                    <CountdownTimer targetDate={`${event.date}T${event.time}`} onComplete={() => setIsCompleted(true)} />
                                </div>
                            )}
                        </div>

                        <p className="text-slate-600 text-sm font-light mb-6 line-clamp-2">
                            {event.description}
                        </p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div>
                                <p className="flex items-center gap-1 text-slate-400 text-[10px] uppercase tracking-wider mb-1"><Calendar size={12} /> Date</p>
                                <p className="text-slate-900 text-sm font-medium">{event.date}</p>
                            </div>
                            <div>
                                <p className="flex items-center gap-1 text-slate-400 text-[10px] uppercase tracking-wider mb-1"><Clock size={12} /> Time</p>
                                <p className="text-slate-900 text-sm font-medium">{event.time}</p>
                            </div>
                            {event.duration && (
                                <div>
                                    <p className="flex items-center gap-1 text-slate-400 text-[10px] uppercase tracking-wider mb-1"><Timer size={12} /> Duration</p>
                                    <p className="text-slate-900 text-sm font-medium">{event.duration}</p>
                                </div>
                            )}
                            {event.certification && (
                                <div>
                                    <p className="flex items-center gap-1 text-slate-400 text-[10px] uppercase tracking-wider mb-1"><BadgeCheck size={12} /> Cert</p>
                                    <p className="text-indigo-600 text-sm font-medium">{event.certification}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100">
                        {isCompleted ? (
                            <Button disabled className="w-full bg-slate-100 text-slate-400 cursor-not-allowed font-semibold py-5 rounded-xl">
                                Registration Closed
                            </Button>
                        ) : event.useInternalForm ? (
                            <Link href={`/events/${event.id}`} className="w-full">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold py-5 rounded-xl text-white flex items-center justify-center gap-2 group">
                                    Register Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        ) : (
                            <Link href={event.regLink || "#"} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 font-bold py-5 rounded-xl flex items-center justify-center gap-2 group transition-all">
                                    Get Tickets <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
