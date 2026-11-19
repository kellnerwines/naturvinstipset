import type { Metadata } from "next";
import "../globals.css";
import SiteShell from "@/components/SiteShell";
import { getSettings } from "@/lib/blob";
import CookieBanner from "@/components/CookieBanner";
import JsonLd from "@/components/JsonLd";
import { siteJsonLd } from "@/lib/seo";
import { display, body } from "../fonts";

// Rotlayout för de engelska sidorna under /en. Samma skal som den svenska, med lang="en".
export const metadata: Metadata = {
  metadataBase: new URL("https://www.naturvinstipset.se"),
  title: {
    default: "Naturvinstipset – natural wine you can buy in Sweden",
    template: "%s – Naturvinstipset",
  },
  description:
    "A Swedish guide to natural wine at Systembolaget and from online shops with home delivery, with taste profiles, food pairings and buying tips.",
  authors: [{ name: "Naturvinstipset" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    alternateLocale: "sv_SE",
    siteName: "Naturvinstipset",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default async function EnglishLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings().catch(() => ({ retailerCompensation: false }));
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <JsonLd data={siteJsonLd} />
        <SiteShell retailerCompensation={settings.retailerCompensation}>{children}</SiteShell>
        <CookieBanner />
      </body>
    </html>
  );
}
