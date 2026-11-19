import type { Metadata } from "next";
import CategoryGuidePage from "@/components/CategoryGuidePage";
import { GUIDE_LINKS, currentYear } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const title = `Rött naturvin – bästa röda naturvinerna på Systembolaget ${currentYear()} och med hemleverans`;
  const description = "Röda naturviner i Sverige just nu, först de på Systembolaget och sedan de med hemleverans. Vad som skiljer rött naturvin från vanligt rött och vad det passar till.";
  return {
    alternates: { canonical: "/rott" },
    title,
    description,
    openGraph: { title, description, url: "https://www.naturvinstipset.se/rott" },
  };
}

// Allmänt kända fakta om stilen, inga påståenden om enskilda producenter.
const FAQ = [
  {
    q: "Vad är rött naturvin?",
    a: "Rött naturvin görs på blå druvor som odlas ekologiskt eller biodynamiskt, plockas för hand och jäser med druvornas egen jäst. Vinet justeras inte med tillsatser, filtreras sällan och får lite eller inget svavel.",
  },
  {
    q: "Hur smakar rött naturvin?",
    a: "Ofta saftigare och friskare än vanligt rött vin, med mer frukt och mindre ek. Många röda naturviner är lätta och passar att dricka lite svala, men det finns också kraftiga och strama viner. Smakprofilen på varje vin visar var det hamnar.",
  },
  {
    q: "Ska rött naturvin serveras kallt?",
    a: "Lätta röda naturviner, till exempel på gamay eller pinot noir, blir ofta bäst runt 14 grader. Ställ flaskan i kylen en halvtimme innan. Fylligare viner kan serveras något varmare.",
  },
];

export default function RottPage() {
  return (
    <CategoryGuidePage
      path="/rott"
      title="Rött naturvin"
      description="Röda naturviner som går att köpa i Sverige just nu, först de som finns på Systembolaget och sedan de du kan få hem från webbutiker. Många är lättare och friskare än man väntar sig, och flera mår bra av att serveras lite svala."
      wineTypes={["Rött"]}
      nounSingular="rött naturvin"
      nounPlural="röda naturviner"
      faqNouns={{ best: "röda naturvinet", one: "rött naturvin", many: "röda naturviner" }}
      crumb="Rött naturvin"
      faq={FAQ}
      guideLinks={GUIDE_LINKS.filter((g) => g.href !== "/rott")}
    />
  );
}
