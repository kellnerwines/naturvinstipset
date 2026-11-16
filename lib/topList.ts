// Veckans topplista (beslut 2026-11-16, ersätter Topp 100): först naturvinerna på
// Systembolaget efter betyg, sedan fylls listan upp till 100 med naturviner från webbutiken
// Flaskvis i importörsordning. Bara viner med flaskbild tas med. Betygen räknas fram till
// måndagen den här veckan, så listan står still hela veckan och byts varje måndag.
// Ordningen redovisas på topplistan och på Om oss.

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

const stockholmDate = (d: Date) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });

/** Veckan enligt svensk tid: måndagens datum (ÅÅÅÅ-MM-DD) och ISO-veckonumret. */
export function weekOf(now = new Date()): { start: string; week: number } {
  const [y, m, d] = stockholmDate(now).split("-").map(Number);
  const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; // 0 = måndag
  const monday = new Date(Date.UTC(y, m - 1, d - dow));
  const thursday = new Date(Date.UTC(y, m - 1, d - dow + 3));
  const dayOfYear = (thursday.getTime() - Date.UTC(thursday.getUTCFullYear(), 0, 1)) / 86_400_000;
  return { start: monday.toISOString().slice(0, 10), week: Math.floor(dayOfYear / 7) + 1 };
}

export type TopEntry = { wine: Wine; rating: number; count: number; likeCount: number; filler: boolean };

export function topList(wines: Wine[], ratings: Rating[], now = new Date()): TopEntry[] {
  const { start } = weekOf(now);
  const counted = ratings.filter((r) => stockholmDate(new Date(r.createdAt)) < start);
  const entry = (w: Wine, filler: boolean): TopEntry => {
    const own = counted.filter((r) => r.wineId === w.id);
    return { wine: w, rating: combinedRating(w, counted), count: own.length, likeCount: own.filter((r) => r.liked).length, filler };
  };
  const shown = wines.filter((w) => w.published && !!w.primaryImageUrl);
  const sb = shown.filter(atSystembolaget).map((w) => entry(w, false)).sort((a, b) => b.rating - a.rating).slice(0, TOP_SIZE);
  const taken = new Set(sb.map((e) => e.wine.id));
  const fill = shown
    .filter((w) => !taken.has(w.id) && inStockAt(w, FILL_SHOP) && importerRank(w) > -1)
    .map((w) => entry(w, true))
    .sort((a, b) => importerRank(a.wine) - importerRank(b.wine) || b.rating - a.rating || a.wine.name.localeCompare(b.wine.name, "sv"))
    .slice(0, TOP_SIZE - sb.length);
  const list = [...sb, ...fill];
  // Månadens vin står alltid först.
  const motm = list.findIndex((e) => e.wine.wineOfMonth);
  return motm > 0 ? [list[motm], ...list.slice(0, motm), ...list.slice(motm + 1)] : list;
}
