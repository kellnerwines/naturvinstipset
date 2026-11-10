import type { MetadataRoute } from "next";

// AI-agenter och AI-sökmotorer får uttryckligen läsa sajten, svarssidorna,
// /llms.txt och kompassens JSON-svar (/api/kompass). Övriga API:er och /go/ är stängda.
const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot"];
const disallow = ["/admin", "/go/", "/api/"];
const allow = ["/", "/api/kompass"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow, disallow },
      { userAgent: AI_BOTS, allow, disallow },
    ],
    sitemap: "https://www.naturvinstipset.se/sitemap.xml",
  };
}
