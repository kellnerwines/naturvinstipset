// Vinkompassens poängmotor, porterad från design/vinkompassen-prototyp.html
// (BRIEF-KOMPASSEN.md, avsnitt 4.3). Ren logik utan DOM, delas av klienten och testerna.

import type { FoodCategory, Wine } from "../blob";

export type Color = "Rött" | "Vitt" | "Orange" | "Rosé" | "Bubbel";
export type Budget = "199" | "299" | "400" | "9999";
export type Adventure = "1" | "2" | "3";
export type ShopPref = "" | "sb" | "web";
export type AxisKey = "s" | "f" | "st" | "fu";

/** Kompakt vin för klienten (korta nycklar som i prototypen). */
export type CompassWine = {
  id: string;
  slug: string;
  n: string;          // namn
  p: string;          // producent
  c: string;          // land
  g: string;          // druva
  t: string;          // vintyp (Rött, Vitt, Orange, Rosé, Pét Nat, Mousserande)
  y: string;          // årgång
  pr: number;         // pris hos primärt säljställe
  s: number; f: number; st: number; fu: number;
  tags: string[];
  food: FoodCategory[];
  foodText: string;
  rt: number;         // admin-betyg, 4 om inget satts
  own: boolean;       // egen import
  auto: boolean;      // automatisk smakprofil
  img?: string;
  shop: string;
  url: string;
  alt?: { shop: string; url: string; pr: number };
};

export type CompassState = {
  color: Color[];
  budget: Budget | null;
  adv: Adventure | null;
  food: (FoodCategory | "none")[];
  ax: Record<AxisKey, number>;
  tags: string[];
  dfood: FoodCategory[];
  country: string;
  grape: string;
  like: string;
  shop: ShopPref;
};

export const emptyState = (): CompassState => ({
  color: [], budget: null, adv: null, food: [], ax: { s: 0, f: 0, st: 0, fu: 0 },
  tags: [], dfood: [], country: "", grape: "", like: "", shop: "",
});

export const FOOD: Record<FoodCategory, string> = {
  fisk: "Fisk och skaldjur", fagel: "Fågel", kott: "Rött kött och vilt", flask: "Fläsk och chark",
  vego: "Vegetariskt", kryddigt: "Kryddigt", ost: "Ost", aperitif: "Aperitif",
};

export const COLOR_VAR: Record<Color, string> = {
  "Rött": "--wine-rott", "Vitt": "--wine-vitt", "Orange": "--wine-orange",
  "Rosé": "--wine-rose", "Bubbel": "--wine-petnat",
};

export type QuestionKey = "color" | "budget" | "adv" | "food";
export type Question = {
  k: QuestionKey;
  h: string;
  s?: string;
  multi?: boolean;
  none?: string;
  o: [value: string, label: string, colorVar?: string][];
};

/** Hur vilt det får smaka: ställs inte i flödet utan finns under Finjustera (beslut 2026-11-11). */
export const ADV_QUESTION: Question = { k: "adv", h: "Hur vilt får det smaka?", s: "Naturvin kan smaka precis som vanligt vin eller vara riktigt funky.",
  o: [["1", "Som ett vanligt vin"], ["2", "Överraska mig lite"], ["3", "Ge mig något funky"]] };

/** Frågorna i chatten: tre stycken, sedan kommer förslagen. */
export const QUESTIONS: Question[] = [
  { k: "color", h: "Vilken färg är du sugen på?", s: "Välj en eller flera.", multi: true,
    o: (["Rött", "Vitt", "Orange", "Rosé", "Bubbel"] as Color[]).map((c) => [c, c, COLOR_VAR[c]]) },
  { k: "budget", h: "Hur mycket vill du lägga?", o: [["199", "Under 199 kr"], ["299", "Upp till 299 kr"], ["400", "Upp till 400 kr"]] },
  { k: "food", h: "Ska vinet passa till mat?", s: "Välj en eller flera.", multi: true, none: "none",
    o: [["none", "Nej, bara dricka"], ...(Object.entries(FOOD) as [FoodCategory, string][]).filter(([k]) => k !== "aperitif")] },
];

export const AXES: [AxisKey, string, string, string][] = [
  ["s", "Syra", "Mjuk", "Hög"], ["f", "Fyllighet", "Lätt", "Fyllig"],
  ["st", "Strävhet", "Len", "Sträv"], ["fu", "Funk", "Ren", "Funkig"],
];

export const TAGS = ["Fruktig", "Mineralisk", "Komplex", "Krispig", "Lättsam", "Jordig", "Frisk",
  "Blommig", "Tanninrik", "Aromatisk", "Kryddig", "Citrus", "Örtig"];

export type RelaxKey = "shop" | "grape" | "country" | "food" | "budget" | "color";
/** Ordningen filter släpps i vid för få träffar (4.3). */
export const RELAX: [RelaxKey, string][] = [
  ["grape", "druva"], ["country", "land"], ["shop", "butik"], ["food", "mat"], ["budget", "budget"], ["color", "färg"],
];

export const ADV_TARGET: Record<Adventure, number> = { "1": 1.5, "2": 2.5, "3": 3.5 };

// ─── Omvandling från lagrade viner ────────────────────────────────────────────

export const typeOf = (w: Pick<CompassWine, "t">): string =>
  w.t === "Pét Nat" || w.t === "Mousserande" ? "Bubbel" : w.t;

const clampAxis = (v: number | undefined) => Math.max(1, Math.min(5, Math.round(v ?? 3)));

/**
 * Gör om ett lagrat vin till kompassformat. Viner som inte är publicerade
 * eller saknar säljställe med vinet i lager visas inte i kompassen (6.3).
 */
export function toCompassWine(w: Wine): CompassWine | null {
  if (!w.published) return null;
  const offers = (w.offers ?? []).filter((o) => o.inStock && o.url);
  // Gamla viner med bara en Systembolaget-länk; ett kontrollerat erbjudande som är slut ersätts inte.
  if (!offers.length && w.systembolagetUrl && !(w.offers ?? []).some((o) => o.shop === "Systembolaget")) {
    offers.push({ shop: "Systembolaget", url: w.systembolagetUrl, price: Number(w.price) || 0, inStock: true, lastSyncedAt: "" });
  }
  if (!offers.length) return null;
  const primary = offers.find((o) => o.shop === w.shop) ?? offers[0];
  const other = offers.find((o) => o !== primary && o.shop !== primary.shop);

  return {
    id: w.id,
    slug: w.slug,
    n: w.name,
    p: w.producer,
    c: w.country,
    g: w.grape ?? "",
    t: w.wineType,
    y: w.year ?? "",
    pr: Math.round(primary.price),
    s: clampAxis(w.syra), f: clampAxis(w.fyllighet), st: clampAxis(w.stravhet), fu: clampAxis(w.funk),
    tags: w.flavorTags ?? [],
    food: w.foodCategories ?? [],
    foodText: w.foodPairing ?? "",
    rt: w.adminRating > 0 ? w.adminRating : 4,
    own: !!w.ownImport,
    auto: !!w.autoProfile,
    img: w.primaryImageUrl || undefined,
    shop: primary.shop,
    url: primary.url,
    ...(other ? { alt: { shop: other.shop, url: other.url, pr: Math.round(other.price) } } : {}),
  };
}

// ─── Poäng ────────────────────────────────────────────────────────────────────

export type Scored = { w: CompassWine; sc: number; hits: string[]; fh: FoodCategory[] };

const dist = (a: number, b: number) => Math.abs(a - b);

export const foodsSel = (S: CompassState): FoodCategory[] =>
  [...(S.food.filter((x) => x !== "none") as FoodCategory[]), ...S.dfood];

/** Mjuk poäng enligt tabellen i 4.3. `own` (egen import) används inte. */
export function score(w: CompassWine, S: CompassState, W: CompassWine[]): Scored {
  let sc = 100;
  const hits: string[] = [];
  const adv = S.adv;
  if (adv) {
    sc -= dist(w.fu, ADV_TARGET[adv]) * 12;
    if (adv === "1" && w.fu <= 2) hits.push("Lätt att tycka om");
    if (adv === "3" && w.fu >= 3) hits.push("Funk");
  }
  for (const [k, n] of [["s", "Syra"], ["f", "Fyllighet"], ["st", "Strävhet"], ["fu", "Funk"]] as [AxisKey, string][]) {
    const t = S.ax[k];
    if (t) { sc -= dist(w[k], t) * 10; if (w[k] === t) hits.push(`${n} ${t}/5`); }
  }
  const tg = S.tags.filter((t) => w.tags.some((x) => x.startsWith(t.slice(0, 5))));
  sc += tg.length * 6 - (S.tags.length - tg.length) * 6;
  hits.push(...tg);
  const fh = foodsSel(S).filter((x) => w.food.includes(x));
  sc += fh.length * 5;
  if (S.like) {
    const L = W.find((x) => x.id === S.like);
    if (L && L.id !== w.id) {
      const d = dist(w.s, L.s) + dist(w.f, L.f) + dist(w.st, L.st) + dist(w.fu, L.fu);
      sc -= d * 7;
      sc += w.tags.filter((t) => L.tags.includes(t)).length * 4;
      if (d <= 2) hits.push("Likt " + L.n);
    }
  }
  if (S.food.includes("none") && w.food.includes("aperitif")) { sc += 4; hits.push("Gott på egen hand"); }
  sc += (w.rt - 4) * 3;
  return { w, sc: Math.max(1, Math.min(99, Math.round(sc))), hits, fh };
}

// ─── Filter och urval ─────────────────────────────────────────────────────────

const isActive = (S: CompassState, k: RelaxKey): boolean => {
  switch (k) {
    case "shop": return !!S.shop;
    case "color": return S.color.length > 0;
    case "budget": return !!S.budget && S.budget !== "9999";
    case "food": return foodsSel(S).length > 0;
    case "country": return !!S.country;
    case "grape": return !!S.grape;
  }
};

function filters(S: CompassState, relax: Set<RelaxKey>): ((w: CompassWine) => boolean)[] {
  const F: ((w: CompassWine) => boolean)[] = [];
  const on = (k: RelaxKey) => isActive(S, k) && !relax.has(k);
  if (on("color")) F.push((w) => (S.color as string[]).includes(typeOf(w)));
  if (on("budget")) F.push((w) => w.pr <= Number(S.budget));
  if (on("food")) { const fs = foodsSel(S); F.push((w) => fs.some((x) => w.food.includes(x))); }
  if (on("country")) F.push((w) => w.c === S.country);
  if (on("shop")) F.push((w) => S.shop === "sb"
    ? w.shop === "Systembolaget" || w.alt?.shop === "Systembolaget"
    : w.shop !== "Systembolaget" || (!!w.alt && w.alt.shop !== "Systembolaget"));
  if (on("grape")) { const g = S.grape.toLowerCase(); F.push((w) => w.g.toLowerCase().includes(g)); }
  return F;
}

export function matching(S: CompassState, W: CompassWine[], relax: Set<RelaxKey> = new Set()): CompassWine[] {
  const F = filters(S, relax);
  return W.filter((w) => F.every((f) => f(w)));
}

const BUDGET_STEPS: Budget[] = ["199", "299", "400"];
const nextBudget = (b: Budget | null): Budget | null =>
  b ? BUDGET_STEPS[BUDGET_STEPS.indexOf(b) + 1] ?? null : null;

/**
 * Hårda filter, och om färre än 3 viner matchar släpps ett filter i taget i
 * RELAX-ordning – bara om det ger fler träffar. Färg släpps bara vid 0 träffar.
 * Budgeten höjs ett steg i taget (199 → 299 → 400) innan den släpps helt, och
 * viner som uppfyller alla val visas alltid före de som kom med när ett filter släpptes.
 */
export function pick(S: CompassState, W: CompassWine[]): { list: Scored[]; relax: RelaxKey[]; budget?: Budget } {
  const relax = new Set<RelaxKey>();
  let cur = S;
  let list = matching(cur, W, relax);
  while (list.length < 3) {
    const useful = RELAX.find(([k]) => {
      if (relax.has(k) || !isActive(cur, k)) return false;
      const t = new Set(relax); t.add(k);
      return matching(cur, W, t).length > list.length && (k !== "color" || list.length === 0);
    });
    if (!useful) break;
    if (useful[0] === "budget") {
      let up = nextBudget(cur.budget);
      while (up && matching({ ...cur, budget: up }, W, relax).length <= list.length) up = nextBudget(up);
      if (up) { cur = { ...cur, budget: up }; list = matching(cur, W, relax); continue; }
    }
    relax.add(useful[0]);
    list = matching(cur, W, relax);
  }
  const strict = new Set(matching(S, W).map((w) => w.id));
  return {
    list: list.map((w) => score(w, S, W)).sort((a, b) => Number(strict.has(b.w.id)) - Number(strict.has(a.w.id)) || b.sc - a.sc),
    relax: RELAX.map(([k]) => k).filter((k) => relax.has(k)),
    ...(cur.budget !== S.budget && !relax.has("budget") ? { budget: cur.budget! } : {}),
  };
}

export const relaxLabel = (keys: RelaxKey[]) =>
  keys.map((k) => RELAX.find((r) => r[0] === k)![1]).join(" och ");

/** "För få viner matchade alla dina val, så jag bortsåg från mat och tog med viner upp till 299 kr." */
export function relaxMessage(keys: RelaxKey[], budget?: Budget): string {
  const parts: string[] = [];
  if (keys.length) parts.push(`bortsåg från ${relaxLabel(keys)}`);
  if (budget) parts.push(`tog med viner upp till ${budget} kr`);
  return parts.length ? `För få viner matchade alla dina val, så jag ${parts.join(" och ")}.` : "";
}

// ─── Etiketter ────────────────────────────────────────────────────────────────

export function label(k: QuestionKey, v: string): string {
  const o = [...QUESTIONS, ADV_QUESTION].find((q) => q.k === k)?.o.find((x) => x[0] === v);
  if (o) return o[1];
  if (k === "budget" && v === "9999") return "Spelar ingen roll";
  return v;
}

export function answerText(q: Question, S: CompassState): string {
  const v = S[q.k] as string | string[] | null;
  if (Array.isArray(v)) return v.length ? v.map((x) => label(q.k, x)).join(", ") : "Spelar ingen roll";
  return v ? label(q.k, v) : "Spelar ingen roll";
}
