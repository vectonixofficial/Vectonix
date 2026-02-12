import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Vectonix | Smart Digital Solutions",
  description: "Vectonix is a technology startup focused on building impactful digital products, smart automation tools, and AI-driven applications.",
  other: {
    "google-adsense-account": "ca-pub-8546769161538607",
  },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Q9PSXCHY32"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-Q9PSXCHY32');
          `}
        </Script>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8546769161538607"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px] animate-pulse"></div>
          <div className="absolute top-[30%] right-[-20%] w-[50%] h-[70%] rounded-full bg-blue-900/10 blur-[180px] animate-pulse delay-1000"></div>
          <div className="absolute bottom-[-20%] left-[10%] w-[60%] h-[50%] rounded-full bg-primary/5 blur-[160px] animate-pulse delay-2000"></div>
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
        </div>
        <Navbar />
        <main className="flex-grow relative z-10">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
