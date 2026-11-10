import type { Metadata } from "next";
import Link from "next/link";
import HeroVideo from "@/components/HeroVideo";
import { getWines, getRatings, combinedRating, getSettings, type Wine } from "@/lib/blob";
import { toCompassWine, type CompassWine } from "@/lib/compass/engine";
import Vinkompassen from "@/components/compass/Vinkompassen";
import HomeFaq from "@/components/HomeFaq";

export const dynamic = "force-dynamic";

const TITLE = "Naturvinstipset – hitta rätt naturvin på Systembolaget eller från webbutiker med hemleverans";
const DESCRIPTION =
  "Svara på fyra snabba frågor och få naturvin som passar din smak, din budget och din mat. På Systembolaget eller från webbutiker med hemleverans, med smakprofiler, matförslag och köptips.";

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
  description: "Hitta rätt naturvin på Systembolaget eller från webbutiker med hemleverans, med smakprofiler, matförslag och köptips.",
  inLanguage: "sv",
};

const atSystembolaget = (w: Wine) =>
  !!w.systembolagetUrl || (w.offers ?? []).some((o) => o.shop === "Systembolaget");

export default async function HomePage() {
  const [wines, ratings, settings] = await Promise.all([getWines(), getRatings(), getSettings()]);
  const compassWines = wines.map(toCompassWine).filter((w): w is CompassWine => !!w);
  const shops = new Set(compassWines.map((w) => w.shop));
  const count = compassWines.length;

  const top3 = wines
    .filter((w) => w.published && atSystembolaget(w))
    .map((w) => ({ w, r: combinedRating(w, ratings) }))
    .sort((a, b) => b.r - a.r)
    .slice(0, 3);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Vinkompassen: videon ligger fast bakom rubriken och hela chatten medan man scrollar ──
          Videolagret är sticky och lika högt som skärmen; den negativa marginalen gör att innehållet
          börjar ovanpå det i stället för under det. Det släpper när sektionen tar slut. */}
      {/* clip-path klipper videon vid sektionens slut utan att bli en scrollcontainer (overflow-hidden skulle stoppa sticky). */}
      <section className="relative bg-[var(--hero-dark)]" style={{ clipPath: "inset(0)" }}>
        <div className="sticky top-14 h-[calc(100svh-3.5rem)] -mb-[calc(100svh-3.5rem)] overflow-hidden" aria-hidden="true">
          <HeroVideo src="/hero-video.mp4" />
          <div className="absolute inset-0" style={{ background: "rgba(42,36,32,0.64)" }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 pb-16 md:pb-24">
          <div className="min-h-[calc(52svh-3.5rem)] flex flex-col justify-end pt-12 pb-8 md:pb-10 text-white">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 mb-3">Vinkompassen</p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-5">
              Vilket naturvin passar dig?
            </h1>
            <p className="text-base md:text-lg text-white/80 leading-relaxed max-w-xl">
              Bland {count} naturviner på Systembolaget eller från webbutiker med hemleverans. Tryck på dina svar eller skriv fritt.
              Efter fyra frågor får du ett förslag. Sedan kan du finjustera tills det sitter.
            </p>
          </div>
          {/* Halvgenomskinlig över videon; den grå texten görs mörkare här så att kontrasten räcker. */}
          <div
            className="bg-white/55 backdrop-blur-sm border border-white/40 rounded-xl px-4 pt-6 md:pt-8"
            style={{ "--muted": "rgba(13, 13, 13, 0.8)", "--faint": "rgba(13, 13, 13, 0.6)" } as React.CSSProperties}
          >
            <Vinkompassen wines={compassWines} compensation={settings.retailerCompensation} />
          </div>
        </div>
      </section>

      {/* ── SEO-text ─────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 pt-20 pb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Naturvin på Systembolaget eller från webbutiker med hemleverans</h2>
        <div className="space-y-4 text-[15px] leading-relaxed text-[var(--fg)] opacity-80">
          <p>
            Naturvinstipset hjälper dig hitta ett naturvin som passar din smak, din budget och maten du ska äta.
            Vi går igenom naturviner som du hämtar på Systembolaget eller får hem från {shops.size > 1 ? `${shops.size - 1} webbutiker` : "webbutiker"} med
            hemleverans. Webbutikerna säljer till svenska konsumenter med svensk alkoholskatt inräknad i priset.
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
