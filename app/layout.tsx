import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Vectonix | Smart Digital Solutions",
  description: "Vectonix is a technology startup focused on building impactful digital products, smart automation tools, and AI-driven applications.",
  other: {
    "google-adsense-account": "ca-pub-8546769161538607",
  },
  icons: {
    icon: "/logo.png",
  },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SplashScreen } from "@/components/SplashScreen";
import { AuthProvider } from "@/lib/context/AuthContext";
import GoogleAdSense from "@/components/GoogleAdSense";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-white text-slate-900">
        <AuthProvider>
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
          <GoogleAdSense />
          <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-100/40 blur-[150px]"></div>
            <div className="absolute top-[30%] right-[-20%] w-[50%] h-[70%] rounded-full bg-sky-100/30 blur-[180px]"></div>
            <div className="absolute bottom-[-20%] left-[10%] w-[60%] h-[50%] rounded-full bg-violet-50/20 blur-[160px]"></div>
          </div>
          <Navbar />
          <SplashScreen />
          <main className="flex-grow relative z-10">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
