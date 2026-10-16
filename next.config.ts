import type { NextConfig } from "next";

/**
 * Headers de seguridad HTTP — solo en build de producción, para no interferir
 * con el modo dev (HMR, previews embebidas, etc.). Vercel añade HSTS
 * automáticamente sobre HTTPS, así que no se duplica aquí.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@libsql/client"],
  allowedDevOrigins: ["*.e2b.app"],
  ...(process.env.NODE_ENV === "production"
    ? {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: securityHeaders,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
