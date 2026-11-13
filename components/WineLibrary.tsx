// Biblioteket: alla viner i lager som rader, filtrerbara på butik, färg, land, pris och fritext.
// Raderna renderas på servern så att alla viner finns i HTML:en; filtret döljer bara rader.

import Link from "next/link";
import type { Rating, Wine } from "@/lib/blob";
import { combinedRating } from "@/lib/blob";
import { entitySlug, grapesOf, producerName } from "@/lib/entities";
import { shopsOf, shopSlug } from "@/lib/shops";
import OwnImportBadge from "@/components/OwnImportBadge";
import LibraryFilter, { type LibraryOptions, type LibraryState } from "@/components/LibraryFilter";

const TYPE_FIELD: Record<string, string> = {
  Rött: "var(--wine-rott)", Vitt: "var(--wine-vitt)", Rosé: "var(--wine-rose)", Orange: "var(--wine-orange)",
  Mousserande: "var(--wine-mousserande)", "Pét Nat": "var(--wine-petnat)",
};
const price = (w: Wine) => Number(String(w.price ?? "").replace(",", ".")) || 0;

export default function WineLibrary({ wines, ratings, initial, lockShop }: {
  wines: Wine[];            // sorterade efter betyg
  ratings: Rating[];
  initial: Partial<LibraryState>;
  lockShop?: boolean;       // butikssidan: butiken är given och filtret visas inte
}) {
  const count = (vals: string[]) => {
    const m = new Map<string, number>();
    for (const v of vals) if (v) m.set(v, (m.get(v) ?? 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "sv"));
  };
  const options: LibraryOptions = {
    shops: count(wines.flatMap(shopsOf)).map(([name, n]) => ({ value: shopSlug(name), label: name, n })),
    types: count(wines.map((w) => w.wineType)).map(([name, n]) => ({ value: entitySlug(name), label: name, n })),
    countries: count(wines.map((w) => w.country)).map(([name, n]) => ({ value: entitySlug(name), label: name, n })),
  };

  return (
    <LibraryFilter options={options} initial={initial} total={wines.length} lockShop={lockShop}>
      <ol className="library-list flex flex-col">
        {wines.map((w) => {
          const shops = shopsOf(w);
          const rating = combinedRating(w, ratings);
          return (
            <li
              key={w.id}
              data-shops={shops.map(shopSlug).join(" ")}
              data-type={entitySlug(w.wineType)}
              data-country={entitySlug(w.country ?? "")}
              data-price={price(w)}
              data-rating={rating.toFixed(2)}
              data-q={[w.name, w.producer, w.region, w.country, ...grapesOf(w)].join(" ").toLowerCase()}
              className="border-b-2 border-[var(--rule)]"
            >
              <Link href={`/viner/${w.slug}`} className="flex items-center gap-4 py-3 group">
                <span className="shrink-0 w-12 h-16 flex items-center justify-center border-2 border-[var(--ink)]" style={{ backgroundColor: TYPE_FIELD[w.wineType] ?? "var(--surface)" }}>
                  {w.primaryImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.primaryImageUrl} alt="" loading="lazy" className="max-h-14 w-auto object-contain" />
                  ) : null}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-[family-name:var(--font-display)] font-black uppercase text-[22px] leading-none truncate text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                    {w.name}{w.year ? ` ${w.year}` : ""}
                  </span>
                  <span className="block text-sm text-[var(--muted)] truncate">
                    {w.producer ? producerName(w.producer) : ""}{w.country ? ` · ${w.country}` : ""}
                    {w.ownImport ? <OwnImportBadge asLink={false} className="ml-2 align-middle" /> : null}
                  </span>
                  <span className="block text-xs text-[var(--muted)] truncate">{w.wineType} · {shops.join(", ")}</span>
                </span>
                <span className="shrink-0 text-right">
                  {rating > 0 && <span className="block text-sm font-semibold">{rating.toFixed(1)}</span>}
                  {w.price && <span className="block text-xs text-[var(--muted)]">{w.price} kr</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </LibraryFilter>
  );
}
