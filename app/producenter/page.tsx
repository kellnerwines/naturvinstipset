import type { Metadata } from "next";
import { getWines } from "@/lib/blob";
import { EntityIndex } from "@/components/EntityPage";
import { producersOf, topValues } from "@/lib/entities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Naturvinsproducenter",
  description: "Alla naturvinsproducenter med viner som går att köpa i Sverige just nu, på Systembolaget eller från webbutiker med hemleverans.",
  alternates: { canonical: "/producenter" },
};

export default async function ProducersPage() {
  const wines = (await getWines()).filter((w) => w.published);
  const items = [...producersOf(wines).values()]
    .sort((a, b) => a.name.localeCompare(b.name, "sv"))
    .map((p) => ({ href: `/producenter/${p.slug}`, label: p.name, count: p.wines.length, sub: topValues(p.wines.map((w) => w.country), 1)[0] }));
  return (
    <EntityIndex
      title="Naturvinsproducenter"
      intro={`${items.length} producenter med naturviner som går att köpa i Sverige just nu, på Systembolaget eller från webbutiker med hemleverans.`}
      items={items}
      crumb="Producenter"
      path="/producenter"
    />
  );
}
