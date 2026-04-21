import type { MetadataRoute } from "next";
import { getWines, getBlogs } from "@/lib/blob";

const BASE = "https://naturvinstipset.se";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [wines, blogs] = await Promise.all([getWines(), getBlogs()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily",   priority: 1 },
    { url: `${BASE}/vad-ar-naturvin`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/blogg`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/vinprovning`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/om-oss`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const wineRoutes = wines
    .filter((w) => w.published)
    .map((w) => ({ url: `${BASE}/viner/${w.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 }));

  const blogRoutes = blogs
    .filter((b) => b.published)
    .map((b) => ({ url: `${BASE}/blogg/${b.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 }));

  return [...staticRoutes, ...wineRoutes, ...blogRoutes];
}
