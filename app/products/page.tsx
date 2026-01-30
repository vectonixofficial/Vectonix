import { Section } from "@/components/ui/Section";
import { ProductCard } from "@/components/ProductCard";
import { Metadata } from 'next';

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
        <div className="bg-background-dark min-h-screen">
            <Section className="pt-32 pb-16">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Our Products</h1>
                    <p className="text-xl text-gray-400">
                        Innovative solutions built for a smarter future. Explore what we've built.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {products.map((product, index) => (
                        <ProductCard
                            key={index}
                            title={product.title}
                            description={product.description}
                            features={product.features}
                            comingSoon={product.comingSoon}
                        />
                    ))}
                </div>
            </Section>
        </div>
    );
}
