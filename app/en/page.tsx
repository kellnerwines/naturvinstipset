import type { Metadata } from "next";
import Link from "next/link";
import HeroVideo from "@/components/HeroVideo";
import { getWines, getRatings, combinedRating, getSettings, type Wine } from "@/lib/blob";
import { toCompassWine, type CompassWine } from "@/lib/compass/engine";
import Vinkompassen from "@/components/compass/Vinkompassen";
import HomeFaq from "@/components/HomeFaq";
import { langAlternates, wordEn } from "@/lib/i18n";

// Engelska startsidan. Vinkompassen är på svenska; texterna runt den är översatta från app/(sv)/page.tsx.
export const dynamic = "force-dynamic";

const TITLE = "Naturvinstipset – find the right natural wine at Systembolaget or from online shops with home delivery";
const DESCRIPTION =
  "Answer three quick questions and get natural wines that suit your taste, your budget and your food. At Systembolaget or from online shops with home delivery, with taste profiles, food pairings and buying tips.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: langAlternates("en", "/"),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://www.naturvinstipset.se/en",
    images: [{ url: "/og-logo.png", width: 1200, height: 630, alt: "Naturvinstipset" }],
  },
};

const atSystembolaget = (w: Wine) =>
  !!w.systembolagetUrl || (w.offers ?? []).some((o) => o.shop === "Systembolaget");

const link = "underline underline-offset-4";

export default async function EnglishHomePage() {
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
      {/* Samma upplägg som den svenska startsidan: videon ligger fast bakom rubriken och kompassen. */}
      <section className="relative bg-[var(--hero-dark)]" style={{ clipPath: "inset(0)" }}>
        <div className="sticky top-[67px] h-[calc(100svh-67px)] -mb-[calc(100svh-67px)] overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0" style={{ filter: "grayscale(1) contrast(1.15)" }}>
            <HeroVideo src="/hero-video.mp4" />
          </div>
          <div className="absolute inset-0 bg-[var(--ink)]" style={{ mixBlendMode: "multiply", opacity: 0.9 }} />
          <div className="absolute -right-32 top-16 w-72 h-72 md:-right-16 md:w-[420px] md:h-[420px] rounded-full bg-[var(--accent)] opacity-90" />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 pb-16 md:pb-24">
          <div className="min-h-[calc(52svh-3.5rem)] flex flex-col justify-end items-center text-center pt-12 pb-8 md:pb-10 text-[var(--paper)]">
            <h1 className="text-6xl md:text-[112px] mb-5 text-[var(--paper)]">
              Which natural wine suits you?
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-xl">
              Among {count} natural wines at Systembolaget or from online shops with home delivery. Three questions, then your suggestions.
            </p>
            <p lang="en" className="mt-5 text-[15px] leading-relaxed max-w-xl bg-[var(--paper)] text-[var(--fg)] border-[3px] border-[var(--ink)] px-4 py-3 text-left">
              The Wine Compass is in Swedish for now. The first question is the colour: Rött is red, Vitt is white and
              Bubbel is sparkling. Then budget, and whether the wine should go with food.
            </p>
          </div>
          <div lang="sv">
            <Vinkompassen wines={compassWines} compensation={settings.retailerCompensation} />
          </div>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 pt-20 pb-6">
        <h2 className="text-4xl md:text-5xl mb-5">Natural wine at Systembolaget or with home delivery</h2>
        <div className="space-y-4 text-[17px] leading-relaxed text-[var(--fg)]">
          <p>
            Naturvinstipset helps you find a natural wine that suits your taste, your budget and the food you are going to eat.
            We go through natural wines that you collect at Systembolaget or get delivered from {shops.size > 1 ? `${shops.size - 1} online shops` : "online shops"} with
            home delivery. The online shops sell to Swedish consumers with Swedish alcohol tax included in the price.
          </p>
          <p>
            Every wine has a taste profile for acidity, body, tannin and funk, and a food pairing written with the region
            the wine comes from in mind. The compass weighs up your answers and shows how well each wine matches.
            Wines from our own import are labelled and get no advantage in the compass. <Link href="/en/om-oss" className={link}>Read more about us</Link>.
          </p>
          <p>
            New to natural wine? Start with <Link href="/en/vad-ar-naturvin" className={link}>our guide to what natural wine is</Link>,
            or browse (in Swedish) <Link href="/orange" hrefLang="sv" className={link}>orange wine</Link>,{" "}
            <Link href="/bubbel" hrefLang="sv" className={link}>natural wine with bubbles</Link>,{" "}
            <Link href="/rott" hrefLang="sv" className={link}>red</Link> and{" "}
            <Link href="/vitt" hrefLang="sv" className={link}>white</Link>.
          </p>
        </div>
      </section>

      {top3.length ? (
        <section className="max-w-2xl mx-auto px-4 py-12">
          <div className="border-t-[3px] border-[var(--ink)] pt-8">
            <div className="flex items-baseline justify-between gap-4 mb-6">
              <h2 className="text-5xl">Top 100</h2>
              <Link href="/topp-100" hrefLang="sv" className="font-bold whitespace-nowrap text-[var(--ink)] border-b-2 border-[var(--ink)] hover:text-[var(--accent)] hover:border-[var(--accent)]">Full list (in Swedish)</Link>
            </div>
            <ol className="divide-y-2 divide-[var(--ink)] border-y-[3px] border-[var(--ink)]">
              {top3.map(({ w, r }, i) => (
                <li key={w.id}>
                  <Link href={`/viner/${w.slug}`} hrefLang="sv" className="flex items-baseline gap-4 py-4 group">
                    <span className="font-[family-name:var(--font-display)] font-black text-4xl leading-none text-[var(--accent)] w-8">{i + 1}</span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-[family-name:var(--font-display)] font-black uppercase text-2xl leading-none truncate text-[var(--ink)] group-hover:text-[var(--accent)]">{w.name}{w.year && w.year !== "NV" ? ` ${w.year}` : ""}</span>
                      <span className="block text-sm text-[var(--muted)] mt-1">{w.producer} · {wordEn(w.wineType)} · {wordEn(w.country)}</span>
                    </span>
                    <span className="text-sm font-bold">{r.toFixed(1)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <HomeFaq lang="en" />
    </div>
  );
}
