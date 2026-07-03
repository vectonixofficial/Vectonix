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
            icon: <Users size={24} className="text-indigo-600" />,
            href: "/learning/workshops",
            color: "from-amber-100/50 to-yellow-100/50",
            action: "View Schedule"
        },
        {
            title: "Courses",
            description: "Structured learning paths to master new technologies.",
            icon: <BookOpen size={24} className="text-indigo-600" />,
            href: "/learning/courses",
            color: "from-purple-100/50 to-pink-100/50",
            action: "Start Learning"
        },
        {
            title: "Internships",
            description: "Gain real-world experience and kickstart your career.",
            icon: <Briefcase size={24} className="text-indigo-600" />,
            href: "/learning/internships",
            color: "from-emerald-100/50 to-teal-100/50",
            action: "Find Opportunities"
        }
    ];

    return (
        <div className="min-h-screen pt-20">
            <Section className="relative overflow-hidden min-h-[calc(100vh-80px)]">
                <HeroBackground />
                <div className="text-center max-w-3xl mx-auto mb-20 relative z-10">
                    <MotionWrapper>
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
                            Learning <span className="text-indigo-600">Hub</span>
                        </h1>
                        <p className="text-xl text-slate-500 leading-relaxed">
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
                                        <div className="flex items-center justify-center p-3 h-12 min-w-[30%] bg-white/80 border-t border-l border-r border-slate-200 rounded-t-xl group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all duration-300 backdrop-blur-md">
                                            <div className="transform group-hover:scale-110 transition-transform duration-300 text-indigo-600">
                                                {category.icon}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Main Folder Body */}
                                    <div className={`h-full pt-10 pb-8 px-8 glass-panel rounded-b-3xl rounded-tr-3xl rounded-tl-none border-t-0 relative overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-indigo-100`}>
                                        {/* Seamless Connection Line for Tab */}
                                        <div className="absolute top-0 left-0 w-[30%] h-[1px] bg-transparent" />
                                        <div className="absolute top-0 right-0 w-[70%] h-[1px] bg-slate-200 group-hover:bg-indigo-200 transition-colors" />

                                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                        <div className="relative z-10 flex flex-col h-full mt-4">
                                            <h2 className="text-3xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                                                {category.title}
                                            </h2>

                                            <p className="text-slate-500 mb-8 flex-grow group-hover:text-slate-600 transition-colors leading-relaxed">
                                                {category.description}
                                            </p>

                                            <div className="flex items-center text-indigo-600 font-medium tracking-wide">
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
