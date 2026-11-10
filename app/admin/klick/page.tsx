// Klickstatistik i admin (BRIEF-KOMPASSEN.md, 7.3).

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getSettings, getWines } from "@/lib/blob";
import { databaseSize, dailyClicks, hasDb } from "@/lib/clicks/db";
import { SOURCE_LABEL, asSourcePage, swedishDay } from "@/lib/clicks/util";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Klickstatistik", robots: { index: false, follow: false } };

const FREE_TIER_BYTES = Number(process.env.CLICK_DB_LIMIT_MB || 1024) * 1024 * 1024;
const isDate = (s: string | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

function sumBy<T>(rows: T[], key: (r: T) => string, val: (r: T) => number) {
  const m = new Map<string, number>();
  for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + val(r));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** Dag för `n` dagar sedan, svensk tid (serverkomponent, körs per förfrågan). */
function daysAgo(n: number): string {
  return swedishDay(new Date(Date.now() - n * 86400_000));
}

const pct = (n: number, total: number) => (total ? `${Math.round((n / total) * 100)} %` : "–");

export default async function KlickPage({ searchParams }: { searchParams: Record<string, string | undefined> | Promise<Record<string, string | undefined>> }) {
  if (!(await isAuthenticated())) redirect("/admin");
  const sp = await searchParams;
  const to = isDate(sp.to) ? sp.to : swedishDay();
  const from = isDate(sp.from) ? sp.from : daysAgo(29);

  const [rows, wines, size, settings] = await Promise.all([
    dailyClicks({ from, to }), getWines(), databaseSize(), getSettings(),
  ]);
  const wineName = new Map(wines.map((w) => [w.id, `${w.name}${w.year && w.year !== "NV" ? ` ${w.year}` : ""}`]));
  const total = rows.reduce((s, r) => s + r.clicks, 0);
  const fromCompass = rows.filter((r) => r.source_page === "kompassen").reduce((s, r) => s + r.clicks, 0);
  const perDay = sumBy(rows, (r) => r.day, (r) => r.clicks).sort((a, b) => b[0].localeCompare(a[0]));
  const perShop = sumBy(rows, (r) => r.shop, (r) => r.clicks);
  const perSource = sumBy(rows, (r) => r.source_page, (r) => r.clicks);
  const perWine = sumBy(rows, (r) => r.wine_id, (r) => r.clicks).slice(0, 30);
  const compassPerWine = new Map(sumBy(rows.filter((r) => r.source_page === "kompassen"), (r) => r.wine_id, (r) => r.clicks));
  const shopsPerWine = new Map<string, string[]>();
  for (const r of rows) {
    const l = shopsPerWine.get(r.wine_id) ?? [];
    if (!l.includes(r.shop)) l.push(r.shop);
    shopsPerWine.set(r.wine_id, l);
  }

  const card = "border border-[var(--rule)] rounded-lg p-5";
  const th = "text-left text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--muted)] pb-2";
  const td = "py-1.5 border-t border-[var(--rule)] text-sm";

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[var(--green-dark)] text-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold">Klickstatistik</h1>
        <Link href="/admin" className="text-sm text-white/80 hover:text-white">← Till admin</Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {!hasDb() ? (
          <p className={`${card} bg-[var(--amber-light)]`}>
            Ingen databas är kopplad. Koppla Neon Postgres till projektet i Vercel (gratisnivån) så att <code>DATABASE_URL</code> finns. Köplänkarna fungerar ändå, men klicken sparas inte.
          </p>
        ) : null}

        <form className="flex flex-wrap items-end gap-3" method="get">
          <label className="text-sm">Från<br /><input type="date" name="from" defaultValue={from} className="border border-[var(--rule)] rounded px-2 py-1.5" /></label>
          <label className="text-sm">Till<br /><input type="date" name="to" defaultValue={to} className="border border-[var(--rule)] rounded px-2 py-1.5" /></label>
          <button className="bg-[var(--fg)] text-white text-sm px-4 py-2 rounded">Visa</button>
          <a href={`/api/admin/klick/csv?from=${from}&to=${to}`} className="text-sm underline underline-offset-4 ml-auto">Ladda ner CSV</a>
        </form>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className={card}><p className={th}>Klick</p><p className="text-3xl font-bold">{total}</p><p className="text-xs text-[var(--muted)]">{from} – {to}, utan robotar</p></div>
          <div className={card}><p className={th}>Från Vinkompassen</p><p className="text-3xl font-bold">{pct(fromCompass, total)}</p><p className="text-xs text-[var(--muted)]">{fromCompass} klick</p></div>
          <div className={card}>
            <p className={th}>Databas (Neon gratisnivå)</p>
            <p className="text-3xl font-bold">{size === null ? "–" : `${(size / 1024 / 1024).toFixed(1)} MB`}</p>
            <p className="text-xs text-[var(--muted)]">{size === null ? "Ingen databas" : `${pct(size, FREE_TIER_BYTES)} av ${Math.round(FREE_TIER_BYTES / 1024 / 1024)} MB`}</p>
            {size !== null ? (
              <div className="h-1.5 bg-[var(--rule)] rounded-full mt-2 overflow-hidden" aria-hidden="true">
                <div className="h-full bg-[var(--fg)]" style={{ width: `${Math.min(100, (size / FREE_TIER_BYTES) * 100)}%` }} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className={card}>
            <h2 className="font-bold mb-3">Per butik</h2>
            <table className="w-full"><thead><tr><th className={th}>Butik</th><th className={`${th} text-right`}>Klick</th><th className={`${th} text-right`}>Andel</th></tr></thead>
              <tbody>{perShop.map(([k, v]) => <tr key={k}><td className={td}>{k}</td><td className={`${td} text-right`}>{v}</td><td className={`${td} text-right`}>{pct(v, total)}</td></tr>)}</tbody></table>
            {!perShop.length ? <p className="text-sm text-[var(--muted)]">Inga klick ännu.</p> : null}
          </div>
          <div className={card}>
            <h2 className="font-bold mb-3">Per källsida</h2>
            <table className="w-full"><thead><tr><th className={th}>Sida</th><th className={`${th} text-right`}>Klick</th><th className={`${th} text-right`}>Andel</th></tr></thead>
              <tbody>{perSource.map(([k, v]) => <tr key={k}><td className={td}>{SOURCE_LABEL[asSourcePage(k)]}</td><td className={`${td} text-right`}>{v}</td><td className={`${td} text-right`}>{pct(v, total)}</td></tr>)}</tbody></table>
          </div>
        </div>

        <div className={card}>
          <h2 className="font-bold mb-3">Topplista över viner</h2>
          <table className="w-full"><thead><tr><th className={th}>Vin</th><th className={th}>Butiker</th><th className={`${th} text-right`}>Klick</th><th className={`${th} text-right`}>Från kompassen</th></tr></thead>
            <tbody>{perWine.map(([id, v]) => (
              <tr key={id}><td className={td}>{wineName.get(id) ?? id}</td><td className={`${td} text-[var(--muted)]`}>{(shopsPerWine.get(id) ?? []).join(", ")}</td>
                <td className={`${td} text-right`}>{v}</td><td className={`${td} text-right`}>{pct(compassPerWine.get(id) ?? 0, v)}</td></tr>
            ))}</tbody></table>
        </div>

        <div className={card}>
          <h2 className="font-bold mb-3">Per dag</h2>
          <table className="w-full"><thead><tr><th className={th}>Dag</th><th className={`${th} text-right`}>Klick</th></tr></thead>
            <tbody>{perDay.map(([d, v]) => <tr key={d}><td className={td}>{d}</td><td className={`${td} text-right`}>{v}</td></tr>)}</tbody></table>
        </div>

        <form action="/api/admin/settings" method="post" className={`${card} flex flex-wrap items-center justify-between gap-4`}>
          <div className="max-w-xl">
            <h2 className="font-bold">Ersättning från webbutiker: {settings.retailerCompensation ? "på" : "av"}</h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              Slå på när det första avtalet om ersättning finns. Då får länkar till webbutiker rel=&quot;sponsored nofollow&quot; och sidfoten visar att sajten kan få ersättning. Systembolaget påverkas inte.
            </p>
          </div>
          <input type="hidden" name="retailerCompensation" value={settings.retailerCompensation ? "false" : "true"} />
          <button className="border border-[var(--fg)] text-sm px-4 py-2 rounded hover:bg-[var(--fg)] hover:text-white">
            {settings.retailerCompensation ? "Slå av" : "Slå på"}
          </button>
        </form>

        <p className="text-xs text-[var(--muted)]">
          Klick loggas utan IP-adress och utan kaka. Samma enhet och vin räknas en gång per dag. Klick äldre än 90 dagar slås ihop till dagssummor varje natt.
        </p>
      </div>
    </div>
  );
}
