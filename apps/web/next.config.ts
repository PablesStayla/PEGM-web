import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isProd = process.env.NODE_ENV === 'production';

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'frame-src https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com',
  [
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:*",
    'https://js.stripe.com',
    'https://www.googletagmanager.com',
    'https://challenges.cloudflare.com',
  ]
    .filter(Boolean)
    .join(' '),
  isProd
    ? "connect-src 'self' http://localhost:* https:"
    : "connect-src 'self' http: https: ws: wss:",
  // isProd ? 'upgrade-insecure-requests' : '',
]
  .filter(Boolean)
  .join('; ');

const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  { key: 'Content-Security-Policy', value: CSP_DIRECTIVES },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@pranakaia/ui',
    '@pranakaia/domain',
    '@pranakaia/application',
    '@pranakaia/infrastructure',
    '@pranakaia/shared-kernel',
    '@pranakaia/identity',
    '@pranakaia/testkit',
  ],
  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      'date-fns',
      'lucide-react',
      'zod',
      'zustand',
      '@tanstack/react-query',
      'framer-motion',
    ],
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'pranakaia.cl',
        'www.pranakaia.cl',
        'pranakaia.vercel.app',
      ],
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.pranakaia.cl' },
      { protocol: 'https', hostname: '**.pranakaia.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  poweredByHeader: false,
  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },
  async redirects() {
    return [
      {
        source: '/api',
        destination: '/api-docs',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
      {
        source: '/api/webhooks/stripe',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://js.stripe.com' },
          { key: 'Access-Control-Allow-Methods', value: 'POST' },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const sentryWrappedConfig = withSentryConfig(nextConfig, {
  org: 'pranakaia',
  project: 'ecommerce-web',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  webpack: (config) => {
    // biome-ignore lint/performance/noDelete: <explanation>
    if (config.optimization?.treeshake) {
      // @ts-expect-error
      config.optimization.treeshake.removeDebugLogging = true;
    }
    return config;
  },
});

export default withNextIntl(sentryWrappedConfig);
