// Tag: config
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/next.config.ts

import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://us-assets.i.posthog.com`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' *.supabase.co data: blob:",
              "connect-src 'self' *.supabase.co *.sentry.io https://us.posthog.com https://us.i.posthog.com https://us-assets.i.posthog.com",
              "worker-src 'self' blob:",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-src 'none'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: "matdam",
  project: "matdam-web",

  // Source map 업로드 비활성화 (개발 단계 — 필요 시 활성화)
  silent: true,

  // 번들 사이즈 최적화: 사용하지 않는 Sentry 코드 제거
  disableLogger: true,

  // Sentry 터널링으로 ad-blocker 우회
  tunnelRoute: "/monitoring",
});
