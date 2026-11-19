import type { Metadata } from "next";
import CategoryGuidePage from "@/components/CategoryGuidePage";
import { GUIDE_LINKS, currentYear } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const title = `Orange naturvin – bästa orangevinerna på Systembolaget ${currentYear()} och med hemleverans`;
  const description =
    "Orangevin bland naturvinerna i Sverige just nu, först de på Systembolaget och sedan de med hemleverans. Vad orangevin är, hur det görs och vad det passar till.";
  return {
    alternates: { canonical: "/orange" },
    title,
    description,
    openGraph: { title, description, url: "https://www.naturvinstipset.se/orange" },
  };
}

// Allmänt kända fakta om stilen, inga påståenden om enskilda producenter.
const FAQ = [
  {
    q: "Vad är orange vin?",
    a: "Orange vin görs på gröna druvor som får jäsa tillsammans med skalen, på samma sätt som rött vin. Skalen ger färgen, från gyllene till bärnsten, och ger vinet mer struktur och lite strävhet än ett vanligt vitt vin. Hur länge skalen får ligga med varierar från några dagar till flera månader.",
  },
  {
    q: "Är orange vin alltid naturvin?",
    a: "Nej. Orange vin är ett sätt att göra vin, inte en filosofi, och det finns orangeviner som görs helt konventionellt. Men många naturvinsmakare gör orange vin, eftersom tanninerna från skalen gör vinet stabilare och det klarar sig med lite eller inget svavel. Alla vinerna på den här sidan är naturvin.",
  },
  {
    q: "Var kommer orange vin ifrån?",
    a: "Metoden är flera tusen år gammal och kommer från Georgien, där vinet traditionellt jäser i stora lerkärl, qvevri, som grävs ner i marken. I modern tid tog vinmakare i Friuli i nordöstra Italien och i Slovenien upp den igen, och i dag görs orange vin i de flesta vinländer.",
  },
  {
    q: "Vad passar orange vin till?",
    a: "Syran och strävheten gör att orange vin klarar mat som är för kraftig för vitt vin men där rött blir för tungt: kryddig mat, rotfrukter, svamp, lagrade ostar och rätter med mycket umami.",
  },
];

export default function OrangePage() {
  return (
    <CategoryGuidePage
      path="/orange"
      title="Orange naturvin"
      description="Orangevin görs på gröna druvor som jäser med skalen och får färg och lite grepp av dem. Här är orangevinerna bland naturvinerna i Sverige just nu, först de som finns på Systembolaget och sedan de du kan få hem från webbutiker."
      wineTypes={["Orange"]}
      nounSingular="orange vin"
      nounPlural="orange viner"
      faqNouns={{ best: "orangevinet", one: "orangevin", many: "orangeviner" }}
      crumb="Orangevin"
      faq={FAQ}
      guideLinks={GUIDE_LINKS.filter((g) => g.href !== "/orange")}
    />
  );
}
