import type { Metadata } from "next";
import "../globals.css";
import SiteShell from "@/components/SiteShell";
import { getSettings } from "@/lib/blob";
import CookieBanner from "@/components/CookieBanner";
import JsonLd from "@/components/JsonLd";
import { siteJsonLd } from "@/lib/seo";
import { display, body } from "../fonts";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.naturvinstipset.se"),
  title: {
    default: "Naturvinstipset – hitta rätt naturvin på Systembolaget eller från webbutiker med hemleverans",
    template: "%s – Naturvinstipset",
  },
  description:
    "Svara på tre snabba frågor och få naturvin som passar din smak, din budget och din mat. På Systembolaget eller från webbutiker med hemleverans, med smakprofiler, matförslag och köptips.",
  keywords: [
    "naturvin", "systembolaget", "naturvinstips", "vinbetyg", "ekologiskt vin", "biodynamiskt vin",
    "naturvin online", "köpa naturvin", "naturvin hemleverans", "orange vin", "vinkompass", "vilket vin passar",
  ],
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
    locale: "sv_SE",
    siteName: "Naturvinstipset",
    title: "Naturvinstipset – hitta rätt naturvin på Systembolaget eller från webbutiker med hemleverans",
    description: "Svara på tre snabba frågor och få naturvin som passar din smak, din budget och din mat. På Systembolaget eller från webbutiker med hemleverans, med smakprofiler, matförslag och köptips.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings().catch(() => ({ retailerCompensation: false }));
  return (
    <html lang="sv" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <JsonLd data={siteJsonLd} />
        <SiteShell retailerCompensation={settings.retailerCompensation}>{children}</SiteShell>
        <CookieBanner />
      </body>
    </html>
  );
}
