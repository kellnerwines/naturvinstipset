import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import WineGrid from "@/components/WineGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "De bästa naturvinerna på Systembolaget – Naturvinstipset",
  description:
    "Hitta ditt nästa naturvin med ärliga betyg och direktlänk till Systembolaget. Utvalda naturviner rankade av riktiga vinälskare — utan krångel.",
  openGraph: {
    title: "De bästa naturvinerna på Systembolaget – Naturvinstipset",
    description: "Hitta ditt nästa naturvin med ärliga betyg och direktlänk till Systembolaget. Utvalda naturviner rankade av riktiga vinälskare.",
    url: "https://www.naturvinstipset.se",
    images: [{ url: "/og-logo.png", width: 1200, height: 630, alt: "Naturvinstipset" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Naturvinstipset",
  url: "https://naturvinstipset.se",
  description: "De bästa naturvinerna på Systembolaget – rankade och betygsatta.",
  inLanguage: "sv",
};

export default async function HomePage() {
  const [wines, ratings] = await Promise.all([getWines(), getRatings()]);

  const published = wines.filter((w) => w.published);
  const entries = published
    .map((w) => {
      const wineRatings = ratings.filter((r) => r.wineId === w.id);
      return { wine: w, rating: combinedRating(w, ratings), count: wineRatings.length, likeCount: wineRatings.filter((r) => r.liked).length };
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 100);

  const featured = entries.find(e => e.wine.wineOfMonth) ?? entries[0] ?? null;

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background video */}
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover object-center">
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        <div className="relative flex flex-col md:flex-row min-h-[520px]">
          {/* Left: beige overlay + headline */}
          <div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-20" style={{ background: "rgba(42,36,32,0.50)" }}>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-5">
              De bästa naturvinerna på Systembolaget
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-white mb-6">
              Hitta vinet<br />
              du faktiskt{" "}
              <em style={{ fontFamily: "Georgia, serif", fontWeight: 700 }}>gillar</em>
            </h1>
            <p className="text-base text-white/55 max-w-sm leading-relaxed mb-8">
              Ärliga betyg och direktlänk till Systembolaget — utan krångel.
            </p>
            <a
              href="#listan"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-white text-[var(--hero-dark)] px-5 py-3 hover:opacity-80 transition-opacity w-fit"
            >
              Se listan →
            </a>
          </div>

          {/* Right: dark featured wine panel */}
          {featured && (
            <div className="w-full md:w-72 flex-shrink-0 flex flex-col justify-center px-8 py-12" style={{ background: "var(--hero-dark)" }}>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-6">Veckans vin</p>
              {featured.wine.primaryImageUrl && (
                <div className="mb-5 flex justify-center">
                  <Image
                    src={featured.wine.primaryImageUrl}
                    alt={`${featured.wine.name}${featured.wine.year ? ` ${featured.wine.year}` : ""}${featured.wine.wineType ? ` ${featured.wine.wineType.toLowerCase()} naturvin` : " naturvin"}${featured.wine.country ? ` från ${featured.wine.country}` : ""}`}
                    width={80}
                    height={120}
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <p className="text-[10px] tracking-[0.15em] uppercase text-white/40 mb-1">{featured.wine.producer}</p>
              <p className="text-sm font-bold text-white mb-3 leading-snug">{featured.wine.name}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                  {featured.rating.toFixed(1)}
                </span>
                {featured.wine.price && (
                  <span className="text-sm text-white/50">{featured.wine.price} kr</span>
                )}
              </div>
              <Link
                href={`/viner/${featured.wine.slug}`}
                className="mt-6 text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 border-b border-white/20 pb-px hover:text-white/90 transition-colors w-fit"
              >
                Läs mer →
              </Link>
            </div>
          )}
        </div>

        {/* Wavy bottom */}
        <div className="absolute bottom-0 left-0 right-0 leading-[0]">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full block" style={{ height: "60px" }}>
            <path d="M0,60 L0,35 C60,25 130,15 240,22 C340,28 390,42 490,36 C590,30 640,18 760,23 C870,28 920,38 1020,34 C1110,30 1170,20 1280,26 C1360,30 1410,38 1440,34 L1440,60 Z" fill="#f0ebe2" />
          </svg>
        </div>
      </section>

      {/* ── Wine grid ───────────────────────────────────────────────────────── */}
      <section id="listan" className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--fg)]" style={{ fontFamily: "Georgia, serif" }}>
              Viner
            </h2>
            <p className="text-xs text-[var(--faint)] tracking-widest uppercase">{published.length} viner</p>
          </div>
          <WineGrid entries={entries} />
        </div>
      </section>

      {/* ── CTA strip ──────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--rule)] py-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-2">Ny på naturvin?</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--fg)] leading-tight">
              Vi förklarar allt du behöver veta.
            </h2>
          </div>
          <a
            href="/vad-ar-naturvin"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-[var(--fg)] border border-[var(--fg)] px-5 py-3 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
          >
            Läs vår guide →
          </a>
        </div>
      </section>
    </div>
  );
}
