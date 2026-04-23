import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--rule)] mt-24 px-6 pt-14 pb-10">
      <div className="max-w-5xl mx-auto">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <Image
              src="/logo.png"
              alt="Naturvinstipset"
              width={36}
              height={54}
              unoptimized
              className="opacity-80"
            />
            <div>
              <p className="text-sm font-bold text-[var(--fg)] mb-1">Naturvinstipset</p>
              <p className="text-xs text-[var(--muted)] max-w-[200px] leading-relaxed">
                Din guide till naturvin på Systembolaget — enkelt, ärligt, utan krångel.
              </p>
            </div>
          </div>

          {/* Nav columns */}
          <div className="flex flex-wrap gap-x-16 gap-y-8 text-sm">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--faint)] mb-3">Utforska</p>
              <nav className="flex flex-col gap-2 text-xs text-[var(--muted)]">
                <Link href="/" className="hover:text-[var(--fg)] transition-colors">Topp 100</Link>
                <Link href="/vad-ar-naturvin" className="hover:text-[var(--fg)] transition-colors">Vad är naturvin?</Link>
                <Link href="/blogg" className="hover:text-[var(--fg)] transition-colors">Blogg</Link>
              </nav>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--faint)] mb-3">Kontakt</p>
              <nav className="flex flex-col gap-2 text-xs text-[var(--muted)]">
                <Link href="/om-oss" className="hover:text-[var(--fg)] transition-colors">Om oss</Link>
                <a href="mailto:hej@naturvinstipset.se" className="hover:text-[var(--fg)] transition-colors">hej@naturvinstipset.se</a>
              </nav>
            </div>
          </div>
        </div>

        {/* Tip CTA */}
        <div className="border-t border-[var(--rule-xs)] pt-8 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[var(--fg)] mb-1">Saknar du ett vin?</p>
            <p className="text-xs text-[var(--muted)]">Tipsa oss — vi uppdaterar listan löpande.</p>
          </div>
          <a
            href="mailto:hej@naturvinstipset.se?subject=Vintips"
            className="shrink-0 text-[11px] font-semibold text-[var(--fg)] border border-[var(--fg)] px-4 py-2 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
          >
            hej@naturvinstipset.se →
          </a>
        </div>

        {/* Bottom */}
        <div className="border-t border-[var(--rule-xs)] pt-6 text-[10px] text-[var(--faint)]">
          <p>Länkarna till Systembolaget kan vara affiliatelänkar. Naturvinstipset är en oberoende guide.</p>
        </div>
      </div>
    </footer>
  );
}
