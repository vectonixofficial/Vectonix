"use client";

import { motion } from "framer-motion";
import { Calendar, Users, FileText, CheckCircle } from "lucide-react";

export default function AdminDashboardPage() {
    const stats = [
        { name: "Total Events", value: "0", icon: Calendar, color: "text-indigo-600" },
        { name: "Total Registrations", value: "0", icon: Users, color: "text-emerald-600" },
        { name: "Form Templates", value: "0", icon: FileText, color: "text-purple-600" },
        { name: "Completed Events", value: "0", icon: CheckCircle, color: "text-sky-600" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500 mt-1">Manage event operations and view analytics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-panel p-6 rounded-2xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">{stat.name}</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl bg-slate-50 border border-slate-100 ${stat.color}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Placeholder for Recent Activity or Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <div className="glass-panel p-6 rounded-2xl min-h-[300px]">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Registrations</h2>
                    <p className="text-slate-500 text-sm">Real-time update stream coming soon...</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl min-h-[300px]">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        <button className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors text-sm flex items-center gap-2 text-slate-700">
                            <Calendar className="h-4 w-4 text-indigo-600" />
                            Schedule New Workshop
                        </button>
                        <button className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors text-sm flex items-center gap-2 text-slate-700">
                            <FileText className="h-4 w-4 text-purple-600" />
                            Configure Registration Form
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
