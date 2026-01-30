import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-background-dark border-t border-white/10 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-white mb-4">
                            <Image src="/logo.jpg" alt="Vectonix Logo" width={32} height={32} className="w-8 h-8 object-contain" />
                            <span>VECTONIX<span className="text-accent-electric">.</span></span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Engineering Smart Digital Solutions for a Smarter World. We build innovative applications and intelligent systems.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/about" className="hover:text-accent-electric transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-accent-electric transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-accent-electric transition-colors">Contact</Link></li>
                            <li><Link href="/privacy" className="hover:text-accent-electric transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Services</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><Link href="/services" className="hover:text-accent-electric transition-colors">App Development</Link></li>
                            <li><Link href="/services" className="hover:text-accent-electric transition-colors">AI & Automation</Link></li>
                            <li><Link href="/services" className="hover:text-accent-electric transition-colors">Cloud Integration</Link></li>
                            <li><Link href="/services" className="hover:text-accent-electric transition-colors">Data Analytics</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Connect</h3>
                        <div className="flex space-x-4">
                            <a href="https://x.com/vectonix/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-electric transition-colors"><Twitter size={20} /></a>
                            <a href="https://www.linkedin.com/in/vectonix-technologies/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-electric transition-colors"><Linkedin size={20} /></a>
                            <a href="https://www.instagram.com/vectonixofficial/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-electric transition-colors"><Instagram size={20} /></a>
                            <a href="https://www.facebook.com/profile.php?id=61586951445808" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-electric transition-colors"><Facebook size={20} /></a>
                        </div>
                        <div className="mt-6 flex items-center text-gray-400 text-sm">
                            <Mail size={16} className="mr-2" />
                            <a href="mailto:vectonixofficial@gmail.com" className="hover:text-accent-electric transition-colors">vectonixofficial@gmail.com</a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Vectonix. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
