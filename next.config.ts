import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
   eslint: {
    // ⚠️ This will ignore ESLint errors/warnings during builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
