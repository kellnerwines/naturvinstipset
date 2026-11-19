import type { Metadata } from "next";
import { getWines } from "@/lib/blob";
import { EntityIndex } from "@/components/EntityPage";
import { shopCounts, SHOPS } from "@/lib/shops";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Butiker med naturvin",
  description: "Butikerna på Naturvinstipset: Systembolaget och webbutiker med hemleverans och svensk alkoholskatt i priset.",
  alternates: { canonical: "/butiker" },
};

export default async function ShopsPage() {
  const counts = shopCounts((await getWines()).filter((w) => w.published));
  const items = SHOPS.filter((s) => counts.get(s.name))
    .map((s) => ({ href: `/butiker/${s.slug}`, label: s.name, count: counts.get(s.name)!, sub: s.web ? `Webbutik, ${s.host}` : "Hämta i butik" }))
    .sort((a, b) => b.count - a.count);
  return (
    <EntityIndex
      title="Butiker med naturvin"
      intro="Här kan du köpa vinerna på Naturvinstipset: Systembolaget och webbutiker som säljer till svenska konsumenter med svensk alkoholskatt inräknad i priset."
      items={items}
      crumb="Butiker"
      path="/butiker"
    />
  );
}
