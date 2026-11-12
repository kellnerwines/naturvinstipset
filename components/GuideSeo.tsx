// Strukturerad data och vanliga frågor för listsidor (kategorier, guider, smakprofiler).
// Svaren räknas fram ur samma viner som listan visar, så de stämmer alltid med sidan.

import type { Wine } from "@/lib/blob";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd, faqJsonLd, wineItemListJsonLd } from "@/lib/seo";

const SB = "Systembolaget";
const price = (w: Wine) => Number(String(w.price ?? "").replace(",", ".")) || 0;
const atSb = (w: Wine) => !!w.systembolagetUrl || (w.offers ?? []).some((o) => o.shop === SB && o.inStock);
const webShops = (w: Wine) => (w.offers ?? []).filter((o) => o.shop !== SB && o.inStock).map((o) => o.shop);
const and = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(", ")} och ${xs[xs.length - 1]}` : xs[0] ?? "");

/** Ordformer för frågorna, t.ex. { best: "röda naturvinet", one: "rött naturvin", many: "röda naturviner" }. */
export type GuideNouns = { best: string; one: string; many: string };

export function guideFaq(wines: Wine[], { best: bestNoun, one: noun, many: nounPlural }: GuideNouns): { q: string; a: string }[] {
  if (!wines.length) return [];
  const [best, ...rest] = wines;
  const faq: { q: string; a: string }[] = [{
    q: `Vilket är det bästa ${bestNoun} just nu?`,
    a: `Högst betyg på Naturvinstipset har ${best.name} från ${best.producer}${best.country ? ` (${best.country})` : ""}${price(best) ? `, ${price(best)} kr` : ""}.`
      + (rest.length ? ` Därefter kommer ${and(rest.slice(0, 2).map((w) => `${w.name} från ${w.producer}`))}.` : ""),
  }];

  const prices = wines.map(price).filter((p) => p > 0).sort((a, b) => a - b);
  if (prices.length >= 3) {
    const median = prices[Math.floor(prices.length / 2)];
    const under200 = prices.filter((p) => p < 200).length;
    faq.push({
      q: `Vad kostar ett bra ${noun}?`,
      a: `De ${prices.length} ${nounPlural} på listan kostar från ${prices[0]} kr, och hälften kostar under ${median} kr. ${under200} av dem kostar under 200 kr.`,
    });
  }

  const sb = wines.filter(atSb).length;
  const shops = [...new Set(wines.flatMap(webShops))].sort((a, b) => a.localeCompare(b, "sv"));
  const web = wines.filter((w) => webShops(w).length).length;
  faq.push({
    q: `Var kan man köpa ${nounPlural}?`,
    a: [
      sb ? `${sb} av vinerna finns på Systembolaget.` : "",
      web ? `${web} går att beställa med hemleverans från ${shops.length > 1 ? "webbutikerna" : "webbutiken"} ${and(shops)}, med svensk alkoholskatt inräknad i priset.` : "",
      "Viner som är slut överallt tas bort från listan tills de finns igen.",
    ].filter(Boolean).join(" "),
  });
  return faq;
}

/** ItemList, brödsmulor och FAQ-schema plus synliga vanliga frågor. */
export default function GuideSeo({ name, path, crumbs, wines, nouns }: {
  name: string;
  path: string;
  crumbs: { name: string; path: string }[];
  wines: Wine[];
  nouns: GuideNouns;
}) {
  const faq = guideFaq(wines, nouns);
  return (
    <>
      <JsonLd data={[
        ...(wines.length ? [wineItemListJsonLd(name, path, wines.slice(0, 50))] : []),
        breadcrumbJsonLd(crumbs),
        ...(faq.length ? [faqJsonLd(faq)] : []),
      ]} />
      {faq.length ? (
        <section className="mt-16 pt-12 border-t border-[var(--rule)]">
          <h2 className="text-2xl font-bold mb-8">Vanliga frågor</h2>
          <div className="space-y-8">
            {faq.map(({ q, a }) => (
              <div key={q}>
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
