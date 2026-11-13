import type { Metadata } from "next";
import Link from "next/link";
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


  return (
    <div>
      <JsonLd data={[jsonLd, wineItemListJsonLd("Topp 100 naturviner", "/topp-100", entries.map((e) => e.wine)), breadcrumbJsonLd([{ name: "Topp 100", path: "/topp-100" }])]} />

      {/* ── Hero: fotot som bakgrund under blått bläck. Lågt nog att listan syns direkt under. ── */}
      <section
        className="relative border-b-[3px] border-[var(--ink)] bg-[var(--ink)] bg-cover bg-center"
        style={{ backgroundImage: "url(/topp-100-hero.jpg)" }}
      >
        <div className="absolute inset-0 bg-[var(--ink)] opacity-60" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-16 pb-10 md:pt-24 md:pb-14 min-h-[300px] md:min-h-[42svh] flex flex-col justify-end gap-5 text-[var(--paper)]">
          <h1 className="text-[84px] md:text-[150px] text-[var(--paper)]">Topp 100</h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-xl">
            De högst betygsatta naturvinerna på Systembolaget, och de bästa du kan få hem från webbutiker i Sverige.
          </p>
        </div>
      </section>

      {/* ── Wine grid ───────────────────────────────────────────────────────── */}
      <section id="listan" className="scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 pb-16">
          <div className="flex items-baseline justify-between mb-8 border-b-[3px] border-[var(--ink)] pb-3">
            <h2 className="text-4xl">Listan</h2>
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
