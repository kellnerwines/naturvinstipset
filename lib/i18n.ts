// Engelska finns för startsidan och de fasta sidorna, under /en. Övriga sidor är bara på svenska.
// Sidorna ligger i app/(sv) och app/en, med var sin rotlayout.

export type Lang = "sv" | "en";

/** Svenska sökvägar som har en engelsk version under /en. */
export const EN_PAGES = ["/", "/vad-ar-naturvin", "/om-listan", "/om-oss"];

export const langOf = (pathname: string): Lang => (pathname === "/en" || pathname.startsWith("/en/") ? "en" : "sv");

/** Den svenska sökvägen för en adress: "/en/om-oss" -> "/om-oss", "/en" -> "/". */
export const svPath = (pathname: string) => (langOf(pathname) === "en" ? pathname.slice(3) || "/" : pathname);

/** Adressen på det andra språket. Sidor utan engelsk version leder till engelska startsidan. */
export function otherLang(pathname: string): string {
  const path = svPath(pathname);
  if (langOf(pathname) === "en") return path;
  return EN_PAGES.includes(path) ? (path === "/" ? "/en" : `/en${path}`) : "/en";
}

export const tr = (lang: Lang, sv: string, en: string) => (lang === "en" ? en : sv);

/** Canonical och hreflang för en sida som finns på båda språken. */
export function langAlternates(lang: Lang, path: string) {
  const en = path === "/" ? "/en" : `/en${path}`;
  return { canonical: lang === "en" ? en : path, languages: { sv: path, en, "x-default": path } };
}

// Vintyper och länder står på svenska i datan. Bara visningen på de engelska sidorna översätts.
const WORDS_EN: Record<string, string> = {
  Rött: "Red", Vitt: "White", Orange: "Orange", Rosé: "Rosé", Mousserande: "Sparkling", "Pét Nat": "Pét-nat", Bubbel: "Sparkling",
  Frankrike: "France", Italien: "Italy", Spanien: "Spain", Österrike: "Austria", Ungern: "Hungary", Armenien: "Armenia",
  Tjeckien: "Czechia", Slovakien: "Slovakia", Slovenien: "Slovenia", Nederländerna: "Netherlands", Australien: "Australia",
  Tyskland: "Germany", Grekland: "Greece", Sverige: "Sweden", Georgien: "Georgia", Sydafrika: "South Africa",
};
export const wordEn = (s: string) => WORDS_EN[s] ?? s;
