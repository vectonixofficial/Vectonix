'use client';

import { useState, useEffect } from 'react';
import { Section } from "@/components/ui/Section";
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { EventCard } from "@/components/EventCard";

export default function CoursesPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const q = query(
                    collection(db, "events"),
                    where("category", "==", "Course")
                );
                const querySnapshot = await getDocs(q);
                let eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
                
                // Sort client-side: newest first, items without createdAt go to the end
                eventsData.sort((a, b) => {
                    const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
                    const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
                    return timeB - timeA;
                });
                
                setEvents(eventsData);
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-20">
            <Section className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px] -z-10" />

                <div className="text-center max-w-4xl mx-auto mb-16">
                    <MotionWrapper>
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
                            Premium <span className="text-purple-600">Courses</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
                            Structured learning paths to master in-demand technologies.
                            <span className="block mt-2 text-slate-900 font-medium">Build your expertise.</span>
                        </p>
                    </MotionWrapper>
                </div>

                <div className="max-w-5xl mx-auto space-y-6">
                    {loading ? (
                        <div className="text-center text-slate-400">Loading courses...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center text-slate-400">No courses available at the moment.</div>
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
