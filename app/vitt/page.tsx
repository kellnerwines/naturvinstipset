import type { Metadata } from "next";
import CategoryGuidePage from "@/components/CategoryGuidePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bästa vita naturvinet på Systembolaget | Naturvinstipset",
  description:
    "De bästa vita naturvinerna på Systembolaget — friska, mineraliska och gjorda med minimal inblandning. Handplockade av Naturvinstipset med direktlänkar.",
  openGraph: {
    title: "Bästa vita naturvinet på Systembolaget",
    description: "De bästa vita naturvinerna på Systembolaget. Handplockade av Naturvinstipset.",
    url: "https://www.naturvinstipset.se/vitt",
  },
};

export default function VittPage() {
  return (
    <CategoryGuidePage
      path="/vitt"
      title="Bästa vita naturvinet på Systembolaget"
      description="Vitt naturvin görs på ekologiskt eller biodynamiskt odlade druvor, ofta ofiltrerat och utan tillsatt syra eller socker. Friskt, mineraliskt och rakt igenom — ett bra val för den som vill prova naturvin för första gången. Här är de bästa vita naturvinerna på Systembolaget enligt Naturvinstipset."
      wineTypes={["Vitt"]}
      nounSingular="vitt vin"
      nounPlural="vita viner"
      guideLinks={[
        { href: "/rott", label: "Bästa röda naturvinet" },
        { href: "/orange", label: "Bästa orangevinet" },
        { href: "/pet-nat", label: "Bästa pét nat" },
        { href: "/basta-naturvin-under-200-kr", label: "Under 200 kr" },
        { href: "/basta-naturvin-for-nyborjare", label: "För nybörjare" },
        { href: "/basta-naturvin-till-mat", label: "Till mat" },
      ]}
    />
  );
}
