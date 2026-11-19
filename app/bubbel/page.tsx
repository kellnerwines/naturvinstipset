import type { Metadata } from "next";
import CategoryGuidePage from "@/components/CategoryGuidePage";
import { GUIDE_LINKS, currentYear } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const title = `Naturvin med bubbel – mousserande naturvin och pét nat på Systembolaget ${currentYear()} och med hemleverans`;
  const description = "Mousserande naturvin och pét nat i Sverige just nu, först de på Systembolaget och sedan de med hemleverans. Skillnaden mellan pét nat och andra mousserande naturviner.";
  return {
    alternates: { canonical: "/bubbel" },
    title,
    description,
    openGraph: { title, description, url: "https://www.naturvinstipset.se/bubbel" },
  };
}

// Allmänt kända fakta om stilen, inga påståenden om enskilda producenter.
const FAQ = [
  {
    q: "Vad är mousserande naturvin?",
    a: "Mousserande naturvin görs av druvor som odlas ekologiskt eller biodynamiskt och jäser med druvornas egen jäst, och vinet justeras inte med tillsatser. Bubblorna kan komma på två sätt: som pét nat, där vinet buteljeras innan jäsningen är klar, eller med traditionell metod, där vinet jäser en andra gång i flaskan.",
  },
  {
    q: "Vad är skillnaden mellan pét nat och annat mousserande naturvin?",
    a: "Pét nat jäser bara en gång och får sina bubblor från druvornas eget socker. Mousserande viner med traditionell metod jäser två gånger och ligger ofta länge på jästen innan de degorgeras. Pét nat är oftast mjukare och mer rustikt, traditionell metod finare i bubblan.",
  },
  {
    q: "Är naturvin med bubbel sött?",
    a: "Nej, de flesta är torra. Pét nat kan ibland ha lite restsötma om jäsningen inte gick hela vägen, men det står oftast på flaskan eller i beskrivningen.",
  },
];

export default function BubbelPage() {
  return (
    <CategoryGuidePage
      path="/bubbel"
      title="Naturvin med bubbel"
      description="Mousserande naturviner och pét nat som går att köpa i Sverige just nu, först de som finns på Systembolaget och sedan de du kan få hem från webbutiker."
      wineTypes={["Mousserande", "Pét Nat"]}
      nounSingular="mousserande naturvin"
      nounPlural="mousserande naturviner"
      faqNouns={{ best: "mousserande naturvinet", one: "mousserande naturvin", many: "mousserande naturviner" }}
      crumb="Naturvin med bubbel"
      faq={FAQ}
      guideLinks={GUIDE_LINKS.filter((g) => g.href !== "/bubbel")}
    />
  );
}
