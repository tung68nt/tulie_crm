import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
} as any;

export default nextConfig;
