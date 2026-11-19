import type { Metadata } from "next";
import Link from "next/link";
import { langAlternates } from "@/lib/i18n";

// Engelsk version av app/(sv)/om-listan/page.tsx. Ändras den svenska texten behöver den här ändras för hand.
export const metadata: Metadata = {
  alternates: langAlternates("en", "/om-listan"),
  title: "About the list – How we rate natural wine",
  description:
    "Every wine on Naturvinstipset's list is of high quality. We rate on four parameters: acidity, body, tannin and funk — so that you find the right style, not just a generically good wine.",
  openGraph: {
    title: "About the list – How we rate natural wine",
    description: "We rate natural wine on four parameters: acidity, body, tannin and funk. This is how the list works.",
    url: "https://www.naturvinstipset.se/en/om-listan",
  },
};

const parameters = [
  {
    name: "Acidity",
    description:
      "How fresh and lively the wine feels in the mouth. High acidity gives a tangy, vibrant character. Low acidity gives a softer, rounder wine.",
  },
  {
    name: "Body",
    description:
      "The wine's body and weight. A light wine feels airy and easy to drink. A full-bodied wine has more substance and goes better with food.",
  },
  {
    name: "Tannin",
    description:
      "The tannins — the grippy, drying feeling found mainly in red wines. A high value suits those who like classic, sturdy reds. A low value suits lighter styles.",
  },
  {
    name: "Funk",
    description:
      "How challenging the wine is in taste — from clean and accessible to broad and complex. Funk is not a fault and not a requirement. It is a style.",
  },
];

const schemaJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "About the list – Naturvinstipset",
  description:
    "How Naturvinstipset selects and rates natural wine. Four taste parameters: acidity, body, tannin and funk.",
  url: "https://www.naturvinstipset.se/en/om-listan",
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: "Naturvinstipset",
    url: "https://www.naturvinstipset.se",
  },
};

export default function AboutTheListPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      <div className="border-b-[3px] border-[var(--ink)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="inline-block self-start bg-[var(--accent)] text-[var(--fg)] border-2 border-[var(--ink)] text-sm font-bold px-2 py-0.5 mb-4">
            About the list
          </p>
          <h1 className="text-5xl md:text-7xl mb-4">
            How we rate
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            Every wine is of high quality. But quality says nothing about what
            you in particular like.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-16">
        <section>
          <p className="text-[var(--muted)] leading-relaxed text-[15px] mb-4">
            Every wine on our list is of high quality. That is the starting point.
            We don&apos;t list wines we don&apos;t believe in — the list is the result of
            careful selection in collaboration with Sweden&apos;s most serious
            natural wine importers.
          </p>
          <p className="text-[var(--muted)] leading-relaxed text-[15px]">
            But quality says nothing about what you in particular like. That is why
            we rate every wine on four parameters that help you find the
            right style, not just a generically good wine.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--fg)] leading-tight mb-8">
            The four parameters
          </h2>
          <div className="space-y-8">
            {parameters.map((p) => (
              <div key={p.name} className="flex gap-6">
                <div className="shrink-0 w-24">
                  <span className="text-sm font-semibold text-[var(--fg)]">
                    {p.name}
                  </span>
                </div>
                <p className="text-[var(--muted)] leading-relaxed text-[15px]">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--fg)] leading-tight mb-4">
            The editorial rating
          </h2>
          <p className="text-[var(--muted)] leading-relaxed text-[15px]">
            The parameters are set by the Naturvinstipset editors, based on
            practical experience of natural wine and close contact with the importers
            and producers whose wines are on the list.
          </p>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--fg)] leading-tight mb-4">
            The community rating
          </h2>
          <p className="text-[var(--muted)] leading-relaxed text-[15px]">
            In addition to the editorial rating, you as a user can rate with
            stars and write your own reviews. The community rating is shown separately
            on every wine card, so that you always see the difference.
          </p>
        </section>

        <section className="border-t border-[var(--rule)] pt-12">
          <p className="text-[var(--muted)] leading-relaxed text-[15px]">
            Questions about how we rate, or missing a wine? Get in touch
            through{" "}
            <Link
              href="/en/kontakt"
              className="text-[var(--fg)] underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              our contact form
            </Link>
          </p>
        </section>
      </div>

      <div className="border-t border-[var(--rule)] py-16 px-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-1">
              See the list
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Ranked list with direct links to Systembolaget (in Swedish).
            </p>
          </div>
          <Link
            href="/topp-100"
            hrefLang="sv"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-[var(--fg)] border border-[var(--fg)] px-5 py-3 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
          >
            See Top 100 →
          </Link>
        </div>
      </div>
    </div>
  );
}
