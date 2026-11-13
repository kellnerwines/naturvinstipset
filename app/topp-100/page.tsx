import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getWines, getRatings } from "@/lib/blob";
import { FILL_IMPORTERS, FILL_SHOP, topHundred } from "@/lib/topList";
import WineGrid from "@/components/WineGrid";
import HomeFaq from "@/components/HomeFaq";
import { OWN_IMPORT_HREF } from "@/components/OwnImportBadge";
import { retailerNote } from "@/lib/buyLinks";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, wineItemListJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Topp 100 – naturviner på Systembolaget och med hemleverans – Naturvinstipset" },
  alternates: { canonical: "/topp-100" },
  description:
    "Topp 100 naturviner: de bäst betygsatta på Systembolaget, kompletterade med naturviner med hemleverans från Flaskvis.",
  openGraph: {
    title: "Topp 100 – naturviner på Systembolaget och med hemleverans",
    description: "De bäst betygsatta naturvinerna på Systembolaget, kompletterade med naturviner med hemleverans.",
    url: "https://www.naturvinstipset.se/topp-100",
    images: [{ url: "/og-logo.png", width: 1200, height: 630, alt: "Naturvinstipset" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Topp 100 – naturviner på Systembolaget och med hemleverans",
  url: "https://www.naturvinstipset.se/topp-100",
  description: "De bäst betygsatta naturvinerna på Systembolaget, kompletterade med naturviner med hemleverans.",
  inLanguage: "sv",
};

export default async function Topp100Page() {
  const [wines, ratings] = await Promise.all([getWines(), getRatings()]);
  const entries = topHundred(wines, ratings);
  const sbCount = entries.filter((e) => !e.filler).length;

  const featured = entries.find(e => e.wine.wineOfMonth) ?? entries[0] ?? null;

  return (
    <div>
      <JsonLd data={[jsonLd, wineItemListJsonLd("Topp 100 naturviner", "/topp-100", entries.map((e) => e.wine)), breadcrumbJsonLd([{ name: "Topp 100", path: "/topp-100" }])]} />

      {/* ── Hero: bilden i ram, rubriken som en etikett och veckans vin som en dekal ── */}
      <section className="border-b-[3px] border-[var(--ink)]">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14 grid md:grid-cols-12 gap-8 md:gap-10 items-end">
          <div className="md:col-span-5 flex flex-col gap-6">
            <h1 className="text-[88px] md:text-[132px]">Topp 100</h1>
            <p className="text-lg leading-relaxed max-w-md">
              De bäst betygsatta naturvinerna på Systembolaget, kompletterade med naturviner som skickas hem från webbutiker.
            </p>
            <a href="#listan" className="self-start rounded-full bg-[var(--ink)] text-[var(--paper)] font-bold px-7 py-4 hover:bg-[var(--accent)] hover:text-[var(--fg)] transition-colors">
              Till listan
            </a>
          </div>
          <div className="md:col-span-7 relative">
            <div className="border-[3px] border-[var(--ink)] bg-[var(--surface)] aspect-[3/2] overflow-hidden">
              <Image src="/topp-100-hero.jpg" alt="Vänner skålar med naturvin i en vinbar" width={1200} height={800} priority className="w-full h-full object-cover" unoptimized />
            </div>
            {featured && (
              <Link
                href={`/viner/${featured.wine.slug}`}
                className="absolute -bottom-6 -left-4 md:-left-10 w-56 bg-[var(--accent)] text-[var(--fg)] border-[3px] border-[var(--ink)] p-4 rotate-[-3deg] hover:rotate-0 transition-transform"
              >
                <span className="block text-sm font-bold">{featured.wine.wineOfMonth ? "Månadens vin" : "Etta på listan"}</span>
                <span className="block font-[family-name:var(--font-display)] font-black uppercase text-3xl leading-none mt-1">{featured.wine.name}</span>
                <span className="block text-sm mt-1">{featured.wine.producer}</span>
                <span className="block text-sm font-bold mt-2">{featured.rating > 0 ? `${featured.rating.toFixed(1)} av 5` : ""}{featured.rating > 0 && featured.wine.price ? " · " : ""}{featured.wine.price ? `${featured.wine.price} kr` : ""}</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Wine grid ───────────────────────────────────────────────────────── */}
      <section id="listan" className="scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-16">
          <div className="flex items-baseline justify-between mb-8 border-b-[3px] border-[var(--ink)] pb-3">
            <h2 className="text-5xl md:text-6xl">Listan</h2>
            <p className="font-bold">{entries.length} viner</p>
          </div>
          <WineGrid entries={entries} />
          <p className="text-[11px] text-[var(--muted)] leading-snug mt-10 max-w-2xl">
            Listan börjar med de {sbCount} bäst betygsatta naturvinerna på Systembolaget.
            {entries.length > sbCount ? ` Resten av platserna fylls med naturviner med hemleverans från ${FILL_SHOP}, i importörsordningen ${FILL_IMPORTERS.join(", ").replace(/, ([^,]*)$/, " och $1")}. Kellner & Kellner drivs av sajtens grundare, och deras viner är märkta "Egen import".` : ""}{" "}
            {retailerNote([{ isSb: true }, ...(entries.length > sbCount ? [{ isSb: false }] : [])])}{" "}
            <Link href={OWN_IMPORT_HREF} className="underline underline-offset-2">Så rankar vi</Link>.
          </p>
        </div>
      </section>

      {/* ── CTA strip ──────────────────────────────────────────────────────── */}
      <section className="border-t-[3px] border-[var(--ink)] py-16 px-5">
        <div className="max-w-6xl mx-auto md:px-3 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h2 className="text-5xl md:text-6xl max-w-xl">Ny på naturvin?</h2>
          <Link href="/vad-ar-naturvin" className="shrink-0 rounded-full border-[3px] border-[var(--ink)] text-[var(--ink)] font-bold px-7 py-4 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">
            Så funkar naturvin
          </Link>
        </div>
      </section>

      <HomeFaq />
    </div>
  );
}
