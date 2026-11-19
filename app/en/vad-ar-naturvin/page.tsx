import type { Metadata } from "next";
import Link from "next/link";
import { langAlternates } from "@/lib/i18n";

// Engelsk version av app/(sv)/vad-ar-naturvin/page.tsx. Ändras den svenska texten behöver den här ändras för hand.
export const metadata: Metadata = {
  alternates: langAlternates("en", "/vad-ar-naturvin"),
  title: "What is natural wine? Common questions answered",
  description:
    "Why is it cloudy? Will it give you a hangover? What is orange wine? We answer the questions you google at 10 pm — a complete guide to natural wine for beginners and the curious.",
  openGraph: {
    title: "What is natural wine? Common questions answered",
    description: "Why is it cloudy? Will it give you a hangover? What is orange wine? A complete guide to natural wine for beginners and the curious.",
    url: "https://www.naturvinstipset.se/en/vad-ar-naturvin",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Guide to natural wine – Naturvinstipset" }],
  },
};

type Section = { id: string; question: string; answer: string; cta?: { text: string; href: string } };

// Länkarna till Topp 100 går till den svenska listan.
const TOP100 = "/topp-100#listan";

const sections: Section[] = [
  {
    id: "vad-ar-naturvin",
    question: "What is natural wine?",
    answer: `Simply put: natural wine is wine made with as little intervention as possible. The grape gets to speak, the place gets to show, and the winemaker keeps their hands in their pockets as much as they can.

That means organic or biodynamic farming, wild yeasts instead of bought ones, and no or minimal additives in the cellar. No sugar, no added acid, rarely any filtration.

There is no official definition — natural wine is more a philosophy than a set of rules. But the core is always the same: authenticity over control.

The result? Wines that truly reflect where they grow — what in wine language is called terroir. Soil, climate, altitude. You can almost taste where the wine comes from. More alive, more unpredictable, more character.

And no — natural wine doesn't have to taste funky. That is one of the most common misconceptions. Many natural wines are clean, fresh and easy to drink. Funky is a style, not a rule.`,
  },
  {
    id: "skillnad-vanligt-vin",
    question: "What is the difference between natural wine and regular wine?",
    answer: `The big difference is in the cellar. Regular wine may be fermented with cultured yeast and adjusted with additives such as sugar, acid, tannins and enzymes. It is often fined and filtered, and sulphur is added so that the wine keeps.

Natural wine ferments with the grapes' own yeast and is made without such adjustments. It is rarely fined or filtered, and sulphur is not added at all or only a little when the wine is bottled. The grapes are grown organically or biodynamically and picked by hand.

That is why natural wine can differ more between bottles and vintages, and is sometimes cloudy or slightly fizzy. That doesn't mean it is worse, only that less has been changed on the way from grape to glass.

In Sweden there is no official definition, so the word natural wine is not protected. In France, the Vin Méthode Nature label with fixed rules has existed since 2020.`,
  },
  {
    id: "skillnad-ekologiskt",
    question: "What is the difference from organic and biodynamic wine?",
    answer: `Three concepts that are often mixed up — and that is entirely understandable. Here is the simple version:

Organic wine is mostly about what happens in the vineyard. No synthetic pesticides or artificial fertiliser. But in the cellar quite a lot of additives and techniques are still allowed. Regulated by the EU and marked with the green leaf.

Biodynamic wine goes a step further and sees the whole vineyard as a living ecosystem. Often certified by Demeter. Still mostly focused on the farming.

Natural wine covers the whole chain — from vineyard to bottle. Natural wine is almost always organically grown, but an organic wine is not automatically natural wine. It is what happens in the cellar that decides.

In short: organic is the foundation, biodynamic is a philosophy, natural wine is the whole package.`,
  },
  {
    id: "varfor-grumligt",
    question: "Why does it look cloudy in the glass?",
    answer: `Conventional wine is carefully fined and filtered before bottling — often using egg white protein or bentonite — which gives a clear, transparent wine. But filtration doesn't only remove particles, it can also remove flavour and aromas.

Natural wine is rarely or never filtered, which means that natural particles such as yeast cells and pectins can remain in the wine. But how cloudy it gets depends on the winemaker — how much sediment they choose to include in the bottle. Many natural wines are completely clear.

So if you see a cloudy natural wine, it is not a fault — it is a deliberate choice. A sign of a living, untreated wine. Think of it as the difference between pasteurised and unpasteurised juice. Both are good, but the unpasteurised one has more to say.`,
  },
  {
    id: "smakar-funky",
    question: "It tastes a bit funky — is that intended?",
    answer: `Sometimes yes, sometimes no. Funky is a broad term in the natural wine world and can mean anything from slightly cider-like and earthy to broad and barnyard-like.

It comes from the wild yeasts and the minimal intervention in the cellar — processes that give more complex and unpredictable flavours than conventional wine.

But funky is a style, not a requirement. And it is definitely not always a fault. Many natural wine lovers look for exactly that lively, edgy character. Others prefer clean and fresh natural wines — and there are plenty of those too.

On Naturvinstipset we have rated and categorised the wines so that you can easily find something that suits your taste profile — whether you are curious about funk or would rather stick to the accessible.`,
  },
  {
    id: "bakis",
    question: "Does natural wine give you a hangover?",
    answer: `The big question. And the answer is: probably no more than regular wine — and perhaps even a little less.

The myth that natural wine is completely hangover-free lives on, and even if it isn't entirely true, there is actually some logic behind it. Natural wine often has lower sulphite levels and fewer additives, which some people feel makes them feel better the day after.

The research is not entirely convincing, but the experience of many natural wine lovers points in the same direction — something seems to be right.

What we do know is that alcohol, dehydration and quantity are the biggest culprits. Not which wine.`,
  },
  {
    id: "kopa-naturvin",
    question: "Where do you buy natural wine?",
    cta: { text: "See our Top 100 list (in Swedish) →", href: TOP100 },
    answer: `Systembolaget is the obvious place for most people in Sweden — and the range keeps growing. But it can be a bit tricky to find the right wine, because there is no official "natural wine" filter.

Check our Top 100 list — a compilation of the most interesting and high-quality natural wines at Systembolaget, carefully selected by Sweden's most serious natural wine importers. We have direct links so you don't have to search yourself.

If you would rather have the wine delivered, there are also online shops with home delivery. The Wine Compass on the home page shows wines both at Systembolaget and from online shops that sell to Sweden with Swedish alcohol tax included in the price.

One thing to keep an eye on: since "natural wine" is not a protected term, there are wines marketed as natural without really being so. Big stickers and "natural wine" stamps are not always a guarantee. That is why we help you.

Something many people don't know: Systembolaget has no official definition of natural wine and no way of verifying that a wine actually is natural wine. What shows up when you search for natural wine at Systembolaget is what the importer has chosen to call it — without any requirement for transparency or documentation. That means you may think you are buying a natural wine, but in practice it may be conventional wine with all the additives the natural wine movement rejects. That is exactly the problem Naturvinstipset solves. We verify that the wines on our list actually are natural wine, in collaboration with importers we know and trust.`,
  },
  {
    id: "nybörjare",
    question: "Which natural wine should I start with?",
    cta: { text: "Explore the list and filter by taste (in Swedish) →", href: TOP100 },
    answer: `The best natural wine to start with is one that matches how you already drink.

Do you like light, fresh wines? Start there. Prefer something with more body and depth? Same thing. Natural wine comes in every style — from light and fizzy to full-bodied and complex.

The smartest thing you can do is think about what you usually like and start from there. Our parameters on the Top 100 list help you filter on exactly that — taste profile, funk level and style — so that your first natural wine feels like a natural next step, not an experiment.

All the wines we present are of high quality and give a good reference for how each grape, style and type should taste. You are in good hands.`,
  },
  {
    id: "forvaring",
    question: "How do you store natural wine at home?",
    answer: `The same rules apply to natural wine as to regular wine — nothing mysterious here.

• Dark and cool — 12–16°C is ideal, avoid direct sunlight and heat sources.
• Lying down if the bottle has a cork — keeps the cork moist and prevents oxidation.
• Stable — avoid big temperature swings and vibrations.

Natural wine can certainly be aged. Many natural wines develop nicely over time, just like conventional wines. How long depends on the producer and the style — just as with any other wine.`,
  },
  {
    id: "orange-vin",
    question: "What is orange wine?",
    cta: { text: "See orange wines in the list (in Swedish) →", href: TOP100 },
    answer: `Orange wine is white wine made like red — that is the simplest explanation.

Normally white grapes are pressed directly and the skins are thrown away. With orange wine the skins are left in contact with the must during fermentation, sometimes for a few days, sometimes for several months. It is the skin contact that gives the wine its characteristic golden to deep orange colour.

The skins also contribute tannins and aromas you otherwise don't find in white wine — giving a more complex, slightly more bitter and often nuttier taste profile.

Many orange wines are aged in clay amphorae, an ancient method that preserves the wine's character without adding flavour. But that is not a requirement — orange wine can just as well be aged in neutral barrels or steel.

Orange wine is not automatically natural wine, but the two worlds often overlap. Many natural wine producers are skin-contact enthusiasts.

Curious? We have a bunch of orange favourites in our Top 100 list.`,
  },
  {
    id: "pet-nat",
    question: "What is pét-nat?",
    cta: { text: "Find pét-nat in the list (in Swedish) →", href: TOP100 },
    answer: `Pét-nat is short for pétillant naturel — French for "naturally sparkling". It is one of the oldest methods of making sparkling wine, and right now one of the hottest styles in natural wine.

The technique is called méthode ancestrale. The wine is bottled before fermentation has finished, which means the natural carbon dioxide from the fermentation is trapped in the bottle. No additives, no dosage, no extra yeast — just the grape and the process.

The result is often a little rustic, fizzy and lively. Not as taut and precise as champagne, more like a glass with personality. Often a little cloudy, often with sediment that settles at the bottom of the bottle.

Pét-nat is also an excellent first encounter with natural wine — easy to drink, fresh and usually with lower alcohol. It is hard not to like a glass of pét-nat in the sun.`,
  },
  {
    id: "veganskt",
    question: "Is natural wine vegan?",
    answer: `More often than you might think — and more often than conventional wine.

Traditional wine fining uses animal products such as egg white, gelatine or casein to clarify the wine. It is entirely common in conventional wine production and doesn't show in the final product — but it has passed through.

Natural wine is rarely or never fined, which means that most natural wines are vegan by definition — not because they are labelled as such, but because the process simply doesn't use animal products.

Some producers are vegan certified, but many small natural wine producers don't do these labels — it takes time and costs money. That says nothing about the quality or whether the wine actually is vegan.

Unsure about any of the wines we present? Get in touch and we will help you.`,
  },
  {
    id: "pris",
    question: "How much does natural wine cost?",
    answer: `Natural wine usually costs more than a conventional wine on the same shelf — and once you understand why, it feels more like a bargain.

Organic farming, hand-picking, smaller harvests, no way to correct with additives. It is craft from vineyard to bottle, and it shows in the glass.

You rarely find a genuine natural wine under SEK 100 — and for a wine to be sold at that price, big compromises have to be made on exactly what makes natural wine natural wine.

But if you look at what you actually get in the glass — the craft, the knowledge, the expression of terroir and the complexity — natural wine is often one of the best buys in the wine world.`,
  },
  {
    id: "laga-mat",
    question: "Can you cook with natural wine?",
    answer: `Yes, absolutely — and it is easier than you think.

There are many rules and rules of thumb about cooking wine — that you should use wine from the same region as the dish, that it should be a specific wine, that you should drink the same with the meal. We keep it simpler than that.

The most important thing when cooking with wine is actually the colour. White for lighter dishes, red for darker ones. That is pretty much the whole rulebook.

Much of the wine's flavour and aroma disappears when it boils and evaporates — so don't put a wine you love in the pot. Use something you like to drink, in a reasonable price range.

Natural wine works just like conventional wine in cooking. Nothing strange, no special rules.

And honestly? Feel free to pour a bag-in-box into the pot and save the natural wine for the glass. That is probably the smartest advice we can give.`,
  },
  {
    id: "varfor-dyrare",
    question: "Why is natural wine more expensive?",
    answer: `Short answer: because it costs more to make.

Organic or biodynamic farming requires more work and gives lower yields. Hand-picking instead of machine harvesting. Longer time in the cellar with no way of speeding up the process with additives or technology.

And unlike large-scale wine production, where every step can be standardised and made more efficient — natural wine is by definition the opposite. Every vintage is unique, every bottle is the result of a whole year's work in the vineyard.

It is not a premium for a fancy brand. It is the price of genuine craft.`,
  },
  {
    id: "basta-naturvin-systembolaget",
    question: "What is the best natural wine at Systembolaget?",
    cta: { text: "Filter and find your wine (in Swedish) →", href: TOP100 },
    answer: `It depends on what you like — and that is exactly why we built Naturvinstipset. There is no objectively best natural wine, but there is a best natural wine for you.

Our list is sorted by editorial rating and complemented by community ratings from real drinkers. Filter on taste profile, wine type and funk level and you will find your next favourite wine faster than you think.`,
  },
  {
    id: "naturvin-nyborjare",
    question: "Which natural wine suits a beginner?",
    cta: { text: "Explore the list (in Swedish) →", href: TOP100 },
    answer: `Start with a wine that matches how you already drink.

Do you like fresh, easy-drinking wines? Choose one with high acidity and low funk. Prefer something with more body? Filter on body.

All the wines we present are of high quality and give a fair picture of what natural wine can be. You will find clear taste parameters on every wine card, so you know what you are getting before you order.`,
  },
  {
    id: "naturvin-till-mat",
    question: "Which natural wine goes with food?",
    cta: { text: "See wines with taste parameters (in Swedish) →", href: TOP100 },
    answer: `The basic rule is simple — white and light with lighter dishes, red and fuller with darker dishes. But natural wine is generous.

Pét-nat works with almost anything. Orange wine is fantastic with spicy dishes, cheeses and vegetables. A light red with low tannin can be served chilled and works like a white.

Check the taste parameters on the wine card — body and tannin are your best guides when choosing wine for food.`,
  },
  {
    id: "biodynamiskt",
    question: "What is biodynamic wine?",
    answer: `Biodynamics is organic farming taken a step further — and a bit further than that.

The basis is to see the vineyard as a whole, closed ecosystem where everything is connected. The health of the soil, the cycles of the plants, the role of the animals. No artificial fertiliser, no synthetic pesticides — just like organic. But biodynamics adds its own layer of philosophy and practice.

Among other things, this means working according to the lunar calendar, using biodynamic preparations to strengthen the natural forces of the soil and the plants, and often keeping animals on the estate as part of the cycle.

Certified by organisations such as Demeter — one of the strictest certifications in agriculture as a whole.

Biodynamic wine is not automatically natural wine, but many of the world's most celebrated natural wine producers work biodynamically. It is a philosophy that fits the natural wine movement like a glove.`,
  },
];

// Frågorna som strukturerad data, ur samma text som syns på sidan.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "en",
  mainEntity: sections.map((s) => ({
    "@type": "Question",
    name: s.question,
    acceptedAnswer: { "@type": "Answer", text: s.answer },
  })),
};

export default function WhatIsNaturalWinePage() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      <div className="border-b-[3px] border-[var(--ink)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="inline-block self-start bg-[var(--accent)] text-[var(--fg)] border-2 border-[var(--ink)] text-sm font-bold px-2 py-0.5 mb-4">Guide</p>
          <h1 className="text-5xl md:text-7xl mb-4">
            What is natural wine?
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            Why is it cloudy? Will it give you a hangover? We answer the questions you google at 10 pm.
          </p>
        </div>
      </div>

      <div className="border-b border-[var(--rule)] bg-[var(--bg)] sticky top-[67px] z-10">
        <div className="max-w-2xl mx-auto px-6 py-3 flex gap-5 overflow-x-auto text-xs text-[var(--muted)] whitespace-nowrap">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="hover:text-[var(--fg)] transition-colors shrink-0">
              {s.question.replace("?", "")}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-16">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="scroll-mt-32">
            <div className="flex items-start gap-5 mb-5">
              <span className="shrink-0 text-xs font-medium text-[var(--faint)] pt-1.5 w-5 text-right tabular-nums">
                {i + 1}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-[var(--fg)] leading-tight">{s.question}</h2>
            </div>
            <div className="text-[var(--muted)] leading-relaxed whitespace-pre-line text-[15px] pl-10">
              {s.answer}
            </div>
            {s.cta && (
              <div className="pl-10 mt-4">
                <Link
                  href={s.cta.href}
                  hrefLang="sv"
                  className="inline-flex items-center text-xs font-semibold text-[var(--fg)] border-b border-[var(--fg)] hover:opacity-60 transition-opacity pb-px"
                >
                  {s.cta.text}
                </Link>
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="border-t border-[var(--rule)] py-16 px-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-1">Ready to try?</h2>
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
