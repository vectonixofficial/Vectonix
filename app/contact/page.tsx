'use client';

import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Mail, MapPin, Phone, Send, Twitter, Linkedin, Instagram, Facebook } from "lucide-react";
import { useState } from "react";

import { HeroBackground } from "@/components/ui/HeroBackground";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

export default function ContactPage() {
    // ... state and handlers ...
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (existing logic)
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    subject: 'General Inquiry',
                    message: ''
                });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none">
                <HeroBackground />
            </div>

            <Section className="relative z-10 pt-40 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <MotionWrapper direction="right" className="space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-7xl font-bold text-white mb-6">Get in Touch</h1>
                            <p className="text-xl text-gray-300 leading-relaxed font-light">
                                Have a project in mind or want to learn more about our products?
                                We'd love to hear from you.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <ContactItem icon={<Mail />} title="Email Us" content="vectonixofficial@gmail.com" />
                            <ContactItem icon={<Phone />} title="Call Us" content="+91 75388 72586, +91 63823 40278" />
                            <ContactItem icon={<MapPin />} title="Visit Us" content="K.V.S. Nagar, Hosur, Tamil Nadu, India" />
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
                            <div className="flex space-x-4">
                                <a href="https://x.com/vectonix/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent-electric hover:text-black transition-colors"><Twitter size={20} /></a>
                                <a href="https://www.linkedin.com/in/vectonix-technologies/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent-electric hover:text-black transition-colors"><Linkedin size={20} /></a>
                                <a href="https://www.instagram.com/vectonixofficial/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent-electric hover:text-black transition-colors"><Instagram size={20} /></a>
                                <a href="https://www.facebook.com/profile.php?id=61586951445808" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent-electric hover:text-black transition-colors"><Facebook size={20} /></a>
                            </div>
                        </div>

                        {/* Map */}
                        {/* Map */}
                        <div className="glass-panel rounded-2xl overflow-hidden h-64 relative">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15573.407983695286!2d77.8139580456205!3d12.72149021817757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae70e176378e9b%3A0xe5a36340659648a7!2sK.V.S.Nagar%2C%20Hosur%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1706600000000!5m2!1sen!2sin"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="filter grayscale hover:grayscale-0 transition-all duration-500 opacity-80 hover:opacity-100"
                            ></iframe>
                        </div>
                    </MotionWrapper>

                    {/* Contact Form */}
                    <MotionWrapper direction="left" delay={0.2}>
                        <div className="glass-panel p-8 md:p-10 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-electric/10 rounded-full blur-3xl -z-10 transition-all duration-700 group-hover:bg-accent-electric/20"></div>
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">First Name</label>
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/50 transition-all" placeholder="Enter your first name" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300">Last Name</label>
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/50 transition-all" placeholder="Enter your last name" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/50 transition-all" placeholder="Enter your email address" required />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Subject</label>
                                    <select name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/50 transition-all">
                                        <option>General Inquiry</option>
                                        <option>Product Support</option>
                                        <option>Business Partnership</option>
                                        <option>Careers</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Message</label>
                                    <textarea name="message" value={formData.message} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-electric/50 focus:ring-1 focus:ring-accent-electric/50 transition-all h-32" placeholder="How can we help you?" required></textarea>
                                </div>

                                <Button className="w-full font-bold py-6 text-lg" variant="neon" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <span className="flex items-center">
                                            Sending... <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            Send Message <Send size={18} className="ml-2" />
                                        </span>
                                    )}
                                </Button>

                                {submitStatus === 'success' && (
                                    <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-center">
                                        Message sent successfully! We'll get back to you soon.
                                    </div>
                                )}

                                {submitStatus === 'error' && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-center">
                                        Failed to send message. Please try again later.
                                    </div>
                                )}
                            </form>
                        </div>
                    </MotionWrapper>
                </div>
            </Section >
        </div >
    );
}

function ContactItem({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
    return (
        <div className="flex items-start glass-panel-hover p-4 rounded-xl transition-all">
            <div className="flex-shrink-0 p-3 bg-white/5 rounded-lg text-accent-electric mr-4 border border-white/10">
                {icon}
            </div>
            <div>
                <h3 className="text-white font-semibold">{title}</h3>
                <p className="text-gray-400">{content}</p>
            </div>
        </div>
    );
}
