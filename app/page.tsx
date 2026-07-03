import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Code, Cpu, Globe, Zap, Settings, ShieldCheck, TrendingUp, Users, BookOpen } from "lucide-react";
import Image from "next/image";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

import { AnnouncementBox } from "@/components/AnnouncementBox";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <MotionWrapper delay={0.2} direction="down">
            <div className="inline-block mb-6 px-6 py-2 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 text-sm font-medium tracking-wide shadow-sm">
              INNOVATING TOMORROW, TODAY
            </div>
          </MotionWrapper>

          <MotionWrapper delay={0.4}>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-slate-900 mb-8 leading-tight">
              Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">Smart Solutions</span> <br />
              for a Smarter World
            </h1>
          </MotionWrapper>

          <MotionWrapper delay={0.6}>
            <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed">
              Vectonix builds innovative applications and intelligent systems that solve real-world problems.
            </p>
          </MotionWrapper>

          <MotionWrapper delay={0.8} direction="up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/products">
                <Button size="lg" variant="neon" className="font-bold text-lg px-10 py-7 rounded-xl">
                  Explore Products
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="font-bold text-lg px-10 py-7 rounded-xl border-slate-300 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300">
                  Contact Us
                </Button>
              </Link>
            </div>
          </MotionWrapper>
        </div>
      </section>

      {/* WHAT IS VECTONIX */}
      <div className="relative z-10">
        <Section className="relative">
          <MotionWrapper viewportAmount={0.5}>
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8">What is Vectonix?</h2>
              <p className="text-lg md:text-xl text-slate-500 leading-relaxed">
                Vectonix is a technology startup focused on building <span className="text-indigo-600 font-semibold">impactful digital products</span>, smart automation tools, and AI-driven applications that improve everyday life. We don't just write code; we architect the future.
              </p>
            </div>
          </MotionWrapper>
        </Section>

        {/* WHAT WE DO */}
        <Section className="border-y border-slate-200/50 section-alt">
          <MotionWrapper>
            <div className="mb-20 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">What We Do</h2>
              <p className="text-slate-500 text-lg">Comprehensive technology solutions for modern challenges</p>
            </div>
          </MotionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <MotionWrapper delay={0.1} direction="up">
              <ServiceCard
                icon={<Code size={40} className="text-indigo-600" />}
                title="App Development"
                description="Custom web & mobile applications tailored to your business needs."
              />
            </MotionWrapper>
            <MotionWrapper delay={0.2} direction="up">
              <ServiceCard
                icon={<Cpu size={40} className="text-indigo-600" />}
                title="AI & Automation"
                description="Intelligent algorithms that automate workflows and enhance decision making."
              />
            </MotionWrapper>
            <MotionWrapper delay={0.3} direction="up">
              <ServiceCard
                icon={<Settings size={40} className="text-indigo-600" />}
                title="Smart Systems"
                description="Integrated IoT solutions connecting the physical and digital worlds."
              />
            </MotionWrapper>
            <MotionWrapper delay={0.4} direction="up">
              <ServiceCard
                icon={<Globe size={40} className="text-indigo-600" />}
                title="Digital Solutions"
                description="End-to-end digital transformation strategies for scalability."
              />
            </MotionWrapper>
          </div>
        </Section>

        {/* WHY CHOOSE VECTONIX */}
        <Section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <MotionWrapper direction="left">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-10">Why Choose Vectonix?</h2>
                <div className="space-y-8">
                  <FeatureItem icon={<Zap />} title="Innovation-driven" description="We constantly explore cutting-edge technologies to stay ahead." delay={0.1} />
                  <FeatureItem icon={<Users />} title="User-focused design" description="We build with the end-user in mind, ensuring intuitive experiences." delay={0.2} />
                  <FeatureItem icon={<TrendingUp />} title="Scalable technology" description="Our solutions grow with your business, without compromise." delay={0.3} />
                  <FeatureItem icon={<ShieldCheck />} title="Reliable support" description="We stand by our products with dedicated maintenance and support." delay={0.4} />
                </div>
              </div>
            </MotionWrapper>

            <MotionWrapper direction="right" delay={0.3}>
              <div className="relative h-[600px] w-full bg-gradient-to-tr from-indigo-600 to-sky-500 rounded-3xl overflow-hidden border border-slate-200 flex items-center justify-center group shadow-2xl">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30 bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                <Image
                  src="/feature_graphic.png"
                  alt="Advanced Neural Architecture"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute bottom-0 left-0 right-0 p-10">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-sky-300 font-mono mb-2">010101 DIGITAL CORE</p>
                    <p className="text-white text-2xl font-bold">Advanced Neural Architecture</p>
                  </div>
                </div>
              </div>
            </MotionWrapper>
          </div>
        </Section>

        {/* FEATURED PRODUCT PREVIEW */}
        <Section className="section-alt">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <MotionWrapper>
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Featured Products</h2>
                <p className="text-slate-500 text-lg">See what we've been building lately</p>
              </div>
            </MotionWrapper>
            <MotionWrapper direction="left">
              <Link href="/products" className="hidden md:flex items-center text-indigo-600 hover:text-indigo-700 transition-colors font-medium text-lg group">
                View All Products <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MotionWrapper>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <MotionWrapper delay={0.1}>
              <ProductCard
                title="SmartBus TN"
                description="A real-time bus tracking system designed to help passengers track buses easily and reduce wait times."
                features={["Live bus location", "Route details", "Arrival time prediction"]}
                comingSoon={true}
              />
            </MotionWrapper>
            <MotionWrapper delay={0.2}>
              <ProductCard
                title="VectoGuard AI"
                description="Intelligent security monitoring system that uses computer vision to detect anomalies."
                features={["Real-time alerts", "Face recognition", "Cloud storage"]}
                comingSoon={true}
              />
            </MotionWrapper>
          </div>

          <div className="mt-12 md:hidden text-center">
            <Link href="/products" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 transition-colors font-medium text-lg">
              View All Products <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </Section>

        {/* LEARNING HUB SECTION */}
        <Section className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-50/50 to-transparent pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <MotionWrapper className="flex-1">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-indigo-200/40 rounded-full blur-xl animate-pulse" />
                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  Master the Future at <br />
                  <span className="text-indigo-600">Vectonix Learning Hub</span>
                </h2>
                <p className="text-slate-500 text-lg mb-8 leading-relaxed max-w-xl">
                  Dive into our curated library of tutorials, deep-dives into AI architecture, and best practices for modern software engineering. Whether you're a beginner or an expert, there's always something new to discover.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/learning">
                    <Button size="lg" variant="neon" className="px-8 py-6 text-lg rounded-xl flex items-center gap-2 group">
                      Start Learning <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="ghost" className="px-8 py-6 text-lg rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                      Contribute an Article
                    </Button>
                  </Link>
                </div>
              </div>
            </MotionWrapper>

            <MotionWrapper direction="left" delay={0.2} className="flex-1 w-full max-w-lg">
              <div className="relative aspect-square glass-panel p-8 rounded-3xl flex items-center justify-center border border-slate-200 shadow-xl group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-transparent to-sky-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Decorative elements representing knowledge/code */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-indigo-200/30 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-dashed border-slate-200/50 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

                <div className="relative z-10 text-center space-y-4">
                  <div className="inline-flex p-6 rounded-2xl bg-indigo-50 border border-indigo-200 mb-2 shadow-md">
                    <BookOpen size={64} className="text-indigo-600" />
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 mx-auto max-w-[200px]">
                    <p className="text-xs text-indigo-600 font-mono tracking-widest mb-1">RESOURCES</p>
                    <p className="text-2xl font-bold text-slate-900">500+</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200 mx-auto max-w-[200px]">
                    <p className="text-xs text-slate-400 font-mono tracking-widest mb-1">COMMUNITY</p>
                    <p className="text-2xl font-bold text-slate-900">Active</p>
                  </div>
                </div>
              </div>
            </MotionWrapper>
          </div>
        </Section>

        {/* CALL TO ACTION */}
        <Section className="py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-600" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-[100px]" />

          <MotionWrapper direction="up">
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-7xl font-bold text-white mb-8">Let's build the future together.</h2>
              <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
                Ready to transform your ideas into reality? Get in touch with our team today.
              </p>
              <Link href="/contact">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-12 py-8 text-xl rounded-xl transition-all shadow-xl hover:shadow-2xl">
                  Start a Project
                </Button>
              </Link>
            </div>
          </MotionWrapper>
        </Section>
      </div>
      <AnnouncementBox />
    </div>
  );
}

// Sub-components for this page only
function ServiceCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-panel glass-panel-hover p-10 rounded-3xl text-center group h-full">
      <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300 border border-indigo-100">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  )
}

function FeatureItem({ icon, title, description, delay = 0 }: { icon: React.ReactNode, title: string, description: string, delay?: number }) {
  return (
    <MotionWrapper delay={delay} direction="left" className="w-full">
      <div className="glass-panel glass-panel-hover flex items-start p-6 rounded-2xl">
        <div className="flex-shrink-0 mr-6 p-4 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500">{description}</p>
        </div>
      </div>
    </MotionWrapper>
  )
}
