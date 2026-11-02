import { Section } from "@/components/ui/Section";
import { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, FileText, CheckCircle2, Mail, Phone, Globe, UserCheck } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy | Vectonix Technologies",
    description: "Official Privacy Policy of VECTONIX PRIVATE LIMITED governing data collection, residential address protection, and student privacy rights.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20">
            <Section className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-10 text-center sm:text-left border-b border-slate-200 pb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 mb-3 uppercase tracking-wider">
                        <Shield className="h-3.5 w-3.5" />
                        Data Privacy & Trust
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        VECTONIX TECHNOLOGIES – PRIVACY POLICY
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        VECTONIX PRIVATE LIMITED • Effective Date: November 2, 2026 • Website: <a href="https://vectonix.in" className="text-indigo-600 underline">https://vectonix.in</a>
                    </p>
                </div>

                <div className="space-y-8 text-sm text-slate-700 leading-relaxed bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
                    {/* 1. Introduction */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            1. Introduction
                        </h2>
                        <p>
                            At <strong>VECTONIX PRIVATE LIMITED</strong> (operating as <strong>Vectonix Technologies</strong>, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we are committed to safeguarding the privacy and personal data of our student participants, applicants, and platform visitors. This Privacy Policy outlines our transparent data practices, detailing what personal information we collect through our website (<a href="https://vectonix.in" className="text-indigo-600 underline">https://vectonix.in</a>), how it is processed for internship program administration, and the rights you retain over your information.
                        </p>
                    </section>

                    {/* 2. Information Collected */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            2. Information We Collect
                        </h2>
                        <p>
                            We collect only information directly necessary to process your internship registration, verify academic credentials, manage task evaluations, and deliver physical welcome kits:
                        </p>
                        <div className="space-y-3 text-xs pt-1">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <strong className="text-slate-900 block text-sm mb-1">A. Personal & Academic Identity:</strong>
                                Full Legal Name, Gender, Date of Birth, College / University Name, Degree Program, Department / Academic Branch, Year of Study, and Expected Graduation Year.
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <strong className="text-slate-900 block text-sm mb-1">B. Contact Details:</strong>
                                Email Address, Mobile Telephone Number, and WhatsApp Number for direct communication regarding batch schedules and mentor review allocations.
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <strong className="text-slate-900 block text-sm mb-1">C. Complete Residential Shipping Address:</strong>
                                Door/House Number, Street Name, Area/Locality, Town/City, District, State, Postal PIN Code, and Country. This data is strictly utilized to ship physical welcome kits (Premium package) and verify residential eligibility.
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <strong className="text-slate-900 block text-sm mb-1">D. Professional Links & Technical Data:</strong>
                                Optional LinkedIn profile URLs, GitHub repositories, portfolio links, and technical skill tags to assist mentors in allocating project teams. Resumes and CV documents are excluded from this intake workflow.
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <strong className="text-slate-900 block text-sm mb-1">E. Email Verification & Session Logs:</strong>
                                Server-side DNS MX validation status (`email_validation_status`), IP addresses, and secure authentication session tokens.
                            </div>
                        </div>
                    </section>

                    {/* 3. How Information is Used */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            3. How Your Information is Used
                        </h2>
                        <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                            <li><strong>Application Processing:</strong> Generating your unique concurrency-safe Application ID (e.g. `VTX-WI26-XXXX`) and allocating domain cohorts.</li>
                            <li><strong>Internship Administration:</strong> Tracking milestone task submissions, assignment grades, and weekly mentor reviews.</li>
                            <li><strong>Transactional Communications:</strong> Sending automatic registration acknowledgements, batch schedules, Discord community access links, and orientation notifications.</li>
                            <li><strong>Kit Logistics:</strong> Printing courier labels to dispatch branded welcome packages to Premium participants.</li>
                            <li><strong>Credential Issuance:</strong> Rendering verifiable, digitally signed Certificates of Completion upon successful milestone fulfillment.</li>
                        </ul>
                    </section>

                    {/* 4. Data Security & Storage */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            4. Data Storage, Security & Access Controls
                        </h2>
                        <p>
                            Student records are hosted on secure PostgreSQL database infrastructure with enforced Row-Level Security (RLS) policies. Access to personal candidate data is restricted exclusively to authenticated Vectonix administrative personnel and assigned technical mentors.
                        </p>
                        <p>
                            We employ SSL/TLS 256-bit encryption for all data in transit across public endpoints. Student phone numbers, email addresses, and residential physical locations are never exposed to other participants, shared directories, or public search indexes.
                        </p>
                    </section>

                    {/* 5. Third-Party Service Providers */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            5. Third-Party Service Providers
                        </h2>
                        <p>
                            We do not sell, rent, or trade student personal information to advertisers or external commercial marketing agencies. We share necessary data only with trusted third-party providers supporting operational workflows:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                            <li><strong>Transactional Email Infrastructure:</strong> Resend, Brevo, or authorized SMTP relays for instantaneous delivery of application confirmations and batch updates.</li>
                            <li><strong>Logistics & Courier Services:</strong> Authorized national courier partners (India Post, BlueDart, Delhivery) receiving only recipient names, delivery addresses, and phone numbers for welcome kit dispatch.</li>
                        </ul>
                    </section>

                    {/* 6. Consent & Marketing Communications */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            6. Marketing Consent & Unsubscribe Mechanisms
                        </h2>
                        <p>
                            We strictly separate mandatory transactional communications (onboarding, assignment updates, reviews) from optional promotional announcements. Promotional or workshop notifications are sent only to students who explicitly check the optional marketing consent box. Every promotional email includes a direct 1-click unsubscribe mechanism.
                        </p>
                    </section>

                    {/* 7. Data Retention & Privacy Rights */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            7. Data Retention, Correction & Deletion Rights
                        </h2>
                        <p>
                            We retain student registration records for the duration of the internship cohort plus a standard verification period to allow alumni and academic institutions to verify certificates through our public portal.
                        </p>
                        <p>
                            Under applicable data protection principles, you possess the right to:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                            <li>Request a copy of your personal data stored in our systems.</li>
                            <li>Request correction of erroneous academic or contact details.</li>
                            <li>Request complete erasure / deletion of your personal data, subject to completion certificate archival requirements.</li>
                        </ul>
                    </section>

                    {/* 8. Cookies & Analytics */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            8. Cookies and Web Analytics
                        </h2>
                        <p>
                            Our platform utilizes essential functional cookies solely to maintain secure student and administrator authentication sessions. We do not use intrusive third-party cross-site behavioral tracking cookies.
                        </p>
                    </section>

                    {/* 9. Contact Details */}
                    <section className="space-y-3 border-t border-slate-200 pt-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            9. Privacy Officer Contact Details
                        </h2>
                        <p>
                            To submit a data correction request, exercise your privacy rights, or inquire about our data security practices, contact our designated privacy desk:
                        </p>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                            <p><strong>VECTONIX PRIVATE LIMITED</strong> (Vectonix Technologies)</p>
                            <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-indigo-600" /> <a href="mailto:vectonixofficial@gmail.com" className="text-indigo-600 underline">vectonixofficial@gmail.com</a></p>
                            <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-indigo-600" /> 6382340278 / 7538872586</p>
                            <p className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-indigo-600" /> <a href="https://vectonix.in" className="text-indigo-600 underline">https://vectonix.in</a></p>
                        </div>
                    </section>
                </div>
            </Section>
        </div>
    );
}
