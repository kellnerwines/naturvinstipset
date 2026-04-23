import type { Metadata } from "next";
import Image from "next/image";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import WineGrid from "@/components/WineGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "De bästa naturvinerna på Systembolaget – Naturvinstipset",
  description:
    "Hitta ditt nästa naturvin med ärliga betyg och direktlänk till Systembolaget. Utvalda naturviner rankade av riktiga vinälskare — utan krångel.",
  openGraph: { url: "https://naturvinstipset.se" },
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
      return { wine: w, rating: combinedRating(w, ratings), count: wineRatings.length };
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 100);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero with parallax background ──────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{
          backgroundImage: "url('/vineyard-hero.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          backgroundAttachment: "fixed",
        }}>
        {/* Darkening overlay */}
        <div className="absolute inset-0" style={{ background: "rgba(13,13,13,0.62)" }} />
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-32 flex flex-col md:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-5">
              De bästa naturvinerna på Systembolaget
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight text-white mb-6">
              Utvalda.<br />Betygsatta.<br />Något för alla.
            </h1>
            <p className="text-base text-white/55 max-w-sm leading-relaxed mb-8">
              Hitta ditt nästa naturvin — med ärliga betyg och direktlänk till Systembolaget.
            </p>
            <a
              href="#listan"
              className="inline-flex items-center gap-2 text-sm font-semibold bg-white text-[var(--fg)] px-5 py-3 hover:opacity-90 transition-opacity"
            >
              Se listan →
            </a>
          </div>

          {/* Illustration */}
          <div className="shrink-0 flex items-center justify-center md:justify-end">
            <Image
              src="/logo.png"
              alt="Naturvinstipset"
              width={160}
              height={241}
              unoptimized
              className="opacity-80 drop-shadow-2xl"
              style={{ filter: "brightness(0) invert(1) opacity(0.55)" }}
            />
          </div>
        </div>

        {/* Wavy bottom — transitions to page background */}
        <div className="absolute bottom-0 left-0 right-0 leading-[0]">
          <svg
            viewBox="0 0 1440 90"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full block"
            style={{ height: "90px" }}
          >
            <path
              d="M0,90 L0,52 C60,38 130,22 240,32 C340,41 390,60 490,52 C590,44 640,28 760,33 C870,38 920,54 1020,50 C1110,46 1170,32 1280,38 C1360,43 1410,55 1440,50 L1440,90 Z"
              fill="#faf8f4"
            />
          </svg>
        </div>
      </section>

      {/* ── Wine grid ───────────────────────────────────────────────────────── */}
      <section id="listan" className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase text-[var(--fg)]">
            Viner
          </h2>
          <p className="text-xs text-[var(--faint)] tracking-widest uppercase">{published.length} viner</p>
        </div>

        <WineGrid entries={entries} />
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
