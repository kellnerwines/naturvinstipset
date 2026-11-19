import type { Lang } from "@/lib/i18n";

const FAQS_EN = [
  {
    question: "What is natural wine?",
    answer:
      "Natural wine is wine made with minimal intervention — organically or biodynamically grown grapes, wild yeasts and few or no additives in the cellar. There is no official definition, but the principle is always the same: the grape and the place should show in the glass.",
  },
  {
    question: "Does natural wine contain sulphites?",
    answer:
      "Yes, almost all wine contains some sulphites, since they form naturally during fermentation. Natural wine, however, rarely has extra sulphur added in the cellar, which often gives considerably lower sulphite levels than conventional wine.",
  },
  {
    question: "Where can you buy natural wine online in Sweden?",
    answer:
      "You can order natural wine from online shops with home delivery, for example Vin & Natur, Flaskvis, Philipson Wine, Wine Trade and Just Wine, or collect it at Systembolaget. The Wine Compass here on Naturvinstipset shows wines from both. We only list online shops that sell to Sweden with Swedish alcohol tax included in the price, so the price you see is what you pay for the wine.",
  },
  {
    question: "Is alcohol tax included when you buy wine from an online shop in the EU?",
    answer:
      "Not always. When wine is sent to your home in Sweden, Swedish alcohol tax must be paid. Some online shops include it in the price, while others let you as the buyer pay the tax yourself afterwards. The online shops on Naturvinstipset have Swedish alcohol tax included in the price. Always check the terms before ordering from a shop we don't list.",
  },
  {
    question: "How do you find natural wine at Systembolaget?",
    answer:
      "Most natural wines are sold through Systembolaget's temporary range and order range rather than on the regular shelf, so they can be hard to find on your own. The easiest way is to search for the producer or item number directly on systembolaget.se — or use our Top 100 list here on Naturvinstipset, with direct links to each wine.",
  },
];

const FAQS = [
  {
    question: "Vad är naturvin?",
    answer:
      "Naturvin är vin gjort med minimal inblandning — ekologiskt eller biodynamiskt odlade druvor, vilda jästar och få eller inga tillsatser i källaren. Det finns ingen officiell definition, men principen är alltid densamma: druvan och platsen ska synas i glaset.",
  },
  {
    question: "Innehåller naturvin sulfiter?",
    answer:
      "Ja, nästan allt vin innehåller viss mängd sulfiter eftersom de bildas naturligt under jäsningen. Naturvin tillsätts dock sällan extra svavel i källaren, vilket ofta ger betydligt lägre sulfithalter än konventionellt vin.",
  },
  {
    question: "Var kan man köpa naturvin online i Sverige?",
    answer:
      "Du kan beställa naturvin från webbutiker med hemleverans, till exempel Vin & Natur, Flaskvis, Philipson Wine, Wine Trade och Just Wine, eller hämta det på Systembolaget. Vinkompassen här på Naturvinstipset visar viner från båda. Vi listar bara webbutiker som säljer till Sverige med svensk alkoholskatt inräknad i priset, så att priset du ser är det du betalar för vinet.",
  },
  {
    question: "Ingår alkoholskatten när man köper vin från en webbutik i EU?",
    answer:
      "Inte alltid. När vin skickas hem till dig i Sverige ska svensk alkoholskatt betalas. En del webbutiker tar med den i priset, medan andra låter dig som köpare betala skatten själv i efterhand. Webbutikerna på Naturvinstipset har svensk alkoholskatt inräknad i priset. Kontrollera alltid villkoren innan du beställer från en butik vi inte listar.",
  },
  {
    question: "Hur hittar man naturvin på Systembolaget?",
    answer:
      "De flesta naturviner säljs via Systembolagets tillfälliga sortiment och beställningssortiment snarare än i den fasta hyllan, så de kan vara svåra att hitta på egen hand. Enklast är att söka på producent eller artikelnummer direkt på systembolaget.se — eller använda vår Topp 100-lista här på Naturvinstipset med direktlänkar till varje vin.",
  },
];

export default function HomeFaq({ lang = "sv" }: { lang?: Lang }) {
  const faqs = lang === "en" ? FAQS_EN : FAQS;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section className="border-t-[3px] border-[var(--ink)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-5xl md:text-6xl mb-10">
          {lang === "en" ? "Common questions about natural wine" : "Vanliga frågor om naturvin"}
        </h2>
        <div className="space-y-8">
          {faqs.map((f) => (
            <div key={f.question}>
              <h3 className="font-bold text-[var(--fg)] mb-2">{f.question}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
