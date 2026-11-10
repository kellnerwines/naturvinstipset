import Link from "next/link";
import type { Wine, Rating } from "@/lib/blob";
import { combinedRating } from "@/lib/blob";
import { buyLinks, retailerNote } from "@/lib/buyLinks";
import OwnImportBadge, { OWN_IMPORT_HREF } from "./OwnImportBadge";

interface Props {
  wines: Wine[];
  ratings: Rating[];
}

export default function GuideWineList({ wines, ratings }: Props) {
  if (wines.length === 0) {
    return (
      <p className="text-[var(--muted)]">
        Inga viner hittades just nu.{" "}
        <Link href="/topp-100" className="underline">
          Se hela listan
        </Link>
        .
      </p>
    );
  }

  const firstLinks = wines.map((w) => buyLinks(w)[0]).filter((l) => !!l);
  const note = retailerNote(firstLinks);

  return (
    <div className="space-y-4">
      {wines.map((wine, i) => {
        const score = combinedRating(wine, ratings);
        return (
          <Link
            key={wine.id}
            href={`/viner/${wine.slug}`}
            className="block bg-white border border-black/8 rounded-xl p-5 hover:border-[var(--green)] transition-colors"
          >
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-6 text-sm text-[var(--muted)] tabular-nums pt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--fg)] truncate">
                      {wine.name}
                      {wine.year ? ` ${wine.year}` : ""}
                    </p>
                    <p className="text-sm text-[var(--muted)] mt-0.5">
                      {wine.producer}
                      {wine.country ? ` · ${wine.country}` : ""}
                      {wine.ownImport ? <OwnImportBadge asLink={false} className="ml-2 align-middle" /> : null}
                    </p>
                    {wine.description && (
                      <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">
                        {wine.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-[var(--fg)]">
                      {score.toFixed(1)}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{wine.wineType}</p>
                    {wine.price && (
                      <p className="text-xs text-[var(--muted)] mt-1">{wine.price} kr</p>
                    )}
                  </div>
                </div>
                {buyLinks(wine)[0] && (
                  <span className="inline-block mt-3 text-xs text-[var(--green)] font-medium">
                    {buyLinks(wine)[0].isSb ? "Köp på Systembolaget" : `Hemleverans från webbutiken ${buyLinks(wine)[0].shop}`} →
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
      {note || wines.some((w) => w.ownImport) ? (
        <p className="text-[11px] text-[var(--muted)] leading-snug pt-2">
          {note}
          {wines.some((w) => w.ownImport) ? (
            <>
              {note ? " " : ""}Viner märkta &quot;Egen import&quot; importeras av Kellner &amp; Kellner, som drivs av sajtens grundare.{" "}
              <Link href={OWN_IMPORT_HREF} className="underline underline-offset-2">Så rankar vi</Link>.
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
