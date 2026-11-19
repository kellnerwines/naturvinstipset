import type { Metadata } from "next";
import { langAlternates } from "@/lib/i18n";
import ContactForm from "@/components/ContactForm";

// Engelsk version av app/(sv)/kontakt/page.tsx.
export const metadata: Metadata = {
  alternates: langAlternates("en", "/kontakt"),
  title: "Contact",
  description: "Tell us about a natural wine that is missing, ask a question or get in touch about a wine tasting. We reply by email.",
  openGraph: {
    title: "Contact – Naturvinstipset",
    description: "Tell us about a natural wine that is missing or ask a question.",
    url: "https://www.naturvinstipset.se/en/kontakt",
    images: [{ url: "/og-logo.png", width: 1200, height: 630, alt: "Naturvinstipset" }],
  },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { amne } = await searchParams;
  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <h1 className="text-5xl md:text-7xl mb-6">Contact</h1>
      <p className="text-lg text-[var(--muted)] leading-relaxed mb-10">
        Missing a wine, found a mistake or want to ask something? Write here and we will reply to your email address.
      </p>
      <ContactForm lang="en" subject={typeof amne === "string" ? amne : ""} />
    </div>
  );
}
