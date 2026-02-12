import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Vectonix',
    description: 'Terms and conditions for using our services.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen">
            <Section className="py-32">
                <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
                <div className="prose prose-invert max-w-none text-gray-400">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p className="mt-4">
                        These Terms of Service ("Terms") govern your access to and use of Vectonix's website and services.
                    </p>
                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">Acceptance of Terms</h2>
                    <p>
                        By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy.
                    </p>
                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">Use License</h2>
                    <p>
                        Permission is granted to temporarily download one copy of the materials (information or software) on Vectonix's website for personal, non-commercial transitory viewing only.
                    </p>
                </div>
            </Section>
        </div>
    );
}
