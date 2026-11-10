import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { isPostLive, type BlogPost, type Wine } from "./blob";
import { buildCatalog, type FoodEntry } from "./wineData";
import { answer } from "./answers";

const load = <T,>(f: string): T => JSON.parse(readFileSync(path.join(__dirname, "..", "data", f), "utf-8"));
const posts = load<BlogPost[]>("blogs.json");
const { wines } = buildCatalog({
  existing: [],
  systembolaget: load<Wine[]>("wines.json"),
  food: load<Record<string, FoodEntry>>("food-systembolaget.json"),
  imports: [
    { wines: load<Wine[]>("wines-vinnatur.json"), source: { source: "vinnatur.shop", autoProfile: true } },
    { wines: load<Wine[]>("wines-flaskvis.json"), source: { source: "flaskvis.se", autoProfile: false } },
  ],
  now: "2026-11-09T00:00:00.000Z",
});

describe("schemalagda blogginlägg", () => {
  it("syns först på publiceringsdagen, svensk tid", () => {
    const p = { published: true, publishedAt: "2026-11-19" };
    expect(isPostLive(p, new Date("2026-11-18T22:30:00Z"))).toBe(false); // 23.30 svensk tid den 18:e
    expect(isPostLive(p, new Date("2026-11-18T23:30:00Z"))).toBe(true);  // 00.30 den 19:e
    expect(isPostLive({ ...p, published: false }, new Date("2027-01-01"))).toBe(false);
  });

  it("varje säsongsinlägg har en vinlista med minst tre viner och länkar till vinsidor som finns", () => {
    const slugs = new Set(wines.map((w) => w.slug));
    const seasonal = posts.filter((p) => p.wineQuery);
    expect(seasonal.length).toBeGreaterThanOrEqual(12);
    for (const p of seasonal) {
      expect(answer(wines, p.wineQuery!).results.length, p.slug).toBeGreaterThanOrEqual(3);
      for (const m of p.content.matchAll(/naturvinstipset\.se\/viner\/([a-z0-9-]+)/g)) expect(slugs.has(m[1]), `${p.slug}: ${m[1]}`).toBe(true);
    }
    expect(new Set(seasonal.map((p) => p.slug)).size).toBe(seasonal.length);
  });
});
