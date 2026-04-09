import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  serverActions: {
    bodySizeLimit: '10mb',
  },
};

export default nextConfig;
