import type { Metadata } from "next";
import { getWines } from "@/lib/blob";
import { EntityIndex } from "@/components/EntityPage";
import { grapesIn } from "@/lib/entities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Druvor i naturvin",
  description: "Alla druvor bland naturvinerna som går att köpa i Sverige just nu, från Pinot Noir och Gamay till Savagnin och Xarel·lo.",
  alternates: { canonical: "/druvor" },
};

export default async function GrapesPage() {
  const wines = (await getWines()).filter((w) => w.published);
  const items = [...grapesIn(wines).values()]
    .sort((a, b) => b.wines.length - a.wines.length || a.name.localeCompare(b.name, "sv"))
    .map((g) => ({ href: `/druvor/${g.slug}`, label: g.name, count: g.wines.length }));
  return (
    <EntityIndex
      title="Druvor i naturvin"
      intro={`${items.length} druvor bland naturvinerna som går att köpa i Sverige just nu, de vanligaste först.`}
      items={items}
      crumb="Druvor"
      path="/druvor"
    />
  );
}
