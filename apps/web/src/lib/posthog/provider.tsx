// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/lib/posthog/provider.tsx

"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      // 수동 capture만 사용
      autocapture: false,
      // 쿠키 없이 메모리에 저장
      persistence: "memory",
      // 개발 환경에서는 캡처 비활성화
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.opt_out_capturing();
        }
      },
    });
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
