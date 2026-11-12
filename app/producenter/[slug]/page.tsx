import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import EntityPage from "@/components/EntityPage";
import { andList, countrySlug, grapeSlug, grapesOf, entityMetadata, MIN_INDEXED, producersOf, topValues, typesOf } from "@/lib/entities";
import { SITE } from "@/lib/seo";
import { kellnerProducerUrl } from "@/lib/kellnerLinks";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  const wines = (await getWines()).filter((w) => w.published);
  return producersOf(wines).get(slug);
}

/** "Bret Brothers gör naturvin i Bourgogne, Frankrike. Här finns 20 viner, mest vitt, på Chardonnay och Gamay." */
function intro(name: string, regions: string[], countries: string[], types: string[], grapes: string[], count: number): string {
  const where = [andList(regions), andList(countries)].filter(Boolean).join(", ");
  const kinds = types.map((t) => ({ "Rött": "rött", "Vitt": "vitt", "Rosé": "rosé", Orange: "orange", Mousserande: "mousserande", "Pét Nat": "pét-nat" }[t] ?? t.toLowerCase()));
  return `${name} gör naturvin${where ? ` i ${where}` : ""}. `
    + `Här finns ${count === 1 ? "ett vin" : `${count} viner`} i lager just nu`
    + (kinds.length ? `, ${count === 1 ? "" : kinds.length === 1 ? "alla " : "mest "}${kinds[0]}` : "")
    + (grapes.length ? `, på ${andList(grapes.slice(0, 4))}${grapes.length > 4 ? " med flera" : ""}` : "")
    + ". Listan visar var vinerna går att köpa och vad de kostar.";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return { title: "Producent" };
  const countries = topValues(p.wines.map((w) => w.country), 2);
  return entityMetadata(`${p.name}: naturviner${countries.length ? ` från ${andList(countries)}` : ""}`, intro(p.name, topValues(p.wines.map((w) => w.region), 2), countries, typesOf(p.wines), [...new Set(p.wines.flatMap(grapesOf))], p.wines.length), `/producenter/${slug}`, p.wines.length >= MIN_INDEXED.producer);
}

export default async function ProducerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, ratings] = await Promise.all([load(slug), getRatings()]);
  if (!p) notFound();

  const wines = [...p.wines].sort((a, b) => combinedRating(b, ratings) - combinedRating(a, ratings));
  const countries = topValues(wines.map((w) => w.country), 3);
  const regions = topValues(wines.map((w) => w.region), 3);
  const grapeCount = new Map<string, number>();
  for (const g of wines.flatMap(grapesOf)) grapeCount.set(g, (grapeCount.get(g) ?? 0) + 1);
  const grapes = [...grapeCount].sort((a, b) => b[1] - a[1]).map(([g]) => g);
  const importer = wines.map((w) => kellnerProducerUrl(w.producer)).find(Boolean);
  const path = `/producenter/${slug}`;

  return (
    <EntityPage
      eyebrow="Producent"
      title={p.name}
      intro={intro(p.name, regions, countries, typesOf(wines), grapes, wines.length)}
      facts={[
        { label: "Land", links: countries.map((c) => ({ href: `/land/${countrySlug(c)}`, label: c })) },
        { label: "Druvor", links: grapes.slice(0, 10).map((g) => ({ href: `/druvor/${grapeSlug(g)}`, label: g })) },
        { label: "Importör", links: importer ? [{ href: importer, label: "Kellner & Kellner" }] : [] },
      ]}
      wines={wines}
      ratings={ratings}
      path={path}
      crumbs={[{ name: "Producenter", path: "/producenter" }, { name: p.name, path }]}
      nouns={{ best: `vinet från ${p.name}`, one: `vin från ${p.name}`, many: `viner från ${p.name}` }}
      related={{ heading: "Mer från samma land", links: countries.map((c) => ({ href: `/land/${countrySlug(c)}`, label: `Naturvin från ${c}` })) }}
      schema={{ "@context": "https://schema.org", "@type": "Organization", "@id": `${SITE}${path}#producent`, name: p.name, ...(countries[0] ? { address: { "@type": "PostalAddress", addressCountry: countries[0] } } : {}) }}
    />
  );
}
