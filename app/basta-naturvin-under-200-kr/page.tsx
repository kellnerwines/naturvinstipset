import type { Metadata } from "next";
import Link from "next/link";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import GuideWineList from "@/components/GuideWineList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bästa naturvinet under 200 kr på Systembolaget | Naturvinstipset",
  description:
    "Vi har samlat de bästa naturvinerna under 200 kr på Systembolaget. Handplockade av Sveriges seriösaste naturvinsimportörer — med direktlänkar och smakparametrar.",
  openGraph: {
    title: "Bästa naturvinet under 200 kr på Systembolaget",
    description:
      "De bästa naturvinerna under 200 kr på Systembolaget — handplockade med direktlänkar.",
    url: "https://www.naturvinstipset.se/basta-naturvin-under-200-kr",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Bästa naturvinet under 200 kr på Systembolaget",
  description:
    "De bästa naturvinerna under 200 kr på Systembolaget. Handplockade av Naturvinstipset.",
  url: "https://www.naturvinstipset.se/basta-naturvin-under-200-kr",
  publisher: { "@type": "Organization", name: "Naturvinstipset" },
};

export default async function BastaNaturvinUnder200Page() {
  const [wines, ratings] = await Promise.all([getWines(), getRatings()]);

  const filtered = wines
    .filter((w) => {
      if (!w.published) return false;
      if (!w.price) return false;
      const price = parseFloat(w.price.replace(",", "."));
      return !isNaN(price) && price < 200;
    })
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
            Bästa naturvinet under 200 kr
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            Naturvin behöver inte kosta skjortan. Vi har samlat de bästa
            naturvinerna under 200 kr på Systembolaget — handplockade av Sveriges
            seriösaste naturvinsimportörer och betygsatta av vår redaktion och
            community.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-sm text-[var(--muted)] mb-8">
          {filtered.length} vin{filtered.length !== 1 ? "er" : ""} under 200 kr
        </p>
        <GuideWineList wines={filtered} ratings={ratings} />

        <div className="mt-16 pt-12 border-t border-[var(--rule)]">
          <p className="text-sm font-semibold text-[var(--muted)] mb-4 uppercase tracking-wider">
            Fler guider
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/basta-naturvin-for-nyborjare" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">För nybörjare</Link>
            <Link href="/basta-orangevin-systembolaget" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Bästa orangevinet</Link>
            <Link href="/basta-pet-nat-systembolaget" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Bästa pét nat</Link>
            <Link href="/basta-naturvin-till-mat" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Till mat</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
