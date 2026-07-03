import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';
import { Button } from "@/components/ui/Button";
import Link from 'next/link';
import { Code, Bot, Cloud, BarChart3, Wrench, Smartphone } from 'lucide-react';
import { HeroBackground } from "@/components/ui/HeroBackground";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export const metadata: Metadata = {
    title: 'Our Services | Vectonix',
    description: 'Professional software development, AI solutions, and cloud integration services.',
};

export default function ServicesPage() {
    const services = [
        {
            icon: <Code size={48} className="text-indigo-600" />,
            title: "Software Development",
            description: "We build custom web and mobile applications tailored to your business needs, using the latest technologies like Next.js, React, and Node.js.",
            features: ["Custom Web Apps", "Mobile App Development", "API Development"]
        },
        {
            icon: <Bot size={48} className="text-indigo-600" />,
            title: "AI Solutions",
            description: "Leverage the power of Artificial Intelligence to automate workflows, analyze data, and create smarter user experiences.",
            features: ["Machine Learning Models", "NLP Chatbots", "Predictive Analytics"]
        },
        {
            icon: <Cloud size={48} className="text-indigo-600" />,
            title: "Cloud Integration",
            description: "Scalable cloud infrastructure setup and management on platforms like AWS, Google Cloud, and Azure to ensure your apps run smoothly.",
            features: ["Cloud Migration", "DevOps & CI/CD", "Serverless Architecture"]
        },
        {
            icon: <BarChart3 size={48} className="text-indigo-600" />,
            title: "Data & Analytics",
            description: "Transform your raw data into actionable insights with our comprehensive data analytics and visualization services.",
            features: ["Business Intelligence", "Data Visualization", "Big Data Processing"]
        },
        {
            icon: <Smartphone size={48} className="text-indigo-600" />,
            title: "IoT & Smart Systems",
            description: "Connect physical devices to the digital world. We build software for IoT devices and smart systems.",
            features: ["IoT Dashboards", "Sensor Integration", "Embedded Software"]
        },
        {
            icon: <Wrench size={48} className="text-indigo-600" />,
            title: "Maintenance & Support",
            description: "We don't just build and leave. We provide ongoing maintenance and support to ensure your software remains secure and up-to-date.",
            features: ["24/7 Support", "Security Audits", "Performance Optimization"]
        }
    ];

    return (
        <div className="min-h-screen">
            <div className="relative pt-40 pb-20 overflow-hidden">
                <HeroBackground />
                <Section className="relative z-10 text-center">
                    <MotionWrapper delay={0.1}>
                        <h1 className="text-4xl md:text-7xl font-bold text-slate-900 mb-6">Our Services</h1>
                    </MotionWrapper>
                    <MotionWrapper delay={0.3}>
                        <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-8">
                            We offer a comprehensive suite of technology services to help your business grow and innovate.
                        </p>
                    </MotionWrapper>
                </Section>
            </div>

            <Section className="py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                    {services.map((service, index) => (
                        <MotionWrapper key={index} delay={0.1 * index} direction="up" className="h-full">
                            <div className="glass-panel glass-panel-hover p-8 rounded-2xl h-full group">
                                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl inline-block group-hover:bg-indigo-100 group-hover:scale-110 transition-all duration-300">
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">{service.title}</h3>
                                <p className="text-slate-500 mb-6 leading-relaxed">
                                    {service.description}
                                </p>
                                <ul className="space-y-2 mb-8 border-t border-slate-200 pt-4">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-sm text-slate-600">
                                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </MotionWrapper>
                    ))}
                </div>
            </Section>

            <Section className="py-24 border-t border-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-indigo-600"></div>
                <MotionWrapper direction="up">
                    <div className="text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to upgrade your business?</h2>
                        <Link href="/contact">
                            <Button size="lg" className="px-12 py-8 text-xl font-bold rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl">
                                Get a Quote
                            </Button>
                        </Link>
                    </div>
                </MotionWrapper>
            </Section>
        </div>
    );
}
