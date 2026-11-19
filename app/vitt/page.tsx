import type { Metadata } from "next";
import CategoryGuidePage from "@/components/CategoryGuidePage";
import { GUIDE_LINKS, currentYear } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const title = `Vitt naturvin – bästa vita naturvinerna på Systembolaget ${currentYear()} och med hemleverans`;
  const description = "Vita naturviner i Sverige just nu, först de på Systembolaget och sedan de med hemleverans. Hur vitt naturvin skiljer sig från vanligt vitt och vad det passar till.";
  return {
    alternates: { canonical: "/vitt" },
    title,
    description,
    openGraph: { title, description, url: "https://www.naturvinstipset.se/vitt" },
  };
}

// Allmänt kända fakta om stilen, inga påståenden om enskilda producenter.
const FAQ = [
  {
    q: "Vad är vitt naturvin?",
    a: "Vitt naturvin görs på gröna druvor som odlas ekologiskt eller biodynamiskt, plockas för hand och jäser med druvornas egen jäst. Vinet justeras inte med tillsatser, filtreras sällan och får lite eller inget svavel.",
  },
  {
    q: "Varför är vitt naturvin ibland grumligt?",
    a: "Det filtreras och klarnas sällan, så små partiklar från druvorna och jästen finns kvar. Det påverkar inte kvaliteten. Vill du ha ett klarare glas kan du låta flaskan stå upprätt en stund innan du häller upp.",
  },
  {
    q: "Vad är skillnaden mellan vitt naturvin och orangevin?",
    a: "Ett vitt vin pressas direkt så att musten skiljs från skalen. Ett orangevin får jäsa med skalen, vilket ger färg och lite strävhet. Orangevinerna finns på en egen sida.",
  },
];

export default function VittPage() {
  return (
    <CategoryGuidePage
      path="/vitt"
      title="Vitt naturvin"
      description="Vita naturviner som går att köpa i Sverige just nu, först de som finns på Systembolaget och sedan de du kan få hem från webbutiker. Från friska och lätta till fylliga viner med lite textur."
      wineTypes={["Vitt"]}
      nounSingular="vitt naturvin"
      nounPlural="vita naturviner"
      faqNouns={{ best: "vita naturvinet", one: "vitt naturvin", many: "vita naturviner" }}
      crumb="Vitt naturvin"
      faq={FAQ}
      guideLinks={GUIDE_LINKS.filter((g) => g.href !== "/vitt")}
    />
  );
}
