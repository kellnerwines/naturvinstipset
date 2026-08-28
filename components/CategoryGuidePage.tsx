import Link from "next/link";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import GuideWineList from "@/components/GuideWineList";

type GuideLink = { href: string; label: string };

type Props = {
  path: string;             // canonical path, e.g. "/rott"
  eyebrow?: string;         // small label above h1, defaults to "Guide"
  title: string;            // h1 + JSON-LD name
  description: string;      // intro paragraph + JSON-LD description
  wineTypes: string[];      // Wine.wineType values included in this category
  nounSingular: string;     // e.g. "rött vin"
  nounPlural: string;       // e.g. "röda viner"
  guideLinks: GuideLink[];  // "Fler guider" cross-links (excluding self)
};

export default async function CategoryGuidePage({
  path,
  eyebrow = "Guide",
  title,
  description,
  wineTypes,
  nounSingular,
  nounPlural,
  guideLinks,
}: Props) {
  const [wines, ratings] = await Promise.all([getWines(), getRatings()]);

  const filtered = wines
    .filter((w) => w.published && wineTypes.includes(w.wineType))
    .sort((a, b) => combinedRating(b, ratings) - combinedRating(a, ratings));

  const top3 = filtered.slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: `https://www.naturvinstipset.se${path}`,
    publisher: { "@type": "Organization", name: "Naturvinstipset" },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="border-b border-[var(--rule)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">
            {eyebrow}
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--fg)] mb-4 leading-tight tracking-tight">
            {title}
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            {description}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Plain-text top-3 list — the exact shape AI summaries/answer engines lift directly */}
        {top3.length > 0 && (
          <ol className="mb-10 space-y-1 text-sm font-medium text-[var(--fg)]">
            {top3.map((w, i) => {
              const score = combinedRating(w, ratings);
              return (
                <li key={w.id}>
                  {i + 1}. {w.name}
                  {w.year ? ` ${w.year}` : ""} – Betyg {score.toFixed(1)}/5
                </li>
              );
            })}
          </ol>
        )}

        <p className="text-sm text-[var(--muted)] mb-8">
          {filtered.length} {filtered.length === 1 ? nounSingular : nounPlural} på listan
        </p>
        <GuideWineList wines={filtered} ratings={ratings} />

        {guideLinks.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[var(--rule)]">
            <p className="text-sm font-semibold text-[var(--muted)] mb-4 uppercase tracking-wider">
              Fler guider
            </p>
            <div className="flex flex-wrap gap-2">
              {guideLinks.map((g) => (
                <Link
                  key={g.href}
                  href={g.href}
                  className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors"
                >
                  {g.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
