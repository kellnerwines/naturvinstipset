// Gemensam sida för producent, druva och land: rubrik, fakta med länkar, vinlistan och strukturerad data.

import Link from "next/link";
import type { ReactNode } from "react";
import type { Rating, Wine } from "@/lib/blob";
import JsonLd from "@/components/JsonLd";
import GuideWineList from "@/components/GuideWineList";
import GuideSeo, { type GuideNouns } from "@/components/GuideSeo";
import { breadcrumbJsonLd, publisherRef, SITE } from "@/lib/seo";

export type EntityLink = { href: string; label: string };
export type EntityFact = { label: string; links: EntityLink[] };

export default function EntityPage({ eyebrow, title, intro, note, facts, wines, ratings, path, crumbs, nouns, related, schema }: {
  eyebrow: string;
  title: string;
  intro: string;
  note?: string;            // redaktionell text, t.ex. om druvan
  facts: EntityFact[];      // fakta där varje värde länkar vidare
  wines: Wine[];            // sorterade efter betyg
  ratings: Rating[];
  path: string;
  crumbs: { name: string; path: string }[];
  nouns: GuideNouns;
  related?: { heading: string; links: EntityLink[] };
  schema?: object;          // t.ex. Organization för en producent
}): ReactNode {
  return (
    <div>
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "CollectionPage", name: title, description: intro, url: `${SITE}${path}`, publisher: publisherRef },
        ...(schema ? [schema] : []),
      ]} />

      <div className="border-b border-[var(--rule)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">{eyebrow}</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--fg)] mb-4 leading-tight tracking-tight">{title}</h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">{intro}</p>
          {note && <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg mt-4">{note}</p>}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {facts.some((f) => f.links.length) && (
          <dl className="mb-12 space-y-3 text-sm">
            {facts.filter((f) => f.links.length).map((f) => (
              <div key={f.label} className="flex gap-4">
                <dt className="text-[var(--muted)] w-24 shrink-0">{f.label}</dt>
                <dd className="flex flex-wrap gap-x-3 gap-y-1">
                  {f.links.map((l) => (
                    <Link key={l.href + l.label} href={l.href} className="font-medium underline underline-offset-2 decoration-black/20 hover:text-[var(--green)]">{l.label}</Link>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <p className="text-sm text-[var(--muted)] mb-8">
          {wines.length} {wines.length === 1 ? "vin" : "viner"} i lager just nu
        </p>
        <GuideWineList wines={wines} ratings={ratings} />

        <GuideSeo name={title} path={path} crumbs={crumbs} wines={wines} nouns={nouns} />

        {related && related.links.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[var(--rule)]">
            <p className="text-sm font-semibold text-[var(--muted)] mb-4 uppercase tracking-wider">{related.heading}</p>
            <div className="flex flex-wrap gap-2">
              {related.links.map((g) => (
                <Link key={g.href} href={g.href} className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors">
                  {g.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Enkel A–Ö-lista för översiktssidorna /producenter, /druvor och /land. */
export function EntityIndex({ title, intro, items, crumb, path }: {
  title: string;
  intro: string;
  items: { href: string; label: string; count: number; sub?: string }[];
  crumb: string;
  path: string;
}) {
  return (
    <div>
      <JsonLd data={breadcrumbJsonLd([{ name: crumb, path }])} />
      <div className="border-b border-[var(--rule)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--fg)] mb-4 leading-tight tracking-tight">{title}</h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">{intro}</p>
        </div>
      </div>
      <ul className="max-w-2xl mx-auto px-6 py-12 grid sm:grid-cols-2 gap-x-8">
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="flex items-baseline justify-between gap-3 py-2 border-b border-black/5 group">
              <span className="font-medium group-hover:text-[var(--green)] transition-colors">
                {it.label}
                {it.sub && <span className="block text-xs font-normal text-[var(--muted)]">{it.sub}</span>}
              </span>
              <span className="text-xs text-[var(--muted)] shrink-0">{it.count} {it.count === 1 ? "vin" : "viner"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
