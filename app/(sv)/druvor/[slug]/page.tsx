import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import EntityPage from "@/components/EntityPage";
import { andList, countrySlug, GRAPE_NOTES, grapesIn, entityMetadata, MIN_INDEXED, producerName, producerSlug, topValues, typesOf } from "@/lib/entities";

export const dynamic = "force-dynamic";

const TYPE_WORD: Record<string, string> = { "Rött": "röda", "Vitt": "vita", "Rosé": "rosé", Orange: "orange", Mousserande: "mousserande", "Pét Nat": "pét-nat" };

async function load(slug: string) {
  const wines = (await getWines()).filter((w) => w.published);
  return grapesIn(wines).get(slug);
}

/** "Här finns 36 naturviner på Gamay i lager just nu, mest röda, från Frankrike och Tyskland." */
function intro(name: string, count: number, types: string[], countries: string[]): string {
  return `Här finns ${count === 1 ? "ett naturvin" : `${count} naturviner`} på ${name} i lager just nu`
    + (types.length && count > 1 ? `, ${types.length === 1 ? "alla" : "mest"} ${TYPE_WORD[types[0]] ?? types[0].toLowerCase()}` : "")
    + (countries.length ? `, från ${andList(countries)}` : "")
    + ". Både rena viner och blandningar där druvan ingår.";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = await load(slug);
  if (!g) return { title: "Druva" };
  return entityMetadata(`${g.name}: naturviner på Systembolaget och med hemleverans`, intro(g.name, g.wines.length, typesOf(g.wines), topValues(g.wines.map((w) => w.country), 3)), `/druvor/${slug}`, g.wines.length >= MIN_INDEXED.grape);
}

export default async function GrapePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [g, ratings] = await Promise.all([load(slug), getRatings()]);
  if (!g) notFound();

  const wines = [...g.wines].sort((a, b) => combinedRating(b, ratings) - combinedRating(a, ratings));
  const countries = topValues(wines.map((w) => w.country), 5);
  const producers = topValues(wines.map((w) => (w.producer ? producerName(w.producer) : undefined)), 8);
  const path = `/druvor/${slug}`;

  return (
    <EntityPage
      eyebrow="Druva"
      title={`Naturvin på ${g.name}`}
      intro={intro(g.name, wines.length, typesOf(wines), countries.slice(0, 3))}
      note={GRAPE_NOTES[slug]}
      facts={[
        { label: "Länder", links: countries.map((c) => ({ href: `/land/${countrySlug(c)}`, label: c })) },
        { label: "Producenter", links: producers.map((p) => ({ href: `/producenter/${producerSlug(p)}`, label: p })) },
      ]}
      wines={wines}
      ratings={ratings}
      path={path}
      crumbs={[{ name: "Druvor", path: "/druvor" }, { name: g.name, path }]}
      nouns={{ best: `naturvinet på ${g.name}`, one: `naturvin på ${g.name}`, many: `naturviner på ${g.name}` }}
      related={{ heading: "Fler druvor", links: [{ href: "/druvor", label: "Alla druvor" }] }}
    />
  );
}
