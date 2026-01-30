import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Careers | Vectonix',
    description: 'Join our team and help build the future.',
};

export default function CareersPage() {
    return (
        <div className="bg-background-dark min-h-screen">
            <Section className="py-32 text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Join Our Team</h1>

                <div className="max-w-3xl mx-auto mt-16 bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-sm hover:border-accent-electric/30 transition-colors">
                    <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light">
                        "We currently do not have any open positions. However, we appreciate your interest and will announce here when we require your full support. Please stay tuned!"
                    </p>
                </div>
            </Section>
        </div>
    );
}
