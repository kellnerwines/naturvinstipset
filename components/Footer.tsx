import Link from "next/link";
import Image from "next/image";
import { tr, type Lang } from "@/lib/i18n";

export default function Footer({ retailerCompensation = false, lang = "sv" }: { retailerCompensation?: boolean; lang?: Lang }) {
  return (
    <footer className="border-t-[3px] border-[var(--ink)] mt-24 px-5 md:px-8 pt-14 pb-10">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <Image src="/logo.png" alt="" width={36} height={54} unoptimized />
            <div>
              <p className="font-[family-name:var(--font-display)] font-black uppercase text-5xl leading-none text-[var(--ink)] mb-3">Naturvinstipset</p>
              <p className="text-[15px] max-w-xs leading-relaxed">
                {tr(lang, "Naturvin som går att köpa i Sverige, på Systembolaget eller med hemleverans från webbutiker.", "Natural wine you can buy in Sweden, at Systembolaget or with home delivery from online shops.")}
              </p>
            </div>
          </div>

          {/* Nav columns */}
          <div className="flex flex-wrap gap-x-16 gap-y-8 text-[15px]">
            {lang === "en" ? (
            <div>
              <p className="font-bold text-[var(--ink)] mb-3">Explore</p>
              <nav className="flex flex-col gap-2">
                <Link href="/en" className="hover:text-[var(--accent)] transition-colors">Wine Compass</Link>
                <Link href="/en/vad-ar-naturvin" className="hover:text-[var(--accent)] transition-colors">What is natural wine?</Link>
                <Link href="/en/om-listan" className="hover:text-[var(--accent)] transition-colors">About the list</Link>
                <Link href="/topp-100" hrefLang="sv" className="hover:text-[var(--accent)] transition-colors">Top 100 (in Swedish)</Link>
                <Link href="/viner" hrefLang="sv" className="hover:text-[var(--accent)] transition-colors">All wines (in Swedish)</Link>
                <Link href="/naturvinsbarer" hrefLang="sv" className="hover:text-[var(--accent)] transition-colors">Natural wine bars (in Swedish)</Link>
              </nav>
            </div>
            ) : (
            <div>
              <p className="font-bold text-[var(--ink)] mb-3">Utforska</p>
              <nav className="flex flex-col gap-2">
                <Link href="/" className="hover:text-[var(--accent)] transition-colors">Vinkompassen</Link>
                <Link href="/topp-100" className="hover:text-[var(--accent)] transition-colors">Topp 100</Link>
                <Link href="/viner" className="hover:text-[var(--accent)] transition-colors">Alla viner</Link>
                <Link href="/butiker" className="hover:text-[var(--accent)] transition-colors">Butiker</Link>
                <Link href="/producenter" className="hover:text-[var(--accent)] transition-colors">Producenter</Link>
                <Link href="/druvor" className="hover:text-[var(--accent)] transition-colors">Druvor</Link>
                <Link href="/land" className="hover:text-[var(--accent)] transition-colors">Länder</Link>
                <Link href="/vad-ar-naturvin" className="hover:text-[var(--accent)] transition-colors">Vad är naturvin?</Link>
                <Link href="/blogg" className="hover:text-[var(--accent)] transition-colors">Blogg</Link>
                <Link href="/svar" className="hover:text-[var(--accent)] transition-colors">Vanliga frågor om naturvin</Link>
              </nav>
            </div>
            )}
            <div>
              <p className="font-bold text-[var(--ink)] mb-3">{tr(lang, "Kontakt", "Contact")}</p>
              <nav className="flex flex-col gap-2">
                <Link href={lang === "en" ? "/en/om-oss" : "/om-oss"} className="hover:text-[var(--accent)] transition-colors">{tr(lang, "Om oss", "About us")}</Link>
                <Link href={lang === "en" ? "/en/kontakt" : "/kontakt"} className="hover:text-[var(--accent)] transition-colors">{tr(lang, "Kontaktformulär", "Contact form")}</Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Tip CTA */}
        <div className="border-t-2 border-[var(--ink)] pt-8 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-display)] font-black uppercase text-3xl leading-none text-[var(--ink)] mb-2">{tr(lang, "Saknar du ett vin?", "Missing a wine?")}</p>
            <p className="text-[15px]">{tr(lang, "Tipsa oss, så lägger vi in det om det går att köpa i Sverige.", "Tell us, and we will add it if it can be bought in Sweden.")}</p>
          </div>
          <Link
            href={lang === "en" ? "/en/kontakt?amne=Vintips" : "/kontakt?amne=Vintips"}
            className="shrink-0 rounded-full bg-[var(--accent)] text-[var(--fg)] border-[3px] border-[var(--ink)] font-bold px-6 py-3 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
          >
            {tr(lang, "Tipsa oss", "Tell us")}
          </Link>
        </div>

        {/* Bottom */}
        <div className="border-t-2 border-[var(--ink)] pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-[var(--muted)]">
          <p>
            {tr(lang,
              "Naturvinstipset drivs av Simon och Stefan på vinimportören Kellner & Kellner. Viner från egen import är märkta och får ingen fördel i Vinkompassen.",
              "Naturvinstipset is run by Simon and Stefan of the wine importer Kellner & Kellner. Wines from their own import are labelled and get no advantage in the Wine Compass.")}
            {retailerCompensation ? tr(lang, " Naturvinstipset kan få ersättning från webbutiker när du köper via våra länkar. Det påverkar inte rankningen.", " Naturvinstipset may receive compensation from online shops when you buy through our links. It does not affect the ranking.") : ""}
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/naturvinstipset/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tr(lang, "Naturvinstipset på Instagram", "Naturvinstipset on Instagram")}
              className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@naturvinstipset"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tr(lang, "Naturvinstipset på TikTok", "Naturvinstipset on TikTok")}
              className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
