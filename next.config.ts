import type { NextConfig } from "next";

const productionHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).host
      : null;
  } catch {
    return null;
  }
})();

const allowedServerActionOrigins = [
  productionHost,
  "medpulse-ai-five.vercel.app",
  "medpulse-a3wfmgz43-6dskdnj66g-dotcoms-projects.vercel.app",
].filter(Boolean) as string[];

const securityHeaders = [
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(self), microphone=(self), geolocation=()" },
  {
    key:   "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    // Provider whitelist:
    //   - Groq + Google Generative AI (active providers)
    //   - NCBI for the library reader
    //   - Supabase for auth/realtime
    //   - Upstash for rate limiting
    // Removed: api.x.ai (xAI Grok was retired; we now use Groq exclusively).
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://www.ncbi.nlm.nih.gov",
      "font-src 'self' data:",
      "connect-src 'self' https://api.groq.com https://generativelanguage.googleapis.com https://eutils.ncbi.nlm.nih.gov https://*.supabase.co wss://*.supabase.co https://*.upstash.io",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    // CSRF defense for Server Actions: only accept invocations from these
    // origins. Vercel preview URLs that need access must be added to
    // NEXT_PUBLIC_SITE_URL or this allowlist.
    serverActions: {
      allowedOrigins: allowedServerActionOrigins,
    },
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "www.ncbi.nlm.nih.gov" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === "development" },
  },

  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
