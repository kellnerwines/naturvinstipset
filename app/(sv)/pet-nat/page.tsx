import type { Metadata } from "next";
import CategoryGuidePage from "@/components/CategoryGuidePage";
import { GUIDE_LINKS, currentYear } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const title = `Pét nat – bästa pét nat på Systembolaget ${currentYear()} och med hemleverans`;
  const description = "Pét nat bland naturvinerna i Sverige just nu, först de på Systembolaget och sedan de med hemleverans. Vad pét nat är och hur det görs.";
  return {
    alternates: { canonical: "/pet-nat" },
    title,
    description,
    openGraph: { title, description, url: "https://www.naturvinstipset.se/pet-nat" },
  };
}

// Allmänt kända fakta om stilen, inga påståenden om enskilda producenter.
const FAQ = [
  {
    q: "Vad är pét nat?",
    a: "Pét nat är en förkortning av pétillant naturel, naturligt pärlande. Vinet buteljeras medan det fortfarande jäser, och kolsyran från den sista jäsningen stannar i flaskan. Metoden är äldre än champagnemetoden och kallas också den ursprungliga metoden.",
  },
  {
    q: "Varför är pét nat grumligt?",
    a: "Jästen som bildar bubblorna stannar ofta kvar i flaskan. Vissa producenter tar bort den, andra låter den vara. Grumligheten är ofarlig och en del av stilen.",
  },
  {
    q: "Hur skiljer sig pét nat från champagne?",
    a: "Champagne jäser två gånger: först som stilla vin och sedan i flaskan med tillsatt socker och jäst. Pét nat jäser bara en gång och får sina bubblor från druvornas eget socker. Pét nat har oftast mjukare bubblor och lägre tryck.",
  },
];

export default function PetNatPage() {
  return (
    <CategoryGuidePage
      path="/pet-nat"
      title="Pét nat"
      description="Pét nat, pétillant naturel, är mousserande vin som buteljeras innan jäsningen är klar, så att bubblorna bildas i flaskan. Här är pét nat bland naturvinerna i Sverige just nu, först de på Systembolaget och sedan de med hemleverans."
      wineTypes={["Pét Nat"]}
      nounSingular="pét nat"
      nounPlural="pét nat"
      faqNouns={{ best: "pét naten", one: "pét nat", many: "pét nat" }}
      crumb="Pét nat"
      faq={FAQ}
      guideLinks={GUIDE_LINKS.filter((g) => g.href !== "/pet-nat")}
    />
  );
}
