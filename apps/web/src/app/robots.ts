// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/robots.ts

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://matdam.vercel.app/sitemap.xml",
  };
}
