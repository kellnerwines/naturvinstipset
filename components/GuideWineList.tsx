import Link from "next/link";
import type { Wine, Rating } from "@/lib/blob";
import { combinedRating } from "@/lib/blob";

interface Props {
  wines: Wine[];
  ratings: Rating[];
}

export default function GuideWineList({ wines, ratings }: Props) {
  if (wines.length === 0) {
    return (
      <p className="text-[var(--muted)]">
        Inga viner hittades just nu.{" "}
        <Link href="/" className="underline">
          Se hela listan
        </Link>
        .
      </p>
    );
  }

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
                {wine.systembolagetUrl && (
                  <span className="inline-block mt-3 text-xs text-[var(--green)] font-medium">
                    Köp på Systembolaget →
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
