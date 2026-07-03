"use client";

import { motion } from "framer-motion";

export const HeroBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden z-0 [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
            {/* Light theme background base */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/30 to-white" />

            {/* Animated gradient orbs — soft, light */}
            <motion.div
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px]"
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />

            <motion.div
                className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-sky-200/30 rounded-full blur-[120px]"
                animate={{
                    x: [0, -70, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.5, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 2
                }}
            />

            <motion.div
                className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-violet-200/20 rounded-full blur-[80px]"
                animate={{
                    x: [0, -50, 0],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 5
                }}
            />

            {/* Grid overlay — very subtle on light */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>
    );
};
