import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Vectonix',
    description: 'Our commitment to protecting your privacy.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen">
            <Section className="py-32">
                <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
                <div className="prose prose-invert max-w-none text-gray-400">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p className="mt-4">
                        At Vectonix, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website.
                    </p>
                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">Information We Collect</h2>
                    <p>
                        We may collect information about you in a variety of ways. The information we may collect on the Site includes:
                    </p>
                    <ul className="list-disc pl-5 mt-4 space-y-2">
                        <li>Personal Data: Personally identifiable information, such as your name, shipping address, email address, and telephone number.</li>
                        <li>Derivative Data: Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                    </ul>
                </div>
            </Section>
        </div>
    );
}
