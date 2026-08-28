import type { Metadata } from "next";
import CategoryGuidePage from "@/components/CategoryGuidePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bästa röda naturvinet på Systembolaget | Naturvinstipset",
  description:
    "De bästa röda naturvinerna på Systembolaget — ofiltrerade, saftiga och gjorda med vilda jästar. Handplockade av Naturvinstipset med direktlänkar.",
  openGraph: {
    title: "Bästa röda naturvinet på Systembolaget",
    description: "De bästa röda naturvinerna på Systembolaget. Handplockade av Naturvinstipset.",
    url: "https://www.naturvinstipset.se/rott",
  },
};

export default function RottPage() {
  return (
    <CategoryGuidePage
      path="/rott"
      title="Bästa röda naturvinet på Systembolaget"
      description="Rött naturvin görs ofta ofiltrerat och med minimal svavling, med vilda jästar och lite eller ingen extraktion i källaren. Resultatet är saftiga, levande viner med jordiga toner och mindre strävhet än konventionellt rött. Här är de bästa röda naturvinerna på Systembolaget enligt Naturvinstipset."
      wineTypes={["Rött"]}
      nounSingular="rött vin"
      nounPlural="röda viner"
      guideLinks={[
        { href: "/vitt", label: "Bästa vita naturvinet" },
        { href: "/orange", label: "Bästa orangevinet" },
        { href: "/pet-nat", label: "Bästa pét nat" },
        { href: "/basta-naturvin-under-200-kr", label: "Under 200 kr" },
        { href: "/basta-naturvin-for-nyborjare", label: "För nybörjare" },
        { href: "/basta-naturvin-till-mat", label: "Till mat" },
      ]}
    />
  );
}
