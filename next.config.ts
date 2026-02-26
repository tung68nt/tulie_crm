import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // @ts-ignore - Lower memory usage by reducing ISR cache size
    isrMemoryCacheSize: 0,
  }
};

export default nextConfig;


