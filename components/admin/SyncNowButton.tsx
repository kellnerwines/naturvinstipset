"use client";

// "Synka nu" i admin: kör synken utan att lämna sidan och visar under tiden hur länge den
// har pågått och ungefär hur lång tid som är kvar, uppskattat från de senaste körningarna.
// Utan JavaScript skickas formuläret som vanligt.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Result = { text: string; seconds: number };
type State = { phase: "idle" } | { phase: "running"; started: number } | { phase: "done"; result: Result } | { phase: "error"; message: string };

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const remaining = (s: number) => (s >= 90 ? `ungefär ${Math.round(s / 60)} min kvar` : s >= 15 ? `under en minut kvar` : "snart klar");

/** Samma knapp för synken och för andra långa körningar i admin, t.ex. utklippning av flaskbilder. */
export default function SyncNowButton({ estimateSeconds, endpoint = "/api/cron/sync", label = "Synka nu" }: {
  estimateSeconds: number;
  endpoint?: string;
  label?: string;
}) {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [now, setNow] = useState(0);
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (state.phase === "running") return;
    const started = Date.now();
    setNow(started);
    setState({ phase: "running", started });
    timer.current = setInterval(() => setNow(Date.now()), 1000);
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(res.status === 401 ? "Du är utloggad. Logga in igen." : `Servern svarade ${res.status}.`);
      // Synken svarar med butiksrapporter, andra körningar med en färdig sammanfattning.
      const body = (await res.json()) as { summary?: string; reports?: { added: string[]; changed: string[]; outOfStock: string[]; errors: string[] }[] };
      const sum = (k: "added" | "changed" | "outOfStock" | "errors") => (body.reports ?? []).reduce((n, r) => n + r[k].length, 0);
      const text = body.summary ?? `${sum("added")} nya, ${sum("changed")} ändrade, ${sum("outOfStock")} slut${sum("errors") ? `, ${sum("errors")} fel` : ""}. Loggen nedan är uppdaterad.`;
      setState({ phase: "done", result: { text, seconds: Math.round((Date.now() - started) / 1000) } });
      router.refresh();
    } catch (err) {
      setState({ phase: "error", message: (err as Error).message || "Något gick fel." });
    } finally {
      clearInterval(timer.current);
    }
  }

  const running = state.phase === "running";
  const elapsed = running ? (now - state.started) / 1000 : 0;
  // Stapeln går mot 95 % av uppskattningen och står still där tills svaret kommer.
  const pct = running ? Math.min(95, (elapsed / estimateSeconds) * 95) : 0;

  return (
    <form action={endpoint} method="post" onSubmit={run} className="flex flex-col items-stretch gap-2 w-[240px] max-w-full">
      <button
        disabled={running}
        className="inline-flex items-center justify-center gap-2 bg-[var(--green-dark)] text-white text-sm font-semibold px-5 py-2.5 rounded-md shadow-sm cursor-pointer transition hover:bg-[var(--fg)] hover:shadow active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green-dark)] disabled:cursor-wait disabled:opacity-80"
      >
        {running ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
            Synkar …
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
            </svg>
            {label}
          </>
        )}
      </button>

      <div aria-live="polite" className="text-xs text-[var(--muted)]">
        {running && (
          <>
            <div className="h-1.5 rounded-full bg-black/10 overflow-hidden mb-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Synkens förlopp">
              <div className="h-full bg-[var(--green-dark)] transition-[width] duration-1000 ease-linear" style={{ width: `${pct}%` }} />
            </div>
            {mmss(elapsed)} · {elapsed < estimateSeconds ? remaining(estimateSeconds - elapsed) : "tar längre tid än vanligt, snart klar"}
            <span className="block">Låt sidan vara öppen tills den är klar.</span>
          </>
        )}
        {state.phase === "done" && (
          <span className="text-[var(--green-dark)]">
            Klar på {mmss(state.result.seconds)}: {state.result.text}
          </span>
        )}
        {state.phase === "error" && <span className="text-red-700">{state.message}</span>}
      </div>
    </form>
  );
}
