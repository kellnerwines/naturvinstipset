import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/go/", "/api/"] }],
    sitemap: "https://www.naturvinstipset.se/sitemap.xml",
  };
}
