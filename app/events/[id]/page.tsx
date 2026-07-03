"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Calendar, Clock, BadgeCheck, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 fill-current">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 414.4c-32 0-63.1-8.5-90.5-24.6l-6.5-3.9-67.4 17.7 18-65.6-4.2-6.8c-17.7-28.5-27-61.9-27-96.1 0-103.5 84.3-187.8 187.8-187.8 51.6 0 100.1 20 136.6 56.6s56.6 85 56.6 136.6c0 103.6-84.3 187.8-187.8 187.8zm102.5 140.2c-5.6-2.8-33.3-16.4-38.5-18.3-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.4 18.3-17.7 22.1-3.3 3.7-6.5 4.2-12.1 1.4-5.6-2.8-23.7-8.8-45.2-28-16.7-15-28-33.5-31.3-39.1-3.3-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.6-6.5 8.4-9.8 2.8-3.3 3.7-5.6 5.6-9.3 1.9-3.7.9-7-4.2-12.6C218 206 206.6 179 201.8 167c-4.7-11.7-9.5-10.1-12.9-10.3-3.3-.2-7-.2-10.7-.2-3.7 0-9.8 1.4-14.9 7S144 183.1 144 206.5c0 23.4 19.5 46.1 22.3 49.8 2.8 3.7 34 52 82.3 72.8 11.5 4.9 20.4 7.9 27.4 10.1 11.5 3.7 22 3.1 30.3 1.9 9.3-1.4 28.5-11.7 32.5-23 4-11.2 4-20.8 2.8-23-1.2-2.3-5-3.7-10.7-6.5z"/>
    </svg>
);

export default function RegistrationPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id as string;

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Form inputs state
    const [formData, setFormData] = useState<any>({
        fullName: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const docRef = doc(db, "events", eventId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setEvent({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError("Event not found");
                }
            } catch (err: any) {
                setError("Failed to load event details");
            } finally {
                setLoading(false);
            }
        };

        if (eventId) fetchEvent();
    }, [eventId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        try {
            await addDoc(collection(db, "registrations"), {
                eventId,
                answers: formData,
                timestamp: serverTimestamp()
            });
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to submit registration");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading form...</div>;

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
            <p className="text-xl font-semibold">{error}</p>
            <Link href="/learning" className="mt-4 text-indigo-600 hover:underline flex items-center gap-1">
                <ArrowLeft size={16} /> Back to Learning Hub
            </Link>
        </div>
    );

    if (success) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="rounded-full bg-green-50 p-5 mb-4 border border-green-200">
                <CheckCircle className="h-16 w-16 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Registration Successful!</h1>
            <p className="text-slate-500 max-w-md mb-8">You are successfully registered for <strong>{event.title}</strong>. We will contact you soon with further details.</p>
            
            <div className="glass-panel p-6 rounded-3xl max-w-md w-full shadow-lg mb-8">
                <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden border-4 border-green-500/30 bg-white">
                        <img src="/logo.png" alt="Vectonix Logo" className="h-full w-full object-cover" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Join Vectonix Official</h2>
                <p className="text-sm text-slate-500 mb-6">Get your meeting links, event updates, and connect with peers in our WhatsApp channel!</p>
                
                <Link href="https://whatsapp.com/channel/0029Vb7YFfeKwqSTJmabLy2S" target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-6 rounded-xl flex items-center justify-center gap-2 group transition-all text-lg shadow-lg shadow-[#25D366]/20">
                        <WhatsAppIcon /> Join WhatsApp Channel
                    </Button>
                </Link>
            </div>

            <Link href="/learning">
                <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl"> Back to Hub </Button>
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-20 px-4">
            <div className="max-w-4xl mx-auto grid md:grid-cols-12 gap-8">
                {/* Left Side: Event Summary */}
                <div className="md:col-span-5 space-y-6">
                    <Link href="/learning" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm transition-colors">
                        <ArrowLeft size={16} /> Back
                    </Link>

                    {event.imageUrl && (
                        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                            <img src={event.imageUrl} alt={event.title} className="w-full h-auto object-cover" />
                        </div>
                    )}

                    <div>
                        <span className="text-xs font-bold tracking-widest uppercase text-indigo-600">{event.category}</span>
                        <h1 className="text-2xl font-bold text-slate-900 mt-1">{event.title}</h1>
                        {event.subtitle && <p className="text-slate-500 text-sm mt-1">{event.subtitle}</p>}
                    </div>

                    <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200 text-slate-700">
                        <div className="flex items-center gap-2 text-slate-700 text-sm">
                            <Calendar size={16} className="text-slate-400" /> <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700 text-sm">
                            <Clock size={16} className="text-slate-400" /> <span>{event.time}</span>
                        </div>
                        {event.duration && (
                            <div className="flex items-center gap-2 text-slate-700 text-sm">
                                <Clock size={16} className="text-slate-400" /> <span>Duration: {event.duration}</span>
                            </div>
                        )}
                        {event.certification === "Yes" && (
                            <div className="flex items-center gap-2 text-indigo-600 text-sm">
                                <BadgeCheck size={16} /> <span>Certification Included</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Registration Form */}
                <div className="md:col-span-7">
                    <div className="glass-panel p-6 md:p-8 rounded-3xl">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Registration Form</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Default Fields */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Full Name</label>
                                <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 text-slate-900 outline-none placeholder:text-slate-400" placeholder="Your full name" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Email Address</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 text-slate-900 outline-none placeholder:text-slate-400" placeholder="your@email.com" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-2">Phone Number</label>
                                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 text-slate-900 outline-none placeholder:text-slate-400" placeholder="Your phone number" />
                            </div>

                            {/* Custom Fields */}
                            {event.customFields?.map((field: any) => (
                                <div key={field.id}>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">{field.label}</label>
                                    {field.type === "dropdown" ? (
                                        <select
                                            name={field.label}
                                            required={field.required}
                                            value={formData[field.label] || ""}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 text-slate-900 outline-none"
                                        >
                                            <option value="">Select Option</option>
                                            {field.options?.map((opt: string) => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type={field.type}
                                            name={field.label}
                                            required={field.required}
                                            value={formData[field.label] || ""}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 text-slate-900 outline-none"
                                        />
                                    )}
                                </div>
                            ))}

                            <div className="pt-4">
                                <Button type="submit" disabled={submitting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl shadow-md">
                                    {submitting ? "Submitting..." : "Submit Registration"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
