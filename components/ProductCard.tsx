import { ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";
import Image from "next/image";

interface ProductCardProps {
    title: string;
    description: string;
    imageSrc?: string;
    features: string[];
    comingSoon?: boolean;
}

export const ProductCard = ({ title, description, imageSrc, features, comingSoon }: ProductCardProps) => {
    return (
        <div className="group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-accent-electric/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.1)]">
            <div className="aspect-video relative bg-gradient-to-br from-primary-light to-background overflow-hidden">
                {/* Placeholder for real image if not provided */}
                {imageSrc ? (
                    <Image src={imageSrc} alt={title} fill className="object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        {comingSoon ? (
                            <div className="text-center p-6 border-2 border-accent-electric/30 rounded-xl bg-black/20 backdrop-blur-sm relative">
                                <div className="text-accent-electric font-black text-2xl tracking-[0.2em] animate-pulse">COMING SOON</div>
                                <div className="absolute -inset-1 bg-accent-electric/20 blur-lg rounded-xl -z-10"></div>
                            </div>
                        ) : (
                            <div className="text-primary/30">
                                <span className="text-6xl font-black opacity-20 transform -rotate-12 select-none block">VECTONIX</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-accent-electric transition-colors">{title}</h3>
                <p className="text-gray-400 mb-6 leading-relaxed min-h-[3em]">{description}</p>

                <div className="mb-8">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Key Features</h4>
                    <ul className="space-y-2">
                        {features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-electric mr-2"></span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <Button variant="outline" className="w-full group-hover:bg-accent-electric group-hover:text-black hover:bg-accent-electric hover:text-black border-white/20">
                    Learn More <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        </div>
    );
};
