// Tolkning av webbutikernas data för synken (BRIEF-KOMPASSEN.md, avsnitt 6).
// Rena funktioner utan I/O, så att de kan testas mot sparade sidor.
// Bara typ-importer, som i lib/wineData.ts.

import type { Wine } from "../blob";

// ─── Gemensamt ────────────────────────────────────────────────────────────────

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsaquo: "›" };

export function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
}

/** HTML → ren text på en rad. */
export function htmlText(html: string): string {
  return decodeEntities(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

/** Ord utan ordgränsproblem för å, ä, ö och accenter. */
const wordRe = (w: string) => new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}])`, "iu");

// ─── Druvor, färg och land (6.1) ─────────────────────────────────────────────

/** Blå druvor. Namnet är det som visas på sajten. */
export const BLUE_GRAPES = [
  "Pinot Noir", "Gamay", "Syrah", "Grenache", "Garnacha", "Mourvèdre", "Carignan", "Cinsault", "Merlot",
  "Cabernet Sauvignon", "Cabernet Franc", "Malbec", "Côt", "Tempranillo", "Sangiovese", "Nebbiolo", "Barbera",
  "Dolcetto", "Montepulciano", "Nero d'Avola", "Frappato", "Nerello Mascalese", "Aglianico", "Lambrusco", "Schioppettino",
  "Zweigelt", "Blaufränkisch", "St. Laurent", "Poulsard", "Trousseau", "Pinot Meunier", "Mondeuse",
  "Grolleau", "Pineau d'Aunis", "Touriga Nacional", "Baga", "Castelão", "Ramisco", "Jaen", "Alfrocheiro",
  "Tinta Roriz", "Rufete", "Tinto Cão", "Vranac", "Teroldego", "Lagrein", "Schiava", "Corvina", "Refosco",
  "Mencía", "Bobal", "Monastrell", "Xinomavro", "Agiorgitiko", "Mavrud", "Saperavi", "Dornfelder", "Regent",
  "Rondo", "Solaris Rouge", "Pinot Nero", "Spätburgunder", "Négrette", "Tannat", "Fer Servadou", "Braucol",
  "Duras", "Prunelard", "Ciliegiolo", "Canaiolo", "Susumaniello", "Primitivo", "Negroamaro", "Croatina",
  "Freisa", "Grignolino", "Pelaverga", "Ruché", "Fumin", "Petit Rouge", "Cornalin", "Gamaret", "Merlot Noir",
] as const;

/** Gröna druvor. */
export const GREEN_GRAPES = [
  "Chardonnay", "Sauvignon Blanc", "Spergola", "Chenin Blanc", "Riesling", "Grüner Veltliner", "Gewürztraminer", "Muscat",
  "Muskateller", "Pinot Gris", "Pinot Grigio", "Pinot Blanc", "Weissburgunder", "Auxerrois", "Sylvaner",
  "Silvaner", "Savagnin", "Melon de Bourgogne", "Aligoté", "Viognier", "Marsanne", "Roussanne", "Grenache Blanc",
  "Macabeu", "Macabeo", "Xarel·lo", "Xarello", "Parellada", "Albariño", "Godello", "Verdejo", "Arinto",
  "Fernão Pires", "Encruzado", "Malvasia", "Malvazija", "Vermentino", "Trebbiano", "Garganega", "Glera",
  "Verdicchio", "Fiano", "Greco", "Falanghina", "Catarratto", "Grillo", "Inzolia", "Zibibbo", "Carricante",
  "Cortese", "Arneis", "Timorasso", "Pecorino", "Passerina", "Ribolla Gialla", "Friulano", "Welschriesling",
  "Furmint", "Hárslevelű", "Müller-Thurgau", "Scheurebe", "Neuburger", "Rotgipfler", "Zierfandler", "Traminer",
  "Sauvignonasse", "Assyrtiko", "Aidani", "Athiri", "Moschofilero", "Rkatsiteli", "Mtsvane", "Kisi", "Solaris",
  "Souvignier Gris", "Johanniter", "Muscaris", "Romorantin", "Jacquère", "Altesse", "Chasselas", "Petit Manseng",
  "Gros Manseng", "Mauzac", "Loin de l'Œil", "Len de l'El", "Picpoul", "Clairette", "Bourboulenc", "Rolle",
  "Ugni Blanc", "Colombard", "Sémillon", "Muscadelle", "Siria", "Síria", "Fonte Cal", "Rabigato", "Gouveio",
  "Viosinho", "Códega", "Avesso", "Loureiro", "Alvarinho", "Antão Vaz", "Roupeiro", "Vital", "Bical", "Cerceal",
] as const;

const GRAPES = [...BLUE_GRAPES, ...GREEN_GRAPES].sort((a, b) => b.length - a.length);
const BLUE = new Set<string>(BLUE_GRAPES);

/** Druvor som nämns i texten, med ordgränser (så att "côte" inte blir Côt). Längsta namn först. */
export function findGrapes(text: string): string[] {
  let t = ` ${text} `;
  const found: string[] = [];
  for (const g of GRAPES) {
    const re = wordRe(g);
    if (re.test(t)) {
      found.push(g);
      t = t.replace(new RegExp(re.source, "giu"), "$1 $2"); // "Pinot Gris" ska inte också ge "Pinot"
    }
  }
  return found;
}

/** Färg enligt prioriteten i 6.1. Returnerar sajtens vintyp, eller undefined om det inte går att avgöra. */
export function deriveWineType(text: string, tags: string[], grapes: string[]): string | undefined {
  const t = text.toLowerCase();
  if (tags.some((x) => x.toLowerCase() === "bubbel") || /pétillant|petillant|pet[ -]?nat|mousserande|champagne|crémant|cremant|ancestral/.test(t))
    return /pet[ -]?nat|pétillant naturel|ancestral/.test(t) ? "Pét Nat" : "Mousserande";
  if (/rosato|rosado|rosé|(^|[^\p{L}])rose($|[^\p{L}])/u.test(t)) return "Rosé";
  if (!grapes.length) return undefined;
  const blue = grapes.filter((g) => BLUE.has(g)).length;
  if (blue === grapes.length) return /blanc de noirs/.test(t) ? "Vitt" : "Rött";
  if (blue === 0) return /skalkontakt|skalmacer|maceration|macerat|orange/.test(t) ? "Orange" : "Vitt";
  return undefined;
}

/** Land från region (6.1). */
export const REGION_COUNTRY: Record<string, string> = {
  Alsace: "Frankrike", "Ardèche": "Frankrike", Auvergne: "Frankrike", Beaujolais: "Frankrike", Bourgogne: "Frankrike",
  Champagne: "Frankrike", Jura: "Frankrike", Languedoc: "Frankrike", Loire: "Frankrike", Lorraine: "Frankrike",
  "Rhône": "Frankrike", Roussillon: "Frankrike", Savoie: "Frankrike",
  Emilia: "Italien", Friuli: "Italien", Lazio: "Italien", Piemonte: "Italien", Sicilien: "Italien", Toscana: "Italien",
  Umbrien: "Italien", Veneto: "Italien",
  Granada: "Spanien", "Skåne": "Sverige", Tinos: "Grekland", Steiermark: "Österrike",
  // Flaskvis (Kellner & Kellners portugisiska producenter)
  Lissabon: "Portugal", Lisboa: "Portugal", Douro: "Portugal", "Trás-os-Montes": "Portugal", "Dão": "Portugal",
  Alentejo: "Portugal", "Beira Interior": "Portugal", Bairrada: "Portugal", Tejo: "Portugal", "Setúbal": "Portugal",
  "Vinho Verde": "Portugal", Minho: "Portugal", Colares: "Portugal",
  // Flaskvis övriga naturviner
  "Terra Alta": "Spanien", "Penedès": "Spanien", Catalunya: "Spanien", Bierzo: "Spanien", "Kanarieöarna": "Spanien",
  Tenerife: "Spanien", Teneriffa: "Spanien", Mallorca: "Spanien", Montsant: "Spanien", Priorat: "Spanien",
  "Conca de Barberà": "Spanien", Empordà: "Spanien", "Biera Interior": "Portugal",
  Burgenland: "Österrike", Wachau: "Österrike", Kamptal: "Österrike", Niederösterreich: "Österrike",
  "Štajerska": "Slovenien", "Goriska Brda": "Slovenien", "Goriška Brda": "Slovenien", Vipava: "Slovenien",
  Swartland: "Sydafrika", Stellenbosch: "Sydafrika", "Western Cape": "Sydafrika", Elgin: "Sydafrika",
};

/** Länder som butikerna skriver ut, på svenska. */
export const COUNTRIES = [
  "Frankrike", "Italien", "Spanien", "Portugal", "Österrike", "Tyskland", "Slovenien", "Kroatien", "Ungern",
  "Tjeckien", "Slovakien", "Grekland", "Georgien", "Serbien", "Bosnien", "Nordmakedonien", "Rumänien", "Bulgarien",
  "Schweiz", "Sverige", "Danmark", "England", "Storbritannien", "Sydafrika", "Australien", "Nya Zeeland", "Chile",
  "Argentina", "USA", "Kanada", "Mexiko", "Japan", "Libanon", "Armenien", "Moldavien", "Turkiet", "Israel",
];

/** "Sydafrika - Western Cape" → land och region; "Terra Alta" → region, land via REGION_COUNTRY. */
export function splitOrigin(origin: string | undefined): { country: string; region?: string } {
  if (!origin) return { country: "" };
  const [first, ...rest] = origin.split(/\s+[-–]\s+/).map((x) => x.trim());
  if (COUNTRIES.includes(first)) return { country: first, region: rest.join(" - ") || undefined };
  // "Štajerska (Styria)" slås upp som "Štajerska".
  return { country: REGION_COUNTRY[first] ?? REGION_COUNTRY[first.replace(/\s*\(.*\)$/, "")] ?? "", region: origin };
}

// ─── Heuristisk smakprofil för Vin & Natur (5.3) ─────────────────────────────

const has = (t: string, re: RegExp) => re.test(t);

/** Syra, fyllighet, strävhet och funk 1–5 samt smaktaggar ur butikens text. autoProfile: true. */
export function heuristicProfile(text: string, wineType: string): Pick<Wine, "syra" | "fyllighet" | "funk" | "stravhet" | "flavorTags"> {
  const t = text.toLowerCase();
  const red = wineType === "Rött";
  const syra = has(t, /hög syra|syrlig|syrlighet|krispig|frisk|livlig|spänstig|citrus/) ? 4 : has(t, /mjuk|rund|låg syra/) ? 2 : 3;
  const fyllighet = has(t, /fyllig|kraftig|koncentrerad|mustig|rik|generös/) ? 4 : has(t, /lätt|luftig|törstsläckande|glou|klunk/) ? 2 : 3;
  const funk = has(t, /funky|funkig|vild|cider|flyktig|kombucha|oxidativ|syrlig öl/) ? 4 : has(t, /ren|precis|stram|klar/) ? 1 : 2;
  const stravhet = !red && wineType !== "Orange" ? 1
    : has(t, /tanninrik|strävhet|sträv|kraftiga tanniner|tydliga tanniner/) ? 4
    : has(t, /mjuka tanniner|lätta tanniner|silkig/) ? 2 : wineType === "Orange" ? 2 : 3;

  const TAG_WORDS: [string, RegExp][] = [
    ["Fruktig", /frukt|bär|körsbär|jordgubb|hallon|persika|aprikos|äpple|päron/],
    ["Mineralisk", /mineral|sten|flinta|salt/], ["Blommig", /blom|ros(?!é)|viol|fläder/],
    ["Kryddig", /krydd|peppar|kanel|nejlika/], ["Jordig", /jord|svamp|skogsbotten|läder/],
    ["Citrus", /citrus|citron|lime|grapefrukt|apelsin/], ["Örtig", /ört|timjan|rosmarin|salvia|mynta/],
    ["Krispig", /krispig|spänstig/], ["Lättsam", /lättdrucken|klunk|törstsläckande|glou/],
    ["Komplex", /komplex|lager på lager|djup/], ["Tanninrik", /tanninrik|strävhet/],
  ];
  const flavorTags = TAG_WORDS.filter(([, re]) => re.test(t)).map(([n]) => n).slice(0, 5);
  return { syra, fyllighet, funk, stravhet, flavorTags };
}

// ─── Vin & Natur (Shopify) ────────────────────────────────────────────────────

export type ShopifyVariant = { title: string; price: string; available: boolean };
export type ShopifyProduct = {
  handle: string; title: string; product_type: string; tags: string[] | string; body_html: string; vendor?: string;
  variants: ShopifyVariant[]; images?: { src: string }[];
};

export const tagList = (t: string[] | string) => (Array.isArray(t) ? t : t.split(",").map((x) => x.trim()).filter(Boolean));
const BIG_BOTTLE = /magnum|jeroboam|1[,.]5\s*l/i;

/** Urval enligt 6.1: typ Vin, inte stora flaskor och pris över 0. Tillgänglighet avgör lagerstatus, inte urvalet. */
export function isVinNaturWine(p: ShopifyProduct): boolean {
  if (p.product_type !== "Vin") return false;
  if (BIG_BOTTLE.test(p.title) || BIG_BOTTLE.test(p.handle)) return false;
  return !!vinNaturVariant(p);
}

/** Varianten "1 flaska", annars "Default Title". */
export function vinNaturVariant(p: ShopifyProduct): { price: number; available: boolean } | undefined {
  const v = p.variants.find((x) => x.title.toLowerCase() === "1 flaska") ?? p.variants.find((x) => x.title === "Default Title");
  const price = v ? Number(v.price) : 0;
  if (!v || !(price > 0) || BIG_BOTTLE.test(v.title)) return undefined;
  return { price: Math.round(price), available: v.available };
}

export const VIN_NATUR_TAX_TEXT = /moms\s+och\s+alkoholskatt\s+inkluderad/i;

/** Region och producent ur brödsmulorna: de två första länkarna före "›". */
export function vinNaturBreadcrumbs(html: string): { region?: string; producer?: string } {
  const i = html.search(/›|&rsaquo;|&#8250;/);
  if (i < 0) return {};
  // Brödsmulorna ligger i samma element som första "›": ta texten runt den.
  const start = Math.max(html.lastIndexOf("<nav", i), html.lastIndexOf("<ol", i), html.lastIndexOf("<ul", i), html.lastIndexOf("<div", i));
  const end = html.indexOf("</nav>", i) > -1 ? html.indexOf("</nav>", i) : i + 3000;
  const block = html.slice(start, end);
  const links = [...block.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => htmlText(m[1])).filter(Boolean)
    .filter((x) => !/^(hem|home|start|alla produkter|vin)$/i.test(x));
  let [region, producer] = links;
  if (region === "Strohmeier") { producer = "Strohmeier"; region = "Steiermark"; }
  return { region, producer };
}

/** Vad produktsidan säger: skattetexten och brödsmulorna. */
export function parseVinNaturPage(html: string): { taxIncluded: boolean; region?: string; producer?: string } {
  return { taxIncluded: VIN_NATUR_TAX_TEXT.test(htmlText(html)), ...vinNaturBreadcrumbs(html) };
}

// ─── Flaskvis (WooCommerce) ──────────────────────────────────────────────────

export type WooProduct = {
  id: number; name: string; slug: string; permalink: string; is_in_stock: boolean;
  prices: { price: string; currency_minor_unit: number };
  images?: { src: string }[];
};

export const wooPrice = (p: WooProduct) => Math.round(Number(p.prices.price) / 10 ** (p.prices.currency_minor_unit ?? 0));

/** Innehållet i `<div class="items…" data-section="X">` fram till nästa sådan sektion. */
function section(html: string, name: string): string {
  const m = html.match(new RegExp(`<div class="items[^"]*" data-section="${name}">`));
  if (!m || m.index === undefined) return "";
  const rest = html.slice(m.index + m[0].length);
  const next = rest.search(/<div class="items[^"]*" data-section="/);
  return next > -1 ? rest.slice(0, next) : rest.slice(0, 5000);
}

export type FlaskvisPage = {
  kellner: boolean;
  /** Svensk importör ur fliken "Importören". */
  importer?: string;
  /** Flaskvis märker naturviner med stilen "Natur". */
  natural: boolean;
  region?: string;
  year?: string;
  grapes: string[];
  style: string[];
  producer?: string;
  values: Partial<Record<"syra" | "fyllighet" | "funk" | "stravhet", number>>;
  description?: string;
};

/** 0–100 → 1–5 enligt 5.3: max(1, round(v/20)). */
export const flaskvisScale = (v: number) => Math.max(1, Math.round(v / 20));

export function parseFlaskvisPage(html: string): FlaskvisPage {
  const supplierHtml = section(html, "supplier");
  const supplier = htmlText(supplierHtml);
  const importer = supplierHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1];
  const producerHtml = section(html, "producer");
  const producer = producerHtml.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)?.[1];
  const metaRow = (label: string) => {
    const m = html.match(new RegExp(`<label class="icon ${label}">[\\s\\S]*?<div class="meta-items">([\\s\\S]*?)</div>`));
    return m ? [...m[1].matchAll(/<span>([\s\S]*?)<\/span>/g)].map((x) => htmlText(x[1])) : [];
  };
  const values: FlaskvisPage["values"] = {};
  const KEY = { torr: "syra", fyllighet: "fyllighet", funk: "funk", stravhet: "stravhet" } as const;
  for (const m of html.matchAll(/class="row (torr|fyllighet|funk|stravhet)-(\d{1,3})"/g)) {
    values[KEY[m[1] as keyof typeof KEY]] = flaskvisScale(Number(m[2]));
  }
  const meta = html.match(/<ul class="wine-volume-meta">([\s\S]*?)<\/ul>/)?.[1] ?? "";
  const year = [...meta.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => htmlText(x[1])).find((x) => /^(19|20)\d{2}$/.test(x));
  const region = html.match(/<span class="country">([\s\S]*?)<\/span>/)?.[1];
  const description = html.match(/<div class="product-text">([\s\S]*?)<\/div>/)?.[1];
  return {
    kellner: /kellner/i.test(supplier),
    importer: importer ? htmlText(importer) : undefined,
    natural: metaRow("stil").some((s) => /^natur(vin)?$/i.test(s)),
    region: region ? htmlText(region) : undefined,
    year,
    grapes: metaRow("druvor"),
    style: metaRow("stil"),
    producer: producer ? htmlText(producer) : undefined,
    values,
    description: description ? htmlText(description) : undefined,
  };
}

/** Vintyp ur Flaskvis stil-taggar ("Rött", "Vitt", "Orange", "Rosé", "Mousserande"/"Pet nat"). */
export function flaskvisWineType(style: string[], grapes: string[], text: string): string | undefined {
  const s = style.map((x) => x.toLowerCase());
  if (s.some((x) => /pet ?nat|pét/.test(x))) return "Pét Nat";
  if (s.some((x) => /mousserande|bubbel/.test(x))) return "Mousserande";
  if (s.includes("orange")) return "Orange";
  if (s.includes("rosé") || s.includes("rose")) return "Rosé";
  if (s.includes("rött")) return "Rött";
  if (s.includes("vitt")) return "Vitt";
  return deriveWineType(text, [], grapes);
}

// ─── Philipson Wine (Dynamicweb) ─────────────────────────────────────────────

export type PhilipsonProduct = {
  name: string; link: string; schemaUrlFull?: string; priceDouble: number; stockText: string; stockLevel?: string;
  availableForPurchase: boolean; type: string; country: string; area: string; primaryGrape?: string; secondaryGrape?: string;
  year: string; bottleSizeCl: string; productDescription?: string; description?: string; image?: string; googleImpression?: string;
};

export const PHILIPSON_TAX_TEXT = /inklusive\s+moms\s+och\s+svensk\s+alkoholskatt/i;

/** Producenten ur Googles produktdata (brand). */
export function philipsonProducer(p: PhilipsonProduct): string | undefined {
  try { return JSON.parse(p.googleImpression ?? "{}").brand || undefined; } catch { return undefined; }
}

/** "2023 Rethink Riesling Mosel Schmitt Söhne" → "Rethink Riesling Mosel" (årgång och producent bort). */
export function philipsonName(p: PhilipsonProduct, producer: string | undefined): string {
  let n = decodeEntities(p.name).replace(/^(19|20)\d{2}\s+/, "").trim();
  if (producer && n.toLowerCase().endsWith(producer.toLowerCase())) n = n.slice(0, -producer.length).replace(/[\s,–-]+$/, "").trim();
  return n || decodeEntities(p.name);
}

export function philipsonWineType(p: PhilipsonProduct, text: string): string | undefined {
  const t = p.type.toLowerCase();
  // Pet nat i namnet går före butikens typ ("Sanctum Pet Nat, Pinot Noir" står som rött vin).
  if (/pet[ '’]*nat|pétillant naturel/i.test(p.name)) return "Pét Nat";
  if (/mousser|champagne|cava|crémant|cremant/.test(t)) return /pet[ '’]*nat|pétillant naturel|ancestral/i.test(text) ? "Pét Nat" : "Mousserande";
  if (/ros[ée]/.test(t)) return "Rosé";
  if (/orange/.test(t)) return "Orange";
  if (/vitt|hvid/.test(t)) return /skalkontakt|skalmacer|maceration|macerat|orangevin|orange wine/i.test(text) ? "Orange" : "Vitt";
  if (/rött|rød/.test(t)) return "Rött";
  return undefined;
}

/** Bara 75 cl-flaskor som går att köpa. */
export const isPhilipsonBottle = (p: PhilipsonProduct) => p.bottleSizeCl === "75" && p.priceDouble > 0;

// ─── Wine Trade (Shopify) ────────────────────────────────────────────────────

/**
 * Wine Trades producenter med land. Butiken skriver producent och vinnamn i olika
 * ordning, så producenten hittas i den här listan. Okända producenter skapas inte
 * utan syns i synkloggen, och läggs då till här.
 */
export const WINE_TRADE_PRODUCERS: Record<string, string> = {
  "Dard & Ribo": "Frankrike", "Domaine Marcel Lapierre": "Frankrike", "Domaine Lapierre": "Frankrike", "Lapierre": "Frankrike",
  "Jean Foillard": "Frankrike", "Alex Foillard": "Frankrike", "Domaine Julien Meyer": "Frankrike", "Julien Meyer": "Frankrike",
  "Calvez-Bobinet": "Frankrike", "Sebastien Brunet": "Frankrike", "Buronfosse": "Frankrike", "Domaine de la Borde": "Frankrike",
  "Château d'Arlay": "Frankrike", "Arnaud Combier": "Frankrike", "Raisins et l'Ange": "Frankrike", "Bruno Dûchene": "Frankrike",
  "Vadin-Plateau": "Frankrike", "Larmandier-Bernier": "Frankrike",
  "Podere le Boncie": "Italien", "Arianna Occhipinti": "Italien", "Calabretta": "Italien", "Camillo Donati": "Italien",
  "C.O.S": "Italien", "Samodia": "Italien", "KOI": "Italien", "Foradori": "Italien", "Vino di Anna": "Italien",
  "Trinchero": "Italien", "La Biancara": "Italien",
  "Comando G": "Spanien", "Envinate": "Spanien", "Forjas del Salnes": "Spanien", "Celler Mir": "Spanien",
  "El Serralet": "Spanien", "Viticola Mentridana": "Spanien",
  "Filipa Pato": "Portugal", "Weingut Schödl": "Österrike", "Schödl": "Österrike", "Testalonga": "Sydafrika",
};

const WT_REGIONS: Record<string, string> = {
  ...REGION_COUNTRY, Etna: "Italien", Vittoria: "Italien", Trentino: "Italien", Dolomiterna: "Italien",
  "Emilia-Romagna": "Italien", "Emilia Romagna": "Italien", Weinviertel: "Österrike", Saumur: "Frankrike",
  Vouvray: "Frankrike", Arbois: "Frankrike",
};
const WT_REGION_NAMES = Object.keys(WT_REGIONS).sort((a, b) => b.length - a.length);
const WT_PRODUCER_NAMES = Object.keys(WINE_TRADE_PRODUCERS).sort((a, b) => b.length - a.length);
const WT_TYPES: Record<string, string> = { "rött": "Rött", vitt: "Vitt", orange: "Orange", "rosé": "Rosé", mousserande: "Mousserande" };

/** Lådor, trepack och liknande är inte enskilda viner. */
export const isWineTradeBottle = (p: ShopifyProduct) =>
  !/låda|lådan|pack|box|kartong/i.test(p.title) && Number(p.variants[0]?.price) > 0 && Number(p.variants[0]?.price) < 1000;

const COLOUR_WORDS: [RegExp, string][] = [
  [/(^|[^\p{L}])(rouge|rosso|tinto|negre)($|[^\p{L}])/iu, "Rött"],
  [/(^|[^\p{L}])(blanc|bianco|blanco|branco)($|[^\p{L}])/iu, "Vitt"],
];

/**
 * Producent, vinnamn, år, region och land ur titeln och beskrivningens första stycke
 * (ursprung och druvor). Druvor letas bara där, eftersom resten av texten ofta
 * handlar om producentens andra viner; finns inga där tas nästa stycke.
 */
export function parseWineTradeProduct(p: ShopifyProduct): { producer?: string; name: string; year: string; region?: string; country: string; wineType?: string; grapes: string[] } {
  const paras = (p.body_html ?? "").split(/<\/p>/i).map(htmlText).filter(Boolean);
  const lead = paras[0] ?? "";
  const lower = (x: string) => x.toLowerCase();
  const producer = WT_PRODUCER_NAMES.find((n) => lower(p.title).includes(lower(n))) ?? WT_PRODUCER_NAMES.find((n) => lower(lead).includes(lower(n)));
  const year = p.title.match(/(?:19|20)\d{2}/)?.[0] ?? lead.match(/(?:19|20)\d{2}/)?.[0] ?? "NV";
  const region = WT_REGION_NAMES.find((r) => wordRe(r).test(lead));
  const country = COUNTRIES.find((c) => wordRe(c).test(lead)) ?? (region && WT_REGIONS[region]) ?? (producer && WINE_TRADE_PRODUCERS[producer]) ?? "";

  // Vinnamnet är titeln utan producent, år, region och land.
  let name = p.title;
  if (producer) name = name.replace(new RegExp(producer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "");
  name = name.replace(/(?:19|20)\d{2}/, "").replace(/^\s*(weingut|domaine)\s+/i, "")
    .split(",").map((x) => x.trim().replace(/\s+x$/i, "")).filter((x) => x && !WT_REGIONS[x] && !COUNTRIES.includes(x)).join(", ")
    .replace(/\s{2,}/g, " ").trim();

  const grapes = findGrapes(`${p.title} ${lead}`).length ? findGrapes(`${p.title} ${lead}`) : findGrapes(paras[1] ?? "");
  const t = `${p.title} ${lead}`;
  const colour = (/frizzante/i.test(t) ? "Mousserande" : undefined)
    ?? deriveWineType(t, tagList(p.tags), grapes)
    ?? COLOUR_WORDS.find(([re]) => re.test(p.title))?.[1]
    ?? WT_TYPES[lower(p.product_type)];
  return { producer, name: name || p.title, year, region, country, wineType: colour, grapes };
}

// ─── Just Wine (Shopify, samlingen Våra naturviner) ──────────────────────────

export const JUST_WINE_TAX_TEXT = /inklusive\s+moms\s+och\s+svensk\s+alkoholskatt/i;

/** Stavfel i butikens producentfält. */
const JW_PRODUCERS: Record<string, string> = { "Rochi di Cialla": "Ronchi di Cialla" };

/** Bara enskilda flaskor (taggen "vinflaska"), inte lådor. */
export const isJustWineBottle = (p: ShopifyProduct) =>
  tagList(p.tags).some((t) => t.toLowerCase() === "vinflaska") && !/låda|lådan|box|kartong/i.test(p.title) && Number(p.variants[0]?.price) > 0;

/** Ett fält ur beskrivningens faktadel, t.ex. "Druva:" eller "Region:". */
const jwField = (text: string, label: string) =>
  text.match(new RegExp(`${label}:\\s*(.*?)(?=\\s+(?:Producent|Druva|Region|Odling|Vinifiering|Alkohol|Lagring|Jäsning)\\s*:|$)`, "i"))?.[1]?.trim();

/**
 * Producent ur butikens producentfält, namn och år ur titeln, druvor och region ur
 * beskrivningens faktadel ("Druva: …", "Region: …") och land ur taggarna.
 */
export function parseJustWineProduct(p: ShopifyProduct): { producer?: string; name: string; year: string; region?: string; country: string; wineType?: string; grapes: string[] } {
  const vendor = p.vendor?.trim();
  const producer = vendor ? JW_PRODUCERS[vendor] ?? vendor : undefined;
  const text = htmlText(p.body_html ?? "");
  const year = p.title.match(/(?:19|20)\d{2}/)?.[0] ?? "NV";
  const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let name = p.title.replace(/(?:19|20)\d{2}/, "");
  for (const n of [producer, vendor].filter((x): x is string => !!x)) name = name.replace(new RegExp(esc(n), "i"), "");
  name = name.replace(/\s{2,}/g, " ").trim();

  const country = COUNTRIES.find((c) => tagList(p.tags).includes(c)) ?? "";
  // Regionen är sista delen som inte är ett land; ibland står en beskrivning i fältet, och då hoppas den över.
  const regionParts = (jwField(text, "Region") ?? "").split(",").map((x) => x.trim())
    .filter((x) => x && !COUNTRIES.includes(x) && /^[A-ZÀ-Ý]/.test(x) && !/\s(och|på|med)\s/.test(x));
  const region = regionParts[regionParts.length - 1] || undefined;
  const grapeText = jwField(text, "Druva") ?? "";
  const grapes = findGrapes(grapeText).length ? findGrapes(grapeText) : findGrapes(p.title);

  // Färgen: bubbel först, sedan druvorna, färgord i titeln och sist beskrivningens "rött"/"vitt".
  const head = `${p.title} ${text.slice(0, 300)}`;
  const lower = head.toLowerCase();
  const wineType = /pet[ -]?nat|ancestral/.test(lower) ? "Pét Nat"
    : /frisant|frizzante|prosecco|col fondo|mousserande|bubbel|brut nature|spumante/.test(lower) ? "Mousserande"
    : deriveWineType(p.title, tagList(p.tags), grapes)
      ?? (/rosato|rosé/i.test(p.title) ? "Rosé" : undefined)
      ?? COLOUR_WORDS.find(([re]) => re.test(p.title))?.[1]
      ?? (/(^|[^\p{L}])rött($|[^\p{L}])/u.test(lower) ? "Rött" : /(^|[^\p{L}])vitt($|[^\p{L}])/u.test(lower) ? "Vitt" : undefined);
  return { producer, name: name || p.title, year, region, country, wineType, grapes };
}
