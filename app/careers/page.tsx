import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';
import { HeroBackground } from "@/components/ui/HeroBackground";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export const metadata: Metadata = {
    title: 'Careers | Vectonix',
    description: 'Join our team and help build the future.',
};

export default function CareersPage() {
    return (
        <div className="min-h-screen overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none">
                <HeroBackground />
            </div>

            <Section className="py-40 text-center relative z-10">
                <MotionWrapper delay={0.1}>
                    <h1 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tighter">Join Our Team</h1>
                </MotionWrapper>

                <MotionWrapper delay={0.3} direction="up">
                    <div className="max-w-3xl mx-auto mt-16 bg-white/5 border border-white/10 rounded-3xl p-12 backdrop-blur-md shadow-2xl hover:border-accent-electric/30 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-accent-electric/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light relative z-10">
                            "We currently do not have any open positions. However, we appreciate your interest and will announce here when we require your full support. Please stay tuned!"
                        </p>
                    </div>
                </MotionWrapper>
            </Section>
        </div>
    );
}
