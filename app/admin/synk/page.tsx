// Synklogg och "Synka nu" i admin (BRIEF-KOMPASSEN.md, 6.3).

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getSyncLog, getWines } from "@/lib/blob";
import type { SyncLogEntry } from "@/lib/sync/run";
import { TAX_HIDDEN } from "@/lib/sync/apply";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Synk av webbutiker", robots: { index: false, follow: false } };

const when = (iso: string) => new Date(iso).toLocaleString("sv-SE", { timeZone: "Europe/Stockholm", dateStyle: "short", timeStyle: "short" });

export default async function SynkPage() {
  if (!(await isAuthenticated())) redirect("/admin");
  const [log, wines] = await Promise.all([getSyncLog<SyncLogEntry>(), getWines()]);
  const hidden = wines.filter((w) => w.syncHidden === TAX_HIDDEN);

  const card = "border border-[var(--rule)] rounded-lg p-5";
  const th = "text-left text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--muted)] pb-2";
  const td = "py-1.5 border-t border-[var(--rule)] text-sm align-top";

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[var(--green-dark)] text-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold">Synk av webbutiker</h1>
        <Link href="/admin" className="text-sm text-white/80 hover:text-white">← Till admin</Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <form action="/api/cron/sync" method="post" className={`${card} flex flex-wrap items-center justify-between gap-4`}>
          <div className="max-w-xl">
            <h2 className="font-bold">Vin &amp; Natur, Flaskvis, Philipson Wine, Wine Trade och Just Wine</h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              Synken körs automatiskt den 1:a varje månad. Den uppdaterar pris och lagerstatus, lägger till nya viner och markerar
              slutsålda. Låsta fält skrivs aldrig över. Det tar några minuter.
            </p>
          </div>
          <button className="bg-[var(--fg)] text-white text-sm px-4 py-2 rounded">Synka nu</button>
        </form>

        {hidden.length ? (
          <div className={`${card} bg-[var(--amber-light)]`}>
            <h2 className="font-bold mb-2">Avpublicerade av synken</h2>
            <p className="text-sm mb-2">Texten &quot;Moms och alkoholskatt inkluderad&quot; saknades på produktsidan. Vinet publiceras igen automatiskt när texten finns tillbaka.</p>
            <ul className="text-sm list-disc pl-5">{hidden.map((w) => <li key={w.id}>{w.name} ({w.shop})</li>)}</ul>
          </div>
        ) : null}

        {log.length === 0 ? <p className="text-sm text-[var(--muted)]">Synken har inte körts än.</p> : null}

        {log.map((e) => (
          <div key={e.startedAt} className={card}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <h2 className="font-bold">{when(e.startedAt)}</h2>
              <p className="text-xs text-[var(--muted)]">
                {e.trigger === "cron" ? "Automatisk" : "Synka nu"} · {Math.round((Date.parse(e.finishedAt) - Date.parse(e.startedAt)) / 1000)} s
              </p>
            </div>
            {e.alerts.length ? (
              <ul className="text-sm bg-[var(--amber-light)] rounded p-3 mb-3 list-disc pl-6">{e.alerts.map((a, i) => <li key={i}>{a}</li>)}</ul>
            ) : null}
            <table className="w-full">
              <thead><tr><th className={th}>Butik</th><th className={th}>Sedda</th><th className={th}>Nya</th><th className={th}>Ändrade</th><th className={th}>Slut</th><th className={th}>Fel</th></tr></thead>
              <tbody>
                {e.reports.map((r) => (
                  <tr key={r.shop}>
                    <td className={td}>{r.shop}</td>
                    <td className={td}>{r.seen}</td>
                    <td className={td} title={r.added.join(", ")}>{r.added.length}</td>
                    <td className={td} title={r.changed.join(", ")}>{r.changed.length}</td>
                    <td className={td} title={r.outOfStock.join(", ")}>{r.outOfStock.length}</td>
                    <td className={td}>{r.errors.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {e.reports.some((r) => r.errors.length) ? (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-[var(--muted)]">Visa fel</summary>
                <ul className="list-disc pl-5 mt-2 space-y-1">{e.reports.flatMap((r) => r.errors.map((x, i) => <li key={`${r.shop}${i}`}>{r.shop}: {x}</li>))}</ul>
              </details>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
