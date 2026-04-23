import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vad är naturvin? – 15 vanliga frågor besvarade | Naturvinstipset",
  description:
    "Varför är det grumligt? Blir man bakis? Vad är orange vin? Vi svarar på frågorna du googlar kl 22 — komplett guide till naturvin för nybörjare och nyfikna.",
  openGraph: { url: "https://naturvinstipset.se/vad-ar-naturvin" },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Vad är naturvin?",
      acceptedAnswer: { "@type": "Answer", text: "Enkelt förklarat: naturvin är vin gjort med så lite inblandning som möjligt. Druvan får tala, platsen får synas, och vinmakaren håller händerna i fickan så mycket det går." },
    },
    {
      "@type": "Question",
      name: "Vad är skillnaden mot ekologiskt och biodynamiskt vin?",
      acceptedAnswer: { "@type": "Answer", text: "Ekologiskt vin handlar mest om vad som händer i vingården. Biodynamiskt tar det ett steg längre. Naturvin täcker hela kedjan — från vingård till flaska. Naturvin är nästan alltid ekologiskt odlat, men ett ekologiskt vin är inte per automatik naturvin." },
    },
    {
      "@type": "Question",
      name: "Varför är naturvin grumligt?",
      acceptedAnswer: { "@type": "Answer", text: "Naturvin filtreras sällan eller aldrig, vilket innebär att naturliga partiklar som jästceller och pektiner kan stanna kvar i vinet. Det är inte ett fel — det är ett medvetet val." },
    },
    {
      "@type": "Question",
      name: "Blir man bakis av naturvin?",
      acceptedAnswer: { "@type": "Answer", text: "Förmodligen inte mer än av vanligt vin — och kanske till och med lite mindre. Naturvin har ofta lägre sulfithalt och färre tillsatser. Men alkohol, dehydrering och mängd är de största bovarna oavsett vin." },
    },
    {
      "@type": "Question",
      name: "Var köper man naturvin?",
      acceptedAnswer: { "@type": "Answer", text: "Systembolaget är det självklara stället. Kolla vår Topp 100-lista — en sammanställning av de mest intressanta naturvinerna på Systembolaget, med direktlänkar så att du slipper leta själv." },
    },
    {
      "@type": "Question",
      name: "Vilket naturvin ska jag börja med?",
      acceptedAnswer: { "@type": "Answer", text: "Det bästa naturvinet att börja med är ett som matchar hur du redan dricker. Gillar du lätta, friska viner? Börja där. Föredrar du något med mer kropp? Samma sak. Naturvin finns i alla stilar." },
    },
    {
      "@type": "Question",
      name: "Vad är orange vin?",
      acceptedAnswer: { "@type": "Answer", text: "Orange vin är vitt vin gjort som rött. Man låter skalen vara kvar i kontakt med musten under jäsningen, vilket ger vinet sin karakteristiska gyllene till djupt orangea färg och mer komplexa smakprofil." },
    },
    {
      "@type": "Question",
      name: "Vad är pét-nat?",
      acceptedAnswer: { "@type": "Answer", text: "Pét-nat är kort för pétillant naturel — naturligt mousserande. Vinet buteljeras innan jäsningen är klar, vilket innebär att den naturliga kolsyran fastnar i flaskan. Ofta lite rustikt, pärligt och levande." },
    },
  ],
};

type Section = { id: string; question: string; answer: string; cta?: { text: string; href: string } };

const sections: Section[] = [
  {
    id: "vad-ar-naturvin",
    question: "Vad är naturvin?",
    answer: `Enkelt förklarat: naturvin är vin gjort med så lite inblandning som möjligt. Druvan får tala, platsen får synas, och vinmakaren håller händerna i fickan så mycket det går.

Det innebär ekologisk eller biodynamisk odling, vilda jästar istället för köpta, och inga eller minimala tillsatser i källaren. Inget socker, ingen tillsatt syra, sällan filtrering.

Det finns ingen officiell definition — naturvin är mer en filosofi än ett regelverk. Men kärnan är alltid densamma: äkthet framför kontroll.

Resultatet? Viner som verkligen avspeglar sin växtplats — det som på vinspråk kallas terroir. Jordmån, klimat, höjd över havet. Du kan nästan smaka var vinet kommer ifrån. Mer levande, mer oförutsägbara, mer karaktär.

Och nej — naturvin behöver inte smaka funky. Det är en av de vanligaste missuppfattningarna. Många naturviner är rena, friska och lättdruckna. Funky är en stil, inte en regel.`,
  },
  {
    id: "skillnad-ekologiskt",
    question: "Vad är skillnaden mot ekologiskt och biodynamiskt vin?",
    answer: `Tre begrepp som ofta blandas ihop — och det är fullt förståeligt. Här är den enkla versionen:

Ekologiskt vin handlar mest om vad som händer i vingården. Inga syntetiska bekämpningsmedel eller konstgödsel. Men i källaren tillåts fortfarande en hel del tillsatser och tekniker. Regleras av EU och märks med det gröna lövet.

Biodynamiskt vin tar det ett steg längre och ser hela vingården som ett levande ekosystem. Certifieras ofta av Demeter. Fortfarande mest fokus på odlingen.

Naturvin täcker hela kedjan — från vingård till flaska. Naturvin är nästan alltid ekologiskt odlat, men ett ekologiskt vin är inte per automatik naturvin. Det är vad som händer i källaren som avgör.

Kort sagt: ekologiskt är grunden, biodynamiskt är en filosofi, naturvin är hela paketet.`,
  },
  {
    id: "varfor-grumligt",
    question: "Varför ser det grumligt ut i glaset?",
    answer: `Konventionellt vin klarnas och filtreras noggrant innan buteljering — ofta med hjälp av äggviteprotein eller bentonit — och ger ett klart, genomskinligt vin. Men filtreringen tar inte bara bort partiklar, den kan också ta bort smak och aromer.

Naturvin filtreras sällan eller aldrig, vilket innebär att naturliga partiklar som jästceller och pektiner kan stanna kvar i vinet. Men hur grumligt det blir beror på vinmakaren — hur mycket sediment man väljer att ta med i flaskan. Många naturviner är helt klara.

Ser du ett grumligt naturvin är det alltså inte ett fel — det är ett medvetet val. Ett tecken på ett levande, obehandlat vin. Tänk på det som skillnaden mellan pastöriserad och opastöriserad juice. Båda är goda, men den opastöriserade har mer att säga.`,
  },
  {
    id: "smakar-funky",
    question: "Det smakar lite funky — är det meningen?",
    answer: `Ibland ja, ibland nej. Funky är ett brett begrepp i naturvinsvärlden och kan betyda allt från lätt cideraktigt och jordig till brett och ladugårdsaktigt.

Det kommer från de vilda jästerna och den minimala inblandningen i källaren — processer som ger mer komplexa och oförutsägbara smaker än konventionellt vin.

Men funky är en stil, inte ett krav. Och det är definitivt inte alltid ett fel. Många naturvinsälskare söker just den där levande, kantiga karaktären. Andra föredrar rena och friska naturviner — och det finns gott om sådana också.

På Naturvinstipset har vi betygsatt och kategoriserat vinerna så att du enkelt kan hitta något som passar din smakprofil — oavsett om du är nyfiken på funk eller hellre håller dig till det tillgängliga.`,
  },
  {
    id: "bakis",
    question: "Blir man bakis av naturvin?",
    answer: `Den stora frågan. Och svaret är: förmodligen inte mer än av vanligt vin — och kanske till och med lite mindre.

Myten att naturvin är helt bakisfritt lever kvar, och även om det inte stämmer helt finns det faktiskt viss logik bakom det. Naturvin har ofta lägre sulfithalt och färre tillsatser, vilket vissa upplever gör att de mår bättre dagen efter.

Forskningen är inte helt övertygande, men erfarenheten från många naturvinsälskare pekar åt samma håll — något verkar stämma.

Det vi vet är att alkohol, dehydrering och mängd är de största bovarna. Inte vilket vin.`,
  },
  {
    id: "kopa-naturvin",
    question: "Var köper man naturvin?",
    cta: { text: "Se vår Topp 100-lista →", href: "/#listan" },
    answer: `Systembolaget är det självklara stället för de flesta i Sverige — och sortimentet växer hela tiden. Men det kan vara lite knepigt att hitta rätt eftersom det inte finns något officiellt "naturvin"-filter.

Kolla vår Topp 100-lista — en sammanställning av de mest intressanta och kvalitativa naturvinerna på Systembolaget, noggrant utvalda av Sveriges seriösaste naturvinsimportörer. Vi har direktlänkar så att du slipper leta själv.

En sak att ha koll på: eftersom "naturvin" inte är ett skyddat begrepp finns det viner som marknadsförs som naturliga utan att egentligen vara det. Stora klisterlappar och "naturvin"-stämplar är inte alltid en garanti. Därför hjälper vi dig.`,
  },
  {
    id: "nybörjare",
    question: "Vilket naturvin ska jag börja med?",
    cta: { text: "Utforska listan och filtrera efter smak →", href: "/#listan" },
    answer: `Det bästa naturvinet att börja med är ett som matchar hur du redan dricker.

Gillar du lätta, friska viner? Börja där. Föredrar du något med mer kropp och djup? Samma sak. Naturvin finns i alla stilar — från lätt och pärligt till fylligt och komplext.

Det smartaste du kan göra är att tänka på vad du brukar gilla och utgå från det. Våra parametrar på Topp 100-listan hjälper dig att filtrera på just det — smakprofil, funk-nivå och stil — så att ditt första naturvin känns som ett naturligt nästa steg, inte ett experiment.

Alla viner vi presenterar håller hög kvalitet och ger en bra referens för hur respektive druva, stil och typ bör smaka. Du är i goda händer.`,
  },
  {
    id: "forvaring",
    question: "Hur förvarar man naturvin hemma?",
    answer: `Samma regler gäller för naturvin som för vanligt vin — inget mystiskt här.

• Mörkt och svalt — 12–16°C är idealiskt, undvik direkt solljus och värmekällor.
• Liggande om flaskan har kork — håller korken fuktig och förhindrar oxidation.
• Stabilt — undvik starka temperaturväxlingar och vibrationer.

Naturvin kan absolut lagras. Många naturviner utvecklas fint över tid, precis som konventionella viner. Hur länge beror på producenten och stilen — precis som med allt annat vin.`,
  },
  {
    id: "orange-vin",
    question: "Vad är orange vin?",
    cta: { text: "Se orangea viner i listan →", href: "/#listan" },
    answer: `Orange vin är vitt vin gjort som rött — det är den enklaste förklaringen.

Normalt sett pressas vita druvor direkt och skalen slängs. Vid orange vin låter man skalen vara kvar i kontakt med musten under jäsningen, ibland i några dagar, ibland i flera månader. Det är skalkontakten som ger vinet sin karakteristiska gyllene till djupt orangea färg.

Skalen bidrar också med tanniner och aromer som du annars inte hittar i vitt vin — det ger en mer komplex, lite bittrare och ofta nötigare smakprofil.

Många orange viner lagras i amforakrukor av lera, en uråldrig metod som bevarar vinets karaktär utan att tillföra smak. Men det är inget krav — orange vin kan lika gärna lagras i neutralt fat eller stål.

Orange vin är inte per automatik naturvin, men de två världarna överlappar ofta. Många naturvinsproducenter är just skalkontakt-entusiaster.

Nyfiken? Vi har ett gäng orangea favoriter i vår Topp 100-lista.`,
  },
  {
    id: "pet-nat",
    question: "Vad är pét-nat?",
    cta: { text: "Hitta pét-nat i listan →", href: "/#listan" },
    answer: `Pét-nat är kort för pétillant naturel — franska för "naturligt mousserande". Det är en av de äldsta metoderna för att göra mousserande vin, och just nu en av de hetaste stilarna inom naturvin.

Tekniken kallas méthode ancestrale. Vinet buteljeras innan jäsningen är klar, vilket innebär att den naturliga kolsyran från jäsningen fastnar i flaskan. Inga tillsatser, ingen dosage, ingen extra jäst — bara druvan och processen.

Resultatet är ofta lite rustikt, pärligt och levande. Inte lika stramt och precist som champagne, mer som ett glas som har personlighet. Ofta lite grumligt, ofta med en kropp som sätter sig längst ner i flaskan.

Pét-nat är också ett utmärkt första möte med naturvin — lättdrucket, friskt och oftast med lägre alkohol. Det är svårt att inte gilla ett glas pét-nat i solen.`,
  },
  {
    id: "veganskt",
    question: "Är naturvin veganskt?",
    answer: `Oftare än du kanske tror — och oftare än konventionellt vin.

Traditionell vinklarning använder animaliska produkter som äggvita, gelatin eller kasein för att klara vinet. Det är helt vanligt i konventionell vinproduktion och syns inte i slutprodukten — men det har passerat igenom.

Naturvin klarnas sällan eller aldrig, vilket innebär att de flesta naturviner är veganska per definition — inte för att de är märkta som det, utan för att processen helt enkelt inte använder animaliska produkter.

Vissa producenter är vegancertifierade, men många små naturvinsproducenter gör inte dessa märkningar — det tar tid och kostar pengar. Det säger ingenting om kvaliteten eller om vinet faktiskt är veganskt.

Är du osäker på något av vinerna vi presenterar? Hör av dig så hjälper vi dig.`,
  },
  {
    id: "pris",
    question: "Hur mycket kostar naturvin?",
    answer: `Naturvin kostar oftast mer än ett konventionellt vin i samma hylla — och när du förstår varför känns det snarare som ett fynd.

Ekologisk odling, handplockning, mindre skördar, ingen möjlighet att korrigera med tillsatser. Det är hantverk från vingård till flaska, och det syns i glaset.

Du hittar sällan ett äkta naturvin under 100 kr — och för att ett vin ska kunna säljas till det priset måste man göra stora kompromisser på just det som gör naturvin till naturvin.

Men ser du till vad du faktiskt får i glaset — hantverket, kunskapen, terroiruttrycket och komplexiteten — är naturvin ofta ett av vinvärldens bästa köp.`,
  },
  {
    id: "laga-mat",
    question: "Kan man laga mat med naturvin?",
    answer: `Ja, absolut — och det är enklare än du tror.

Det finns många regler och tumregler kring matlagningsvin — att man ska använda vin från samma region som rätten, att det ska vara ett specifikt vin, att man ska dricka samma till maten. Vi håller det enklare än så.

Det viktigaste när du lagar mat med vin är faktiskt färgen. Vitt till ljusare rätter, rött till mörkare. Det är i stort sett hela regelboken.

Mycket av vinets smak och aromer försvinner när det kokar och avdunstar — så lägg inte ner ett vin du älskar i grytan. Använd något du tycker om att dricka, i en rimlig prisklass.

Naturvin fungerar precis som konventionellt vin i matlagning. Inga konstigheter, inga särskilda regler.

Och helt ärligt? Häll gärna en bag-in-box i grytan och spara naturvinet till glaset. Det är nog det smartaste rådet vi kan ge.`,
  },
  {
    id: "varfor-dyrare",
    question: "Varför är naturvin dyrare?",
    answer: `Kort svar: för att det kostar mer att göra.

Ekologisk eller biodynamisk odling kräver mer arbete och ger lägre skördar. Handplockning istället för maskinskörd. Längre tid i källaren utan möjlighet att snabba på processen med tillsatser eller teknik.

Och till skillnad från storskalig vinproduktion där man kan standardisera och effektivisera varje steg — är naturvin per definition det motsatta. Varje årgång är unik, varje flaska är ett resultat av ett helt års arbete i vingården.

Det är inte ett premium för ett fancy varumärke. Det är priset för äkta hantverk.`,
  },
  {
    id: "biodynamiskt",
    question: "Vad är biodynamiskt vin?",
    answer: `Biodynamik är ekologisk odling tagen ett steg längre — och lite längre än så.

Grunden är att se vingården som ett helt slutet ekosystem där allt hänger ihop. Jordens hälsa, växternas cykler, djurens roll. Inget konstgödsel, inga syntetiska bekämpningsmedel — precis som ekologiskt. Men biodynamik lägger till ett eget lager av filosofi och praktik.

Det innebär bland annat att man arbetar efter månkalendern, använder biodynamiska preparat för att stärka jordens och plantornas naturliga krafter, och ofta håller djur på gården som en del av kretsloppet.

Certifieras av organisationer som Demeter — en av de strängaste certifieringarna inom jordbruk överhuvudtaget.

Biodynamiskt vin är inte per automatik naturvin, men många av världens mest hyllade naturvinsproducenter arbetar biodynamiskt. Det är en filosofi som passar naturvinsrörelsen som hand i handske.`,
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
            Varför är det grumligt? Blir man bakis? Vi svarar på frågorna du googlar kl 22.
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
            {s.cta && (
              <div className="pl-10 mt-4">
                <Link
                  href={s.cta.href}
                  className="inline-flex items-center text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--fg)] border-b border-[var(--fg)] hover:opacity-60 transition-opacity pb-px"
                >
                  {s.cta.text}
                </Link>
              </div>
            )}
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
