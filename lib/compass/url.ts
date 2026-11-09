// Delbar URL för Vinkompassen (BRIEF-KOMPASSEN.md, 4.4), t.ex.
// ?farg=vitt,orange&budget=250&aventyr=2&mat=fisk
// Ett svar "Spelar ingen roll" skrivs som "alla" så att frågan räknas som besvarad.

import type { FoodCategory } from "../blob";
import {
  FOOD, TAGS, emptyState,
  type Adventure, type AxisKey, type Budget, type Color, type CompassState, type QuestionKey,
} from "./engine";

const COLOR_SLUG: Record<Color, string> = { "Rött": "rott", "Vitt": "vitt", "Orange": "orange", "Rosé": "rose", "Bubbel": "bubbel" };
const SLUG_COLOR = Object.fromEntries(Object.entries(COLOR_SLUG).map(([k, v]) => [v, k])) as Record<string, Color>;
const ANY = "alla";
const AX_PARAM: Record<AxisKey, string> = { s: "syra", f: "fyllighet", st: "stravhet", fu: "funk" };
const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function stateToParams(S: CompassState, answered: Iterable<QuestionKey>): URLSearchParams {
  const a = new Set(answered);
  const p = new URLSearchParams();
  if (a.has("color")) p.set("farg", S.color.length ? S.color.map((c) => COLOR_SLUG[c]).join(",") : ANY);
  if (a.has("budget")) p.set("budget", S.budget ?? ANY);
  if (a.has("adv")) p.set("aventyr", S.adv ?? ANY);
  if (a.has("food")) p.set("mat", S.food.length ? S.food.map((f) => (f === "none" ? "ingen" : f)).join(",") : ANY);
  for (const k of Object.keys(AX_PARAM) as AxisKey[]) if (S.ax[k]) p.set(AX_PARAM[k], String(S.ax[k]));
  if (S.tags.length) p.set("smak", S.tags.map(slug).join(","));
  if (S.dfood.length) p.set("matval", S.dfood.join(","));
  if (S.country) p.set("land", S.country);
  if (S.grape) p.set("druva", S.grape);
  if (S.like) p.set("likt", S.like);
  if (S.shop) p.set("butik", S.shop === "sb" ? "systembolaget" : "webbutik");
  return p;
}

export function paramsToState(p: URLSearchParams): { state: CompassState; answered: QuestionKey[] } {
  const S = emptyState();
  const answered: QuestionKey[] = [];
  const list = (k: string) => (p.get(k) ?? "").split(",").map((x) => x.trim()).filter(Boolean);

  if (p.has("farg")) {
    S.color = list("farg").map((c) => SLUG_COLOR[slug(c)]).filter(Boolean);
    if (S.color.length || p.get("farg") === ANY) answered.push("color");
  }
  const b = p.get("budget");
  if (b && (["150", "250", "400", "9999"].includes(b) || b === ANY)) { S.budget = b === ANY ? null : (b as Budget); answered.push("budget"); }
  const a = p.get("aventyr");
  if (a && (["1", "2", "3"].includes(a) || a === ANY)) { S.adv = a === ANY ? null : (a as Adventure); answered.push("adv"); }
  if (p.has("mat")) {
    const foods = list("mat").map((f) => (f === "ingen" ? "none" : f)).filter((f) => f === "none" || f in FOOD) as (FoodCategory | "none")[];
    S.food = foods.includes("none") ? ["none"] : foods;
    if (S.food.length || p.get("mat") === ANY) answered.push("food");
  }
  for (const k of Object.keys(AX_PARAM) as AxisKey[]) {
    const v = Number(p.get(AX_PARAM[k]));
    if (v >= 1 && v <= 5) S.ax[k] = Math.round(v);
  }
  S.tags = list("smak").map((t) => TAGS.find((x) => slug(x) === slug(t))).filter((x): x is string => !!x);
  S.dfood = list("matval").filter((f) => f in FOOD) as FoodCategory[];
  S.country = p.get("land") ?? "";
  S.grape = p.get("druva") ?? "";
  S.like = p.get("likt") ?? "";
  const shop = p.get("butik");
  S.shop = shop === "systembolaget" ? "sb" : shop === "webbutik" ? "web" : "";
  return { state: S, answered };
}
