import type { NextConfig } from "next";

// @ts-expect-error - reactCompiler is valid but types might be strict
const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;


