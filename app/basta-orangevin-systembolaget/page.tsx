import type { Metadata } from "next";
import Link from "next/link";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import GuideWineList from "@/components/GuideWineList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bästa orangevinet på Systembolaget | Naturvinstipset",
  description:
    "De bästa orangevinerna på Systembolaget — vitt vin gjort som rött, med djup och komplexitet. Handplockade av Naturvinstipset med direktlänkar.",
  openGraph: {
    title: "Bästa orangevinet på Systembolaget",
    description:
      "De bästa orangevinerna på Systembolaget. Handplockade av Naturvinstipset.",
    url: "https://www.naturvinstipset.se/basta-orangevin-systembolaget",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Bästa orangevinet på Systembolaget",
  description:
    "De bästa orangevinerna på Systembolaget. Handplockade av Naturvinstipset.",
  url: "https://www.naturvinstipset.se/basta-orangevin-systembolaget",
  publisher: { "@type": "Organization", name: "Naturvinstipset" },
};

export default async function BastaOrangevinPage() {
  const [wines, ratings] = await Promise.all([getWines(), getRatings()]);

  const filtered = wines
    .filter((w) => w.published && w.wineType === "Orange")
    .sort((a, b) => combinedRating(b, ratings) - combinedRating(a, ratings));

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
            Bästa orangevinet på Systembolaget
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            Orange vin är vitt vin gjort som rött — skalen är kvar under
            jäsningen och ger vinet sin karakteristiska färg och komplexa
            smakprofil. Passar utmärkt till kryddiga rätter, ostar och
            grönsaker. Här är de bästa orangevinerna på Systembolaget enligt
            Naturvinstipset.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-sm text-[var(--muted)] mb-8">
          {filtered.length} orange vin{filtered.length !== 1 ? "er" : ""} på listan
        </p>
        <GuideWineList wines={filtered} ratings={ratings} />

        <div className="mt-16 pt-12 border-t border-[var(--rule)]">
          <p className="text-sm font-semibold text-[var(--muted)] mb-4 uppercase tracking-wider">
            Fler guider
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/basta-naturvin-under-200-kr" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Under 200 kr</Link>
            <Link href="/basta-naturvin-for-nyborjare" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">För nybörjare</Link>
            <Link href="/basta-pet-nat-systembolaget" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Bästa pét nat</Link>
            <Link href="/basta-naturvin-till-mat" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Till mat</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
