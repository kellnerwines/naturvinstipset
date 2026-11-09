import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import CookieBanner from "@/components/CookieBanner";

/*
  Outfit — clean geometric sans, upright proportions (not wide like Syne).
  Similar rounded terminals to Kynema. To swap in Kynema later: self-host
  the .woff2 files with @font-face and update --font-display in globals.css.
*/
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-syne",   // reuse same CSS var so nothing else needs changing
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.naturvinstipset.se"),
  title: {
    default: "Naturvinstipset – hitta rätt naturvin på Systembolaget eller från webbutiker med hemleverans",
    template: "%s – Naturvinstipset",
  },
  description:
    "Svara på fyra snabba frågor och få naturvin som passar din smak, din budget och din mat. På Systembolaget eller från webbutiker med hemleverans, med smakprofiler, matförslag och köptips.",
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
    description: "Svara på fyra snabba frågor och få naturvin som passar din smak, din budget och din mat. På Systembolaget eller från webbutiker med hemleverans, med smakprofiler, matförslag och köptips.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${outfit.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SiteShell>{children}</SiteShell>
        <CookieBanner />
      </body>
    </html>
  );
}
