"use client";

// Filtret i biblioteket. Läser data-attributen på raderna och döljer de som inte matchar,
// sorterar med CSS order och sparar valen i adressen så att en filtrerad lista går att länka till.

import { useEffect, useRef, useState, type ReactNode } from "react";

export type LibraryState = { butik: string; farg: string; land: string; pris: string; q: string; sort: string };
type Option = { value: string; label: string; n: number };
export type LibraryOptions = { shops: Option[]; types: Option[]; countries: Option[] };

const EMPTY: LibraryState = { butik: "", farg: "", land: "", pris: "", q: "", sort: "betyg" };
const PRICES: [string, string][] = [["", "Alla priser"], ["150", "Under 150 kr"], ["200", "Under 200 kr"], ["300", "Under 300 kr"], ["400", "Under 400 kr"]];
const SORTS: [string, string][] = [["betyg", "Högst betyg"], ["pris", "Lägst pris"], ["pris-hog", "Högst pris"]];

const select = "text-sm font-bold border-2 border-[var(--ink)] rounded-full px-3 py-1.5 bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--surface)] max-w-full";

export default function LibraryFilter({ options, initial, total, lockShop, children }: {
  options: LibraryOptions;
  initial: Partial<LibraryState>;
  total: number;
  lockShop?: boolean;
  children: ReactNode;
}) {
  const [s, setS] = useState<LibraryState>({ ...EMPTY, ...initial });
  const ref = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const emptyRef = useRef<HTMLParagraphElement>(null);
  const set = (k: keyof LibraryState) => (v: string) => setS((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    const rows = [...(ref.current?.querySelectorAll<HTMLElement>("li[data-shops]") ?? [])];
    const words = s.q.toLowerCase().split(/\s+/).filter(Boolean);
    const max = Number(s.pris) || Infinity;
    let n = 0;
    const ranked = rows.map((el) => {
      const d = el.dataset;
      const ok = (!s.butik || (d.shops ?? "").split(" ").includes(s.butik))
        && (!s.farg || d.type === s.farg)
        && (!s.land || d.country === s.land)
        && (max === Infinity || (Number(d.price) > 0 && Number(d.price) < max))
        && words.every((w) => (d.q ?? "").includes(w));
      el.hidden = !ok;
      if (ok) n++;
      return { el, price: Number(d.price) || 0, rating: Number(d.rating) || 0 };
    });
    // Sortering med CSS order; viner utan pris hamnar sist vid prissortering.
    const sorted = s.sort === "betyg" ? ranked
      : [...ranked].sort((a, b) => (!a.price ? 1 : !b.price ? -1 : s.sort === "pris" ? a.price - b.price : b.price - a.price));
    sorted.forEach((r, i) => { r.el.style.order = String(i); });
    // Antalet skrivs direkt i DOM:en, som raderna, i stället för via state.
    if (countRef.current) countRef.current.textContent = String(n);
    if (emptyRef.current) emptyRef.current.hidden = n > 0;

    // Valen i adressen (utan att ladda om sidan); butiken på en butikssida ingår redan i adressen.
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(s)) if (v && v !== EMPTY[k as keyof LibraryState] && !(lockShop && k === "butik")) params.set(k, v);
    const qs = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [s, lockShop]);

  const active = Object.entries(s).some(([k, v]) => v !== EMPTY[k as keyof LibraryState] && !(lockShop && k === "butik"));

  return (
    <div ref={ref}>
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filtrera vinerna">
        <input
          type="search"
          value={s.q}
          onChange={(e) => set("q")(e.target.value)}
          placeholder="Sök vin, producent eller druva"
          aria-label="Sök"
          className="w-full text-base border-[3px] border-[var(--ink)] rounded-full px-5 py-2.5 bg-[var(--paper)] mb-1 placeholder:text-[var(--muted)]"
        />
        {!lockShop && (
          <select aria-label="Butik" value={s.butik} onChange={(e) => set("butik")(e.target.value)} className={select}>
            <option value="">Alla butiker</option>
            {options.shops.map((o) => <option key={o.value} value={o.value}>{o.label} ({o.n})</option>)}
          </select>
        )}
        <select aria-label="Färg" value={s.farg} onChange={(e) => set("farg")(e.target.value)} className={select}>
          <option value="">Alla färger</option>
          {options.types.map((o) => <option key={o.value} value={o.value}>{o.label} ({o.n})</option>)}
        </select>
        <select aria-label="Land" value={s.land} onChange={(e) => set("land")(e.target.value)} className={select}>
          <option value="">Alla länder</option>
          {options.countries.map((o) => <option key={o.value} value={o.value}>{o.label} ({o.n})</option>)}
        </select>
        <select aria-label="Pris" value={s.pris} onChange={(e) => set("pris")(e.target.value)} className={select}>
          {PRICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select aria-label="Sortering" value={s.sort} onChange={(e) => set("sort")(e.target.value)} className={select}>
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <p className="text-sm text-[var(--muted)] mb-4" aria-live="polite">
        <span ref={countRef}>{total}</span> av {total} viner
        {active && (
          <button type="button" onClick={() => setS({ ...EMPTY, ...(lockShop ? { butik: initial.butik ?? "" } : {}) })} className="ml-3 underline underline-offset-2 hover:text-[var(--fg)]">
            Rensa filter
          </button>
        )}
      </p>
      {children}
      <p ref={emptyRef} hidden className="text-[var(--muted)] py-8">Inga viner matchar filtret.</p>
    </div>
  );
}
