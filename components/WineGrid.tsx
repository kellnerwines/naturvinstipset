"use client";

import { useState, useMemo } from "react";
import WineCard from "./WineCard";
import type { Wine } from "@/lib/blob";

export type WineEntry = { wine: Wine; rating: number; count: number };

/* ── Filter shape ──────────────────────────────────────────────────────────── */
type Filters = {
  wineTypes: string[];
  minRating: number | null;
  priceRange: [number, number] | null;
  countries: string[];
  grapes: string[];
  flavorTags: string[];
  profile: { syra: number | null; fyllighet: number | null; funk: number | null; stravhet: number | null };
};

const empty: Filters = {
  wineTypes: [], minRating: null, priceRange: null,
  countries: [], grapes: [], flavorTags: [],
  profile: { syra: null, fyllighet: null, funk: null, stravhet: null },
};

const PRICE_RANGES: { label: string; range: [number, number] }[] = [
  { label: "–150 kr",   range: [0, 149] },
  { label: "150–200",   range: [150, 200] },
  { label: "200–300",   range: [201, 300] },
  { label: "300+ kr",   range: [301, 9999] },
];

const RATING_OPTS = [
  { label: "5.0", min: 4.95 },
  { label: "4.5+", min: 4.5 },
  { label: "4.0+", min: 4.0 },
  { label: "3.5+", min: 3.5 },
];

const PROFILE_LABELS: { key: keyof Filters["profile"]; label: string }[] = [
  { key: "syra",      label: "Syra" },
  { key: "fyllighet", label: "Fyllighet" },
  { key: "funk",      label: "Funk" },
  { key: "stravhet",  label: "Strävhet" },
];

/* ── Pill button ───────────────────────────────────────────────────────────── */
function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-[9px] font-bold tracking-[0.18em] uppercase px-2.5 py-1 border transition-colors whitespace-nowrap
        ${active
          ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
          : "border-[var(--rule)] text-[var(--muted)] hover:border-[var(--fg)] hover:text-[var(--fg)]"
        }`}
    >
      {children}
    </button>
  );
}

/* ── Section with label ────────────────────────────────────────────────────── */
function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[var(--faint)] w-16 shrink-0">{label}</span>
      {children}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export default function WineGrid({ entries }: { entries: WineEntry[] }) {
  const [filters, setFilters] = useState<Filters>(empty);
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* Derive option lists from data */
  const options = useMemo(() => {
    const types    = [...new Set(entries.map(e => e.wine.wineType).filter(Boolean))].sort();
    const countries = [...new Set(entries.map(e => e.wine.country).filter(Boolean))].sort();
    const grapeSet = new Set<string>();
    const tagSet   = new Set<string>();
    for (const { wine } of entries) {
      wine.grape?.split(/[,;]/).forEach(g => { const t = g.trim(); if (t) grapeSet.add(t); });
      wine.flavorTags?.forEach(t => tagSet.add(t));
    }
    return {
      types,
      countries,
      grapes: [...grapeSet].sort(),
      flavorTags: [...tagSet].sort(),
    };
  }, [entries]);

  /* Apply filters */
  const filtered = useMemo(() => {
    return entries.filter(({ wine, rating }) => {
      if (filters.wineTypes.length && !filters.wineTypes.includes(wine.wineType)) return false;
      if (filters.minRating !== null && rating < filters.minRating) return false;
      if (filters.priceRange) {
        const p = Number(wine.price ?? 0);
        if (p < filters.priceRange[0] || p > filters.priceRange[1]) return false;
      }
      if (filters.countries.length && !filters.countries.includes(wine.country)) return false;
      if (filters.grapes.length) {
        const wineGrapes = (wine.grape ?? "").split(/[,;]/).map(g => g.trim());
        if (!filters.grapes.some(g => wineGrapes.includes(g))) return false;
      }
      if (filters.flavorTags.length) {
        if (!filters.flavorTags.some(t => wine.flavorTags?.includes(t))) return false;
      }
      // Profile filters: wine must have at least the selected level
      for (const { key } of PROFILE_LABELS) {
        const min = filters.profile[key];
        if (min !== null) {
          const val = wine[key] as number | undefined;
          if (val == null || val < min) return false;
        }
      }
      return true;
    });
  }, [entries, filters]);

  /* Pin motm to #1 in filtered results */
  const ranked = useMemo(() => {
    const motmIdx = filtered.findIndex(e => e.wine.wineOfMonth);
    if (motmIdx > 0) {
      return [filtered[motmIdx], ...filtered.slice(0, motmIdx), ...filtered.slice(motmIdx + 1)];
    }
    return filtered;
  }, [filtered]);

  /* Toggle helpers */
  function toggleArr<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  const activeCount = [
    filters.wineTypes.length,
    filters.minRating !== null ? 1 : 0,
    filters.priceRange !== null ? 1 : 0,
    filters.countries.length,
    filters.grapes.length,
    filters.flavorTags.length,
    Object.values(filters.profile).filter(v => v !== null).length,
  ].reduce((a, b) => a + b, 0);

  const hasFilters = activeCount > 0;

  return (
    <div>
      {/* ── Filter toggle bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--rule)]">
        <button
          onClick={() => setFiltersOpen(o => !o)}
          className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
        >
          <svg className={`w-3 h-3 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
          </svg>
          Filtrera
          {hasFilters && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--fg)] text-[var(--bg)] text-[8px] font-bold">
              {activeCount}
            </span>
          )}
        </button>

        {hasFilters && (
          <button
            onClick={() => setFilters(empty)}
            className="text-[9px] tracking-[0.15em] uppercase text-[var(--faint)] hover:text-[var(--fg)] transition-colors border-b border-[var(--rule)] pb-px"
          >
            Rensa filter
          </button>
        )}
      </div>

      {/* ── Filter panel ───────────────────────────────────────────────────── */}
      {filtersOpen && (
        <div className="mb-10 border border-[var(--rule)] p-5 space-y-4 bg-[var(--card)]">

          {/* Vintyp */}
          <FilterSection label="Vintyp">
            {options.types.map(t => (
              <Pill key={t} active={filters.wineTypes.includes(t)}
                onClick={() => setFilters(f => ({ ...f, wineTypes: toggleArr(f.wineTypes, t) }))}>
                {t}
              </Pill>
            ))}
          </FilterSection>

          {/* Betyg */}
          <FilterSection label="Betyg">
            {RATING_OPTS.map(({ label, min }) => (
              <Pill key={label} active={filters.minRating === min}
                onClick={() => setFilters(f => ({ ...f, minRating: f.minRating === min ? null : min }))}>
                {label}
              </Pill>
            ))}
          </FilterSection>

          {/* Pris */}
          <FilterSection label="Pris">
            {PRICE_RANGES.map(({ label, range }) => (
              <Pill key={label}
                active={filters.priceRange?.[0] === range[0] && filters.priceRange?.[1] === range[1]}
                onClick={() => setFilters(f => ({
                  ...f,
                  priceRange: f.priceRange?.[0] === range[0] && f.priceRange?.[1] === range[1] ? null : range,
                }))}>
                {label}
              </Pill>
            ))}
          </FilterSection>

          {/* Land */}
          <FilterSection label="Land">
            {options.countries.map(c => (
              <Pill key={c} active={filters.countries.includes(c)}
                onClick={() => setFilters(f => ({ ...f, countries: toggleArr(f.countries, c) }))}>
                {c}
              </Pill>
            ))}
          </FilterSection>

          {/* Smaktoner */}
          {options.flavorTags.length > 0 && (
            <FilterSection label="Smak">
              {options.flavorTags.map(t => (
                <Pill key={t} active={filters.flavorTags.includes(t)}
                  onClick={() => setFilters(f => ({ ...f, flavorTags: toggleArr(f.flavorTags, t) }))}>
                  {t}
                </Pill>
              ))}
            </FilterSection>
          )}

          {/* Druvor */}
          {options.grapes.length > 0 && (
            <FilterSection label="Druva">
              <div className="flex flex-wrap gap-1.5">
                {options.grapes.map(g => (
                  <Pill key={g} active={filters.grapes.includes(g)}
                    onClick={() => setFilters(f => ({ ...f, grapes: toggleArr(f.grapes, g) }))}>
                    {g}
                  </Pill>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Smakprofil */}
          <FilterSection label="Profil">
            <div className="flex flex-wrap gap-3">
              {PROFILE_LABELS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[9px] tracking-[0.15em] uppercase text-[var(--muted)] w-14">{label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setFilters(f => ({
                          ...f,
                          profile: { ...f.profile, [key]: f.profile[key] === n ? null : n },
                        }))}
                        className={`w-5 h-1.5 rounded-full transition-colors ${
                          filters.profile[key] !== null && n <= (filters.profile[key] ?? 0)
                            ? "bg-[var(--fg)]"
                            : "bg-[var(--fg)] opacity-10 hover:opacity-40"
                        }`}
                      />
                    ))}
                  </div>
                  {filters.profile[key] !== null && (
                    <span className="text-[8px] text-[var(--faint)]">≥{filters.profile[key]}</span>
                  )}
                </div>
              ))}
            </div>
          </FilterSection>
        </div>
      )}

      {/* ── Result count ───────────────────────────────────────────────────── */}
      {hasFilters && (
        <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--muted)] mb-6">
          {ranked.length} {ranked.length === 1 ? "vin" : "viner"} matchar
        </p>
      )}

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      {ranked.length === 0 ? (
        <div className="text-center py-24 text-[var(--muted)]">
          <p className="text-5xl mb-6 opacity-30">○</p>
          <p className="text-sm">Inga viner matchar filtret.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
          {ranked.map(({ wine, rating, count }, i) => (
            <WineCard key={wine.id} wine={wine} rating={rating} ratingCount={count} rank={i + 1} wineOfMonth={wine.wineOfMonth} />
          ))}
        </div>
      )}
    </div>
  );
}
