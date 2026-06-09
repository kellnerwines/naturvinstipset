import type { Metadata } from "next";
import Link from "next/link";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import GuideWineList from "@/components/GuideWineList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bästa naturvinet för nybörjare på Systembolaget | Naturvinstipset",
  description:
    "Ny till naturvin? Här är de bästa, mest tillgängliga naturvinerna på Systembolaget för nybörjare — med låg funk och tydliga smakprofiler.",
  openGraph: {
    title: "Bästa naturvinet för nybörjare på Systembolaget",
    description:
      "De bästa naturvinerna för nybörjare — tillgängliga, välbalanserade och handplockade av Naturvinstipset.",
    url: "https://www.naturvinstipset.se/basta-naturvin-for-nyborjare",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Bästa naturvinet för nybörjare på Systembolaget",
  description:
    "De bästa naturvinerna för nybörjare på Systembolaget. Handplockade av Naturvinstipset.",
  url: "https://www.naturvinstipset.se/basta-naturvin-for-nyborjare",
  publisher: { "@type": "Organization", name: "Naturvinstipset" },
};

export default async function BastaNaturvinNyborjarePage() {
  const [wines, ratings] = await Promise.all([getWines(), getRatings()]);

  // Nybörjare: låg funk (≤2), publicerade viner sorterade efter betyg
  const filtered = wines
    .filter((w) => w.published && (w.funk == null || w.funk <= 2))
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
            Bästa naturvinet för nybörjare
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            Börja med ett vin som matchar hur du redan dricker. Vinerna i den
            här listan har låg funk — de är tillgängliga, välbalanserade och ger
            en rättvis bild av vad naturvin kan vara. Alla håller hög kvalitet
            och finns på Systembolaget.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-sm text-[var(--muted)] mb-8">
          {filtered.length} vin{filtered.length !== 1 ? "er" : ""} lämpliga för nybörjare
        </p>
        <GuideWineList wines={filtered} ratings={ratings} />

        <div className="mt-16 pt-12 border-t border-[var(--rule)]">
          <h2 className="text-lg font-bold text-[var(--fg)] mb-4">
            Varför är dessa bra för nybörjare?
          </h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed mb-4">
            Vinerna på den här listan har ett funk-värde på 2 av 5 eller lägre.
            Det innebär att de är rena, friska och tillgängliga — utan de
            utmanande toner av brett, cider eller fermenterade frukter som kan
            vara ovana för förstagångsdrinkaren.
          </p>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            Gillar du vad du hittar här? Nästa steg är att utforska viner med
            lite högre funk och djupare karaktär. Vår{" "}
            <Link href="/" className="underline">
              fullständiga lista
            </Link>{" "}
            har smakparametrar som hjälper dig steg för steg.
          </p>
        </div>

        <div className="mt-12 pt-12 border-t border-[var(--rule)]">
          <p className="text-sm font-semibold text-[var(--muted)] mb-4 uppercase tracking-wider">
            Fler guider
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/basta-naturvin-under-200-kr" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Under 200 kr</Link>
            <Link href="/basta-orangevin-systembolaget" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Bästa orangevinet</Link>
            <Link href="/basta-pet-nat-systembolaget" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Bästa pét nat</Link>
            <Link href="/basta-naturvin-till-mat" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Till mat</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
