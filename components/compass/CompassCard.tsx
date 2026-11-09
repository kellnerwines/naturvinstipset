"use client";

import Link from "next/link";
import { useState } from "react";
import { COLOR_VAR, FOOD, typeOf, type Color, type Scored } from "@/lib/compass/engine";
import { buyHref, track } from "@/lib/compass/links";

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
  scored, first, targets,
}: {
  scored: Scored;
  first: boolean;
  targets: { s?: number; f?: number; st?: number; fu?: number };
}) {
  const { w, sc, hits, fh } = scored;
  const [imgFailed, setImgFailed] = useState(false);
  const hitSet = new Set(hits);
  const isSb = w.shop === "Systembolaget";

  return (
    <article
      className={`bg-[var(--card)] border ${first ? "border-[var(--fg)]" : "border-[var(--rule)]"} rounded-md p-4 grid grid-cols-[56px_1fr_auto] gap-x-4 gap-y-3`}
    >
      <Link href={`/viner/${w.slug}`} className="row-span-2 flex items-start justify-center" tabIndex={-1} aria-hidden="true">
        {w.img && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={w.img} alt="" loading="lazy" className="w-[56px] h-[120px] object-contain" onError={() => setImgFailed(true)} />
        ) : (
          <BottleSvg type={typeOf(w)} className="w-[34px] h-[74px] mt-2" />
        )}
      </Link>

      <div className="min-w-0">
        <p className="text-[10px] tracking-[0.12em] uppercase text-[var(--muted)] mb-1">
          {w.t} · {w.c}
          {w.y && w.y !== "NV" ? ` · ${w.y}` : ""}
          {w.own ? (
            <Link
              href="/om-oss#sa-rankar-vi"
              className="ml-2 normal-case tracking-normal text-[10px] border border-[var(--fg)] px-1.5 py-[1px] rounded-sm text-[var(--fg)]"
              title="Sajten drivs av grundaren av Kellner & Kellner. Egen import får ingen fördel i rankningen."
            >
              Egen import
            </Link>
          ) : null}
        </p>
        <h3 className="text-base font-bold leading-tight tracking-tight">
          <Link href={`/viner/${w.slug}`} className="hover:opacity-60 transition-opacity">{w.n}</Link>
        </h3>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          {w.p}{w.g ? ` · ${w.g}` : ""}
        </p>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold leading-none">{sc} %</p>
        <p className="text-[10px] text-[var(--muted)] mt-1">matchning</p>
      </div>

      <div className="col-span-2 space-y-1.5">
        <Axis name="Syra" value={w.s} target={targets.s} />
        <Axis name="Fyllighet" value={w.f} target={targets.f} />
        <Axis name="Strävhet" value={w.st} target={targets.st} />
        <Axis name="Funk" value={w.fu} target={targets.fu} />
      </div>

      <div className="col-span-3 text-sm leading-relaxed">
        {w.foodText ? (
          <p><span className="font-semibold">Passar till:</span> {w.foodText}</p>
        ) : null}
        {w.auto ? (
          <p className="text-[11px] text-[var(--muted)] mt-1">Smakprofilen är uppskattad automatiskt från butikens beskrivning.</p>
        ) : null}
      </div>

      <div className="col-span-3 flex flex-wrap gap-1.5">
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

      <div className="col-span-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 pt-3 border-t border-[var(--rule)]">
        <p className="text-sm">
          <span className="font-semibold">ca {w.pr} kr</span>
          {!isSb ? <span className="text-xs text-[var(--muted)]"> · webbutik, hemleverans, svensk skatt ingår</span> : null}
        </p>
        <div className="flex flex-col items-end gap-1">
          <a
            href={buyHref(w.slug, w.shop, w.url)}
            target="_blank"
            rel="noopener nofollow"
            onClick={() => track({ type: "buy", wineId: w.id, shop: w.shop, price: w.pr })}
            className="text-sm font-semibold underline underline-offset-4 decoration-[var(--faint)] hover:decoration-[var(--fg)]"
          >
            {isSb ? "Se vinet hos Systembolaget" : `Köp hos ${w.shop}`} →
          </a>
          {w.alt ? (
            <a
              href={buyHref(w.slug, w.alt.shop, w.alt.url)}
              target="_blank"
              rel="noopener nofollow"
              onClick={() => track({ type: "buy", wineId: w.id, shop: w.alt!.shop, price: w.alt!.pr })}
              className="text-xs text-[var(--muted)] underline underline-offset-4 decoration-[var(--faint)] hover:text-[var(--fg)]"
            >
              {w.alt.shop === "Systembolaget"
                ? `Eller hos Systembolaget, ${w.alt.pr} kr →`
                : `Eller hemleverans hos ${w.alt.shop}, ${w.alt.pr} kr →`}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
