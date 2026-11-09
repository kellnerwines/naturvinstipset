// Fritext i Vinkompassen: tolka och spegla (BRIEF-KOMPASSEN.md, 4.2).
// Porterad från parse()/reflect() i design/vinkompassen-prototyp.html.
// Fas 1 är ren ordmatchning. Tolkaren ligger bakom gränssnittet Interpreter så
// att den kan bytas mot Claude Haiku i fas 2, med den här som reserv.

import type { FoodCategory } from "../blob";
import {
  FOOD, QUESTIONS, label,
  type Adventure, type AxisKey, type Budget, type Color, type CompassState, type CompassWine,
  type QuestionKey, type ShopPref,
} from "./engine";

export type Parsed = {
  color?: Color[];
  budget?: Budget;
  adv?: Adventure;
  food?: (FoodCategory | "none")[];
  tags: string[];
  ax: Partial<Record<AxisKey, number>>;
  /** Etiketter för "Jag plockade upp". */
  pick: string[];
  skin?: boolean;
  mood?: "sun" | "cozy" | "party";
  alone?: boolean;
  shop?: Exclude<ShopPref, "">;
  country?: string;
  grape?: string;
  like?: string;
};

export interface Interpreter {
  parse(text: string, wines: CompassWine[]): Parsed | Promise<Parsed>;
}

const CRX: Record<string, RegExp> = {
  Portugal: /portug/, Frankrike: /frankrike|fransk/, Italien: /itali/, Spanien: /spanien|spansk/,
  "Österrike": /österrik/, Ungern: /ungern|ungersk/, Armenien: /armeni/, Tjeckien: /tjeck/,
  Slovakien: /slovak/, Slovenien: /sloven/, USA: /\busa\b|amerikansk|kalifornien/,
  "Nederländerna": /nederländ|holländ/, Australien: /australi/, Tyskland: /tyskland|tysk/,
  Grekland: /grekland|grekisk/, Sverige: /sverige|svensk/, Georgien: /georgien|georgisk/,
};

const grapeCache = new WeakMap<CompassWine[], string[]>();
function grapesOf(W: CompassWine[]): string[] {
  let g = grapeCache.get(W);
  if (!g) {
    g = [...new Set(W.flatMap((w) => w.g.split(/,|\d+%/).map((s) => s.trim()).filter((s) => s.length > 3)))];
    grapeCache.set(W, g);
  }
  return g;
}

export function parse(raw: string, W: CompassWine[]): Parsed {
  const t = " " + raw.toLowerCase().replace(/[.,!?;:]/g, " ") + " ";
  const o: Parsed = { tags: [], ax: {}, pick: [] };
  const addColor = (v: Color) => { o.color = [...new Set([...(o.color ?? []), v])]; };
  const addFood = (v: FoodCategory) => { o.food = [...new Set([...(o.food ?? []), v])]; };
  const tag = (v: string, lbl?: string) => { if (!o.tags.includes(v)) { o.tags.push(v); o.pick.push(lbl ?? v); } };

  /* färg */
  if (/\s(rött|röd|röda|rödvin)/.test(t)) addColor("Rött");
  if (/\s(vitt|vit|vita|vitvin)\s/.test(t)) addColor("Vitt");
  if (/orange|amber/.test(t)) addColor("Orange");
  if (/ros[ée]/.test(t)) addColor("Rosé");
  if (/bubb|pét|pet ?nat|mousser|skumpa|champagne|cava|crémant/.test(t)) addColor("Bubbel");
  if (/macer|skalkontakt|på skalen|skin contact/.test(t)) { addColor("Orange"); o.skin = true; }

  /* budget */
  const m = t.match(/(\d{2,4})\s*(kr|kronor|:-|spänn)?/);
  if (m) { const v = +m[1]; if (v >= 80 && v <= 5000) o.budget = v <= 150 ? "150" : v <= 250 ? "250" : v <= 400 ? "400" : "9999"; }
  if (!o.budget && /billig|budget|inte för dyr|plånbok/.test(t)) o.budget = "150";
  if (!o.budget && /prisvärt|vardagsvin|tisdag/.test(t)) o.budget = "250";
  if (!o.budget && /lyx|unna mig|spara inte|kalasvin|något fint/.test(t)) o.budget = "9999";

  /* äventyr */
  if (/inte (för )?(funk|konstig|galen|vild)|klassisk|vanligt vin|nybörjar|säkert kort|rent och/.test(t)) o.adv = "1";
  else if (/funk|vild|galen|utmanande|stall|kombucha|cider|grumlig|ofiltrerad/.test(t)) o.adv = "3";
  else if (/annorlunda|nyfiken|spännande|något nytt|överraska/.test(t)) o.adv = "2";

  /* mat */
  const foodCtx = /(till|med|mat|middag|äta|käk|rätt)/.test(t);
  const F: Record<Exclude<FoodCategory, "kryddigt" | "aperitif">, RegExp> = {
    fisk: /fisk|skaldjur|räk|ostron|lax|torsk|mussl|sushi|hummer|krabba|kräft|bläckfisk/,
    fagel: /kyckling|fågel|anka|kalkon|höns/,
    kott: /kött|lamm|biff|entrecôte|vilt|älg|hjort|högrev|burgare|hamburgare|oxfilé/,
    flask: /fläsk|chark|korv|skinka|salami|pancetta|bacon|pulled pork/,
    vego: /vegetar|vego|grönsak|svamp|risotto|linser|bönor/,
    ost: /\sost(ar|bricka)?\s/,
  };
  for (const [k, r] of Object.entries(F)) if (r.test(t)) addFood(k as FoodCategory);
  if (/grill/.test(t) && !(o.food ?? []).length) addFood("kott");
  if (/thai|indisk|curry|chili|tacos|sichuan|koreansk|stark mat|kryddig mat|kryddstark/.test(t)
    || (/(till|med)\s[^\s]*\s?krydd/.test(t) && foodCtx && /mat|rätt/.test(t))) addFood("kryddigt");

  /* tillfälle */
  if (/solnedgång|balkong|terrass|altan|sommar|\ssol\s|soligt|picknick|strand|brygga|trädgård|\spark\s|varm (dag|kväll)|uteserver/.test(t)) {
    o.mood = "sun"; tag("Friskt", "Friskt och svalt"); tag("Lättsam", "Lättdrucket"); if (!o.ax.f) o.ax.f = 2;
  }
  if (/vinter|brasa|höst|mys|kall kväll|stuga|fjäll|regn|ljus och filt/.test(t)) {
    o.mood = "cozy"; tag("Komplex", "Lite djup"); tag("Jordig"); if (!o.ax.f) o.ax.f = 4;
  }
  if (/fest|mingel|kalas|nyår|fira|after ?work|förfest/.test(t)) { o.mood = o.mood ?? "party"; tag("Fruktig", "Lätt att tycka om"); }
  if ((o.mood === "sun" || o.mood === "party") && !(o.food ?? []).length) { o.food = ["none"]; o.alone = true; }
  if (/bara dricka|utan mat|på egen hand|sippa/.test(t) && !(o.food ?? []).length) { o.food = ["none"]; o.alone = true; }

  /* smak */
  if (/krydd|peppr|kanel/.test(t) && !(o.food ?? []).includes("kryddigt")) tag("Kryddig", "Kryddig ton");
  if (/frisk|fräsch|syrlig|syra|pigg/.test(t)) { tag("Friskt", "Friskt"); o.ax.s = 4; }
  if (/krispig|knaprig/.test(t)) tag("Krispig");
  if (/mineral|salt|flinta|\ssten/.test(t)) tag("Mineralisk");
  if (/frukt|bärig|saftig|juicig/.test(t)) tag("Fruktig");
  if (/blomm|parfym|fläder/.test(t)) tag("Blommig");
  if (/jordig|skogig|svampig/.test(t)) tag("Jordig");
  if (/komplex|djup|lager på lager/.test(t)) tag("Komplex");
  if (/lättdruck|glou|lättsam|törstsläck|\slätt\s/.test(t)) { tag("Lättsam", "Lättdrucket"); o.ax.f = o.ax.f || 2; }
  if (/fyllig|kraftig|tung|mustig|stor/.test(t)) o.ax.f = 4;
  if (/sträv|tannin/.test(t)) { tag("Tanninrik", "Strävt"); o.ax.st = 4; }
  if (/mjuk|len|rund|silkig/.test(t)) o.ax.st = 2;
  if (/aromat|doftig/.test(t)) tag("Aromatisk");
  if (/citrus|citron|lime|grapefrukt/.test(t)) tag("Citrus");
  if (/örtig|örter|timjan|rosmarin/.test(t)) tag("Örtig");
  if (/systembolag|bolaget/.test(t)) o.shop = "sb";
  else if (/hemleverans|leverera|hem till|webbutik|nätet|online/.test(t)) o.shop = "web";

  /* land, druva, liknar */
  for (const [c, r] of Object.entries(CRX)) if (r.test(t) && W.some((w) => w.c === c)) o.country = c;
  const g = grapesOf(W).find((g) => t.includes(" " + g.toLowerCase()));
  if (g) o.grape = g;
  const lk = t.match(/(?:likt|liknar|som)\s+(.+)$/);
  if (lk) {
    // Hela ord, så att "som … i solnedgången" inte matchar vinet "Sol".
    const rest = ` ${lk[1].trim()} `;
    const L = W.filter((w) => w.n.length >= 3 && rest.includes(` ${w.n.toLowerCase()} `))
      .sort((a, b) => b.n.length - a.n.length)[0];
    if (L) o.like = L.id;
  }
  return o;
}

export const understood = (o: Parsed): boolean =>
  !!(o.shop || o.color || o.budget || o.adv || o.food || o.tags.length || Object.keys(o.ax).length || o.country || o.grape || o.like);

export const regexInterpreter: Interpreter = { parse };

const FOOD_OPENERS: Record<string, string> = {
  kryddigt: "Kryddig mat, då behövs ett vin som tål hettan och inte är för strävt.",
  fisk: "Fisk och skaldjur, då letar jag efter syra och lite sälta.",
  kott: "Till kött, då får vinet gärna ha lite grepp.",
  fagel: "Fågel, det öppnar för både vitt, orange och lättare rött.",
  flask: "Fläsk och chark, då vill man ha något saftigt som skär igenom fettet.",
  vego: "Vegetariskt, då tittar jag efter jordiga och örtiga toner.",
  ost: "Ost, då kan vinet gärna ha både syra och djup.",
};

/** Svar som speglar tolkningen i ord (inte bara listar den). */
export function reflect(o: Parsed, raw: string, W: CompassWine[]): string {
  const t = raw.toLowerCase();
  let open: string;
  if (o.mood === "sun") open = /solnedgång/.test(t) && /balkong/.test(t) ? "Solnedgång på balkongen, det låter som en fin kväll."
    : /solnedgång/.test(t) ? "Ett glas i solnedgången, fint." : "Ute i solen alltså, då ska vinet vara svalt och piggt.";
  else if (o.mood === "cozy") open = "En mysig kväll inne, då får vinet gärna ha lite mer kropp.";
  else if (o.mood === "party") open = "Fest, då ska det vara lätt att tycka om.";
  else if (o.food && !o.alone) open = FOOD_OPENERS[o.food[0]] ?? "Okej, jag förstår vad du är ute efter.";
  else open = "Okej, jag förstår vad du är ute efter.";

  const p: string[] = [];
  if (o.color) {
    const c = o.color.filter((x) => !(o.skin && x === "Orange" && o.color!.includes("Vitt")));
    const one: Record<Color, string> = { "Rött": "ett rött", "Vitt": "ett vitt", "Orange": "ett orange", "Rosé": "en rosé", "Bubbel": "något som bubblar" };
    let s = c.length === 1 ? one[c[0]] : c.map((x) => x.toLowerCase()).join(" eller ");
    if (o.skin) s += o.color.includes("Vitt")
      ? ", och eftersom du nämner skalkontakt tar jag med orangeviner också, det är vita druvor som fått ligga på skalen"
      : " med skalkontakt";
    p.push(s);
  }
  if (o.tags.includes("Kryddig")) p.push("med lite kryddighet i doften");
  if (o.mood === "sun") p.push("friskt och inte för fylligt, så att det håller sig pigg i värmen");
  if (o.mood === "cozy") p.push("med lite djup och jordighet");
  const rest = o.tags.filter((x) => !["Kryddig", "Friskt", "Lättsam", "Komplex", "Jordig", "Fruktig"].includes(x));
  if (rest.length) p.push(rest.join(", ").toLowerCase());
  if (o.ax.st === 2) p.push("mjukt i munnen");
  if (o.ax.st === 4) p.push("med lite grepp");
  if (o.ax.f === 4 && o.mood !== "cozy") p.push("med kropp");
  if (o.alone) p.push("gott att dricka på egen hand");
  if (o.budget) p.push(o.budget === "9999" ? "utan prisgräns" : label("budget", o.budget).toLowerCase());
  if (o.adv) p.push({ "1": "som smakar som ett vanligt vin", "2": "som överraskar lite", "3": "som får vara riktigt funky" }[o.adv]);
  if (o.shop) p.push(o.shop === "sb" ? "att hämta på Systembolaget" : "med hemleverans från en webbutik");
  if (o.country) p.push("från " + o.country);
  if (o.grape) p.push("gärna " + o.grape);
  if (o.like) { const L = W.find((w) => w.id === o.like); if (L) p.push("i stil med " + L.n); }
  return open + (p.length ? " Jag tänker " + (o.color ? "" : "något ") + p.join(", ") + "." : "");
}

const MISSING_LABEL: Record<QuestionKey, string> = { color: "färg", budget: "budget", adv: "hur vilt det får smaka", food: "mat" };

/** "Det jag inte vet än är budget och hur vilt det får smaka, …" */
export function missingTail(missing: QuestionKey[], done: boolean): string {
  if (done) return " Jag har uppdaterat förslagen.";
  if (!missing.length) return " Då har jag allt jag behöver.";
  const names = missing.map((k) => MISSING_LABEL[k]);
  const list = names.length > 1 ? names.slice(0, -1).join(", ") + " och " + names[names.length - 1] : names[0];
  return ` Det jag inte vet än är ${list}, ${missing.length === 1 ? "ett tryck" : "några tryck"} till så har du ditt förslag.`;
}

/**
 * Lägger in tolkningen i kompassens tillstånd. Returnerar nytt tillstånd,
 * vilka frågor som nu är besvarade och etiketterna för "Jag plockade upp".
 */
export function applyParsed(S: CompassState, o: Parsed, W: CompassWine[]): { state: CompassState; answered: QuestionKey[]; picked: string[] } {
  const s: CompassState = { ...S, ax: { ...S.ax }, tags: [...S.tags] };
  const answered: QuestionKey[] = [];
  const pick: string[] = [];
  if (o.color) { s.color = o.color; answered.push("color"); pick.push(...o.color); }
  if (o.budget) { s.budget = o.budget; answered.push("budget"); pick.push(o.budget === "9999" ? "Ingen prisgräns" : label("budget", o.budget)); }
  if (o.adv) { s.adv = o.adv; answered.push("adv"); pick.push(label("adv", o.adv)); }
  if (o.food) { s.food = o.food; answered.push("food"); pick.push(...o.food.map((f) => (f === "none" ? "Gott på egen hand" : FOOD[f]))); }
  s.tags = [...new Set([...s.tags, ...o.tags])];
  pick.push(...o.pick);
  for (const k of Object.keys(o.ax) as AxisKey[]) s.ax[k] = o.ax[k]!;
  if (o.ax.s) pick.push("Hög syra");
  if (o.ax.f === 4) pick.push("Fylligt");
  if (o.ax.st === 2) pick.push("Mjukt");
  if (o.shop) { s.shop = o.shop; pick.push(o.shop === "sb" ? "Hämta på Systembolaget" : "Hemleverans från webbutik"); }
  if (o.country) { s.country = o.country; pick.push(o.country); }
  if (o.grape) { s.grape = o.grape; pick.push(o.grape); }
  if (o.like) { s.like = o.like; const L = W.find((w) => w.id === o.like); if (L) pick.push("Likt " + L.n); }
  return { state: s, answered, picked: [...new Set(pick)] };
}

export const QUESTION_KEYS = QUESTIONS.map((q) => q.k);
