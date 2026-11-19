import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import EntityPage from "@/components/EntityPage";
import { andList, countriesOf, grapeSlug, grapesOf, entityMetadata, MIN_INDEXED, producerName, producerSlug, topValues } from "@/lib/entities";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  const wines = (await getWines()).filter((w) => w.published);
  return countriesOf(wines).get(slug);
}

/** "Här finns 244 naturviner från Frankrike i lager just nu, från bland annat Loire, Alsace och Beaujolais." */
function intro(name: string, count: number, regions: string[], grapes: string[]): string {
  return `Här finns ${count === 1 ? "ett naturvin" : `${count} naturviner`} från ${name} i lager just nu`
    + (regions.length ? `, från ${regions.length > 1 ? "bland annat " : ""}${andList(regions)}` : "")
    + "."
    + (grapes.length ? ` Vanligaste druvorna är ${andList(grapes)}.` : "")
    + " Listan visar var vinerna går att köpa i Sverige och vad de kostar.";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await load(slug);
  if (!c) return { title: "Land" };
  return entityMetadata(`Bästa naturvinet från ${c.name} på Systembolaget och med hemleverans`, intro(c.name, c.wines.length, topValues(c.wines.map((w) => w.region), 3), topValues(c.wines.flatMap(grapesOf), 3)), `/land/${slug}`, c.wines.length >= MIN_INDEXED.country);
}

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [c, ratings] = await Promise.all([load(slug), getRatings()]);
  if (!c) notFound();

  const wines = [...c.wines].sort((a, b) => combinedRating(b, ratings) - combinedRating(a, ratings));
  const grapes = topValues(wines.flatMap(grapesOf), 10);
  const producers = topValues(wines.map((w) => (w.producer ? producerName(w.producer) : undefined)), 12);
  const path = `/land/${slug}`;

  return (
    <EntityPage
      eyebrow="Land"
      title={`Naturvin från ${c.name}`}
      intro={intro(c.name, wines.length, topValues(wines.map((w) => w.region), 3), grapes.slice(0, 3))}
      facts={[
        { label: "Druvor", links: grapes.map((g) => ({ href: `/druvor/${grapeSlug(g)}`, label: g })) },
        { label: "Producenter", links: producers.map((p) => ({ href: `/producenter/${producerSlug(p)}`, label: p })) },
      ]}
      wines={wines}
      ratings={ratings}
      path={path}
      crumbs={[{ name: "Länder", path: "/land" }, { name: c.name, path }]}
      nouns={{ best: `naturvinet från ${c.name}`, one: `naturvin från ${c.name}`, many: `naturviner från ${c.name}` }}
      related={{ heading: "Fler länder", links: [{ href: "/land", label: "Alla länder" }] }}
    />
  );
}
