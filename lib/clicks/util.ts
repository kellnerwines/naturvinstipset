// Rena hjälpfunktioner för klickloggen (BRIEF-KOMPASSEN.md, 7.1). Ingen I/O,
// så att de kan användas i både klient och server och testas med Vitest.

export type SourcePage = "kompassen" | "vinsida" | "topplistan" | "kategori" | "guide" | "okand";
export const SOURCE_PAGES: SourcePage[] = ["kompassen", "vinsida", "topplistan", "kategori", "guide", "okand"];

export const SOURCE_LABEL: Record<SourcePage, string> = {
  kompassen: "Vinkompassen", vinsida: "Vinsida", topplistan: "Topp 100",
  kategori: "Kategorisida", guide: "Guide", okand: "Okänd",
};

/** "Vin & Natur" → "vin-natur", "Systembolaget" → "systembolaget". */
export function shopSlug(shop: string): string {
  return shop
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function asSourcePage(v: string | null | undefined): SourcePage {
  return SOURCE_PAGES.includes(v as SourcePage) ? (v as SourcePage) : "okand";
}

const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegrambot|discordbot|preview|headless|lighthouse|pingdom|uptime|curl|wget|python-requests|httpclient|axios|node-fetch|go-http-client|java\//i;

/** Kända robotar och förhandsvisningar. Klicket sparas men räknas inte. */
export function isBot(ua: string | null | undefined): boolean {
  if (!ua || ua.length < 10) return true;
  return BOT_RE.test(ua);
}

/** Grov enhetstyp, ingen fingeravtryckning. */
export function deviceType(ua: string | null | undefined): "mobil" | "surfplatta" | "dator" | "okand" {
  if (!ua) return "okand";
  if (/ipad|tablet|kindle|silk|playbook|(android(?!.*mobile))/i.test(ua)) return "surfplatta";
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return "mobil";
  return "dator";
}

/**
 * Lägger på spårningsparametrar till webbutiker. Till Systembolaget läggs
 * ingenting på (7.1). Befintliga parametrar i butikens URL behålls.
 */
export function outboundUrl(rawUrl: string, shop: string, campaign: string): string {
  if (shop === "Systembolaget") return rawUrl;
  try {
    const u = new URL(rawUrl);
    u.searchParams.set("utm_source", "naturvinstipset");
    u.searchParams.set("utm_medium", "referral");
    u.searchParams.set("utm_campaign", campaign);
    u.searchParams.set("ref", "naturvinstipset");
    return u.toString();
  } catch {
    return rawUrl;
  }
}

/** Kampanjnamn i utm_campaign: "vinkompassen" eller sidans namn. */
export function campaignFor(source: SourcePage): string {
  return source === "kompassen" ? "vinkompassen" : source;
}

/** Bara värdnamnet från en referrer, aldrig hela adressen. */
export function referrerHost(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try { return new URL(referrer).hostname.slice(0, 120) || null; } catch { return null; }
}

/** Kort, säker sökväg (utan frågeparametrar) för page_path. */
export function safePath(p: string | null | undefined): string | null {
  if (!p || !p.startsWith("/") || p.startsWith("//")) return null;
  return p.split(/[?#]/)[0].slice(0, 200);
}

/** Kompassens val som kort JSON-objekt från dess URL-parametrar (4.4). */
export function compassState(qs: string | null | undefined): Record<string, string> | null {
  if (!qs) return null;
  const allowed = ["farg", "budget", "aventyr", "mat", "syra", "fyllighet", "stravhet", "funk", "smak", "matval", "land", "druva", "likt", "butik"];
  const p = new URLSearchParams(qs.slice(0, 600));
  const out: Record<string, string> = {};
  for (const k of allowed) { const v = p.get(k); if (v) out[k] = v.slice(0, 80); }
  return Object.keys(out).length ? out : null;
}

/** Datumsträng YYYY-MM-DD i svensk tid (för dedupe per dag). */
export function swedishDay(d = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export type BuyContext = { source: SourcePage; path?: string; state?: string };

/** Intern länk via /go som loggar klicket och svarar 302 till butiken. */
export function goHref(wineSlug: string, shop: string, ctx: BuyContext): string {
  const q = new URLSearchParams({ src: ctx.source });
  if (ctx.path) q.set("p", ctx.path);
  if (ctx.state) q.set("k", ctx.state);
  return `/go/${shopSlug(shop)}/${encodeURIComponent(wineSlug)}?${q.toString()}`;
}

/** rel-attribut för köplänkar (7.1). sponsored slås på i admin när ett avtal finns. */
export function buyRel(shop: string, compensation: boolean): string {
  return compensation && shop !== "Systembolaget" ? "noopener sponsored nofollow" : "noopener nofollow";
}
