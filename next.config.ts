import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/privacy-policy",
        destination: "/privacy",
      },
      {
        source: "/terms-and-conditions",
        destination: "/terms",
      },
    ];
  },
};

export default nextConfig;
