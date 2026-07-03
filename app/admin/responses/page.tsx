"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Download, FileSpreadsheet, Eye } from "lucide-react";
import * as XLSX from "xlsx";

export default function ResponsesPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [responses, setResponses] = useState<any[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingResponses, setLoadingResponses] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setEvents(eventsData);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoadingEvents(false);
            }
        };
        fetchEvents();
    }, []);

    const fetchResponses = async (event: any) => {
        setSelectedEvent(event);
        setLoadingResponses(true);
        try {
            const q = query(collection(db, "registrations"), where("eventId", "==", event.id));
            const querySnapshot = await getDocs(q);
            const responsesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setResponses(responsesData);
        } catch (error) {
            console.error("Error fetching responses:", error);
        } finally {
            setLoadingResponses(false);
        }
    };

    const downloadExcel = () => {
        if (!selectedEvent || responses.length === 0) return;

        // Prepare data for Excel
        const excelData = responses.map(r => {
            const row: any = {
                "Timestamp": r.timestamp ? new Date(r.timestamp.seconds * 1000).toLocaleString() : "N/A",
                "Name": r.answers?.fullName || "N/A",
                "Email": r.answers?.email || "N/A",
                "Phone": r.answers?.phone || "N/A",
                "College": r.answers?.college || "N/A",
                "Department": r.answers?.department || "N/A",
                "Year": r.answers?.year || "N/A",
            };

            // Add Custom Fields dynamically
            selectedEvent.customFields?.forEach((field: any) => {
                row[field.label] = r.answers?.[field.label] || "";
            });

            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");
        XLSX.writeFile(workbook, `${selectedEvent.title}_Responses.xlsx`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Form Responses</h1>
                <p className="text-slate-500 mt-1">Select an event to view registration data.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Events list */}
                <div className="glass-panel p-4 rounded-2xl h-fit max-h-[70vh] overflow-y-auto space-y-3">
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">Events</h2>
                    {loadingEvents ? (
                        <p className="text-slate-500 text-sm">Loading events...</p>
                    ) : events.length === 0 ? (
                        <p className="text-slate-500 text-sm">No events found.</p>
                    ) : (
                        events.map((event) => (
                            <button
                                key={event.id}
                                onClick={() => fetchResponses(event)}
                                className={`w-full text-left p-3 rounded-xl border transition-all text-sm flex items-center justify-between cursor-pointer ${selectedEvent?.id === event.id
                                        ? "border-indigo-500 bg-indigo-50 text-indigo-600 font-semibold"
                                        : "border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                                    }`}
                            >
                                <span className="font-medium truncate mr-2">{event.title}</span>
                                <Eye className="h-4 w-4 opacity-70" />
                            </button>
                        ))
                    )}
                </div>

                {/* Responses Panel */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl min-h-[400px]">
                    {!selectedEvent ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm min-h-[300px]">
                            Select an event on the left to view response table.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{selectedEvent.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1">Total Registrations: {responses.length}</p>
                                </div>
                                {responses.length > 0 && (
                                    <Button onClick={downloadExcel} size="sm" className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 shadow-md">
                                        <Download className="h-4 w-4" /> Export Excel
                                    </Button>
                                )}
                            </div>

                            {loadingResponses ? (
                                <p className="text-slate-500 text-sm">Loading responses...</p>
                            ) : responses.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <FileSpreadsheet className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                                    No responses yet for this event.
                                </div>
                            ) : (
                                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-inner bg-slate-50/50">
                                    <table className="w-full text-sm text-left text-slate-600">
                                        <thead className="text-xs uppercase bg-slate-100 text-slate-500 border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3">Name</th>
                                                <th className="px-4 py-3">Email</th>
                                                <th className="px-4 py-3">Phone</th>
                                                {selectedEvent.customFields?.map((f: any) => (
                                                    <th key={f.id} className="px-4 py-3">{f.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {responses.map((r) => (
                                                <tr key={r.id} className="border-b border-slate-100 bg-white hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-semibold text-slate-900">{r.answers?.fullName}</td>
                                                    <td className="px-4 py-3">{r.answers?.email}</td>
                                                    <td className="px-4 py-3">{r.answers?.phone}</td>
                                                    {selectedEvent.customFields?.map((f: any) => (
                                                        <td key={f.id} className="px-4 py-3">
                                                            {r.answers?.[f.label] || "-"}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
