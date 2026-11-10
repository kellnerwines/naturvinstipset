"use client";

// Filtret "Var köper du?" på kategorisidor och guider (BRIEF-KOMPASSEN.md, 9).
// Listan renderas på servern med data-where på varje vin, så att alla viner
// finns i HTML:en för sökmotorer. Filtret döljer bara rader med CSS.

import { useState } from "react";

export type Where = "alla" | "sb" | "web";
const OPTIONS: [Where, string][] = [["alla", "Alla"], ["sb", "Systembolaget"], ["web", "Hemleverans"]];

export default function WhereFilter({ counts, children }: { counts: Record<Where, number>; children: React.ReactNode }) {
  const [where, setWhere] = useState<Where>("alla");
  const showFilter = counts.sb > 0 && counts.web > 0;
  return (
    <div data-where-filter={where} className="where-filter">
      {showFilter ? (
        <div className="flex flex-wrap items-center gap-2 mb-6" role="group" aria-label="Var köper du?">
          <span className="text-sm text-[var(--muted)] mr-1">Var köper du?</span>
          {OPTIONS.map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={where === k}
              onClick={() => setWhere(k)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${where === k ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]" : "border-[var(--rule)] text-[var(--fg)] hover:border-[var(--fg)]"}`}
            >
              {label} <span className="opacity-60">{counts[k]}</span>
            </button>
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
}
