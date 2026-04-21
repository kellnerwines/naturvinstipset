import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vad är naturvin? – Komplett guide för nybörjare",
  description:
    "Vad är naturvin egentligen? Vi svarar på de vanligaste frågorna: skillnad mot ekologiskt vin, varför det är grumligt, om det ger huvudvärk, och var du hittar det på Systembolaget.",
  openGraph: { url: "https://naturvinstipset.se/vad-ar-naturvin" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Vad är naturvin?",
      acceptedAnswer: { "@type": "Answer", text: "Naturvin är vin gjort med minimal inblandning i vingård och källare. Druvorna odlas utan bekämpningsmedel och vinet jäser med naturliga jästar. Inga eller mycket få tillsatser används." },
    },
    {
      "@type": "Question",
      name: "Vad är skillnaden mellan naturvin och ekologiskt vin?",
      acceptedAnswer: { "@type": "Answer", text: "Ekologiskt vin regleras av lag och handlar om odlingen. Naturvin är ett bredare begrepp som också täcker vinifieringen – hur vinet görs i källaren. Naturvin är oftast ekologiskt, men ekologiskt vin är inte alltid naturvin." },
    },
    {
      "@type": "Question",
      name: "Varför är naturvin grumligt?",
      acceptedAnswer: { "@type": "Answer", text: "Naturvin filtreras sällan eller aldrig, vilket gör att naturliga partiklar (jästceller, druvskal) stannar kvar i flaskan. Det grumliga utseendet är ett tecken på ett obehandlat, levande vin – inte ett fel." },
    },
    {
      "@type": "Question",
      name: "Ger naturvin mer huvudvärk?",
      acceptedAnswer: { "@type": "Answer", text: "Myten är envis, men vetenskapligt stöd saknas. Naturvin har ofta lägre sulfithalt, vilket vissa tror minskar risken för huvudvärk. Alkohol och mängd är den vanligaste orsaken till vinrelaterade besvär." },
    },
    {
      "@type": "Question",
      name: "Var kan man köpa naturvin i Sverige?",
      acceptedAnswer: { "@type": "Answer", text: "Systembolaget har ett växande sortiment av naturviner, även om de inte alltid är märkta som sådana. Kolla vår topp 100-lista för direktlänkar till Systembolaget. Naturvin finns också hos vinbarer och specialiserade importörer." },
    },
    {
      "@type": "Question",
      name: "Vilket naturvin ska jag börja med?",
      acceptedAnswer: { "@type": "Answer", text: "Börja gärna med ett vitt eller orange naturvin – de är ofta mer tillgängliga i smaken. Välj ett vin med låg funk-rating om du är osäker. Kolla vår topp 100-lista för nybörjarvänliga val." },
    },
  ],
};

type Section = { id: string; question: string; answer: string; extra?: string };

const sections: Section[] = [
  {
    id: "vad-ar-naturvin",
    question: "Vad är naturvin?",
    answer:
      `Naturvin är vin gjort med så lite inblandning som möjligt – både i vingården och i källaren. Det handlar om att låta druvan och platsen tala, snarare än att styra processen med teknik och tillsatser.

I praktiken innebär det:
• Druvorna odlas ekologiskt eller biodynamiskt, utan syntetiska bekämpningsmedel
• Vinet jäser med vilda, naturliga jästar (inte kommersiella jästkulturer)
• Inga eller minimala tillsatser används (sulfiter, socker, syra, etc.)
• Vinet filtreras sällan eller aldrig

Det finns ingen officiell laglig definition av "naturvin" – det är mer en filosofi och rörelse bland vinmakare världen över.`,
  },
  {
    id: "skillnad-ekologiskt",
    question: "Vad är skillnaden mot ekologiskt vin och biodynamiskt vin?",
    answer:
      `Det är en vanlig förvirring! Här är de tre begreppen förklarade:

**Ekologiskt vin** regleras av EU-lag. Det handlar nästan uteslutande om odlingen – inga syntetiska bekämpningsmedel. Men i källaren tillåts fortfarande många tillsatser.

**Biodynamiskt vin** tar det ett steg längre och ser vingården som ett helt ekosystem. Certifieras av organisationer som Demeter. Strängare regler, men fokuserar fortfarande mest på odlingen.

**Naturvin** är det vidaste begreppet och täcker hela kedjan – från vingård till flaska. Naturvin är nästan alltid ekologiskt, men ett ekologiskt vin är inte per automatik naturvin.`,
  },
  {
    id: "varfor-grumligt",
    question: "Varför är naturvin grumligt?",
    answer:
      `Konventionellt vin klarnas och filtreras ofta noggrant – det tar bort partiklar men kan också ta bort smak och aromer.

Naturvin filtreras sällan eller aldrig. Det innebär att naturliga partiklar (jästceller, pektiner, druvskal) stannar kvar i vinet. Resultatet är ett grumligt eller disigt utseende.

Det grumliga utseendet är inte ett fel – det är ett tecken på ett levande, obehandlat vin. Tänk på det som skillnaden mellan pastöriserad och opastöriserad juice: båda är goda, men den opastöriserade är mer komplex.`,
  },
  {
    id: "smakar-konstigt",
    question: "Varför kan naturvin smaka konstigt – nästan som cider eller äppeljuice?",
    answer:
      `Det är en av de vanligaste reaktionerna bland nybörjare. Naturvin kan ibland ha ovanliga smaker som:
• Cider eller fermenterade äpplen
• Lite "pärlig" (lätt kolsyra)
• Jordig eller svamplika toner
• Ibland lite brett eller "ladugårdsaktigt"

Detta beror på de vilda jästerna och den minimala inblandningen. Det är inte alltid ett tecken på dåligt vin – men ibland är det det.

På Naturvinstipset värnar vi om naturvin med balans och drickbarhet. Vår topp 100 fokuserar på viner som smakar gott, inte bara "naturliga".`,
  },
  {
    id: "huvudvark",
    question: "Ger naturvin mer huvudvärk?",
    answer:
      `Det korta svaret: antagligen inte mer än vanligt vin.

Myten att sulfiter orsakar huvudvärk är utbredd men saknar starkt vetenskapligt stöd. De flesta människor tål sulfiter precis bra. Naturvin har ofta lägre sulfithalt, men det är inte bevisat att det minskar risken för huvudvärk.

De vanligaste orsakerna till vinrelaterade besvär är:
• Alkohol (den viktigaste faktorn)
• Dehydrering (drick vatten!)
• Mängd konsumerat vin
• Histaminer (som finns i alla viner, inte bara naturvin)

Vill du minimera risken – drick lagom, drick vatten till, och välj lättare viner med lägre alkoholhalt.`,
  },
  {
    id: "kopa-systembolaget",
    question: "Var hittar jag naturvin på Systembolaget?",
    answer:
      `Systembolaget har inget officiellt "naturvin"-filter, men sortimentet växer hela tiden. Så här hittar du dem:

1. **Kolla vår Topp 100-lista** – vi har direktlänkar till varje vin på Systembolaget
2. **Sök på kända naturvinsproducenter** – t.ex. Gut Oggau, Partida Creus, La Stoppa, Elisabetta Foradori
3. **Filtrera på ekologiskt och biodynamiskt** – de flesta naturviner är certifierade
4. **Fråga personalen** – många Systembolagets butiker har vinexperter som kan guida dig

Tänk på att många naturviner är beställningssortiment – de finns inte alltid i hyllan men kan beställas hem.`,
  },
  {
    id: "nybörjare",
    question: "Vilket naturvin ska jag börja med som nybörjare?",
    answer:
      `Vår bästa nybörjarrekommendation:

**Börja med vitt eller orange** – dessa är ofta mer tillgängliga i smaken än röda naturviner som kan ha mer funk och tanniner.

**Välj låg funk-rating** – om du ser smakprofilen på ett vin, välj ett med låg "funk" om du är osäker på vilda smaker.

**Pris runt 100–150 kr** – det finns utmärkta naturviner i det spannet på Systembolaget.

**Servera lite kallt** – naturvin mår ofta bra av att serveras lite svalare än konventionellt vin, och öppna gärna upp 15–20 minuter innan du dricker.

Kolla in vår topp 100-lista – vi har rankat dem med nybörjare i åtanke.`,
  },
  {
    id: "forvaring",
    question: "Hur förvarar man naturvin?",
    answer:
      `Naturvin är ofta mer känsligt än konventionellt vin och mår bra av:

• **Mörkt och svalt** – 12–16°C är idealiskt
• **Liggande** – håller korken fuktig och förhindrar oxidation
• **Stabilt** – undvik starka temperaturväxlingar och vibrationer
• **Drick relativt snart** – de flesta naturviner är gjorda för att drickas unga (1–3 år), inte lagras länge

Har du köpt ett naturvin och tvekar – öppna det. De flesta naturviner är inte byggda för decennierlång lagring.`,
  },
];

export default function VadArNaturvinPage() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero */}
      <div className="border-b border-[var(--rule)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">Guide</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--fg)] mb-4 leading-tight tracking-tight">
            Vad är naturvin?
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            Svar på de vanligaste frågorna – från nyfiken nybörjare till den som undrar varför vinet är grumligt.
          </p>
        </div>
      </div>

      {/* Jump links */}
      <div className="border-b border-[var(--rule)] bg-[var(--bg)] sticky top-14 z-10">
        <div className="max-w-2xl mx-auto px-6 py-3 flex gap-5 overflow-x-auto text-xs text-[var(--muted)] whitespace-nowrap">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="hover:text-[var(--fg)] transition-colors shrink-0">
              {s.question.replace("?", "")}
            </a>
          ))}
        </div>
      </div>

      {/* Content */}
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
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="border-t border-[var(--rule)] py-16 px-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-1">Redo att testa?</h2>
            <p className="text-sm text-[var(--muted)]">
              Rankad lista med direktlänkar till Systembolaget.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-[var(--fg)] border border-[var(--fg)] px-5 py-3 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
          >
            Se Topp 100 →
          </Link>
        </div>
      </div>
    </div>
  );
}
