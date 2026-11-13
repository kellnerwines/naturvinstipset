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
  "Svara på tre snabba frågor och få naturvin som passar din smak, din budget och din mat. På Systembolaget eller från webbutiker med hemleverans, med smakprofiler, matförslag och köptips.";

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

      {/* ── Vinkompassen: videon ligger fast bakom rubriken och hela chatten medan man scrollar ──
          Videolagret är sticky och lika högt som skärmen; den negativa marginalen gör att innehållet
          börjar ovanpå det i stället för under det. Det släpper när sektionen tar slut. */}
      {/* clip-path klipper videon vid sektionens slut utan att bli en scrollcontainer (overflow-hidden skulle stoppa sticky). */}
      <section className="relative bg-[var(--hero-dark)]" style={{ clipPath: "inset(0)" }}>
        <div className="sticky top-[67px] h-[calc(100svh-67px)] -mb-[calc(100svh-67px)] overflow-hidden" aria-hidden="true">
          {/* Videon i gråskala under blått bläck, som ett tvåfärgstryck */}
          <div className="absolute inset-0" style={{ filter: "grayscale(1) contrast(1.15)" }}>
            <HeroVideo src="/hero-video.mp4" />
          </div>
          <div className="absolute inset-0 bg-[var(--ink)]" style={{ mixBlendMode: "multiply", opacity: 0.9 }} />
          <div className="absolute -right-32 top-16 w-72 h-72 md:-right-16 md:w-[420px] md:h-[420px] rounded-full bg-[var(--accent)] opacity-90" />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 pb-16 md:pb-24">
          <div className="min-h-[calc(52svh-3.5rem)] flex flex-col justify-end md:items-center md:text-center pt-12 pb-8 md:pb-10 text-[var(--paper)]">
            <h1 className="text-6xl md:text-[112px] mb-5 text-[var(--paper)]">
              Vilket naturvin passar dig?
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-xl">
              Bland {count} naturviner på Systembolaget eller från webbutiker med hemleverans. Tre frågor, sedan dina förslag.
            </p>
          </div>
          <Vinkompassen wines={compassWines} compensation={settings.retailerCompensation} />
        </div>
      </section>

      {/* ── SEO-text ─────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 pt-20 pb-6">
        <h2 className="text-4xl md:text-5xl mb-5">Naturvin på Systembolaget eller med hemleverans</h2>
        <div className="space-y-4 text-[17px] leading-relaxed text-[var(--fg)]">
          <p>
            Naturvinstipset hjälper dig hitta ett naturvin som passar din smak, din budget och maten du ska äta.
            Vi går igenom naturviner som du hämtar på Systembolaget eller får hem från {shops.size > 1 ? `${shops.size - 1} webbutiker` : "webbutiker"} med
            hemleverans. Webbutikerna säljer till svenska konsumenter med svensk alkoholskatt inräknad i priset.
          </p>
          <p>
            Varje vin har en smakprofil för syra, fyllighet, strävhet och funk, och ett matförslag skrivet utifrån
            trakten vinet kommer från. Kompassen väger ihop dina svar och visar hur väl varje vin matchar.
            Viner från egen import är märkta och får ingen fördel i kompassen. <Link href="/om-oss" className="underline underline-offset-4">Läs mer om oss</Link>.
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
          <div className="border-t-[3px] border-[var(--ink)] pt-8">
            <div className="flex items-baseline justify-between gap-4 mb-6">
              <h2 className="text-5xl">Topp 100</h2>
              <Link href="/topp-100" className="font-bold whitespace-nowrap text-[var(--ink)] border-b-2 border-[var(--ink)] hover:text-[var(--accent)] hover:border-[var(--accent)]">Hela listan</Link>
            </div>
            <ol className="divide-y-2 divide-[var(--ink)] border-y-[3px] border-[var(--ink)]">
              {top3.map(({ w, r }, i) => (
                <li key={w.id}>
                  <Link href={`/viner/${w.slug}`} className="flex items-baseline gap-4 py-4 group">
                    <span className="font-[family-name:var(--font-display)] font-black text-4xl leading-none text-[var(--accent)] w-8">{i + 1}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-[family-name:var(--font-display)] font-black uppercase text-2xl leading-none truncate text-[var(--ink)] group-hover:text-[var(--accent)]">{w.name}{w.year && w.year !== "NV" ? ` ${w.year}` : ""}</span>
                      <span className="block text-sm text-[var(--muted)] mt-1">{w.producer} · {w.wineType} · {w.country}</span>
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
