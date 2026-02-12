import { Section } from "@/components/ui/Section";
import { ProductCard } from "@/components/ProductCard";
import { Metadata } from 'next';
import { HeroBackground } from "@/components/ui/HeroBackground";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export const metadata: Metadata = {
    title: 'Our Products | Vectonix',
    description: 'Explore our innovative digital products and smart automation tools.',
};

export default function ProductsPage() {
    const products = [
        {
            title: "SmartBus TN",
            description: "A real-time bus tracking system designed to help passengers track buses easily. Reduces wait times and improves commute efficiency.",
            features: ["Live bus location", "Route details", "Arrival time prediction", "Mobile App Support"],
            comingSoon: true,
        },
        {
            title: "VectoGuard AI",
            description: "Intelligent security monitoring system that uses computer vision to detect anomalies and unauthorized access in real-time.",
            features: ["Real-time alerts", "Face recognition", "Cloud storage", "Night Vision Enhancement"],
            comingSoon: true,
        },
        {
            title: "AutoHome Hub",
            description: "Centralized smart home controller that integrates with all your devices for seamless automation and energy management.",
            features: ["Voice Control", "Energy Analytics", "Multi-device Sync", "Remote Access"],
            comingSoon: true,
        },
        {
            title: "VectoLearn",
            description: "An AI-powered learning platform that adapts to your learning style, providing personalized curriculum and real-time feedback.",
            features: ["Adaptive Learning", "Skill Tracking", "Interactive Quizzes", "Expert Mentorship"],
            comingSoon: true,
        }
    ];

    return (
        <div className="min-h-screen">
            <div className="relative pt-40 pb-20 overflow-hidden">
                <HeroBackground />
                <Section className="relative z-10 text-center">
                    <MotionWrapper delay={0.1}>
                        <h1 className="text-4xl md:text-7xl font-bold text-white mb-6">Our Products</h1>
                    </MotionWrapper>
                    <MotionWrapper delay={0.3}>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 drop-shadow-md">
                            Innovative solutions built for a smarter future. Explore what we've built.
                        </p>
                    </MotionWrapper>
                </Section>
            </div>

            <Section className="py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {products.map((product, index) => (
                        <MotionWrapper key={index} delay={0.1 * index} className="h-full">
                            <ProductCard
                                title={product.title}
                                description={product.description}
                                features={product.features}
                                comingSoon={product.comingSoon}
                            />
                        </MotionWrapper>
                    ))}
                </div>
            </Section>
        </div>
    );
}
