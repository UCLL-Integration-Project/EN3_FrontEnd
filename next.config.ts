import type { NextConfig } from "next";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import withSerwistInit from "@serwist/next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

// A revision helps Serwist version precached pages so stale entries
// don't survive a deploy. `git rev-parse HEAD` is convenient; swap for
// per-file hashes if precision matters.
const revision = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() || crypto.randomUUID();

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(withSerwist(nextConfig));
