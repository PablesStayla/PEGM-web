import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const adminCsp = (() => {
  const base = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "form-action 'self'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https:",
    "style-src 'self' 'unsafe-inline' https:",
    isProd
      ? "script-src 'self' 'unsafe-inline' http://localhost:* https:"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    isProd ? "connect-src 'self' http://localhost:* https:" : "connect-src 'self' http: https: ws:",
  ];

  return base.join('; ');
})();

const nextConfig: NextConfig = {
  transpilePackages: [
    '@pranakaia/ui',
    '@pranakaia/domain',
    '@pranakaia/application',
    '@pranakaia/infrastructure',
    '@pranakaia/shared-kernel',
    '@pranakaia/identity',
    '@pranakaia/testkit',
  ],
  typescript: {
    ignoreBuildErrors: false,
  },
  ...(process.platform === 'win32' ? {} : { output: 'standalone' as const }),
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001', 'admin.pranakaia.com'],
    },
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          { key: 'Content-Security-Policy', value: adminCsp },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: 'pranakaia',
  project: 'pranakaia-admin',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
});
