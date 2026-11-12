import type { Metadata } from "next";
import CategoryGuidePage from "@/components/CategoryGuidePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/pet-nat" },
  title: "Bästa pét nat på Systembolaget eller från webbutiker med hemleverans",
  description:
    "De bästa pét nat-vinerna på Systembolaget eller från webbutiker med hemleverans — naturligt mousserande, friska och levande. Handplockade av Naturvinstipset med direktlänkar.",
  openGraph: {
    title: "Bästa pét nat på Systembolaget eller från webbutiker med hemleverans",
    description: "De bästa pét nat-vinerna på Systembolaget eller från webbutiker med hemleverans. Naturligt mousserande och handplockade av Naturvinstipset.",
    url: "https://www.naturvinstipset.se/pet-nat",
  },
};

export default function PetNatPage() {
  return (
    <CategoryGuidePage
      path="/pet-nat"
      title="Bästa pét nat på Systembolaget eller från webbutiker med hemleverans"
      description="Pét nat — pétillant naturel — är naturligt mousserande vin buteljerat innan jäsningen är klar. Friskt, pärligt och levande. Ofta med lägre alkohol och en rustik charm som är svår att motstå. Här är de bästa pét nat-vinerna på Systembolaget eller från webbutiker med hemleverans enligt Naturvinstipset."
      wineTypes={["Pét Nat"]}
      nounSingular="pét nat-vin"
      nounPlural="pét nat-viner"
      faqNouns={{ best: "pét-naten", one: "pét-nat", many: "pét-nats" }}
      crumb="Pét-nat"
      guideLinks={[
        { href: "/rott", label: "Bästa röda naturvinet" },
        { href: "/vitt", label: "Bästa vita naturvinet" },
        { href: "/orange", label: "Bästa orangevinet" },
        { href: "/basta-naturvin-under-200-kr", label: "Under 200 kr" },
        { href: "/basta-naturvin-for-nyborjare", label: "För nybörjare" },
        { href: "/basta-naturvin-till-mat", label: "Till mat" },
      ]}
    />
  );
}
