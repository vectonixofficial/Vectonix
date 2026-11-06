import { Section } from "@/components/ui/Section";
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Terms of Service | Vectonix',
    description: 'Terms and conditions for using our services.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Section className="py-24 max-w-4xl mx-auto px-4 sm:px-6">
                <div className="mb-8 p-6 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 uppercase tracking-wider mb-2">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Winter Internship 2026 Policy
                        </span>
                        <h2 className="text-lg font-bold text-slate-900">
                            Looking for Winter Internship 2026 Terms &amp; Conditions?
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">
                            Review the comprehensive policy covering ₹0 Free Course enrollment, Standard/Premium packages, verified certificates, and project guidelines.
                        </p>
                    </div>
                    <Link
                        href="/terms-and-conditions"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
                    >
                        View Full Terms
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Terms of Service</h1>
                    <div className="prose prose-slate max-w-none text-slate-600 text-sm space-y-4">
                        <p className="text-xs text-slate-400">Effective Date: November 2, 2026</p>
                        <p>
                            These Terms of Service (&quot;Terms&quot;) govern your access to and use of Vectonix websites, learning management systems, and technical services operated by VECTONIX PRIVATE LIMITED.
                        </p>
                        <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using our websites, online services, or student portals, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not access our services.
                        </p>
                        <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">2. Use License</h2>
                        <p>
                            Permission is granted to temporarily access and view educational resources, curriculum guides, and code repositories on Vectonix websites for personal, academic, non-commercial technical training only.
                        </p>
                        <h2 className="text-xl font-bold text-slate-900 mt-6 mb-2">3. Internship Program Policies</h2>
                        <p>
                            Participation in internship programs (including Batch WI26) is governed additionally by our official <Link href="/terms-and-conditions" className="text-indigo-600 underline font-semibold">Winter Internship 2026 Terms &amp; Conditions</Link>.
                        </p>
                    </div>
                </div>
            </Section>
        </div>
    );
}
