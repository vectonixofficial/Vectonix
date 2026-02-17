import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Internships | Vectonix Learning',
    description: 'Gain real-world experience with our internship programs.',
};

export default function InternshipsPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Section className="py-32 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Internships</h1>
                <p className="text-gray-400">Internship opportunities opening soon.</p>
            </Section>
        </div>
    );
}
