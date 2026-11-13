import Link from "next/link";
import Image from "next/image";

export default function Footer({ retailerCompensation = false }: { retailerCompensation?: boolean }) {
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
                Naturvin som går att köpa i Sverige, på Systembolaget eller med hemleverans från webbutiker.
              </p>
            </div>
          </div>

          {/* Nav columns */}
          <div className="flex flex-wrap gap-x-16 gap-y-8 text-[15px]">
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
            <div>
              <p className="font-bold text-[var(--ink)] mb-3">Kontakt</p>
              <nav className="flex flex-col gap-2">
                <Link href="/om-oss" className="hover:text-[var(--accent)] transition-colors">Om oss</Link>
                <a href="mailto:hej@naturvinstipset.se" className="hover:text-[var(--accent)] transition-colors">hej@naturvinstipset.se</a>
              </nav>
            </div>
          </div>
        </div>

        {/* Tip CTA */}
        <div className="border-t-2 border-[var(--ink)] pt-8 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-[family-name:var(--font-display)] font-black uppercase text-3xl leading-none text-[var(--ink)] mb-2">Saknar du ett vin?</p>
            <p className="text-[15px]">Tipsa oss, så lägger vi in det om det går att köpa i Sverige.</p>
          </div>
          <a
            href="mailto:hej@naturvinstipset.se?subject=Vintips"
            className="shrink-0 rounded-full bg-[var(--accent)] text-[var(--fg)] border-[3px] border-[var(--ink)] font-bold px-6 py-3 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
          >
            hej@naturvinstipset.se
          </a>
        </div>

        {/* Bottom */}
        <div className="border-t-2 border-[var(--ink)] pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-[var(--muted)]">
          <p>
            Naturvinstipset drivs av grundaren av vinimportören Kellner &amp; Kellner. Viner från egen import är märkta och får ingen fördel i Vinkompassen.
            {retailerCompensation ? " Naturvinstipset kan få ersättning från webbutiker när du köper via våra länkar. Det påverkar inte rankningen." : ""}
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/naturvinstipset/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Naturvinstipset på Instagram"
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
              aria-label="Naturvinstipset på TikTok"
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
