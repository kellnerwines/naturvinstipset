import type { Metadata } from "next";
import { getWines } from "@/lib/blob";
import { EntityIndex } from "@/components/EntityPage";
import { countriesOf } from "@/lib/entities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Naturvin per land",
  description: "Naturviner från Frankrike, Italien, Spanien, Portugal, Österrike och fler länder som går att köpa i Sverige just nu.",
  alternates: { canonical: "/land" },
};

export default async function CountriesPage() {
  const wines = (await getWines()).filter((w) => w.published);
  const items = [...countriesOf(wines).values()]
    .sort((a, b) => b.wines.length - a.wines.length || a.name.localeCompare(b.name, "sv"))
    .map((c) => ({ href: `/land/${c.slug}`, label: c.name, count: c.wines.length }));
  return (
    <EntityIndex
      title="Naturvin per land"
      intro={`Naturviner från ${items.length} länder som går att köpa i Sverige just nu, flest först.`}
      items={items}
      crumb="Länder"
      path="/land"
    />
  );
}
