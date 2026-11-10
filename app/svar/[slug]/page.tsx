// Svarssidor (Vinkompassen för sökmotorer och AI-agenter): en vanlig fråga,
// kompassens svar renderat på servern och en länk för att finjustera i chatten.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWines } from "@/lib/blob";
import { ANSWER_PAGES, SITE, answer, answerPage, compassLink } from "@/lib/answers";
import { RETAILER_DISCLAIMER } from "@/lib/compass/links";
import OwnImportBadge from "@/components/OwnImportBadge";

export const dynamic = "force-dynamic";

const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm", day: "numeric", month: "long", year: "numeric" });
const names = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} och ${xs[xs.length - 1]}` : xs[0] ?? "");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = answerPage((await params).slug);
  if (!page) return {};
  return {
    title: page.question,
    description: `${page.lead} Vinkompassens förslag bland naturviner på Systembolaget och från webbutiker med hemleverans, med pris och var du köper.`,
    alternates: { canonical: `/svar/${page.slug}` },
  };
}

export default async function SvarPage({ params }: { params: Promise<{ slug: string }> }) {
  const page = answerPage((await params).slug);
  if (!page) notFound();
  const a = answer(await getWines(), page.params);
  const top3 = a.results.slice(0, 3);
  const summary = top3.length
    ? `Vinkompassens bästa förslag just nu är ${names(top3.map((r) => `${r.name} från ${r.producer} (${r.price} kr, ${r.shop})`))}.`
    : "Just nu hittar Vinkompassen inget vin som passar.";

  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: page.question, acceptedAnswer: { "@type": "Answer", text: `${page.lead} ${summary}` } }],
    },
    {
      "@context": "https://schema.org", "@type": "ItemList", name: page.question, numberOfItems: a.results.length,
      itemListElement: a.results.map((r) => ({ "@type": "ListItem", position: r.rank, url: r.url, name: `${r.name} – ${r.producer}` })),
    },
  ];
  const others = ANSWER_PAGES.filter((p) => p.slug !== page.slug).slice(0, 8);

  return (
    <div className="max-w-2xl mx-auto px-5 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-3">Vinkompassen svarar</p>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">{page.question}</h1>
      <p className="text-base leading-relaxed mb-2">{page.lead} {summary}</p>
      <p className="text-xs text-[var(--muted)] mb-8">
        Uppdaterat {today()} · {a.count} naturviner passar · priser inklusive svensk alkoholskatt
        {a.note ? ` · ${a.note}` : ""}
      </p>

      <ol className="space-y-3 mb-8">
        {a.results.map((r) => (
          <li key={r.url} className="border border-[var(--rule)] rounded-lg p-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-bold leading-snug">
                {r.rank}. <Link href={r.url.replace(SITE, "")} className="hover:opacity-60">{r.name}</Link>
                {r.vintage && r.vintage !== "NV" ? ` ${r.vintage}` : ""}
                {r.ownImport ? <OwnImportBadge className="ml-2 align-middle" /> : null}
              </p>
              <span className="text-xs text-[var(--muted)] whitespace-nowrap">{r.match} % matchning</span>
            </div>
            <p className="text-sm text-[var(--muted)] mt-0.5">{[r.producer, r.type, r.country, r.grape].filter(Boolean).join(" · ")}</p>
            {r.foodPairing ? <p className="text-sm mt-2"><span className="font-semibold">Passar till:</span> {r.foodPairing}</p> : null}
            <p className="text-sm mt-2">
              ca {r.price} kr hos {r.shop}{r.alsoAt ? `, eller ${r.alsoAt.price} kr hos ${r.alsoAt.shop}` : ""} ·{" "}
              <a href={r.buyUrl.replace(SITE, "")} rel="nofollow noopener" target="_blank" className="underline underline-offset-2">
                {r.shop === "Systembolaget" ? "Se vinet hos Systembolaget" : `Köp hos ${r.shop}`} →
              </a>
            </p>
          </li>
        ))}
      </ol>

      <Link href={compassLink(page.params)} className="inline-flex items-center gap-2 text-sm font-semibold border border-[var(--fg)] px-5 py-3 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors">
        Finjustera i Vinkompassen →
      </Link>

      <p className="text-[11px] text-[var(--muted)] leading-snug mt-8">
        {RETAILER_DISCLAIMER} Naturvinstipset drivs av grundaren av vinimportören Kellner &amp; Kellner. Viner från egen import är märkta och får ingen fördel i Vinkompassen.
      </p>

      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)] mt-14 mb-3">Fler frågor</h2>
      <ul className="flex flex-wrap gap-2">
        {others.map((p) => (
          <li key={p.slug}><Link href={`/svar/${p.slug}`} className="inline-block text-sm border border-[var(--rule)] rounded-full px-3 py-1.5 hover:border-[var(--fg)]">{p.question}</Link></li>
        ))}
      </ul>
    </div>
  );
}
