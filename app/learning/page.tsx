import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Learning Hub | Vectonix',
    description: 'Explore our library of tech articles, tutorials, and resources.',
};

export default function LearningPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Section className="py-32 text-center">
                <div className="relative inline-flex items-center justify-center p-8 border-2 border-accent-electric/30 rounded-2xl bg-black/20 backdrop-blur-md">
                    <div className="absolute inset-0 bg-accent-electric/5blur-xl rounded-2xl -z-10"></div>
                    <div className="space-y-4">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-accent-electric/10 rounded-full animate-pulse">
                                <BookOpen size={48} className="text-accent-electric" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest uppercase mb-2">
                            Learning Hub
                        </h1>
                        <div className="text-accent-electric font-bold text-xl md:text-2xl tracking-[0.3em] animate-pulse">
                            WILL BE UPDATED SOON
                        </div>
                        <p className="text-gray-400 max-w-md mx-auto">
                            We are curating high-quality tech articles and tutorials. Stay tuned!
                        </p>
                    </div>
                </div>
            </Section>
        </div>
    );
}
