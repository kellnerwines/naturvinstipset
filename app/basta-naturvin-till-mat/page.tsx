import type { Metadata } from "next";
import Link from "next/link";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import GuideWineList from "@/components/GuideWineList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bästa naturvinet till mat på Systembolaget | Naturvinstipset",
  description:
    "Vilket naturvin passar till mat? Vi har samlat de bästa matvinerna bland naturviner på Systembolaget — med smakparametrar och direktlänkar.",
  openGraph: {
    title: "Bästa naturvinet till mat på Systembolaget",
    description:
      "De bästa naturvinerna till mat på Systembolaget. Handplockade av Naturvinstipset.",
    url: "https://www.naturvinstipset.se/basta-naturvin-till-mat",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Bästa naturvinet till mat på Systembolaget",
  description:
    "De bästa naturvinerna till mat på Systembolaget. Handplockade av Naturvinstipset.",
  url: "https://www.naturvinstipset.se/basta-naturvin-till-mat",
  publisher: { "@type": "Organization", name: "Naturvinstipset" },
};

export default async function BastaNaturvinTillMatPage() {
  const [wines, ratings] = await Promise.all([getWines(), getRatings()]);

  // Matviner: hög fyllighet (≥3) eller hög syra (≥3) — viner med substans
  const filtered = wines
    .filter(
      (w) =>
        w.published &&
        ((w.fyllighet != null && w.fyllighet >= 3) ||
          (w.syra != null && w.syra >= 3))
    )
    .sort((a, b) => combinedRating(b, ratings) - combinedRating(a, ratings));

  const sections = [
    {
      title: "Vita och orange viner till mat",
      wines: filtered.filter(
        (w) => w.wineType === "Vitt" || w.wineType === "Orange"
      ),
      tip: "Vitt vin med hög syra är klassiskt till fisk, skaldjur och ljusa rätter. Orange vin är fantastiskt till kryddiga rätter, ostar och grönsaker.",
    },
    {
      title: "Röda viner till mat",
      wines: filtered.filter((w) => w.wineType === "Rött"),
      tip: "Rött vin passar till kött och mörkare rätter. Välj fyllighet efter rätten — ett lätt rött med låg strävhet kan serveras kylt och fungerar nästan som ett vitt.",
    },
    {
      title: "Mousserande till mat",
      wines: filtered.filter(
        (w) => w.wineType === "Pét Nat" || w.wineType === "Mousserande"
      ),
      tip: "Mousserande naturvin fungerar till nästan allt — aperitif, förrätt, fisk och lättare rätter.",
    },
  ].filter((s) => s.wines.length > 0);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="border-b border-[var(--rule)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">
            Guide
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--fg)] mb-4 leading-tight tracking-tight">
            Bästa naturvinet till mat
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            Grundregeln är enkel: vitt och lätt till ljusare rätter, rött och
            fylligare till mörkare rätter. Men naturvin är generöst — kolla
            fyllighet och strävhet på vinkortet så hittar du rätt match.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-16">
        {sections.length > 0 ? (
          sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-[var(--fg)] mb-2">
                {section.title}
              </h2>
              <p className="text-sm text-[var(--muted)] mb-6">{section.tip}</p>
              <GuideWineList wines={section.wines} ratings={ratings} />
            </div>
          ))
        ) : (
          <GuideWineList wines={filtered} ratings={ratings} />
        )}

        <div className="pt-12 border-t border-[var(--rule)]">
          <p className="text-sm font-semibold text-[var(--muted)] mb-4 uppercase tracking-wider">
            Fler guider
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/basta-naturvin-under-200-kr" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Under 200 kr</Link>
            <Link href="/basta-naturvin-for-nyborjare" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">För nybörjare</Link>
            <Link href="/basta-orangevin-systembolaget" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Bästa orangevinet</Link>
            <Link href="/basta-pet-nat-systembolaget" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Bästa pét nat</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
