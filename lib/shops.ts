// Säljställena som egna sidor (/butiker): namn, adress till butiken och vilka viner som finns där.

import type { Wine } from "@/lib/blob";
import { buyLinks, SB } from "@/lib/buyLinks";
import { entitySlug } from "@/lib/entities";

export type ShopInfo = { name: string; slug: string; url: string; host: string; web: boolean };

/** Kända säljställen. Webbutikerna säljer till svenska konsumenter med svensk alkoholskatt i priset. */
export const SHOPS: ShopInfo[] = [
  { name: "Vin & Natur", url: "https://vinnatur.shop", host: "vinnatur.shop", web: true },
  { name: "Philipson Wine", url: "https://philipsonwine.se", host: "philipsonwine.se", web: true },
  { name: "Flaskvis", url: "https://www.flaskvis.se", host: "flaskvis.se", web: true },
  { name: "Wine Trade", url: "https://winetrade.se", host: "winetrade.se", web: true },
  { name: SB, url: "https://www.systembolaget.se", host: "systembolaget.se", web: false },
].map((s) => ({ ...s, slug: entitySlug(s.name) }));

export const shopSlug = (name: string) => entitySlug(name);
export const getShop = (slug: string) => SHOPS.find((s) => s.slug === slug);

/** Butikerna där vinet finns i lager just nu, Systembolaget först. */
export const shopsOf = (w: Wine): string[] => [...new Set(buyLinks(w).map((l) => l.shop))];

/** Antal publicerade viner i lager per butik. */
export function shopCounts(wines: Wine[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const w of wines) for (const s of shopsOf(w)) m.set(s, (m.get(s) ?? 0) + 1);
  return m;
}
