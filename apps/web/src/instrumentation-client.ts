// Tag: config
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/instrumentation-client.ts

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
