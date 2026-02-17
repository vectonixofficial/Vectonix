'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string;
    onComplete?: () => void;
}

export const CountdownTimer = ({ targetDate, onComplete }: CountdownTimerProps) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                if (onComplete) onComplete();
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // Run immediately

        return () => clearInterval(timer);
    }, [targetDate, onComplete]);

    const TimeBox = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/10 backdrop-blur-md min-w-[70px]">
            <span className="text-2xl md:text-3xl font-bold text-accent-electric font-mono">
                {value.toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
        </div>
    );

    return (
        <div className="flex gap-3 justify-center md:justify-start">
            <TimeBox value={timeLeft.days} label="Days" />
            <TimeBox value={timeLeft.hours} label="Hrs" />
            <TimeBox value={timeLeft.minutes} label="Mins" />
            <TimeBox value={timeLeft.seconds} label="Secs" />
        </div>
    );
};
