import type { Metadata } from "next";
import Link from "next/link";
import { getWines, getRatings, combinedRating, type Wine } from "@/lib/blob";
import { toCompassWine, type CompassWine } from "@/lib/compass/engine";
import Vinkompassen from "@/components/compass/Vinkompassen";
import HomeFaq from "@/components/HomeFaq";

export const dynamic = "force-dynamic";

const TITLE = "Naturvinstipset – hitta rätt naturvin på Systembolaget och i svenska webbutiker";
const DESCRIPTION =
  "Svara på fyra snabba frågor och få naturvin som passar din smak, din budget och din mat. Viner från Systembolaget och svenska webbutiker, med smakprofiler, matförslag och köptips.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.naturvinstipset.se",
    images: [{ url: "/og-logo.png", width: 1200, height: 630, alt: "Naturvinstipset" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Naturvinstipset",
  url: "https://naturvinstipset.se",
  description: "Hitta rätt naturvin på Systembolaget och i svenska webbutiker, med smakprofiler, matförslag och köptips.",
  inLanguage: "sv",
};

const atSystembolaget = (w: Wine) =>
  !!w.systembolagetUrl || (w.offers ?? []).some((o) => o.shop === "Systembolaget");

export default async function HomePage() {
  const [wines, ratings] = await Promise.all([getWines(), getRatings()]);
  const compassWines = wines.map(toCompassWine).filter((w): w is CompassWine => !!w);
  const shops = new Set(compassWines.map((w) => w.shop));
  const count = Math.floor(compassWines.length / 50) * 50;

  const top3 = wines
    .filter((w) => w.published && atSystembolaget(w))
    .map((w) => ({ w, r: combinedRating(w, ratings) }))
    .sort((a, b) => b.r - a.r)
    .slice(0, 3);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Vinkompassen ─────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 pt-10 md:pt-16">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-3">Vinkompassen</p>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.08] tracking-tight mb-4">
          Vilket naturvin passar dig?
        </h1>
        <p className="text-base text-[var(--muted)] leading-relaxed mb-10 max-w-xl">
          Bland över {count} naturviner på Systembolaget och i svenska webbutiker. Tryck på dina svar eller skriv fritt.
          Efter fyra frågor får du ett förslag, sedan kan du borra så djupt du vill.
        </p>
        <Vinkompassen wines={compassWines} />
      </section>

      {/* ── SEO-text ─────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 pt-20 pb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Naturvin på Systembolaget och i svenska webbutiker</h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-[var(--fg)] opacity-80">
          <p>
            Naturvinstipset hjälper dig hitta ett naturvin som passar din smak, din budget och maten du ska äta.
            Vi går igenom naturviner från Systembolaget och från {shops.size > 1 ? `${shops.size - 1} svenska webbutiker` : "svenska webbutiker"} som
            säljer till svenska konsumenter med svensk alkoholskatt inräknad i priset.
          </p>
          <p>
            Varje vin har en smakprofil för syra, fyllighet, strävhet och funk, och ett matförslag skrivet utifrån
            trakten vinet kommer från. Kompassen väger ihop dina svar och visar hur väl varje vin matchar.
            Viner från egen import är märkta och får ingen fördel i rankningen. <Link href="/om-oss" className="underline underline-offset-4">Läs mer om oss</Link>.
          </p>
          <p>
            Ny på naturvin? Börja med <Link href="/vad-ar-naturvin" className="underline underline-offset-4">vår guide om vad naturvin är</Link>,
            eller bläddra bland <Link href="/orange" className="underline underline-offset-4">orangevin</Link>,{" "}
            <Link href="/pet-nat" className="underline underline-offset-4">pét-nat</Link>,{" "}
            <Link href="/rott" className="underline underline-offset-4">rött</Link> och{" "}
            <Link href="/vitt" className="underline underline-offset-4">vitt</Link>.
          </p>
        </div>
      </section>

      {/* ── Topp 100-teaser ──────────────────────────────────────────────── */}
      {top3.length ? (
        <section className="max-w-2xl mx-auto px-4 py-12">
          <div className="border-t border-[var(--rule)] pt-10">
            <div className="flex items-baseline justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Topp 100 på Systembolaget</h2>
              <Link href="/topp-100" className="text-sm font-semibold whitespace-nowrap underline underline-offset-4">Se hela listan →</Link>
            </div>
            <ol className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
              {top3.map(({ w, r }, i) => (
                <li key={w.id}>
                  <Link href={`/viner/${w.slug}`} className="flex items-baseline gap-4 py-4 hover:opacity-60 transition-opacity">
                    <span className="text-sm text-[var(--muted)] w-5">{i + 1}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold truncate">{w.name}{w.year && w.year !== "NV" ? ` ${w.year}` : ""}</span>
                      <span className="block text-xs text-[var(--muted)]">{w.producer} · {w.wineType} · {w.country}</span>
                    </span>
                    <span className="text-sm font-bold">{r.toFixed(1)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <HomeFaq />
    </div>
  );
}
