"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { StarDisplay } from "./Stars";
import type { Wine } from "@/lib/blob";

type Props = { wine: Wine; rating: number; ratingCount: number; rank?: number; wineOfMonth?: boolean };

// Muted type-based background when no image is supplied
const typeBg: Record<string, string> = {
  Rött:        "#dccfcf",
  Vitt:        "#dbd5bc",
  Rosé:        "#dbc5d0",
  Orange:      "#d8c9b0",
  Mousserande: "#bfcdd8",
  "Pét Nat":   "#cabfd8",
};

function Meter({ label, value }: { label: string; value: number }) {
  const filled = Math.round(Math.max(0, Math.min(5, value)));
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[var(--muted)] w-16 shrink-0">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className={`h-1.5 w-5 rounded-full ${n <= filled ? "bg-[var(--fg)]" : "bg-[var(--fg)] opacity-10"}`} />
        ))}
      </div>
    </div>
  );
}

export default function WineCard({ wine, rating, ratingCount, rank, wineOfMonth }: Props) {
  const [open, setOpen] = useState(false);

  const hasProfile = wine.syra != null || wine.fyllighet != null || wine.funk != null || wine.stravhet != null;
  const bg = typeBg[wine.wineType] ?? "#d4d0c8";

  return (
    <div className={`flex flex-col${wineOfMonth ? " motm-card" : ""}`}>
      {/* ── Image block ────────────────────────────────────────────────── */}
      <Link href={`/viner/${wine.slug}`} className="block relative group">
        {wineOfMonth && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-[9px] font-bold tracking-[0.2em] uppercase bg-amber-400 text-white px-3 py-0.5 whitespace-nowrap">
            Månadens vin
          </span>
        )}
        <div
          className="w-full aspect-[3/4] overflow-hidden flex items-end justify-center rounded-lg"
          style={{ backgroundColor: bg }}
        >
          {wine.primaryImageUrl ? (
            <Image
              src={wine.primaryImageUrl}
              alt={wine.name}
              fill
              className="object-contain object-top group-hover:scale-[1.03] transition-transform duration-500"
              unoptimized
            />
          ) : (
            <span className="text-6xl mb-8 opacity-20 select-none">○</span>
          )}
        </div>

        {/* Rank badge */}
        {rank && (
          <span className="absolute top-3 left-3 text-[10px] font-bold tracking-widest text-white/70 bg-black/20 px-2 py-0.5">
            #{rank}
          </span>
        )}

        {/* Wine type */}
        <span className="absolute top-3 right-3 text-[9px] font-semibold tracking-[0.18em] uppercase text-white/70 bg-black/20 px-2 py-0.5">
          {wine.wineType}
        </span>
      </Link>

      {/* ── Info block ─────────────────────────────────────────────────── */}
      <div className="pt-4 flex-1 flex flex-col">
        {/* Producer */}
        <p className="text-[10px] tracking-[0.18em] uppercase text-[var(--muted)] mb-0.5">{wine.producer}</p>

        {/* Name + year */}
        <Link href={`/viner/${wine.slug}`} className="group mb-1">
          <h3 className="font-bold text-[var(--fg)] leading-tight text-sm uppercase tracking-tight group-hover:opacity-60 transition-opacity">
            {wine.name}
          </h3>
        </Link>
        {wine.year && <p className="text-xs text-[var(--muted)] mb-2">{wine.year}</p>}

        {/* Star rating */}
        <div className="mb-3">
          <StarDisplay rating={rating} count={ratingCount} />
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-4 mt-auto">
          {wine.systembolagetUrl && (
            <a
              href={wine.systembolagetUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--fg)] border-b border-[var(--fg)] hover:opacity-50 transition-opacity pb-px"
            >
              Beställ
            </a>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)] hover:text-[var(--fg)] transition-colors flex items-center gap-1"
          >
            Smakprofil
            <svg className={`w-2.5 h-2.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* ── Expanded smakprofil ─────────────────────────────────────── */}
        {open && (
          <div className="mt-4 pt-4 border-t border-[var(--rule-xs)] space-y-2.5">
            {hasProfile ? (
              <>
                {wine.syra      != null && <Meter label="Syra"      value={wine.syra} />}
                {wine.fyllighet != null && <Meter label="Fyllighet" value={wine.fyllighet} />}
                {wine.funk      != null && <Meter label="Funk"      value={wine.funk} />}
                {wine.stravhet  != null && <Meter label="Strävhet"  value={wine.stravhet} />}
              </>
            ) : (
              <p className="text-xs text-[var(--faint)] italic">Smakprofil saknas.</p>
            )}

            {wine.flavorNotes && (
              <p className="text-xs text-[var(--muted)] leading-relaxed italic pt-1">{wine.flavorNotes}</p>
            )}

            {wine.grape && (
              <p className="text-[10px] text-[var(--faint)] tracking-wide">{wine.grape}</p>
            )}

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <Link
                href={`/viner/${wine.slug}`}
                className="block text-[10px] tracking-[0.15em] uppercase text-[var(--muted)] border-b border-[var(--rule)] hover:text-[var(--fg)] hover:border-[var(--fg)] transition-colors pb-px w-fit"
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
                className="block text-[10px] tracking-[0.15em] uppercase text-[var(--faint)] hover:text-[var(--muted)] transition-colors pb-px w-fit"
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
