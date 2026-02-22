// Tag: core
// Path: /Users/hodduk/Documents/git/mat_dam/apps/web/src/app/sitemap.ts

import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: recipes } = await supabase
    .from("recipes")
    .select("slug, updated_at")
    .eq("published", true);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://matdam.vercel.app";

  const staticPages = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/en`, lastModified: new Date() },
    { url: `${baseUrl}/ko`, lastModified: new Date() },
    { url: `${baseUrl}/en/explore`, lastModified: new Date() },
    { url: `${baseUrl}/ko/explore`, lastModified: new Date() },
  ];

  const recipePages = (recipes ?? []).flatMap((r) => [
    { url: `${baseUrl}/en/recipe/${r.slug}`, lastModified: new Date(r.updated_at) },
    { url: `${baseUrl}/ko/recipe/${r.slug}`, lastModified: new Date(r.updated_at) },
  ]);

  return [...staticPages, ...recipePages];
}
