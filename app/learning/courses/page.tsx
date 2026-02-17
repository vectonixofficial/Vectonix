import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Courses | Vectonix Learning',
    description: 'Structured courses to take your skills to the next level.',
};

export default function CoursesPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Section className="py-32 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Courses</h1>
                <p className="text-gray-400">Comprehensive courses coming soon.</p>
            </Section>
        </div>
    );
}
