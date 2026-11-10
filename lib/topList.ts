// Topp 100 (beslut 2026-11-10): först naturvinerna på Systembolaget efter betyg,
// sedan fylls listan upp till 100 med naturviner från webbutiken Flaskvis i
// importörsordning. Ordningen redovisas på Topp 100 och på Om oss.

import { combinedRating, type Rating, type Wine } from "./blob";

export const TOP_SIZE = 100;
export const FILL_SHOP = "Flaskvis";
/** Importörerna som fyller listan, i den här ordningen. */
export const FILL_IMPORTERS = ["Kellner & Kellner", "Backyard Wines", "Wine Rebels", "Nordic 4 Wines"];

const norm = (s: string | undefined) => (s ?? "").toLowerCase().replace(/[^a-z0-9&]/g, "");
const importerRank = (w: Wine) => FILL_IMPORTERS.findIndex((i) => norm(i) === norm(w.importer));

export const atSystembolaget = (w: Wine) =>
  !!w.systembolagetUrl || (w.offers ?? []).some((o) => o.shop === "Systembolaget");
const inStockAt = (w: Wine, shop: string) => (w.offers ?? []).some((o) => o.shop === shop && o.inStock);

export type TopEntry = { wine: Wine; rating: number; count: number; likeCount: number; filler: boolean };

export function topHundred(wines: Wine[], ratings: Rating[]): TopEntry[] {
  const entry = (w: Wine, filler: boolean): TopEntry => {
    const own = ratings.filter((r) => r.wineId === w.id);
    return { wine: w, rating: combinedRating(w, ratings), count: own.length, likeCount: own.filter((r) => r.liked).length, filler };
  };
  const published = wines.filter((w) => w.published);
  const sb = published.filter(atSystembolaget).map((w) => entry(w, false)).sort((a, b) => b.rating - a.rating).slice(0, TOP_SIZE);
  const taken = new Set(sb.map((e) => e.wine.id));
  const fill = published
    .filter((w) => !taken.has(w.id) && inStockAt(w, FILL_SHOP) && importerRank(w) > -1)
    .map((w) => entry(w, true))
    .sort((a, b) => importerRank(a.wine) - importerRank(b.wine) || b.rating - a.rating || a.wine.name.localeCompare(b.wine.name, "sv"))
    .slice(0, TOP_SIZE - sb.length);
  return [...sb, ...fill];
}
