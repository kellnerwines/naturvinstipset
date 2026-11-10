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
      "Du kan beställa naturvin från webbutiker med hemleverans, till exempel Vin & Natur, Flaskvis och Philipson Wine, eller hämta det på Systembolaget. Vinkompassen här på Naturvinstipset visar viner från båda. Vi listar bara webbutiker som säljer till Sverige med svensk alkoholskatt inräknad i priset, så att priset du ser är det du betalar för vinet.",
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

export default function HomeFaq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section className="border-t border-[var(--rule)] bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h2
          className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--fg)] mb-10"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Vanliga frågor om naturvin
        </h2>
        <div className="space-y-8">
          {FAQS.map((f) => (
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
