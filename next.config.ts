import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@libsql/client"],
  allowedDevOrigins: ["*.e2b.app"],
};

export default nextConfig;
