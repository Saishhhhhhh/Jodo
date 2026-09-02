import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow mobile devices to connect to dev server
  allowedDevOrigins: ['192.168.1.11'],
} as any;

export default nextConfig;
