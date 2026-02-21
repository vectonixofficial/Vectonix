"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export const SplashScreen = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Prevent scrolling while splash screen is visible
        if (isVisible) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 3000); // 3 seconds

        return () => {
            clearTimeout(timer);
            document.body.style.overflow = "unset";
        };
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="splash-screen"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-3xl"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative w-40 h-40 md:w-56 md:h-56 mb-8"
                    >
                        <Image
                            src="/logo.png"
                            alt="Vectonix Logo"
                            fill
                            className="object-contain drop-shadow-[0_0_25px_rgba(255,215,0,0.5)]"
                            priority
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="flex flex-col items-center"
                    >
                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-widest mb-2 font-mono">
                            VECTONIX
                        </h1>
                        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full animate-pulse" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
