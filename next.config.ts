import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "*.thapar.edu" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "drizzle-orm", "@auth/core"],
  },
};

export default nextConfig;
