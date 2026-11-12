// Gemensam strukturerad data (schema.org) för sajten, SEO-AIO-AUDIT.md etapp A.
// Allt byggs ur samma data som syns på sidan; inget hittas på.

export const SITE = "https://www.naturvinstipset.se";
const ORG_ID = `${SITE}/#organization`;
const SITE_ID = `${SITE}/#website`;

/** Naturvinstipset som organisation och webbplats, en gång i layouten. */
export const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Naturvinstipset",
    url: SITE,
    logo: `${SITE}/logo.png`,
    email: "hej@naturvinstipset.se",
    description: "Svensk guide till naturvin på Systembolaget och från webbutiker med hemleverans, med Vinkompassen, Topp 100 och naturvinsbarer i hela Sverige.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: "Naturvinstipset",
    url: SITE,
    inLanguage: "sv-SE",
    publisher: { "@id": ORG_ID },
  },
];

/** Hänvisning till organisationen i andra scheman. */
export const publisherRef = { "@id": ORG_ID };

/** Brödsmulor: Start först, sedan sidorna i ordning. Sista posten är sidan själv. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Start", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}

/** Rankad lista med viner, i samma ordning som på sidan. */
export function wineItemListJsonLd(name: string, path: string, wines: { slug: string; name: string; year?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url: `${SITE}${path}`,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: wines.length,
    itemListElement: wines.map((w, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: w.year && w.year !== "NV" ? `${w.name} ${w.year}` : w.name,
      url: `${SITE}/viner/${w.slug}`,
    })),
  };
}

/** FAQPage ur samma frågor och svar som visas på sidan. */
export function faqJsonLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}
