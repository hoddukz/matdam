// Tag: config
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/next.config.ts

import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {};

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
