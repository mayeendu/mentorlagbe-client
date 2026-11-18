import type { NextConfig } from "next";
import { readClientEnvironment, securityHeaders } from "./config/environment.mjs";

export default function nextConfig(): NextConfig {
  const { publicApiOrigin, serverApiOrigin, production } = readClientEnvironment();
  return {
    poweredByHeader: false,
    async rewrites() {
      return [{ source: "/api/auth/:path*", destination: serverApiOrigin + "/api/auth/:path*" }];
    },
    async headers() {
      return [{ source: "/:path*", headers: securityHeaders(publicApiOrigin, production) }];
    },
    cacheComponents: true,
    partialPrefetching: true,
    reactCompiler: true,
    turbopack: {
      rules: {
        "*.css": {
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      },
    },
  };
}
