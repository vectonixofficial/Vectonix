import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';
import Image from "next/image";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export const metadata: Metadata = {
    title: 'About Us | Vectonix',
    description: 'Vectonix is a next-generation technology startup focused on solving real-world challenges.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen overflow-hidden">
            {/* Hero */}
            <div className="relative pt-40 pb-20 overflow-hidden">
                <HeroBackground />
                <Section className="relative z-10 text-center">
                    <MotionWrapper delay={0.1}>
                        <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 tracking-tight">
                            Architecting the <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-electric">Future</span>
                        </h1>
                    </MotionWrapper>
                    <MotionWrapper delay={0.3}>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                            Vectonix is a next-generation technology startup focused on solving real-world challenges through intelligent digital systems.
                        </p>
                    </MotionWrapper>
                </Section>
            </div>

            {/* Mission & Vision */}
            <Section className="py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    <MotionWrapper direction="right" delay={0.2} className="h-full">
                        <div className="glass-panel glass-panel-hover p-10 rounded-3xl h-full">
                            <h3 className="text-accent-electric font-mono text-sm uppercase tracking-widest mb-4">Our Mission</h3>
                            <h2 className="text-3xl font-bold text-white mb-6">Simplifying Life Through Innovation</h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                To create innovative applications that make life smarter, easier, and more connected. We believe technology should work for people, not the other way around.
                            </p>
                        </div>
                    </MotionWrapper>
                    <MotionWrapper direction="left" delay={0.4} className="h-full">
                        <div className="glass-panel glass-panel-hover p-10 rounded-3xl h-full">
                            <h3 className="text-accent-electric font-mono text-sm uppercase tracking-widest mb-4">Our Vision</h3>
                            <h2 className="text-3xl font-bold text-white mb-6">Global Leader in Smart Tech</h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                To become a global leader in smart digital technologies, setting new standards for quality, integrity, and user experience in the digital age.
                            </p>
                        </div>
                    </MotionWrapper>
                </div>
            </Section>

            {/* Values */}
            <Section className="border-y border-white/5">
                <MotionWrapper>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white">Our Core Values</h2>
                    </div>
                </MotionWrapper>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <MotionWrapper delay={0.1} direction="up"><ValueCard title="Innovation" description="We embrace change and constantly push boundaries." /></MotionWrapper>
                    <MotionWrapper delay={0.2} direction="up"><ValueCard title="Integrity" description="Honesty and transparency in everything we do." /></MotionWrapper>
                    <MotionWrapper delay={0.3} direction="up"><ValueCard title="Simplicity" description="Making complex technology easy to use." /></MotionWrapper>
                    <MotionWrapper delay={0.4} direction="up"><ValueCard title="Impact" description="Creating solutions that make a real difference." /></MotionWrapper>
                </div>
            </Section>

            {/* Team */}
            <Section className="text-center pt-32">
                <MotionWrapper>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-16">Meet the Team</h2>
                </MotionWrapper>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                    <MotionWrapper delay={0.2} direction="up">
                        <TeamMember name="Habibur Rahman" role="Founder" imageSrc="/habibur-rahman.png" />
                    </MotionWrapper>
                    <MotionWrapper delay={0.4} direction="up">
                        <TeamMember name="Elanithi" role="Founder" imageSrc="/elanithi.jpg" />
                    </MotionWrapper>
                </div>
            </Section>
        </div>
    );
}

function ValueCard({ title, description }: { title: string, description: string }) {
    return (
        <div className="glass-panel glass-panel-hover p-8 rounded-2xl text-center h-full">
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
    )
}

function TeamMember({ name, role, imageSrc }: { name: string, role: string, imageSrc?: string }) {
    return (
        <div className="group relative">
            <div className="w-72 h-96 mx-auto glass-panel glass-panel-hover rounded-2xl mb-6 overflow-hidden relative shadow-2xl">
                {imageSrc ? (
                    <Image src={imageSrc} alt={name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center text-white">
                        <span className="text-xs">Photo</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-accent-electric transition-colors">{name}</h3>
            <p className="text-accent-electric font-medium tracking-wider uppercase text-sm border-t border-accent-electric/20 pt-2 inline-block px-4">{role}</p>
        </div>
    )
}
