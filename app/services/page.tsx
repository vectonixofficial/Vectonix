import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';
import { Button } from "@/components/ui/Button";
import Link from 'next/link';
import { Code, Bot, Cloud, BarChart3, Wrench, Smartphone } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Our Services | Vectonix',
    description: 'Professional software development, AI solutions, and cloud integration services.',
};

export default function ServicesPage() {
    const services = [
        {
            icon: <Code size={48} className="text-accent-electric" />,
            title: "Software Development",
            description: "We build custom web and mobile applications tailored to your business needs, using the latest technologies like Next.js, React, and Node.js.",
            features: ["Custom Web Apps", "Mobile App Development", "API Development"]
        },
        {
            icon: <Bot size={48} className="text-accent-electric" />,
            title: "AI Solutions",
            description: "Leverage the power of Artificial Intelligence to automate workflows, analyze data, and create smarter user experiences.",
            features: ["Machine Learning Models", "NLP Chatbots", "Predictive Analytics"]
        },
        {
            icon: <Cloud size={48} className="text-accent-electric" />,
            title: "Cloud Integration",
            description: "Scalable cloud infrastructure setup and management on platforms like AWS, Google Cloud, and Azure to ensure your apps run smoothly.",
            features: ["Cloud Migration", "DevOps & CI/CD", "Serverless Architecture"]
        },
        {
            icon: <BarChart3 size={48} className="text-accent-electric" />,
            title: "Data & Analytics",
            description: "Transform your raw data into actionable insights with our comprehensive data analytics and visualization services.",
            features: ["Business Intelligence", "Data Visualization", "Big Data Processing"]
        },
        {
            icon: <Smartphone size={48} className="text-accent-electric" />,
            title: "IoT & Smart Systems",
            description: "Connect physical devices to the digital world. We build software for IoT devices and smart systems.",
            features: ["IoT Dashboards", "Sensor Integration", "Embedded Software"]
        },
        {
            icon: <Wrench size={48} className="text-accent-electric" />,
            title: "Maintenance & Support",
            description: "We don't just build and leave. We provide ongoing maintenance and support to ensure your software remains secure and up-to-date.",
            features: ["24/7 Support", "Security Audits", "Performance Optimization"]
        }
    ];

    return (
        <div className="bg-background-dark min-h-screen">
            <Section className="pt-32 pb-16 text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Our Services</h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-16">
                    We offer a comprehensive suite of technology services to help your business grow and innovate.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-accent-electric/50 transition-colors group">
                            <div className="mb-6 p-4 bg-primary/20 rounded-xl inline-block group-hover:bg-primary/40 transition-colors">
                                {service.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                {service.description}
                            </p>
                            <ul className="space-y-2 mb-8">
                                {service.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-gray-300">
                                        <span className="w-1.5 h-1.5 bg-accent-electric rounded-full mr-2"></span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </Section>

            <Section className="bg-primary/10 py-16">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to upgrade your business?</h2>
                    <Link href="/contact">
                        <Button size="lg" variant="neon" className="px-10 py-6 text-lg">
                            Get a Quote
                        </Button>
                    </Link>
                </div>
            </Section>
        </div>
    );
}
