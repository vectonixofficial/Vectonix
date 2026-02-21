import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';
import { BookOpen, Users, Briefcase, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { MotionWrapper } from "@/components/ui/MotionWrapper";
import { HeroBackground } from "@/components/ui/HeroBackground";

export const metadata: Metadata = {
    title: 'Learning Hub | Vectonix',
    description: 'Explore our library of tech articles, tutorials, and resources.',
};

export default function LearningPage() {
    const categories = [
        {
            title: "Workshops",
            description: "Join hands-on, interactive sessions led by industry experts.",
            icon: <Users size={24} className="text-accent-electric" />,
            href: "/learning/workshops",
            color: "from-amber-500/20 to-yellow-500/20",
            action: "View Schedule"
        },
        {
            title: "Courses",
            description: "Structured learning paths to master new technologies.",
            icon: <BookOpen size={24} className="text-accent-electric" />,
            href: "/learning/courses",
            color: "from-purple-500/20 to-pink-500/20",
            action: "Start Learning"
        },
        {
            title: "Internships",
            description: "Gain real-world experience and kickstart your career.",
            icon: <Briefcase size={24} className="text-accent-electric" />,
            href: "/learning/internships",
            color: "from-emerald-500/20 to-teal-500/20",
            action: "Find Opportunities"
        }
    ];

    return (
        <div className="min-h-screen pt-20">
            <Section className="relative overflow-hidden min-h-[calc(100vh-80px)]">
                <HeroBackground />
                <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
                    <MotionWrapper>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                            Learning <span className="text-accent-electric">Hub</span>
                        </h1>
                        <p className="text-xl text-gray-300 leading-relaxed">
                            Empower your future with our comprehensive learning resources. Whether you want to attend a workshop, take a course, or apply for an internship, we have something for you.
                        </p>
                    </MotionWrapper>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {categories.map((category, index) => (
                        <MotionWrapper key={category.title} delay={index * 0.1} direction="up" className="h-full">
                            <Link href={category.href} className="block h-full group">
                                <div className="group relative h-full">
                                    {/* Folder Tab */}
                                    <div className="absolute -top-10 left-0 z-10">
                                        <div className="flex items-center justify-center p-3 h-12 min-w-[30%] bg-white/5 border-t border-l border-r border-white/10 rounded-t-xl group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-300 backdrop-blur-md">
                                            <div className="transform group-hover:scale-110 transition-transform duration-300 text-accent-electric">
                                                {category.icon}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Folder Body */}
                                    <div className={`h-full pt-10 pb-8 px-8 glass-panel rounded-b-3xl rounded-tr-3xl rounded-tl-none border-t-0 relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_0_30px_rgba(255,215,0,0.1)]`}>
                                        {/* Seamless Connection Line for Tab */}
                                        <div className="absolute top-0 left-0 w-[30%] h-[1px] bg-transparent" />
                                        <div className="absolute top-0 right-0 w-[70%] h-[1px] bg-white/10 group-hover:bg-white/20 transition-colors" />

                                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                        <div className="relative z-10 flex flex-col h-full mt-4">
                                            <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-accent-electric transition-colors">
                                                {category.title}
                                            </h2>

                                            <p className="text-gray-400 mb-8 flex-grow group-hover:text-gray-300 transition-colors leading-relaxed">
                                                {category.description}
                                            </p>

                                            <div className="flex items-center text-accent-electric font-medium tracking-wide">
                                                {category.action} <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </MotionWrapper>
                    ))}
                </div>
            </Section>
        </div>
    );
}
