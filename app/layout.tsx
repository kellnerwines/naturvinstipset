import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/SiteShell";

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
    default: "Naturvinstipset – 100 bästa naturvinerna på Systembolaget",
    template: "%s – Naturvinstipset",
  },
  description:
    "Hitta de bästa naturvinerna på Systembolaget. Betyg, smakprofiler och köptips för nybörjare och nyfikna. Helt utan krångel.",
  keywords: ["naturvin", "systembolaget", "naturvinstips", "vinbetyg", "ekologiskt vin", "biodynamiskt vin"],
  authors: [{ name: "Naturvinstipset" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    siteName: "Naturvinstipset",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className={`${outfit.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
