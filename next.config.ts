import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking by denying all iframe embedding
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME-type sniffing attacks
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control referrer information sent with requests
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Restrict browser features — allow camera/geo for attendance scanner
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(self), interest-cohort=()',
          },
          // Force HTTPS for 2 years with preload registration
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Content Security Policy (Report-Only — does not block, only monitors)
          // In production, Cloudflare WAF provides enforcement layer
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https: wss: ws:",
              "worker-src 'self' blob:",
              "media-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/assets/:path*',
      },
    ];
  },
};

export default nextConfig;
