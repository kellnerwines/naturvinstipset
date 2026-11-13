"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { StarDisplay } from "./Stars";
import LikeButton from "./LikeButton";
import type { Wine } from "@/lib/blob";
import { buildWineProductJsonLd, getArticleNumber } from "@/lib/wineJsonLd";
import { buyLinks } from "@/lib/buyLinks";
import OwnImportBadge from "./OwnImportBadge";

type Props = { wine: Wine; rating: number; ratingCount: number; likeCount: number; rank?: number; wineOfMonth?: boolean };

// Platta tryckfärger per vintyp (globals.css); texten på färgfältet är mörk eller ljus efter fältet.
const typeColor: Record<string, string> = {
  Vitt:        "var(--wine-vitt)",
  Rött:        "var(--wine-rott)",
  Rosé:        "var(--wine-rose)",
  Orange:      "var(--wine-orange)",
  "Pét Nat":   "var(--wine-petnat)",
  Mousserande: "var(--wine-mousserande)",
};
const lightText = new Set(["Rött"]);

function Meter({ label, value, color }: { label: string; value: number; color?: string }) {
  const filled = Math.round(Math.max(0, Math.min(5, value)));
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--muted)] w-16 shrink-0">{label}</span>
      <div className="flex gap-0.5 flex-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="h-2 flex-1 border border-[var(--ink)]"
            style={{ backgroundColor: n <= filled ? (color ?? "var(--ink)") : "transparent" }}
          />
        ))}
      </div>
    </div>
  );
}

export default function WineCard({ wine, rating, ratingCount, likeCount, rank, wineOfMonth }: Props) {
  const [open, setOpen] = useState(false);

  const color = typeColor[wine.wineType] ?? "var(--surface)";
  const onColor = lightText.has(wine.wineType) ? "text-[var(--paper)]" : "text-[var(--ink)]";
  const hasProfile = wine.syra != null || wine.fyllighet != null || wine.funk != null;

  const articleNumber = getArticleNumber(wine);
  const buy = buyLinks(wine, { source: "topplistan", path: "/topp-100" })[0];
  const jsonLd = buildWineProductJsonLd(wine, { combinedRating: rating, communityCount: ratingCount });

  return (
    <div className={`flex flex-col bg-[var(--card)] border-[3px] border-[var(--ink)]${wineOfMonth ? " motm-card" : ""}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Färgfält med flaskan, plats och vintyp ─────────────────────── */}
      <Link href={`/viner/${wine.slug}`} className="block relative group border-b-[3px] border-[var(--ink)]" style={{ backgroundColor: color }}>
        <div className="relative w-full aspect-[4/5] overflow-hidden">
          {wine.primaryImageUrl ? (
            <Image
              src={wine.primaryImageUrl}
              alt={`${wine.name}${wine.year ? ` ${wine.year}` : ""}${wine.wineType ? ` ${wine.wineType.toLowerCase()} naturvin` : " naturvin"}${wine.country ? ` från ${wine.country}` : ""}`}
              fill
              className="object-contain object-bottom p-4 pt-10 group-hover:scale-[1.03] transition-transform duration-500"
              unoptimized
            />
          ) : (
            <svg className={`absolute inset-x-0 bottom-4 mx-auto h-3/4 ${onColor}`} viewBox="0 0 40 140" aria-hidden="true"><path d="M15 2h10v34c0 8 11 14 11 30v68a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V66c0-16 11-22 11-30z" fill="currentColor" opacity="0.35" /></svg>
          )}
        </div>
        <div className={`absolute top-0 inset-x-0 flex items-start justify-between p-3 ${onColor}`}>
          {rank ? <span className="font-[family-name:var(--font-display)] font-black text-3xl leading-none">{rank}</span> : <span />}
          <span className="font-[family-name:var(--font-display)] font-black uppercase text-lg leading-none">{wine.wineType}</span>
        </div>
        {wineOfMonth && (
          <span className="absolute bottom-3 left-3 bg-[var(--accent)] text-[var(--fg)] border-2 border-[var(--ink)] text-xs font-bold px-2 py-1 rotate-[-3deg]">
            Månadens vin
          </span>
        )}
      </Link>

      {/* ── Info block ─────────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-3 flex-1 flex flex-col">
        {/* Producer */}
        <p className="text-sm text-[var(--muted)] mb-0.5">{wine.producer}</p>
        {wine.ownImport ? <OwnImportBadge className="self-start mb-1.5" /> : null}

        {/* Name */}
        <Link href={`/viner/${wine.slug}`} className="group mb-2">
          <h3 className="font-[family-name:var(--font-display)] font-black uppercase text-[26px] leading-[0.95] text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
            {wine.name}
          </h3>
        </Link>

        {/* Always-visible smakprofil meters */}
        {hasProfile && (
          <div className="space-y-1.5 mb-3">
            {wine.syra      != null && <Meter label="Syra"     value={wine.syra}      color={color} />}
            {wine.fyllighet != null && <Meter label="Fyllighet" value={wine.fyllighet} color={color} />}
            {wine.funk      != null && <Meter label="Funk"      value={wine.funk}      color={color} />}
          </div>
        )}

        {/* Flavor notes — always visible */}
        {wine.flavorNotes && (
          <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">{wine.flavorNotes}</p>
        )}

        {/* Rating + price row */}
        <div className="flex items-baseline justify-between mt-auto mb-1 border-t-2 border-[var(--ink)] pt-2">
          <span
            className="text-base font-bold text-[var(--ink)]"
            role="img"
            aria-label={rating > 0 ? `Betyg: ${rating.toFixed(1)} av 5${ratingCount > 0 ? ` (${ratingCount} röster)` : ""}` : "Inget betyg än"}
          >
            {rating > 0 ? <><span aria-hidden="true">★</span> {rating.toFixed(1)}</> : <span className="text-xs font-normal text-[var(--muted)]">Inget betyg än</span>}
          </span>
          {wine.price && (
            <span className="font-bold text-[var(--ink)]">{wine.price} kr</span>
          )}
        </div>

        {/* Plain-text spec line — for AI/assistive parsing, not just icons */}
        <p className="text-xs text-[var(--muted)] leading-snug mb-2">
          {[
            wine.country && `Land: ${wine.country}`,
            wine.wineType && `Vintyp: ${wine.wineType}`,
            wine.grape && `Druva: ${wine.grape}`,
            articleNumber && `Systembolaget art.nr: ${articleNumber}`,
            wine.price && `Pris: ca ${wine.price} kr`,
            buy && !buy.isSb && `Hemleverans från webbutiken ${buy.shop}`,
          ].filter(Boolean).join(" · ")}
        </p>

        {/* Actions row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t-2 border-[var(--ink)] pt-2">
          <LikeButton wineId={wine.id} likeCount={likeCount} small />
          {buy && (
            <a
              href={buy.href}
              target="_blank"
              rel={buy.rel}
              title={`${buy.label} – ${buy.how.toLowerCase()}`}
              className="text-sm font-bold text-[var(--ink)] border-b-2 border-[var(--ink)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors whitespace-nowrap"
            >
              {buy.isSb ? "Beställ" : "Hemleverans"}
            </a>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors flex items-center gap-1 whitespace-nowrap ml-auto"
          >
            Mer
            <svg className={`w-2.5 h-2.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* ── Expandable: strävhet, flavor notes, druva, links ────────── */}
        {open && (
          <div className="mt-3 pt-3 border-t-2 border-[var(--ink)] space-y-2">
            {wine.stravhet != null && <Meter label="Strävhet" value={wine.stravhet} color={color} />}
            {wine.grape && (
              <p className="text-sm text-[var(--muted)]">{wine.grape}</p>
            )}
            <div className="flex items-center gap-4 flex-wrap pt-1">
              <Link
                href={`/viner/${wine.slug}`}
                className="text-sm font-bold text-[var(--ink)] border-b-2 border-[var(--ink)] hover:text-[var(--accent)] transition-colors"
              >
                Läs mer →
              </Link>
              <Link
                href={
                  wine.wineType === "Orange" ? "/vad-ar-naturvin#orange-vin"
                  : wine.wineType === "Pét Nat" ? "/vad-ar-naturvin#pet-nat"
                  : wine.wineType === "Mousserande" ? "/vad-ar-naturvin#pet-nat"
                  : "/vad-ar-naturvin"
                }
                className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
              >
                {wine.wineType === "Orange" ? "Vad är orange vin?"
                  : wine.wineType === "Pét Nat" ? "Vad är pét-nat?"
                  : wine.wineType === "Mousserande" ? "Om mousserande naturvin"
                  : "Ny på naturvin?"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
