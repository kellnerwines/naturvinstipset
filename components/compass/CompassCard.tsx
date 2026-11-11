"use client";

import Link from "next/link";
import { useState } from "react";
import { COLOR_VAR, FOOD, typeOf, type Color, type Scored } from "@/lib/compass/engine";
import { buyHref, track } from "@/lib/compass/links";
import { buyRel } from "@/lib/clicks/util";
import OwnImportBadge from "@/components/OwnImportBadge";

/** Enkel flask-SVG i vinets typfärg, reserv när bild saknas. */
export function BottleSvg({ type, className }: { type: string; className?: string }) {
  const color = COLOR_VAR[type as Color] ?? "--wine-rott";
  return (
    <svg viewBox="0 0 44 96" aria-hidden="true" className={className}>
      <path d="M17 2h10v18c0 4 9 8 9 18v52a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V38c0-10 9-14 9-18z" fill={`var(${color})`} />
      <rect x="11" y="48" width="22" height="26" rx="2" fill="var(--card)" opacity=".85" />
      <rect x="17" y="2" width="10" height="7" fill="var(--fg)" opacity=".7" />
    </svg>
  );
}

function Axis({ name, value, target }: { name: string; value: number; target?: number }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
      <span className="w-[62px] shrink-0">{name}</span>
      <div className="relative flex gap-[3px] flex-1 max-w-[110px]" aria-label={`${name} ${value} av 5`} role="img">
        {[1, 2, 3, 4, 5].map((i) => (
          <i key={i} className={`h-[4px] flex-1 rounded-full ${i <= value ? "bg-[var(--fg)]" : "bg-[var(--rule)]"}`} />
        ))}
        {target ? (
          <span
            className="absolute -top-[4px] w-[2px] h-[12px] bg-[var(--fg)] opacity-60"
            style={{ left: `calc(${((target - 0.5) / 5) * 100}% - 1px)` }}
            title="Ditt val"
          />
        ) : null}
      </div>
    </div>
  );
}

export default function CompassCard({
  scored, first, targets, stateQs, compensation,
}: {
  scored: Scored;
  first: boolean;
  /** Kompassens val som URL-parametrar, följer med klicket till /go. */
  stateQs: string;
  compensation: boolean;
  targets: { s?: number; f?: number; st?: number; fu?: number };
}) {
  const { w, sc, hits, fh } = scored;
  const [imgFailed, setImgFailed] = useState(false);
  // Kortet visar bara bild, namn, producent, pris och köplänk. Resten fälls ut med "Visa mer".
  const [open, setOpen] = useState(false);
  const hitSet = new Set(hits);
  const isSb = w.shop === "Systembolaget";
  const detailsId = `vin-${w.id}-detaljer`;

  return (
    // På desktop ligger korten två och två med den stående flaskbilden överst; bästa förslaget tar hela bredden.
    <article className={`bg-[var(--card)] border ${first ? "border-[var(--fg)] md:col-span-2" : "border-[var(--rule)]"} rounded-lg p-4`}>
      <div className={`grid grid-cols-[72px_1fr] sm:grid-cols-[88px_1fr] gap-x-4 ${first ? "md:grid-cols-[150px_1fr] md:gap-x-6" : "md:grid-cols-1 md:gap-y-4"}`}>
        <Link href={`/viner/${w.slug}`} className={`flex items-center justify-center bg-[var(--surface)] rounded-md h-[132px] sm:h-[150px] ${first ? "md:h-[220px]" : "md:h-[240px]"}`} tabIndex={-1} aria-hidden="true">
          {w.img && !imgFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={w.img} alt="" loading="lazy" className="h-[120px] w-[66px] sm:h-[136px] sm:w-[80px] md:h-[85%] md:w-auto object-contain" onError={() => setImgFailed(true)} />
          ) : (
            <BottleSvg type={typeOf(w)} className="w-[40px] h-[96px] md:w-[60px] md:h-[144px]" />
          )}
        </Link>

        <div className="min-w-0 flex flex-col">
          <h3 className="text-lg font-bold leading-tight tracking-tight">
            <Link href={`/viner/${w.slug}`} className="hover:opacity-60 transition-opacity">{w.n}</Link>
          </h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            {w.p} · ca {w.pr} kr
          </p>
          {w.own ? <p className="mt-1.5"><OwnImportBadge /></p> : null}

          <div className="mt-auto pt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href={buyHref(w.slug, w.shop, { source: "kompassen", path: "/", state: stateQs })}
              target="_blank"
              rel={buyRel(w.shop, compensation)}
              onClick={() => track({ type: "buy", wineId: w.id, shop: w.shop, price: w.pr })}
              className="inline-flex items-center whitespace-nowrap rounded-full bg-[var(--fg)] text-[var(--bg)] text-[13px] sm:text-sm font-semibold px-3.5 sm:px-4 py-2 hover:opacity-80 transition-opacity"
            >
              {isSb ? "Se hos Systembolaget" : `Köp hos ${w.shop}`}
            </a>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={() => setOpen((o) => !o)}
              className="text-sm text-[var(--muted)] hover:text-[var(--fg)] inline-flex items-center gap-1"
            >
              {open ? "Visa mindre" : "Visa mer"}
              <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          </div>
        </div>
      </div>

      {open ? (
        <div id={detailsId} className="mt-4 pt-4 border-t border-[var(--rule)] space-y-3 text-sm">
          <p className="text-[11px] tracking-[0.12em] uppercase text-[var(--muted)]">
            {w.t} · {w.c}{w.y && w.y !== "NV" ? ` · ${w.y}` : ""}{w.g ? ` · ${w.g}` : ""} · {sc} % matchning
          </p>
          <div className="space-y-1.5">
            <Axis name="Syra" value={w.s} target={targets.s} />
            <Axis name="Fyllighet" value={w.f} target={targets.f} />
            <Axis name="Strävhet" value={w.st} target={targets.st} />
            <Axis name="Funk" value={w.fu} target={targets.fu} />
          </div>
          {w.foodText ? <p className="leading-relaxed"><span className="font-semibold">Passar till:</span> {w.foodText}</p> : null}
          <div className="flex flex-wrap gap-1.5">
            {[...hitSet].map((h) => (
              <span key={`h-${h}`} className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--fg)] text-[var(--bg)]">{h}</span>
            ))}
            {fh.map((f) => (
              <span key={`f-${f}`} className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--fg)] text-[var(--bg)]">{FOOD[f]}</span>
            ))}
            {w.tags.filter((t) => !hitSet.has(t)).map((t) => (
              <span key={`t-${t}`} className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--surface)] text-[var(--fg)]">{t}</span>
            ))}
          </div>
          {!isSb ? <p className="text-xs text-[var(--muted)]">Webbutik med hemleverans, svensk alkoholskatt ingår i priset.</p> : null}
          {w.alt ? (
            <a
              href={buyHref(w.slug, w.alt.shop, { source: "kompassen", path: "/", state: stateQs })}
              target="_blank"
              rel={buyRel(w.alt.shop, compensation)}
              onClick={() => track({ type: "buy", wineId: w.id, shop: w.alt!.shop, price: w.alt!.pr })}
              className="inline-block text-sm underline underline-offset-4 decoration-[var(--faint)] hover:decoration-[var(--fg)]"
            >
              {w.alt.shop === "Systembolaget" ? `Finns även hos Systembolaget, ${w.alt.pr} kr →` : `Finns även med hemleverans hos ${w.alt.shop}, ${w.alt.pr} kr →`}
            </a>
          ) : null}
          {w.auto ? <p className="text-[11px] text-[var(--muted)]">Smakprofilen är uppskattad automatiskt från butikens beskrivning.</p> : null}
        </div>
      ) : null}
    </article>
  );
}
