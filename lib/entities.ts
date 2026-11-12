// Producenter, druvor och länder som egna sidor (SEO-AIO-AUDIT.md, etapp B).
// Namnen normaliseras bara när sidorna byggs; lagrad data ändras inte.

import type { Metadata } from "next";
import type { Wine } from "@/lib/blob";

/** Slug som klarar accenter: "Hervé Villemade" → "herve-villemade", "Österrike" → "osterrike". */
export function entitySlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Samma producent under olika namn. Nyckel: slug av namnet i datan, värde: namnet som visas. */
const PRODUCER_ALIASES: Record<string, string> = {
  "julien-meyer": "Domaine Julien Meyer",
};

/** Samma druva under olika namn eller stavningar. Nyckel: slug, värde: namnet som visas. */
const GRAPE_ALIASES: Record<string, string> = {
  blaufrankisch: "Blaufränkisch",
  chenin: "Chenin Blanc",
  garnacha: "Grenache",
  "garnacha-tinta": "Grenache",
  "garnacha-blanca": "Grenache Blanc",
  "pinot-grigio": "Pinot Gris",
  "pinot-bianco": "Pinot Blanc",
  weissburgunder: "Pinot Blanc",
  "pinot-nero": "Pinot Noir",
  macabeo: "Macabeu",
  carinena: "Carignan",
  rolle: "Vermentino",
  moscato: "Muscat",
  "fernao-pires": "Fernão Pires",
  mencia: "Mencía",
  rebula: "Ribolla Gialla",
  aragonez: "Aragonês",
};

export function producerName(raw: string): string {
  const name = raw.trim();
  return PRODUCER_ALIASES[entitySlug(name)] ?? name;
}

export const producerSlug = (raw: string) => entitySlug(producerName(raw));

/**
 * Druvorna i ett vin som namn, i samma ordning som i datan.
 * Procentsatser och beskrivande text ("från kalkrika jordar") tas bort, liksom "Okänd druva".
 */
export function grapesOf(w: Pick<Wine, "grape">): string[] {
  const out: string[] = [];
  for (const part of (w.grape ?? "").replace(/\s+från\s.*$/i, "").split(/\s*[,/&+]\s*|\s+och\s+/)) {
    const g = part.replace(/\s*\d+\s*%/g, "").trim();
    if (!g || !/^[A-ZÀ-Ý]/.test(g) || /^okänd/i.test(g)) continue;
    const name = GRAPE_ALIASES[entitySlug(g)] ?? g;
    if (!out.includes(name)) out.push(name);
  }
  return out;
}

export const grapeSlug = (name: string) => entitySlug(GRAPE_ALIASES[entitySlug(name)] ?? name);
export const countrySlug = (name: string) => entitySlug(name);

export type Entity = { slug: string; name: string; wines: Wine[] };

/** Grupperar vinerna per nyckel. Visningsnamnet är den vanligaste stavningen. */
function group(wines: Wine[], keys: (w: Wine) => string[]): Map<string, Entity> {
  const spellings = new Map<string, Map<string, number>>();
  const map = new Map<string, Entity>();
  for (const w of wines) {
    for (const name of keys(w)) {
      const slug = entitySlug(name);
      if (!slug) continue;
      const e = map.get(slug) ?? { slug, name, wines: [] };
      e.wines.push(w);
      map.set(slug, e);
      const s = spellings.get(slug) ?? new Map<string, number>();
      s.set(name, (s.get(name) ?? 0) + 1);
      spellings.set(slug, s);
    }
  }
  for (const [slug, e] of map) e.name = [...spellings.get(slug)!].sort((a, b) => b[1] - a[1])[0][0];
  return map;
}

export const producersOf = (wines: Wine[]) => group(wines, (w) => (w.producer?.trim() ? [producerName(w.producer)] : []));
export const grapesIn = (wines: Wine[]) => group(wines, grapesOf);
export const countriesOf = (wines: Wine[]) => group(wines, (w) => (w.country?.trim() ? [w.country.trim()] : []));

/** Producenter och druvor med bara ett vin indexeras inte; länder behöver fler viner för en egen lista. */
export const MIN_INDEXED = { producer: 2, grape: 2, country: 5 } as const;

/** Färgerna bland vinerna, vanligast först, t.ex. ["Rött", "Rosé"]. */
export function typesOf(wines: Wine[]): string[] {
  const m = new Map<string, number>();
  for (const w of wines) if (w.wineType) m.set(w.wineType, (m.get(w.wineType) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

/** De vanligaste värdena av ett fält bland vinerna, t.ex. regioner. */
export function topValues(values: (string | undefined)[], n: number): string[] {
  const m = new Map<string, number>();
  for (const v of values) if (v?.trim()) m.set(v.trim(), (m.get(v.trim()) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "sv")).slice(0, n).map(([v]) => v);
}

/** Hela meningar som ryms i max tecken; annars kapat vid ett ord med "…". */
export function clip(text: string, max = 160): string {
  if (text.length <= max) return text;
  const sentences = text.match(/[^.]+\./g) ?? [];
  let out = "";
  for (const s of sentences) if ((out + s).length <= max) out += s; else break;
  return out.trim() || `${text.slice(0, max - 1).replace(/\s+\S*$/, "").replace(/[,;:]$/, "")}…`;
}

/** Titel, beskrivning, canonical, Open Graph och noindex för en entitetssida. */
export function entityMetadata(title: string, description: string, path: string, indexed: boolean): Metadata {
  const d = clip(description);
  return {
    title,
    description: d,
    alternates: { canonical: path },
    openGraph: { title: `${title} – Naturvinstipset`, description: d, url: `https://www.naturvinstipset.se${path}` },
    robots: indexed ? undefined : { index: false, follow: true },
  };
}

/** "A, B och C" */
export const andList = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} och ${xs[xs.length - 1]}` : xs[0] ?? "");

/**
 * Korta texter om de vanligaste druvorna. Allmänt kända fakta om ursprung och stil, inga påståenden om enskilda viner.
 */
export const GRAPE_NOTES: Record<string, string> = {
  "pinot-noir": "Pinot Noir är den röda druvan från Bourgogne. Den ger ljusa, syrliga viner med röda bär och lite tanniner, och odlas av naturvinsmakare i bland annat Alsace, Jura, Tyskland och Österrike.",
  chardonnay: "Chardonnay är den vita druvan från Bourgogne och Champagne. Den tar tydligt intryck av jorden och av källaren och kan bli allt från stram och mineralisk till fyllig.",
  gamay: "Gamay är druvan bakom Beaujolais, där naturvinsrörelsen tog fart på 1980-talet. Den ger saftiga, lätta röda viner som ofta serveras svala.",
  grenache: "Grenache, eller Garnacha på spanska, odlas i södra Frankrike och Spanien. Den ger varma, fruktiga röda viner och är en del av många blandningar.",
  syrah: "Syrah kommer från norra Rhône. Den ger mörka viner med peppar, mörka bär och fasta tanniner.",
  "chenin-blanc": "Chenin Blanc är Loiredalens stora vita druva och odlas också mycket i Sydafrika. Den har hög syra och kan bli torr, halvtorr eller mousserande.",
  "sauvignon-blanc": "Sauvignon Blanc kommer från Loire och Bordeaux. Den ger friska, aromatiska vita viner med citrus och gröna toner.",
  carignan: "Carignan, Cariñena på spanska, är en gammal röd druva från Medelhavet. Gamla stockar i Languedoc, Roussillon och Katalonien ger koncentrerade, rustika viner.",
  merlot: "Merlot är en röd druva från Bordeaux. Den ger mjuka viner med plommon och mörka bär.",
  riesling: "Riesling är den stora vita druvan i Tyskland, Alsace och Österrike. Den har hög syra, tydliga citrus- och stenfruktstoner och speglar jorden väl.",
  sangiovese: "Sangiovese är Toscanas röda druva, bakom bland annat Chianti och Brunello. Den ger syrliga viner med körsbär och fasta tanniner.",
  cinsault: "Cinsault är en röd druva från södra Frankrike som också odlas i Sydafrika. Den ger lätta, ljusa och blommiga viner.",
  trebbiano: "Trebbiano är en av Italiens vanligaste vita druvor. Den har hög syra och neutral frukt och används gärna för skalmacererade viner.",
  "pinot-gris": "Pinot Gris, Pinot Grigio på italienska, har rosa skal. Den kan bli vitt vin, eller kopparfärgat ramato och orangevin när skalen får ligga med.",
  savagnin: "Savagnin är Juras vita druva. Den ger nötiga, syrliga viner, och lagras den under ett jästtäcke blir den vin jaune.",
  malvasia: "Malvasia är en gammal familj av vita druvor runt Medelhavet. Den är aromatisk och används ofta till orangevin.",
  "cabernet-sauvignon": "Cabernet Sauvignon är den röda druvan i Bordeaux vänstra strand. Den ger mörka viner med svarta vinbär och mycket tanniner.",
  gewurztraminer: "Gewürztraminer har rosa skal och är mycket aromatisk, med ros och litchi. Den är vanligast i Alsace.",
  "cabernet-franc": "Cabernet Franc är Loiredalens röda druva. Den ger friska viner med röda bär och gröna, örtiga toner.",
  "xarel-lo": "Xarel·lo är en vit druva från Katalonien och en av druvorna i cava. Den ger stramt, syrligt vin.",
};
