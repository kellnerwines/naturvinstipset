import type { Metadata } from "next";
import CategoryGuidePage from "@/components/CategoryGuidePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bästa orangevinet på Systembolaget | Naturvinstipset",
  description:
    "De bästa orangevinerna på Systembolaget — vitt vin gjort som rött, med djup och komplexitet. Handplockade av Naturvinstipset med direktlänkar.",
  openGraph: {
    title: "Bästa orangevinet på Systembolaget",
    description: "De bästa orangevinerna på Systembolaget. Handplockade av Naturvinstipset.",
    url: "https://www.naturvinstipset.se/orange",
  },
};

export default function OrangePage() {
  return (
    <CategoryGuidePage
      path="/orange"
      title="Bästa orangevinet på Systembolaget"
      description="Orange vin är vitt vin gjort som rött — skalen är kvar under jäsningen och ger vinet sin karakteristiska färg och komplexa smakprofil. Passar utmärkt till kryddiga rätter, ostar och grönsaker. Här är de bästa orangevinerna på Systembolaget enligt Naturvinstipset."
      wineTypes={["Orange"]}
      nounSingular="orange vin"
      nounPlural="orange viner"
      guideLinks={[
        { href: "/rott", label: "Bästa röda naturvinet" },
        { href: "/vitt", label: "Bästa vita naturvinet" },
        { href: "/pet-nat", label: "Bästa pét nat" },
        { href: "/basta-naturvin-under-200-kr", label: "Under 200 kr" },
        { href: "/basta-naturvin-for-nyborjare", label: "För nybörjare" },
        { href: "/basta-naturvin-till-mat", label: "Till mat" },
      ]}
    />
  );
}
