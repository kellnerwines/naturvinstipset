import type { MetadataRoute } from "next";
import { getWines, getBlogs } from "@/lib/blob";
import { bars } from "@/lib/bars";

const BASE = "https://www.naturvinstipset.se";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [wines, blogs] = await Promise.all([getWines(), getBlogs()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily",   priority: 1 },
    { url: `${BASE}/topp-100`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/vad-ar-naturvin`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/blogg`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/om-listan`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/basta-naturvin-under-200-kr`,    lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/basta-naturvin-for-nyborjare`,   lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/basta-naturvin-till-mat`,        lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/rott`,     lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/vitt`,     lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/orange`,   lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/pet-nat`,  lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/smakprofil/mineralisk`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/smakprofil/fruktig`,    lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/smakprofil/jordig`,     lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/smakprofil/latt`,       lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/smakprofil/funk`,       lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/vinprovning`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/om-oss`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const barCityRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/basta-naturvinsbarer-stockholm`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  ];

  const barRoutes: MetadataRoute.Sitemap = bars.map((b) => ({
    url: `${BASE}/naturvinsbarer/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Alla publicerade viner, både från Systembolaget och från webbutikerna (BRIEF-KOMPASSEN.md, 9).
  // lastModified är senaste synken av vinets erbjudanden, annars när vinet skapades.
  const wineRoutes = wines
    .filter((w) => w.published)
    .map((w) => {
      const synced = (w.offers ?? []).map((o) => Date.parse(o.lastSyncedAt)).filter(Number.isFinite);
      const created = Date.parse(w.createdAt);
      const last = synced.length ? Math.max(...synced) : Number.isFinite(created) ? created : Date.now();
      return { url: `${BASE}/viner/${w.slug}`, lastModified: new Date(last), changeFrequency: "weekly" as const, priority: 0.8 };
    });

  const blogRoutes = blogs
    .filter((b) => b.published)
    .map((b) => ({ url: `${BASE}/blogg/${b.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 }));

  return [...staticRoutes, ...barCityRoutes, ...barRoutes, ...wineRoutes, ...blogRoutes];
}
