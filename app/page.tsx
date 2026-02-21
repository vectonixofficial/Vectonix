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
            <div className="inline-block mb-6 px-6 py-2 rounded-full border border-accent-electric/30 bg-accent-electric/10 backdrop-blur-md text-accent-electric text-sm font-medium tracking-wide shadow-[0_0_15px_rgba(255,215,0,0.3)]">
              INNOVATING TOMORROW, TODAY
            </div>
          </MotionWrapper>

          <MotionWrapper delay={0.4}>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-tight">
              Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-electric animate-pulse">Smart Solutions</span> <br />
              for a Smarter World
            </h1>
          </MotionWrapper>

          <MotionWrapper delay={0.6}>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
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
                <Button size="lg" variant="outline" className="font-bold text-lg px-10 py-7 rounded-xl border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
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
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">What is Vectonix?</h2>
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
                Vectonix is a technology startup focused on building <span className="text-accent-electric">impactful digital products</span>, smart automation tools, and AI-driven applications that improve everyday life. We don't just write code; we architect the future.
              </p>
            </div>
          </MotionWrapper>
        </Section>

        {/* WHAT WE DO */}
        <Section className="border-y border-white/5">
          <MotionWrapper>
            <div className="mb-20 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">What We Do</h2>
              <p className="text-gray-400 text-lg">Comprehensive technology solutions for modern challenges</p>
            </div>
          </MotionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <MotionWrapper delay={0.1} direction="up">
              <ServiceCard
                icon={<Code size={40} className="text-accent-electric" />}
                title="App Development"
                description="Custom web & mobile applications tailored to your business needs."
              />
            </MotionWrapper>
            <MotionWrapper delay={0.2} direction="up">
              <ServiceCard
                icon={<Cpu size={40} className="text-accent-electric" />}
                title="AI & Automation"
                description="Intelligent algorithms that automate workflows and enhance decision making."
              />
            </MotionWrapper>
            <MotionWrapper delay={0.3} direction="up">
              <ServiceCard
                icon={<Settings size={40} className="text-accent-electric" />}
                title="Smart Systems"
                description="Integrated IoT solutions connecting the physical and digital worlds."
              />
            </MotionWrapper>
            <MotionWrapper delay={0.4} direction="up">
              <ServiceCard
                icon={<Globe size={40} className="text-accent-electric" />}
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
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-10">Why Choose Vectonix?</h2>
                <div className="space-y-8">
                  <FeatureItem icon={<Zap />} title="Innovation-driven" description="We constantly explore cutting-edge technologies to stay ahead." delay={0.1} />
                  <FeatureItem icon={<Users />} title="User-focused design" description="We build with the end-user in mind, ensuring intuitive experiences." delay={0.2} />
                  <FeatureItem icon={<TrendingUp />} title="Scalable technology" description="Our solutions grow with your business, without compromise." delay={0.3} />
                  <FeatureItem icon={<ShieldCheck />} title="Reliable support" description="We stand by our products with dedicated maintenance and support." delay={0.4} />
                </div>
              </div>
            </MotionWrapper>

            <MotionWrapper direction="right" delay={0.3}>
              <div className="relative h-[600px] w-full bg-gradient-to-tr from-primary to-primary-light rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center group shadow-2xl">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30 bg-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                <Image
                  src="/feature_graphic.png"
                  alt="Advanced Neural Architecture"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute bottom-0 left-0 right-0 p-10">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-accent-electric font-mono mb-2">010101 DIGITAL CORE</p>
                    <p className="text-white text-2xl font-bold">Advanced Neural Architecture</p>
                  </div>
                </div>
              </div>
            </MotionWrapper>
          </div>
        </Section>

        {/* FEATURED PRODUCT PREVIEW */}
        <Section className="">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <MotionWrapper>
              <div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Featured Products</h2>
                <p className="text-gray-400 text-lg">See what we've been building lately</p>
              </div>
            </MotionWrapper>
            <MotionWrapper direction="left">
              <Link href="/products" className="hidden md:flex items-center text-accent-electric hover:text-white transition-colors font-medium text-lg group">
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
            <Link href="/products" className="inline-flex items-center text-accent-electric hover:text-white transition-colors font-medium text-lg">
              View All Products <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </Section>

        {/* LEARNING HUB SECTION */}
        <Section className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent-electric/5 to-transparent pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <MotionWrapper className="flex-1">
              <div className="relative">
                <div className="absolute -top-10 -left-10 w-20 h-20 bg-accent-electric/20 rounded-full blur-xl animate-pulse" />
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Master the Future at <br />
                  <span className="text-accent-electric">Vectonix Learning Hub</span>
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-xl">
                  Dive into our curated library of tutorials, deep-dives into AI architecture, and best practices for modern software engineering. Whether you're a beginner or an expert, there's always something new to discover.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/learning">
                    <Button size="lg" variant="neon" className="px-8 py-6 text-lg rounded-xl flex items-center gap-2 group">
                      Start Learning <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="ghost" className="px-8 py-6 text-lg rounded-xl text-gray-300 hover:text-white hover:bg-white/5">
                      Contribute an Article
                    </Button>
                  </Link>
                </div>
              </div>
            </MotionWrapper>

            <MotionWrapper direction="left" delay={0.2} className="flex-1 w-full max-w-lg">
              <div className="relative aspect-square glass-panel p-8 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent-electric/10 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Decorative elements representing knowledge/code */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-accent-electric/20 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-dashed border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

                <div className="relative z-10 text-center space-y-4">
                  <div className="inline-flex p-6 rounded-2xl bg-gradient-to-br from-accent-electric/20 to-transparent border border-accent-electric/30 backdrop-blur-md mb-2 shadow-[0_0_30px_rgba(255,215,0,0.2)]">
                    <BookOpen size={64} className="text-accent-electric drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/5 mx-auto max-w-[200px]">
                    <p className="text-xs text-accent-electric font-mono tracking-widest mb-1">RESOURCES</p>
                    <p className="text-2xl font-bold text-white">500+</p>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/5 mx-auto max-w-[200px]">
                    <p className="text-xs text-gray-400 font-mono tracking-widest mb-1">COMMUNITY</p>
                    <p className="text-2xl font-bold text-white">Active</p>
                  </div>
                </div>
              </div>
            </MotionWrapper>
          </div>
        </Section>

        {/* CALL TO ACTION */}
        <Section className="py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-electric/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-electric/10 rounded-full blur-[100px]" />

          <MotionWrapper direction="up">
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-7xl font-bold text-white mb-8">Let’s build the future together.</h2>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Ready to transform your ideas into reality? Get in touch with our team today.
              </p>
              <Link href="/contact">
                <Button size="lg" className="bg-white text-black hover:bg-accent-electric hover:text-black font-bold px-12 py-8 text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)]">
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
      <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 text-accent-electric group-hover:scale-110 group-hover:bg-accent-electric/20 transition-all duration-300 border border-white/10">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  )
}

function FeatureItem({ icon, title, description, delay = 0 }: { icon: React.ReactNode, title: string, description: string, delay?: number }) {
  return (
    <MotionWrapper delay={delay} direction="left" className="w-full">
      <div className="glass-panel glass-panel-hover flex items-start p-6 rounded-2xl">
        <div className="flex-shrink-0 mr-6 p-4 bg-white/5 rounded-xl text-accent-electric border border-white/10">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-300">{description}</p>
        </div>
      </div>
    </MotionWrapper>
  )
}
