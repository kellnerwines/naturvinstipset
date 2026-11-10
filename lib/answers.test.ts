import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import type { Wine } from "./blob";
import { buildCatalog, type FoodEntry } from "./wineData";
import { ANSWER_PAGES, answer, compassLink } from "./answers";

const load = <T,>(f: string): T => JSON.parse(readFileSync(path.join(__dirname, "..", "data", f), "utf-8"));
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

describe("kompassens svar för sökmotorer och AI-agenter", () => {
  it("varje svarssida ger minst tre förslag", () => {
    for (const p of ANSWER_PAGES) expect(answer(wines, p.params).results.length, p.slug).toBeGreaterThanOrEqual(3);
  });

  it("svaret följer kompassens filter och har köp- och vinlänkar", () => {
    const a = answer(wines, { farg: "rott", budget: "299" }, 5);
    expect(a.results).toHaveLength(5);
    for (const r of a.results) {
      expect(r.type).toBe("Rött");
      expect(r.price).toBeLessThanOrEqual(299);
      expect(r.url).toMatch(/^https:\/\/www\.naturvinstipset\.se\/viner\//);
      expect(r.buyUrl).toMatch(/^https:\/\/www\.naturvinstipset\.se\/go\//);
    }
    expect(a.results.map((r) => r.rank)).toEqual([1, 2, 3, 4, 5]);
  });

  it("länken till kompassen har samma parametrar", () => {
    expect(compassLink({ farg: "vitt,orange", mat: "fisk" })).toBe("/?farg=vitt%2Corange&mat=fisk");
  });
});
