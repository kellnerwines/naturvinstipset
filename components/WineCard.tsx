"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { StarDisplay } from "./Stars";
import LikeButton from "./LikeButton";
import type { Wine } from "@/lib/blob";

type Props = { wine: Wine; rating: number; ratingCount: number; likeCount: number; rank?: number; wineOfMonth?: boolean };

const typeColor: Record<string, string> = {
  Vitt:        "#d4b896",
  Rött:        "#8a4a4a",
  Rosé:        "#d4879a",
  Orange:      "#d4886a",
  "Pét Nat":   "#8aaa7a",
  Mousserande: "#7a9ab4",
};

// Lighter tint for image container background
const typeBg: Record<string, string> = {
  Rött:        "#dccfcf",
  Vitt:        "#dbd5bc",
  Rosé:        "#dbc5d0",
  Orange:      "#d8c9b0",
  Mousserande: "#bfcdd8",
  "Pét Nat":   "#cabfd8",
};

function Meter({ label, value, color }: { label: string; value: number; color?: string }) {
  const filled = Math.round(Math.max(0, Math.min(5, value)));
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[var(--muted)] w-12 shrink-0">{label}</span>
      <div className="flex gap-0.5 flex-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="h-1 flex-1 rounded-full"
            style={{ backgroundColor: n <= filled ? (color ?? "#0d0d0d") : "rgba(13,13,13,0.10)" }}
          />
        ))}
      </div>
    </div>
  );
}

export default function WineCard({ wine, rating, ratingCount, likeCount, rank, wineOfMonth }: Props) {
  const [open, setOpen] = useState(false);

  const color = typeColor[wine.wineType] ?? "#0d0d0d";
  const bg    = typeBg[wine.wineType] ?? "#d4d0c8";
  const hasProfile = wine.syra != null || wine.fyllighet != null || wine.funk != null;

  return (
    <div className={`flex flex-col bg-white${wineOfMonth ? " motm-card" : ""}`}>
      {/* ── Top bar: rank + type pill ───────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        {rank ? (
          <span className="text-[11px] font-bold text-[var(--muted)]">#{rank}</span>
        ) : <span />}
        <span
          className="text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {wine.wineType}
        </span>
      </div>

      {/* ── Image block ────────────────────────────────────────────────── */}
      <Link href={`/viner/${wine.slug}`} className="block relative group px-3">
        {wineOfMonth && (
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 text-[9px] font-bold tracking-[0.2em] uppercase bg-amber-400 text-white px-3 py-0.5 whitespace-nowrap">
            Månadens vin
          </span>
        )}
        <div
          className="w-full aspect-[3/4] overflow-hidden flex items-end justify-center rounded-md"
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
      </Link>

      {/* ── Info block ─────────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-3 flex-1 flex flex-col">
        {/* Producer */}
        <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)] mb-0.5">{wine.producer}</p>

        {/* Name */}
        <Link href={`/viner/${wine.slug}`} className="group mb-2">
          <h3 className="font-bold text-[var(--fg)] leading-tight text-sm tracking-tight group-hover:opacity-60 transition-opacity">
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
          <p className="text-xs text-[var(--muted)] leading-relaxed italic mb-3">{wine.flavorNotes}</p>
        )}

        {/* Rating + price row */}
        <div className="flex items-baseline justify-between mt-auto mb-2">
          <span className="text-base font-bold text-[var(--fg)]" style={{ fontFamily: "Georgia, serif" }}>
            ★ {rating.toFixed(1)}
          </span>
          {wine.price && (
            <span className="text-[11px] text-[var(--muted)]">{wine.price} kr</span>
          )}
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--rule-xs)] pt-2">
          <LikeButton wineId={wine.id} likeCount={likeCount} small />
          {wine.systembolagetUrl && (
            <a
              href={wine.systembolagetUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--fg)] border-b border-[var(--fg)] hover:opacity-50 transition-opacity pb-px whitespace-nowrap"
            >
              Beställ
            </a>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)] hover:text-[var(--fg)] transition-colors flex items-center gap-1 whitespace-nowrap ml-auto"
          >
            Mer
            <svg className={`w-2.5 h-2.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* ── Expandable: strävhet, flavor notes, druva, links ────────── */}
        {open && (
          <div className="mt-3 pt-3 border-t border-[var(--rule-xs)] space-y-2">
            {wine.stravhet != null && <Meter label="Strävhet" value={wine.stravhet} color={color} />}
            {wine.grape && (
              <p className="text-[10px] text-[var(--faint)] tracking-wide">{wine.grape}</p>
            )}
            <div className="flex items-center gap-4 flex-wrap pt-1">
              <Link
                href={`/viner/${wine.slug}`}
                className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)] border-b border-[var(--rule)] hover:text-[var(--fg)] hover:border-[var(--fg)] transition-colors pb-px"
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
                className="text-[10px] tracking-[0.15em] uppercase text-[var(--faint)] hover:text-[var(--muted)] transition-colors pb-px"
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
