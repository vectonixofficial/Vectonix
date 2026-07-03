"use client";

import { useState } from "react";
import { eventsService } from "@/lib/services/eventsService";
import { storageService } from "@/lib/services/storageService";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Plus, Trash2, Calendar, Upload, Check } from "lucide-react";

export default function CreateEventPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // Event Details
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Workshop");
    const [status, setStatus] = useState("Upcoming");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [duration, setDuration] = useState("");
    const [certification, setCertification] = useState("Yes");
    const [regLink, setRegLink] = useState("");
    const [useInternalForm, setUseInternalForm] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState("");

    // Form Builder State
    const [customFields, setCustomFields] = useState<any[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const addField = () => {
        setCustomFields([
            ...customFields,
            { id: Date.now().toString(), label: "", type: "text", required: true }
        ]);
    };

    const updateField = (id: string, key: string, value: any) => {
        setCustomFields(customFields.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    const removeField = (id: string) => {
        setCustomFields(customFields.filter(f => f.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            let imageUrl = "";
            if (imageFile) {
                try {
                    imageUrl = await storageService.uploadFile("events", `${Date.now()}_${imageFile.name}`, imageFile);
                } catch {
                    imageUrl = imagePreview;
                }
            }

            const eventData = {
                title,
                description,
                date,
                time,
                category,
                image_url: imageUrl,
                registration_link: useInternalForm ? "" : regLink,
                custom_fields: useInternalForm ? customFields : [],
            };

            await eventsService.create(eventData);
            setSuccess(true);
            setTimeout(() => router.push("/admin"), 1500);
        } catch (err: any) {
            setError(err.message || "Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="rounded-full bg-green-50 border border-green-200 p-4 mb-4 animate-pulse">
                    <Check className="h-12 w-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Event Created Successfully!</h2>
                <p className="text-slate-500 mt-2">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create New Event</h1>
                <p className="text-slate-500 mt-1">Fill in the details to publish a new event.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Upload */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h2 className="text-xl font-bold text-slate-900">Event Banner</h2>
                    <div className="flex items-center gap-6">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="h-32 w-52 object-cover rounded-xl border border-slate-200" />
                        ) : (
                            <div className="h-32 w-52 bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-300">
                                <Calendar className="h-10 w-10 text-slate-300" />
                            </div>
                        )}
                        <div>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="banner-upload" />
                            <label htmlFor="banner-upload" className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors text-sm font-semibold border border-slate-200">
                                <Upload className="h-4 w-4" />
                                Upload Image
                            </label>
                            <p className="text-xs text-slate-400 mt-2">Recommended: 1200x630 or 16:9 ratio</p>
                        </div>
                    </div>
                </div>

                {/* Event Details */}
                <div className="glass-panel p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
                    <h2 className="text-xl font-bold text-slate-900 col-span-2">Event Information</h2>
                    
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Event Title</label>
                        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 text-slate-900 outline-none" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle / Short Description</label>
                        <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 text-slate-900 outline-none" placeholder="e.g., Master React in 2 hours" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Full Description</label>
                        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 text-slate-900 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 text-slate-900 outline-none">
                            <option value="Workshop">Workshop</option>
                            <option value="Internship">Internship</option>
                            <option value="Course">Course</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 text-slate-900 outline-none">
                            <option value="Upcoming">Upcoming</option>
                            <option value="Live">Live</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 text-slate-900 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                        <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 text-slate-900 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Duration (e.g., 2 Hours)</label>
                        <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 text-slate-900 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Certification</label>
                        <select value={certification} onChange={(e) => setCertification(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 text-slate-900 outline-none">
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                </div>

                {/* Form Logic Toggle */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Registration Method</h2>
                            <p className="text-sm text-slate-500 mt-1">Choose between external link or built-in website form.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500">{useInternalForm ? "Internal Form" : "External Link"}</span>
                            <button
                                type="button"
                                onClick={() => setUseInternalForm(!useInternalForm)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${useInternalForm ? "bg-indigo-600" : "bg-slate-200"}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ease-in-out ${useInternalForm ? "translate-x-6" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </div>

                    {!useInternalForm ? (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">External Registration Link</label>
                            <input type="url" value={regLink} onChange={(e) => setRegLink(e.target.value)} placeholder="https://google.com/form/..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:border-indigo-500 text-slate-900 outline-none" />
                        </div>
                    ) : (
                        <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900">Form Builder</h3>
                                <Button type="button" onClick={addField} size="sm" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center gap-1 border border-indigo-200">
                                    <Plus className="h-4 w-4" /> Add Field
                                </Button>
                            </div>
                            
                            <p className="text-xs text-slate-400">* Full Name, Email, Phone are collected by default.</p>

                            <div className="space-y-3">
                                {customFields.map((field) => (
                                    <div key={field.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                        <input
                                            type="text"
                                            value={field.label}
                                            onChange={(e) => updateField(field.id, "label", e.target.value)}
                                            placeholder="Question Label (e.g., College Name)"
                                            className="flex-1 bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none px-1 text-sm text-slate-900"
                                        />
                                        <select
                                            value={field.type}
                                            onChange={(e) => updateField(field.id, "type", e.target.value)}
                                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none"
                                        >
                                            <option value="text">Short Text</option>
                                            <option value="number">Number</option>
                                            <option value="dropdown">Dropdown</option>
                                        </select>
                                        <button type="button" onClick={() => removeField(field.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl shadow-md">
                    {loading ? "Publishing Event..." : "Publish Event"}
                </Button>
            </form>
        </div>
    );
}
