"use client";

import { useState } from "react";

export function StarDisplay({ rating, count }: { rating: number; count?: number }) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.3 && rating - full < 0.8;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex text-[var(--fg)]">
        {Array(full).fill(0).map((_, i) => <StarIcon key={`f${i}`} type="full" />)}
        {half && <StarIcon type="half" />}
        {Array(empty).fill(0).map((_, i) => <StarIcon key={`e${i}`} type="empty" />)}
      </span>
      <span className="text-xs font-semibold text-[var(--fg)] ml-1 opacity-70">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-[var(--faint)]">({count})</span>}
    </span>
  );
}

function StarIcon({ type }: { type: "full" | "half" | "empty" }) {
  if (type === "full")  return <span className="text-xs">★</span>;
  if (type === "half")  return <span className="text-xs opacity-60">★</span>;
  return <span className="text-xs opacity-15">★</span>;
}

export function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="flex gap-1 text-3xl cursor-pointer">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className={`transition-opacity ${(hover || value) >= n ? "opacity-100 text-[var(--fg)]" : "opacity-15 text-[var(--fg)]"}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
