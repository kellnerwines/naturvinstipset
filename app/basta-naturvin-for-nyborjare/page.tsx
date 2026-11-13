import type { Metadata } from "next";
import Link from "next/link";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import GuideWineList from "@/components/GuideWineList";
import GuideSeo from "@/components/GuideSeo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/basta-naturvin-for-nyborjare" },
  title: "Bästa naturvinet för nybörjare på Systembolaget eller från webbutiker med hemleverans",
  description:
    "Ny till naturvin? Här är de bästa, mest tillgängliga naturvinerna för nybörjare, på Systembolaget eller från webbutiker med hemleverans — med låg funk och tydliga smakprofiler.",
  openGraph: {
    title: "Bästa naturvinet för nybörjare på Systembolaget eller från webbutiker med hemleverans",
    description:
      "De bästa naturvinerna för nybörjare — tillgängliga, välbalanserade och handplockade av Naturvinstipset.",
    url: "https://www.naturvinstipset.se/basta-naturvin-for-nyborjare",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Bästa naturvinet för nybörjare på Systembolaget eller från webbutiker med hemleverans",
  description:
    "De bästa naturvinerna för nybörjare på Systembolaget eller från webbutiker med hemleverans. Handplockade av Naturvinstipset.",
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

      <div className="border-b-[3px] border-[var(--ink)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="inline-block self-start bg-[var(--accent)] text-[var(--fg)] border-2 border-[var(--ink)] text-sm font-bold px-2 py-0.5 mb-4">
            Guide
          </p>
          <h1 className="text-5xl md:text-7xl mb-4">
            Bästa naturvinet för nybörjare
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            Börja med ett vin som matchar hur du redan dricker. Vinerna i den
            här listan har låg funk — de är tillgängliga, välbalanserade och ger
            en rättvis bild av vad naturvin kan vara. Alla håller hög kvalitet
            och går att köpa på Systembolaget eller från webbutiker med hemleverans.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <p className="text-sm text-[var(--muted)] mb-8">
          {filtered.length} vin{filtered.length !== 1 ? "er" : ""} lämpliga för nybörjare
        </p>
        <GuideWineList wines={filtered} ratings={ratings} />
        <GuideSeo name="Bästa naturvinet för nybörjare" path="/basta-naturvin-for-nyborjare" crumbs={[{ name: "Naturvin för nybörjare", path: "/basta-naturvin-for-nyborjare" }]}
          wines={filtered} nouns={{ best: "naturvinet för nybörjare", one: "naturvin för nybörjare", many: "naturviner för nybörjare" }} />

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
            <Link href="/topp-100" className="underline">
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
            <Link href="/basta-naturvin-under-200-kr" className="text-sm font-bold border-2 border-[var(--ink)] text-[var(--ink)] px-4 py-2 rounded-full hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">Under 200 kr</Link>
            <Link href="/rott" className="text-sm font-bold border-2 border-[var(--ink)] text-[var(--ink)] px-4 py-2 rounded-full hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">Bästa röda naturvinet</Link>
            <Link href="/vitt" className="text-sm font-bold border-2 border-[var(--ink)] text-[var(--ink)] px-4 py-2 rounded-full hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">Bästa vita naturvinet</Link>
            <Link href="/orange" className="text-sm font-bold border-2 border-[var(--ink)] text-[var(--ink)] px-4 py-2 rounded-full hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">Bästa orangevinet</Link>
            <Link href="/pet-nat" className="text-sm font-bold border-2 border-[var(--ink)] text-[var(--ink)] px-4 py-2 rounded-full hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">Bästa pét nat</Link>
            <Link href="/basta-naturvin-till-mat" className="text-sm font-bold border-2 border-[var(--ink)] text-[var(--ink)] px-4 py-2 rounded-full hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">Till mat</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
