import type { Metadata } from "next";
import { langAlternates } from "@/lib/i18n";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  alternates: langAlternates("sv", "/kontakt"),
  title: "Kontakt",
  description: "Tipsa om ett naturvin som saknas, ställ en fråga eller hör av dig om vinprovning. Vi svarar via mejl.",
  openGraph: {
    title: "Kontakt – Naturvinstipset",
    description: "Tipsa om ett naturvin som saknas eller ställ en fråga.",
    url: "https://www.naturvinstipset.se/kontakt",
    images: [{ url: "/og-logo.png", width: 1200, height: 630, alt: "Naturvinstipset" }],
  },
};

export default async function KontaktPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { amne } = await searchParams;
  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <h1 className="text-5xl md:text-7xl mb-6">Kontakt</h1>
      <p className="text-lg text-[var(--muted)] leading-relaxed mb-10">
        Saknar du ett vin, har du hittat ett fel eller vill du fråga något? Skriv här, så svarar vi till din mejladress.
      </p>
      <ContactForm subject={typeof amne === "string" ? amne : ""} />
    </div>
  );
}
