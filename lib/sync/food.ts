// Matkategorier för viner som saknar dem (beslut 2026-11-10): härleds ur
// vintyp, druva, land och smakprofil. Regelbaserat utan AI; i fas 2 kan
// Claude-berikningen ersätta dem. Fält i lockedFields rörs inte.

import type { FoodCategory, Wine } from "../blob";

const has = (grape: string | undefined, names: string[]) => {
  const g = (grape ?? "").toLowerCase();
  return names.some((n) => g.includes(n.toLowerCase()));
};

const LIGHT_RED = ["Gamay", "Pinot Noir", "Pinot Nero", "Spätburgunder", "Cinsault", "Poulsard", "Trousseau", "Frappato",
  "Grolleau", "Pineau d'Aunis", "Zweigelt", "Schiava", "St. Laurent", "Dolcetto", "Mencía", "Mencia", "Baga", "Ramisco", "Areni"];
const BIG_RED = ["Syrah", "Cabernet Sauvignon", "Malbec", "Tannat", "Nebbiolo", "Aglianico", "Mourvèdre", "Monastrell",
  "Touriga Nacional", "Tempranillo", "Tinta Roriz", "Sagrantino", "Saperavi", "Xinomavro", "Montepulciano", "Primitivo", "Zinfandel"];
const AROMATIC = ["Gewürztraminer", "Traminer", "Muscat", "Muskat", "Muskateller", "Scheurebe", "Torrontés", "Malvasia", "Malvazija", "Kharji"];
const CRISP_WHITE = ["Sauvignon", "Riesling", "Melon", "Muscadet", "Albariño", "Alvarinho", "Arinto", "Chenin", "Grüner", "Aligoté",
  "Assyrtiko", "Picpoul", "Vermentino", "Loureiro", "Godello", "Jacquère", "Romorantin"];
const RICH_WHITE = ["Chardonnay", "Viognier", "Marsanne", "Roussanne", "Sémillon", "Semillon", "Savagnin", "Encruzado", "Grenache Blanc", "Garnacha Blanca"];

/** Länder där chark och fläsk hör till vardagsmaten vid sidan av vinet. */
const CHARK = new Set(["Italien", "Spanien", "Portugal", "Österrike", "Tyskland", "Slovenien", "Ungern", "Tjeckien", "Georgien", "Armenien"]);
/** Kustländer där fisk och skaldjur ligger nära till hands för vita och rosé. */
const COAST = new Set(["Portugal", "Spanien", "Grekland", "Kroatien", "Italien"]);

/** 2–3 matkategorier ur vintyp, druva, land och smakprofil. */
export function deriveFoodCategories(w: Pick<Wine, "wineType" | "grape" | "country" | "region" | "fyllighet" | "stravhet" | "syra" | "funk">): FoodCategory[] {
  const out = new Set<FoodCategory>();
  const body = w.fyllighet ?? 3;
  const add = (...c: FoodCategory[]) => c.forEach((x) => out.add(x));

  switch (w.wineType) {
    case "Rött":
      if (has(w.grape, BIG_RED) || body >= 4 || (w.stravhet ?? 0) >= 4) add("kott", "flask");
      else if (has(w.grape, LIGHT_RED) || body <= 2) add("fagel", "vego");
      else add("kott", "vego");
      if (CHARK.has(w.country)) add("flask");
      break;
    case "Vitt":
      if (has(w.grape, AROMATIC)) add("kryddigt", "vego");
      else if (has(w.grape, RICH_WHITE) || body >= 4) add("fagel", "fisk");
      else add("fisk", "vego");
      if (has(w.grape, CRISP_WHITE) && (w.syra ?? 3) >= 3) add("fisk");
      if (/alsace|elsass/i.test(w.region ?? "")) add("flask");
      break;
    case "Orange":
      add("vego", "kryddigt");
      if (body >= 4 || (w.stravhet ?? 0) >= 3) add("fagel");
      break;
    case "Rosé":
      add("fisk", "vego");
      if (!COAST.has(w.country)) add("kryddigt");
      break;
    case "Pét Nat":
      add("aperitif", "vego");
      if ((w.funk ?? 0) >= 3) add("ost");
      break;
    default: // Mousserande
      add("aperitif", "fisk");
      if (/champagne/i.test(w.region ?? "")) add("ost");
  }
  if (COAST.has(w.country) && (w.wineType === "Vitt" || w.wineType === "Rosé")) add("fisk");
  return [...out].slice(0, 3);
}

/** Fyller i matkategorier på viner som saknar dem. Returnerar slugs för ändrade viner. */
export function fillFoodCategories(wines: Wine[]): string[] {
  const filled: string[] = [];
  for (const w of wines) {
    if (w.foodCategories?.length || w.lockedFields?.includes("foodCategories")) continue;
    w.foodCategories = deriveFoodCategories(w);
    filled.push(w.slug);
  }
  return filled;
}
