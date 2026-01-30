import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';
import Image from "next/image";

export const metadata: Metadata = {
    title: 'About Us | Vectonix',
    description: 'Vectonix is a next-generation technology startup focused on solving real-world challenges.',
};

export default function AboutPage() {
    return (
        <div className="bg-background-dark min-h-screen">
            {/* Hero */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
                <Section className="relative z-10 text-center">
                    <h1 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                        Architecting the <span className="text-accent-electric">Future</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        Vectonix is a next-generation technology startup focused on solving real-world challenges through intelligent digital systems.
                    </p>
                </Section>
            </div>

            {/* Mission & Vision */}
            <Section className="py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    <div className="bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-sm">
                        <h3 className="text-accent-electric font-mono text-sm uppercase tracking-widest mb-4">Our Mission</h3>
                        <h2 className="text-3xl font-bold text-white mb-6">Simplifying Life Through Innovation</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            To create innovative applications that make life smarter, easier, and more connected. We believe technology should work for people, not the other way around.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-sm">
                        <h3 className="text-accent-electric font-mono text-sm uppercase tracking-widest mb-4">Our Vision</h3>
                        <h2 className="text-3xl font-bold text-white mb-6">Global Leader in Smart Tech</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            To become a global leader in smart digital technologies, setting new standards for quality, integrity, and user experience in the digital age.
                        </p>
                    </div>
                </div>
            </Section>

            {/* Values */}
            <Section className="bg-secondary/5">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Our Core Values</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <ValueCard title="Innovation" description="We embrace change and constantly push boundaries." />
                    <ValueCard title="Integrity" description="Honesty and transparency in everything we do." />
                    <ValueCard title="Simplicity" description="Making complex technology easy to use." />
                    <ValueCard title="Impact" description="Creating solutions that make a real difference." />
                </div>
            </Section>

            {/* Team */}
            <Section className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-16">Meet the Team</h2>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                    <TeamMember name="Habibur Rahman" role="Founder" imageSrc="/habibur-rahman.png" />
                    <TeamMember name="Elanithi" role="Founder" imageSrc="/elanithi.jpg" />
                </div>
            </Section>
        </div>
    );
}

function ValueCard({ title, description }: { title: string, description: string }) {
    return (
        <div className="bg-background border border-white/5 p-6 rounded-xl text-center hover:border-accent-electric/30 transition-colors">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-400 text-sm">{description}</p>
        </div>
    )
}

function TeamMember({ name, role, imageSrc }: { name: string, role: string, imageSrc?: string }) {
    return (
        <div className="group">
            <div className="w-72 h-96 mx-auto bg-white/5 rounded-2xl mb-6 overflow-hidden relative border border-white/5 group-hover:border-accent-electric/50 transition-all shadow-2xl">
                {imageSrc ? (
                    <Image src={imageSrc} alt={name} fill className="object-cover" />
                ) : (
                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center text-white">
                        <span className="text-xs">Photo</span>
                    </div>
                )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
            <p className="text-accent-electric font-medium tracking-wider">{role}</p>
        </div>
    )
}
