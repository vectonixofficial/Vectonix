"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

// Paths where Google Ads should not be loaded
const EXCLUDED_PATHS = [
  "/login",
  "/signup",
  "/verify",
  "/admin",
];

export default function GoogleAdSense() {
  const pathname = usePathname();

  // If current path matches or is a subpath of any excluded path
  const shouldExclude = EXCLUDED_PATHS.some((path) => 
    pathname === path || pathname.startsWith(path + "/")
  );

  if (shouldExclude) {
    return null;
  }

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8546769161538607"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
