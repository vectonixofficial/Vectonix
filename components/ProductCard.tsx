"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";
import Image from "next/image";
import { motion } from "framer-motion";

interface ProductCardProps {
    title: string;
    description: string;
    imageSrc?: string;
    features: string[];
    comingSoon?: boolean;
}

export const ProductCard = ({ title, description, imageSrc, features, comingSoon }: ProductCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
            className="glass-panel glass-panel-hover p-8 rounded-[28px] h-full flex flex-col group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent-electric/5 rounded-full blur-3xl -z-10 transition-all duration-700 group-hover:bg-accent-electric/10"></div>

            {imageSrc && (
                <div className="mb-6 relative h-48 rounded-2xl overflow-hidden border border-white/10">
                    <Image src={imageSrc} alt={title} fill className="object-cover" />
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-accent-electric transition-colors">{title}</h3>
                <p className="text-gray-300 leading-relaxed text-sm h-20 overflow-hidden">{description}</p>
            </div>

            <div className="mb-8 flex-grow">
                <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Key Features</h4>
                <ul className="space-y-2">
                    {features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-electric mr-2"></span>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-auto">
                {comingSoon ? (
                    <div className="text-center py-3 px-4 border border-accent-electric/30 rounded-xl bg-accent-electric/5 text-accent-electric text-sm font-bold tracking-widest uppercase">
                        Coming Soon
                    </div>
                ) : (
                    <Button variant="outline" className="w-full group-hover:bg-accent-electric group-hover:text-black hover:bg-accent-electric hover:text-black border-white/20 rounded-xl">
                        Learn More <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                )}
            </div>
        </motion.div>
    );
};
