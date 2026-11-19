// Ordningen på listsidorna (rött, vitt, orange, pét nat och guiderna). Viner som inte har fått
// något betyg än visar inget betyg, i stället för 0,0, och hamnar efter de betygsatta. Bland dem
// kommer viner på Systembolaget först, sedan viner med hemleverans.

import { combinedRating, type Rating, type Wine } from "./blob";

const atSb = (w: Wine) => !!w.systembolagetUrl || (w.offers ?? []).some((o) => o.shop === "Systembolaget" && o.inStock);

/** Har vinet ett betyg, från redaktionen eller från besökare? */
export const isRated = (w: Wine, ratings: Rating[]) => w.adminRating > 0 || ratings.some((r) => r.wineId === w.id);

export function guideOrder(wines: Wine[], ratings: Rating[]): Wine[] {
  const rated = new Map(wines.map((w) => [w.id, isRated(w, ratings)]));
  const score = new Map(wines.map((w) => [w.id, combinedRating(w, ratings)]));
  return [...wines].sort((a, b) =>
    Number(rated.get(b.id)) - Number(rated.get(a.id))
    || score.get(b.id)! - score.get(a.id)!
    || Number(atSb(b)) - Number(atSb(a))
    || a.name.localeCompare(b.name, "sv"));
}
