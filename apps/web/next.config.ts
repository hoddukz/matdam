// Tag: config
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/next.config.ts

import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
