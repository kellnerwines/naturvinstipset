import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWines, getRatings, combinedRating, type Wine } from "@/lib/blob";
import WineLibrary from "@/components/WineLibrary";
import GuideSeo from "@/components/GuideSeo";
import JsonLd from "@/components/JsonLd";
import { andList, clip, countrySlug, topValues, typesOf } from "@/lib/entities";
import { getShop, shopsOf } from "@/lib/shops";
import { publisherRef, SITE } from "@/lib/seo";

export const dynamic = "force-dynamic";

const TYPE_WORD: Record<string, string> = { "Rött": "rött", "Vitt": "vitt", "Rosé": "rosé", Orange: "orange", Mousserande: "mousserande", "Pét Nat": "pét-nat" };
const price = (w: Wine) => Number(String(w.price ?? "").replace(",", ".")) || 0;

async function load(slug: string) {
  const shop = getShop(slug);
  if (!shop) return undefined;
  const wines = (await getWines()).filter((w) => w.published && shopsOf(w).includes(shop.name));
  return { shop, wines };
}

/** "Wine Trade har 38 naturviner på Naturvinstipset just nu, mest rött, från Frankrike, Italien och Spanien. Priserna ligger mellan 189 och 690 kr." */
function intro(name: string, web: boolean, wines: Wine[]): string {
  const prices = wines.map(price).filter((p) => p > 0).sort((a, b) => a - b);
  const types = typesOf(wines);
  const countries = topValues(wines.map((w) => w.country), 3);
  return `${name} har ${wines.length} naturviner på Naturvinstipset just nu`
    + (types.length ? `, mest ${TYPE_WORD[types[0]] ?? types[0].toLowerCase()}` : "")
    + (countries.length ? `, från ${andList(countries)}` : "")
    + "."
    + (prices.length > 1 ? ` Priserna ligger mellan ${prices[0]} och ${prices[prices.length - 1]} kr.` : "")
    + (web ? " Vinerna skickas hem från webbutiken, med svensk alkoholskatt inräknad i priset." : " Vinerna köps i Systembolagets butiker.");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await load(slug);
  if (!d) return { title: "Butik" };
  const title = `Naturvin från ${d.shop.name}`;
  const description = clip(intro(d.shop.name, d.shop.web, d.wines));
  return {
    title,
    description,
    alternates: { canonical: `/butiker/${slug}` },
    openGraph: { title: `${title} – Naturvinstipset`, description, url: `${SITE}/butiker/${slug}` },
    robots: d.wines.length ? undefined : { index: false, follow: true },
  };
}

export default async function ShopPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const [d, ratings] = await Promise.all([load(slug), getRatings()]);
  if (!d) notFound();
  const { shop } = d;
  const wines = [...d.wines].sort((a, b) => combinedRating(b, ratings) - combinedRating(a, ratings));
  const path = `/butiker/${slug}`;
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const countries = topValues(wines.map((w) => w.country), 6);

  return (
    <div>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "CollectionPage", name: `Naturvin från ${shop.name}`, url: `${SITE}${path}`, publisher: publisherRef,
          about: { "@type": "Store", name: shop.name, url: shop.url } },
      ]} />
      <div className="border-b border-[var(--rule)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">{shop.web ? "Webbutik" : "Butik"}</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--fg)] mb-4 leading-tight tracking-tight">Naturvin från {shop.name}</h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">{intro(shop.name, shop.web, wines)}</p>
          <a href={shop.url} target="_blank" rel="noopener" className="inline-block mt-6 text-sm font-semibold border border-[var(--fg)] px-4 py-2 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors">
            Till {shop.host} →
          </a>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-10">
        {countries.length > 1 && (
          <p className="text-sm text-[var(--muted)] mb-6">
            Länder:{" "}
            {countries.map((c, i) => (
              <span key={c}>{i > 0 && ", "}<Link href={`/land/${countrySlug(c)}`} className="underline underline-offset-2 hover:text-[var(--green)]">{c}</Link></span>
            ))}
          </p>
        )}
        <WineLibrary
          wines={wines}
          ratings={ratings}
          lockShop
          initial={{ butik: slug, farg: pick(sp.farg), land: pick(sp.land), pris: pick(sp.pris), q: pick(sp.q), sort: pick(sp.sort) || "betyg" }}
        />
        <GuideSeo
          name={`Naturvin från ${shop.name}`}
          path={path}
          crumbs={[{ name: "Butiker", path: "/butiker" }, { name: shop.name, path }]}
          wines={wines}
          nouns={{ best: `naturvinet från ${shop.name}`, one: `naturvin från ${shop.name}`, many: `naturviner från ${shop.name}` }}
        />
        <div className="mt-16 pt-12 border-t border-[var(--rule)] flex flex-wrap gap-2">
          <Link href="/viner" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Alla naturviner</Link>
          <Link href="/butiker" className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">Alla butiker</Link>
        </div>
      </div>
    </div>
  );
}
