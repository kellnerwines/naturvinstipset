import Link from "next/link";
import Image from "next/image";
import type { TopEntry } from "@/lib/topList";
import { buyLinks } from "@/lib/buyLinks";
import type { SourcePage } from "@/lib/clicks/util";
import OwnImportBadge from "./OwnImportBadge";

// Samma tryckfärger per vintyp som WineCard.
const typeColor: Record<string, string> = {
  Vitt:        "var(--wine-vitt)",
  Rött:        "var(--wine-rott)",
  Rosé:        "var(--wine-rose)",
  Orange:      "var(--wine-orange)",
  "Pét Nat":   "var(--wine-petnat)",
  Mousserande: "var(--wine-mousserande)",
};
const lightText = new Set(["Rött"]);

/** Topplistans tre första, stora. På mobil som rader, på desktop tre i bredd. */
export default function TopThree({ entries, source, path }: { entries: TopEntry[]; source: SourcePage; path: string }) {
  return (
    <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
      {entries.slice(0, 3).map(({ wine, rating }, i) => {
        const buy = buyLinks(wine, { source, path })[0];
        const onColor = lightText.has(wine.wineType) ? "text-[var(--paper)]" : "text-[var(--ink)]";
        return (
          <li key={wine.id} className="bg-[var(--card)] border-[3px] border-[var(--ink)] grid grid-cols-[120px_1fr] md:grid-cols-1">
            <Link
              href={`/viner/${wine.slug}`}
              className="relative block border-r-[3px] md:border-r-0 md:border-b-[3px] border-[var(--ink)] min-h-[170px] md:aspect-[4/5]"
              style={{ backgroundColor: typeColor[wine.wineType] ?? "var(--surface)" }}
              tabIndex={-1}
              aria-hidden="true"
            >
              <span className={`absolute top-2 left-3 z-10 font-[family-name:var(--font-display)] font-black text-5xl md:text-7xl leading-none ${onColor}`}>{i + 1}</span>
              <Image src={wine.primaryImageUrl!} alt="" fill className="object-contain object-bottom p-3 pt-12 md:p-6 md:pt-20" unoptimized />
            </Link>
            <div className="p-4 flex flex-col min-w-0">
              <p className="text-sm text-[var(--muted)]">{wine.producer}</p>
              {wine.ownImport ? <OwnImportBadge className="self-start mt-1" /> : null}
              <h3 className="font-[family-name:var(--font-display)] font-black uppercase text-[28px] md:text-[34px] leading-[0.95] mt-1">
                <Link href={`/viner/${wine.slug}`} className="text-[var(--ink)] hover:text-[var(--accent)] transition-colors">
                  {wine.name}{wine.year && wine.year !== "NV" ? ` ${wine.year}` : ""}
                </Link>
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1">{wine.wineType} · {wine.country}</p>
              <div className="mt-auto pt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                {rating > 0 ? <span className="font-bold text-[var(--ink)]"><span aria-hidden="true">★</span> {rating.toFixed(1)}</span> : null}
                {wine.price ? <span className="font-bold text-[var(--ink)]">{wine.price} kr</span> : null}
                {buy ? (
                  <a
                    href={buy.href}
                    target="_blank"
                    rel={buy.rel}
                    title={`${buy.label} – ${buy.how.toLowerCase()}`}
                    className="inline-flex items-center whitespace-nowrap rounded-full bg-[var(--accent)] text-[var(--fg)] border-2 border-[var(--ink)] text-sm font-bold px-4 py-2 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
                  >
                    {buy.isSb ? "Se hos Systembolaget" : `Köp hos ${buy.shop}`}
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
