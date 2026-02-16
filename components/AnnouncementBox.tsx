'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const updates = [
    {
        id: 1,
        text: "SmartBus TN Beta is now live! Track your bus in real-time.",
        link: "/products"
    },
    {
        id: 2,
        text: "VectoGuard AI wins innovation award at TechSummit 2026.",
        link: "/about"
    }
];

export const AnnouncementBox = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        // Target date: Feb 18, 2026 8:30 PM IST
        const targetDate = new Date('2026-02-18T20:30:00+05:30').getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            } else {
                // Time is up
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setIsVisible(false);
            }
        };

        // Initial calculation
        const now = new Date().getTime();
        if (targetDate - now <= 0) {
            // Already expired, do nothing (don't show)
            return;
        }

        calculateTimeLeft();

        // Update every second
        const timer = setInterval(() => {
            const currentNow = new Date().getTime();
            if (targetDate - currentNow <= 0) {
                clearInterval(timer);
                setIsVisible(false);
            } else {
                calculateTimeLeft();
            }
        }, 1000);

        // Show modal after delay ONLY if not expired
        const showTimer = setTimeout(() => {
            const currentNow = new Date().getTime();
            if (targetDate - currentNow > 0) {
                setIsVisible(true);
            }
        }, 1500);

        return () => {
            clearInterval(timer);
            clearTimeout(showTimer);
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
                >
                    <div className="relative w-[75vw] h-[75vh] pointer-events-auto overflow-hidden rounded-2xl border border-white/20 bg-transparent backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.7)] p-8 flex flex-col">
                        {/* Glowing background effect */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-electric/20 rounded-full blur-3xl animate-pulse" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8 relative">
                                {/* Centered Title */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-accent-electric/10 text-accent-electric shadow-[0_0_10px_rgba(125,249,255,0.2)]">
                                        <Bell size={24} />
                                    </div>
                                    <h3 className="font-bold text-white text-3xl tracking-wide">Announcement</h3>
                                </div>

                                {/* Close Button (Right) */}
                                <div className="ml-auto">
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-white hover:bg-white/10 transition-all p-2 rounded-full"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-grow flex flex-col md:flex-row items-center w-full overflow-hidden gap-6 md:gap-8">
                                {/* Image Container (Left on Desktop) */}
                                <div className="relative w-full md:w-1/2 h-1/2 md:h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl flex-shrink-0 order-2 md:order-1">
                                    <Image
                                        src="/workshop.png"
                                        alt="Workshop Poster"
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        priority
                                    />
                                </div>

                                {/* Text Container (Right on Desktop) */}
                                <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left w-full md:w-1/2 h-auto md:h-full order-1 md:order-2 px-4">
                                    <h4 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-6">
                                        Ready for the <br />
                                        Workshop? <br />
                                        <Link
                                            href="https://forms.gle/JYzdpUNph7VdNYeq7"
                                            target="_blank"
                                            className="text-accent-electric hover:text-accent-electric/80 hover:underline transition-all cursor-pointer"
                                        >
                                            Register Now
                                        </Link>
                                    </h4>

                                    {/* Countdown Timer */}
                                    <div className="grid grid-cols-4 gap-2 md:gap-4 text-center">
                                        {[
                                            { label: 'Days', value: timeLeft.days },
                                            { label: 'Hours', value: timeLeft.hours },
                                            { label: 'Mins', value: timeLeft.minutes },
                                            { label: 'Secs', value: timeLeft.seconds }
                                        ].map((item, index) => (
                                            <div key={index} className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm min-w-[60px] md:min-w-[70px]">
                                                <span className="text-xl md:text-2xl font-bold text-accent-electric font-mono">
                                                    {String(item.value).padStart(2, '0')}
                                                </span>
                                                <span className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 text-xs text-gray-400">
                                        Starts Feb 18, 2026 • 8:30 PM IST
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
