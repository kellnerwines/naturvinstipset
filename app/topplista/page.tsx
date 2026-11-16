import type { Metadata } from "next";
import Link from "next/link";
import { getWines, getRatings } from "@/lib/blob";
import { FILL_IMPORTERS, FILL_SHOP, topList, weekOf } from "@/lib/topList";
import WineGrid from "@/components/WineGrid";
import TopThree from "@/components/TopThree";
import HomeFaq from "@/components/HomeFaq";
import { OWN_IMPORT_HREF } from "@/components/OwnImportBadge";
import { retailerNote } from "@/lib/buyLinks";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, wineItemListJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Veckans topplista – naturviner på Systembolaget och med hemleverans – Naturvinstipset" },
  alternates: { canonical: "/topplista" },
  description:
    "Veckans topplista: de bäst betygsatta naturvinerna på Systembolaget, kompletterade med naturviner med hemleverans. Uppdateras varje måndag.",
  openGraph: {
    title: "Veckans topplista – naturviner på Systembolaget och med hemleverans",
    description: "De bäst betygsatta naturvinerna på Systembolaget, kompletterade med naturviner med hemleverans. Uppdateras varje måndag.",
    url: "https://www.naturvinstipset.se/topplista",
    images: [{ url: "/og-logo.png", width: 1200, height: 630, alt: "Naturvinstipset" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Veckans topplista – naturviner på Systembolaget och med hemleverans",
  url: "https://www.naturvinstipset.se/topplista",
  description: "De bäst betygsatta naturvinerna på Systembolaget, kompletterade med naturviner med hemleverans. Uppdateras varje måndag.",
  inLanguage: "sv",
};

export default async function TopplistaPage() {
  const [wines, ratings] = await Promise.all([getWines(), getRatings()]);
  const entries = topList(wines, ratings);
  const { week } = weekOf();
  const sbCount = entries.filter((e) => !e.filler).length;

  return (
    <div>
      <JsonLd data={[jsonLd, wineItemListJsonLd("Veckans topplista – naturviner", "/topplista", entries.map((e) => e.wine)), breadcrumbJsonLd([{ name: "Veckans topplista", path: "/topplista" }])]} />

      {/* ── Hero: fotot som bakgrund under blått bläck. Lågt nog att topp 3 syns direkt under. ── */}
      <section
        className="relative border-b-[3px] border-[var(--ink)] bg-[var(--ink)] bg-cover bg-[center_65%]"
        style={{ backgroundImage: "url(/topp-100-hero.jpg)" }}
      >
        <div className="absolute inset-0 bg-[var(--ink)] opacity-60" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-14 pb-8 md:pt-20 md:pb-12 min-h-[260px] md:min-h-[36svh] flex flex-col justify-end gap-4 text-[var(--paper)]">
          <p className="self-start bg-[var(--accent)] text-[var(--fg)] border-2 border-[var(--ink)] text-sm font-bold px-2 py-0.5">Vecka {week}</p>
          <h1 className="text-[64px] md:text-[128px] leading-[0.9] text-[var(--paper)]">Veckans topplista</h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-xl">
            De högst betygsatta naturvinerna på Systembolaget, och de bästa du kan få hem från webbutiker i Sverige. Ny lista varje måndag.
          </p>
        </div>
      </section>

      {/* ── Topp 3 ───────────────────────────────────────────────────────────── */}
      {entries.length ? (
        <section className="max-w-6xl mx-auto px-5 md:px-8 pt-8">
          <div className="flex items-baseline justify-between mb-6 border-b-[3px] border-[var(--ink)] pb-3">
            <h2 className="text-4xl">Topp 3</h2>
            <p className="font-bold">Vecka {week}</p>
          </div>
          <TopThree entries={entries} source="topplistan" path="/topplista" />
        </section>
      ) : null}

      {/* ── Resten av listan ────────────────────────────────────────────────── */}
      <section id="listan" className="scroll-mt-20">
        <div className="max-w-6xl mx-auto px-5 md:px-8 pt-14 pb-16">
          <div className="flex items-baseline justify-between mb-8 border-b-[3px] border-[var(--ink)] pb-3">
            <h2 className="text-4xl">Hela listan</h2>
            <p className="font-bold">{entries.length} viner</p>
          </div>
          <WineGrid entries={entries.slice(3)} rankOffset={3} />
          <p className="text-[11px] text-[var(--muted)] leading-snug mt-10 max-w-2xl">
            Listan börjar med de {sbCount} bäst betygsatta naturvinerna på Systembolaget.
            {entries.length > sbCount ? ` Resten av platserna fylls med naturviner med hemleverans från ${FILL_SHOP}, i importörsordningen ${FILL_IMPORTERS.join(", ").replace(/, ([^,]*)$/, " och $1")}. Kellner & Kellner drivs av sajtens grundare, och deras viner är märkta "Egen import".` : ""}{" "}
            Betygen räknas fram till måndag, så listan står still hela veckan. Bara viner med flaskbild är med.{" "}
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
