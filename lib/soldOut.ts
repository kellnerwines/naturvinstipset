// Viner som är slut i alla butiker döljs i kompassen och listorna (lib/sync/apply.ts), men vinsidan
// ligger kvar så att adressen behåller sin plats i Google. Sidan visar "Slut just nu" och liknande
// viner som går att köpa, och vinet visas igen överallt när det finns i lager.

import type { Wine } from "./blob";
import { STOCK_HIDDEN } from "./sync/apply";
import { grapesOf } from "./entities";

/** Slut i alla butiker just nu, men sidan ska finnas kvar. */
export const isSoldOut = (w: Wine) => !w.published && w.syncHidden === STOCK_HIDDEN;

/** Vinsidan visas för publicerade viner och för viner som bara är slut för stunden. */
export const hasWinePage = (w: Wine) => w.published || isSoldOut(w);

/** Upp till `n` publicerade viner som liknar ett slutsålt vin: samma typ och druva först, sedan samma typ och land. */
export function similarWines(wine: Wine, wines: Wine[], n = 4): Wine[] {
  const grapes = new Set(grapesOf(wine).map((g) => g.toLowerCase()));
  const pool = wines.filter((w) => w.published && w.id !== wine.id && w.wineType === wine.wineType);
  const byGrape = pool.filter((w) => grapesOf(w).some((g) => grapes.has(g.toLowerCase())));
  const byCountry = pool.filter((w) => w.country === wine.country && !byGrape.includes(w));
  return [...byGrape, ...byCountry].slice(0, n);
}
