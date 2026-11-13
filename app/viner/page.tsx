import type { Metadata } from "next";
import Link from "next/link";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import WineLibrary from "@/components/WineLibrary";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, publisherRef, SITE, wineItemListJsonLd } from "@/lib/seo";
import { shopCounts, shopsOf, SHOPS } from "@/lib/shops";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Alla naturviner på Systembolaget och med hemleverans",
  description: "Hela biblioteket: alla naturviner som går att köpa i Sverige just nu. Filtrera på butik, färg, land och pris, eller sök på vin, producent och druva.",
  alternates: { canonical: "/viner" },
  openGraph: {
    title: "Alla naturviner – Naturvinstipset",
    description: "Alla naturviner som går att köpa i Sverige just nu, på Systembolaget och från webbutiker med hemleverans.",
    url: `${SITE}/viner`,
  },
};

const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function LibraryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const [all, ratings] = await Promise.all([getWines(), getRatings()]);
  const wines = all
    .filter((w) => w.published && shopsOf(w).length)
    .sort((a, b) => combinedRating(b, ratings) - combinedRating(a, ratings));
  const counts = shopCounts(wines);

  return (
    <div>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "CollectionPage", name: "Alla naturviner", url: `${SITE}/viner`, publisher: publisherRef },
        wineItemListJsonLd("Alla naturviner", "/viner", wines.slice(0, 50)),
        breadcrumbJsonLd([{ name: "Alla viner", path: "/viner" }]),
      ]} />
      <div className="border-b-[3px] border-[var(--ink)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="inline-block self-start bg-[var(--accent)] text-[var(--fg)] border-2 border-[var(--ink)] text-sm font-bold px-2 py-0.5 mb-4">Biblioteket</p>
          <h1 className="text-5xl md:text-7xl mb-4">Alla naturviner</h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            Alla {wines.length} naturviner som går att köpa i Sverige just nu, på Systembolaget eller från webbutiker med hemleverans. Listan är sorterad efter betyg. Viner som är slut överallt visas inte.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {SHOPS.filter((s) => counts.get(s.name)).map((s) => (
              <Link key={s.slug} href={`/butiker/${s.slug}`} className="text-sm font-bold border-2 border-[var(--ink)] text-[var(--ink)] px-4 py-2 rounded-full hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">
                {s.name} <span className="text-[var(--muted)]">{counts.get(s.name)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <WineLibrary
          wines={wines}
          ratings={ratings}
          initial={{ butik: pick(sp.butik), farg: pick(sp.farg), land: pick(sp.land), pris: pick(sp.pris), q: pick(sp.q), sort: pick(sp.sort) || "betyg" }}
        />
      </div>
    </div>
  );
}
