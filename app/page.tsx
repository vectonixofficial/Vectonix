import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Code, Cpu, Globe, Zap, Settings, ShieldCheck, TrendingUp, Users } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background-dark">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[128px]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-accent-electric/30 bg-accent-electric/10 text-accent-electric text-sm font-medium tracking-wide">
            INNOVATING TOMORROW, TODAY
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
            Engineering <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-electric">Smart Digital Solutions</span> <br />
            for a Smarter World
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Vectonix builds innovative applications and intelligent systems that solve real-world problems.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products">
              <Button size="lg" variant="neon" className="font-bold text-lg px-8 py-6">
                Explore Products
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="font-bold text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT IS VECTONIX */}
      <Section className="bg-background relative">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">What is Vectonix?</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Vectonix is a technology startup focused on building impactful digital products, smart automation tools, and AI-driven applications that improve everyday life. We don't just write code; we architect the future.
          </p>
        </div>
      </Section>

      {/* WHAT WE DO */}
      <Section className="bg-secondary/5">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What We Do</h2>
          <p className="text-gray-400">Comprehensive technology solutions for modern challenges</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            icon={<Code size={32} className="text-accent-electric" />}
            title="App Development"
            description="Custom web & mobile applications tailored to your business needs."
          />
          <ServiceCard
            icon={<Cpu size={32} className="text-accent-electric" />}
            title="AI & Automation"
            description="Intelligent algorithms that automate workflows and enhance decision making."
          />
          <ServiceCard
            icon={<Settings size={32} className="text-accent-electric" />}
            title="Smart Systems"
            description="Integrated IoT solutions connecting the physical and digital worlds."
          />
          <ServiceCard
            icon={<Globe size={32} className="text-accent-electric" />}
            title="Digital Solutions"
            description="End-to-end digital transformation strategies for scalability."
          />
        </div>
      </Section>

      {/* WHY CHOOSE VECTONIX */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Why Choose Vectonix?</h2>
            <div className="space-y-6">
              <FeatureItem icon={<Zap />} title="Innovation-driven" description="We constantly explore cutting-edge technologies to stay ahead." />
              <FeatureItem icon={<Users />} title="User-focused design" description="We build with the end-user in mind, ensuring intuitive experiences." />
              <FeatureItem icon={<TrendingUp />} title="Scalable technology" description="Our solutions grow with your business, without compromise." />
              <FeatureItem icon={<ShieldCheck />} title="Reliable support" description="We stand by our products with dedicated maintenance and support." />
            </div>
          </div>
          <div className="relative h-[500px] w-full bg-gradient-to-tr from-primary to-primary-light rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center group">
            <Image
              src="/feature_graphic.png"
              alt="Vectonix Technology Visualization"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-white text-lg font-bold">Advanced Neural Architecture</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* FEATURED PRODUCT PREVIEW */}
      <Section className="bg-secondary/5">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Featured Products</h2>
            <p className="text-gray-400">See what we've been building lately</p>
          </div>
          <Link href="/products" className="hidden md:flex items-center text-accent-electric hover:text-accent transition-colors font-medium">
            View All Products <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ProductCard
            title="SmartBus TN"
            description="A real-time bus tracking system designed to help passengers track buses easily and reduce wait times."
            features={["Live bus location", "Route details", "Arrival time prediction"]}
            comingSoon={true}
          />
          <ProductCard
            title="VectoGuard AI"
            description="Intelligent security monitoring system that uses computer vision to detect anomalies."
            features={["Real-time alerts", "Face recognition", "Cloud storage"]}
            comingSoon={true}
          />
        </div>
        <div className="mt-8 md:hidden text-center">
          <Link href="/products" className="inline-flex items-center text-accent-electric hover:text-accent transition-colors font-medium">
            View All Products <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </Section>

      {/* CALL TO ACTION */}
      <Section className="py-32 bg-gradient-to-b from-background to-primary/20 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Let’s build the future together.</h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Ready to transform your ideas into reality? Get in touch with our team today.
        </p>
        <Link href="/contact">
          <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold px-10 py-6 text-lg">
            Start a Project
          </Button>
        </Link>
      </Section>
    </div>
  );
}

// Sub-components for this page only
function ServiceCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white/5 p-8 rounded-xl border border-white/5 hover:bg-white/10 transition-colors text-center group">
      <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/30 text-accent-electric group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-4 p-3 bg-primary/20 rounded-lg text-accent-electric">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  )
}
