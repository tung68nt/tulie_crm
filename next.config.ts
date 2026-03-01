import type { NextConfig } from "next";

const nextConfig = {
  reactCompiler: true,
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
} as any;

export default nextConfig;
