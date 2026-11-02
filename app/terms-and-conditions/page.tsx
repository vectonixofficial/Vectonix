import { Section } from "@/components/ui/Section";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Calendar, Package, FileText, CheckCircle2, AlertCircle, Mail, Phone, Globe } from "lucide-react";

export const metadata: Metadata = {
    title: "Vectonix Winter Internship 2026 – Terms & Conditions | Vectonix Technologies",
    description: "Official terms and conditions governing student registration and participation in the Vectonix Winter Internship 2026 (Batch WI26).",
};

export default function TermsAndConditionsPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20">
            <Section className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-10 text-center sm:text-left border-b border-slate-200 pb-8">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3 uppercase tracking-wider">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Official Policy Document
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        VECTONIX WINTER INTERNSHIP 2026 – TERMS & CONDITIONS
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        VECTONIX PRIVATE LIMITED • Brand: Vectonix Technologies • Effective Date: November 2, 2026
                    </p>
                </div>

                <div className="space-y-8 text-sm text-slate-700 leading-relaxed bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
                    {/* 1. Introduction & Acceptance */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            1. Introduction and Acceptance
                        </h2>
                        <p>
                            These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;Student&quot;, &quot;Applicant&quot;, or &quot;Participant&quot;) and <strong>VECTONIX PRIVATE LIMITED</strong> (operating under the brand <strong>Vectonix Technologies</strong>, &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By registering for, enrolling in, or participating in the Vectonix Winter Internship 2026 program (Batch WI26) through <a href="https://vectonix.in" className="text-indigo-600 underline font-medium">https://vectonix.in</a>, you explicitly acknowledge that you have read, understood, and agreed to be bound by these Terms in full.
                        </p>
                    </section>

                    {/* 2. Program Details & Schedule */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            2. Internship Program Details & Duration
                        </h2>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                            <p><strong>Program Name:</strong> Vectonix Winter Internship 2026 (Cohort Batch WI26)</p>
                            <p><strong>Official Duration:</strong> 25 November 2026 – 25 December 2026 (One Month Intensive)</p>
                            <p><strong>Mode of Delivery:</strong> Virtual / Remote hands-on project-based technical training</p>
                        </div>
                        <p>
                            The internship is designed to bridge academic curriculum and technical industry demands through practical project execution, code reviews, and structured mentor interactions.
                        </p>
                    </section>

                    {/* 3. Eligibility & Registration */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            3. Eligibility & Registration Requirements
                        </h2>
                        <p>
                            The program is open to undergraduate and postgraduate students enrolled in higher education institutions in India (B.E., B.Tech, BCA, MCA, B.Sc, M.Tech, Polytechnic Diplomas) and recent graduates seeking applied industry engineering practice.
                        </p>
                        <p>
                            Applicants must ensure that all information provided during registration—including legal name, contact numbers, academic institution, and complete residential delivery address—is accurate and truthful. Vectonix reserves the right to cancel registrations containing falsified identity details.
                        </p>
                    </section>

                    {/* 4. Domain Selection */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            4. Internship Domain Selection
                        </h2>
                        <p>
                            Students must choose one technical domain track during registration. Available domains for Batch WI26 include:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                            <li>Full Stack Web & Cloud Development</li>
                            <li>Artificial Intelligence & Machine Learning (AI/ML)</li>
                            <li>Cybersecurity & Ethical Defense</li>
                            <li>Robotics & Internet of Things (IoT)</li>
                            <li>Software Testing & Automation (STA)</li>
                            <li>Digital Marketing & Growth Engineering</li>
                        </ul>
                        <p>
                            Domain changes are only permitted within 48 hours of enrollment and are subject to cohort batch capacity.
                        </p>
                    </section>

                    {/* 5. Package Selection */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            5. Internship Packages & Entitlements
                        </h2>
                        <p>
                            Participants select one of two structured packages upon enrollment:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                                <h3 className="font-bold text-slate-900 text-sm">Standard Package — ₹749</h3>
                                <ul className="mt-2 space-y-1 text-slate-600">
                                    <li>• Complete Winter Internship Participation</li>
                                    <li>• Live curriculum & course materials access</li>
                                    <li>• Practical task-based activities</li>
                                    <li>• Weekly project evaluations & reviews</li>
                                    <li>• 24/7 technical mentor support</li>
                                    <li>• Access to available teaching classes</li>
                                    <li>• Verified Internship Completion Certificate</li>
                                </ul>
                            </div>
                            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40">
                                <h3 className="font-bold text-indigo-950 text-sm">Premium Package — ₹999</h3>
                                <ul className="mt-2 space-y-1 text-slate-700">
                                    <li>• <strong>All benefits included in Standard</strong></li>
                                    <li>• Vectonix Branded Stainless Steel Bottle</li>
                                    <li>• Vectonix Branded Executive Pen</li>
                                    <li>• Vectonix Branded Metallic Badge</li>
                                    <li>• Free Internship Welcome Kit dispatched to residential address</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 6. Physical Welcome Kit Distribution */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            6. Internship Welcome Kit Delivery
                        </h2>
                        <p>
                            For students selecting the Premium Package, the physical welcome kit will be dispatched via registered courier/postal service to the residential address provided during registration. Dispatch typically occurs during the second week of the internship. Vectonix is not liable for delivery failures caused by incorrect postal addresses or recipient unavailability.
                        </p>
                    </section>

                    {/* 7. Tasks, Classes & Deadlines */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            7. Task-Based Structure, Reviews & Deadlines
                        </h2>
                        <p>
                            The internship operates on a practical, task-oriented milestone model. Students are assigned weekly tasks through the Student Internship Dashboard. Participation in scheduled weekly project review sessions and meeting assignment submission deadlines is mandatory for evaluation.
                        </p>
                        <p>
                            Teaching classes are offered as an additional learning resource to guide implementation; attendance schedules are published inside the student portal.
                        </p>
                    </section>

                    {/* 8. Code of Conduct & Plagiarism */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            8. Code of Conduct, Academic Integrity & Plagiarism
                        </h2>
                        <p>
                            All submitted source code, designs, and documentation must be the student&apos;s own original work or properly attributed open-source libraries. Plagiarism, direct copying from fellow candidates, or unauthorized submission of existing commercial templates without functional enhancement constitutes misconduct and will result in immediate disqualification without certificate issuance.
                        </p>
                    </section>

                    {/* 9. Intellectual Property */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            9. Intellectual Property Rights
                        </h2>
                        <p>
                            Students retain full ownership of the independent source code and projects they build during the program. Vectonix Technologies retains ownership of all proprietary instructional materials, class recordings, brand logos, and assessment rubrics provided.
                        </p>
                    </section>

                    {/* 10. Certificate Eligibility */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            10. Certificate Eligibility & Issuance
                        </h2>
                        <p>
                            <strong>Important Condition:</strong> Registration alone does not entitle an applicant to an internship certificate. To be awarded the official, verifiable Certificate of Completion, a participant must:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                            <li>Complete and submit at least 80% of assigned practical milestone tasks.</li>
                            <li>Participate in the designated weekly project review checkpoints.</li>
                            <li>Deliver a functional, demonstratable capstone project in their chosen domain.</li>
                        </ul>
                        <p>
                            Certificates are digitally signed with a tamper-proof QR code verifiable via <a href="https://vectonix.in/verify" className="text-indigo-600 underline">https://vectonix.in/verify</a>.
                        </p>
                    </section>

                    {/* 11. No Employment Guarantee & No False Claims */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            11. Program Nature & Disclaimers
                        </h2>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                            <p><strong>Educational Nature:</strong> This program is an independent, skill-development industrial training internship offered by VECTONIX PRIVATE LIMITED.</p>
                            <p><strong>No Employment Guarantee:</strong> Participation or certificate completion does not guarantee employment, permanent placement, or salary offers from Vectonix or partner companies.</p>
                            <p><strong>University Recognition:</strong> While many colleges approve this training for mandatory degree internship credits, acceptance is governed solely by your institution&apos;s internal academic board.</p>
                        </div>
                    </section>

                    {/* 12. Cancellation & Refund Policy */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            12. Cancellation, Withdrawal & Refund Policy
                        </h2>
                        <p>
                            Due to immediate provisioning of digital curriculum resources, technical infrastructure, and kit manufacturing orders:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                            <li>Requests for cancellation made <strong>prior to the batch start date (before 25 November 2026)</strong> are eligible for a 70% refund (30% administrative and onboarding fee deducted).</li>
                            <li>Once the cohort commences on <strong>25 November 2026</strong>, registration fees are strictly non-refundable and non-transferable.</li>
                        </ul>
                    </section>

                    {/* 13. Limitation of Liability */}
                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            13. Limitation of Liability
                        </h2>
                        <p>
                            Vectonix Technologies shall not be liable for any indirect, incidental, or consequential damages resulting from internet downtime, hardware incompatibilities, or platform service disruptions beyond reasonable control. In all cases, our total aggregate liability shall not exceed the amount paid for your chosen package.
                        </p>
                    </section>

                    {/* 14. Contact Information */}
                    <section className="space-y-3 border-t border-slate-200 pt-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            14. Contact & Inquiries
                        </h2>
                        <p>
                            For questions regarding these Terms, program logistics, or academic verification:
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
