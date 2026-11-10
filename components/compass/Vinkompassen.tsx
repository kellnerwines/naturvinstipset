"use client";

// Vinkompassen (BRIEF-KOMPASSEN.md, avsnitt 4). Flöde, texter och beteende
// följer design/vinkompassen-prototyp.html; utseendet följer sajtens tema.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ADV_TARGET, AXES, FOOD, QUESTIONS, TAGS, answerText, emptyState, foodsSel, label, matching, pick, relaxLabel, relaxMessage,
  type AxisKey, type CompassState, type CompassWine, type Question, type QuestionKey,
} from "@/lib/compass/engine";
import { applyParsed, missingTail, reflect, regexInterpreter, understood } from "@/lib/compass/parse";
import { paramsToState, stateToParams } from "@/lib/compass/url";
import { RETAILER_DISCLAIMER, track } from "@/lib/compass/links";
import CompassCard from "./CompassCard";
import css from "./compass.module.css";

type Step = { h: string; s: string; done: boolean };
type Item =
  | { id: number; kind: "q"; k: QuestionKey; left?: number }
  | { id: number; kind: "user"; text: string }
  | { id: number; kind: "agent"; text: string; picked?: string[]; animate: boolean }
  | { id: number; kind: "think"; steps: Step[]; summary: string | null }
  | { id: number; kind: "results" }
  | { id: number; kind: "deep" };

type NewItem = Item extends infer T ? (T extends Item ? Omit<T, "id"> : never) : never;

type PanelKey = "shop" | "prof" | "tags" | "dfood" | "country" | "grape" | "like";
const PANELS: [PanelKey, string][] = [
  ["shop", "Hur vill du få vinet?"], ["prof", "Smakprofil"], ["tags", "Smak"], ["dfood", "Mat"],
  ["country", "Land"], ["grape", "Druva"], ["like", "Liknar ett vin jag gillar"],
];
const S0 = ["Något kryddigt till solnedgången på balkongen", "Ett vitt till skaldjur under 300 kr", "Något funkigt och orange", "Ett rött till lammgryta", "Bubbel till mingel", "Från Portugal"];
const S1 = ["Mer mineraliskt", "Från Portugal", "Lite mer funk", "Till kryddig mat", "Börja om"];
const FIRST_SHOWN = 5;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─── Små byggstenar ───────────────────────────────────────────────────────────

function GlassIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M7 3h10l-.6 6.5A4.5 4.5 0 0 1 12 13.6 4.5 4.5 0 0 1 7.6 9.5z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 13.6V20M8.5 20.5h7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AgentRow({ children }: { children: React.ReactNode }) {
  return (
    <div className={`flex gap-3 items-start ${css.enter}`}>
      <div className="w-7 h-7 shrink-0 rounded-full border border-[var(--rule)] flex items-center justify-center text-[var(--fg)] bg-[var(--bg)]">
        <GlassIcon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">{children}</div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className={`flex justify-end ${css.enter}`}>
      <p className="max-w-[85%] bg-[var(--fg)] text-[var(--bg)] text-sm px-4 py-2.5 rounded-2xl rounded-br-sm">{text}</p>
    </div>
  );
}

/** Text som skrivs fram ord för ord, med fullständig text för skärmläsare. */
function TypeText({ text, animate, onDone }: { text: string; animate: boolean; onDone?: () => void }) {
  const words = useMemo(() => text.split(" "), [text]);
  const [shown, setShown] = useState(() => (animate && !prefersReducedMotion() ? -1 : words.length));
  const doneRef = useRef(onDone);
  useEffect(() => { doneRef.current = onDone; });

  useEffect(() => {
    if (!animate || prefersReducedMotion()) { doneRef.current?.(); return; }
    let i = -1;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i++;
      setShown(i);
      if (i < words.length) t = setTimeout(tick, 16);
      else doneRef.current?.();
    };
    t = setTimeout(tick, 320);
    return () => clearTimeout(t);
    // Animeras bara vid första visning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (shown < 0) return <span className={css.dots} aria-hidden="true"><i /><i /><i /></span>;
  return (
    <>
      <span aria-hidden="true">{words.slice(0, Math.max(shown, 0)).join(" ")}</span>
      <span className="sr-only">{text}</span>
    </>
  );
}

const chipBase =
  "inline-flex items-center gap-2 text-sm px-3.5 py-2 rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg)]";
const chipCls = (sel: boolean) =>
  `${chipBase} ${sel ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]" : "bg-[var(--card)] text-[var(--fg)] border-[var(--rule)] hover:border-[var(--fg)]"}`;
const skipCls = `${chipBase} border-dashed border-[var(--faint)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--fg)] bg-transparent`;

// ─── Komponenten ──────────────────────────────────────────────────────────────

export default function Vinkompassen({ wines, compensation = false }: { wines: CompassWine[]; compensation?: boolean }) {
  const W = wines;
  const [S, setS] = useState<CompassState>(emptyState);
  const [answered, setAnswered] = useState<QuestionKey[]>([]);
  const [items, setItems] = useState<Item[]>([{ id: 1, kind: "q", k: "color" }]);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shownN, setShownN] = useState(FIRST_SHOWN);
  const [panels, setPanels] = useState<PanelKey[]>([]);
  const [flashKey, setFlashKey] = useState(0);
  const [updated, setUpdated] = useState(false);
  const [countdown, setCountdown] = useState<{ item: number; run: number } | null>(null);
  const [owners, setOwners] = useState<Partial<Record<QuestionKey, number>>>({});
  const [input, setInput] = useState("");

  // Refs för den asynkrona flödeslogiken (alltid senaste värdet).
  // Uppdateras i samma setters som state (setState, setAns, setBusyB, push …).
  const R = useRef({
    S: emptyState(), answered: [] as QuestionKey[], done: false, busy: false, cur: 0, nextId: 2,
    items: [{ id: 1, kind: "q", k: "color" }] as Item[], interacted: false,
  });
  const autoT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, prefersReducedMotion() ? Math.min(ms, 30) : ms));

  const scrollDown = useCallback(() => {
    if (!R.current.interacted) return;
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "end" }));
  }, []);

  const push = useCallback((item: NewItem) => {
    const id = R.current.nextId++;
    const full = { ...item, id } as Item;
    R.current.items = [...R.current.items, full];
    setItems(R.current.items);
    scrollDown();
    return id;
  }, [scrollDown]);

  const setState = (s: CompassState) => { R.current.S = s; setS(s); };
  const setAns = (a: QuestionKey[]) => { R.current.answered = a; setAnswered(a); };
  const setBusyB = (b: boolean) => { R.current.busy = b; setBusy(b); };

  const pendingDone = useRef(new Map<number, () => void>());
  /** Agentmeddelande med skrivanimation; väntar tills det är framskrivet. */
  const say = useCallback((text: string, picked?: string[]) => new Promise<void>((resolve) => {
    const id = R.current.nextId;
    pendingDone.current.set(id, resolve);
    push({ kind: "agent", text, picked, animate: true });
  }), [push]);

  // ── Frågor ──
  const ask = useCallback((i: number) => {
    R.current.cur = i;
    push({ kind: "q", k: QUESTIONS[i].k, left: matching(R.current.S, W).length });
  }, [push, W]);

  const refresh = useCallback(() => {
    setFlashKey((k) => k + 1);
    setUpdated(true);
  }, []);

  const finish = useCallback(async () => {
    R.current.done = true; setDone(true); setBusyB(true);
    const St = R.current.S;
    const { list, relax, budget: raised } = pick(St, W);
    const colors = St.color.length ? St.color.join(", ").toLowerCase() : "alla färger";
    const fs = foodsSel(St);
    const plan: [string, string][] = [
      [`Går igenom ${W.length} naturviner på Systembolaget eller från webbutiker med hemleverans`, `${colors}, ${St.budget && St.budget !== "9999" ? "upp till " + St.budget + " kr" : "alla prisnivåer"}`],
      ["Matchar funk-nivån mot hur vilt det får smaka", St.adv ? label("adv", St.adv) : "Ingen preferens"],
      ["Kollar matförslagen", fs.length ? fs.map((f) => FOOD[f].toLowerCase()).join(", ") : "Vinet ska vara gott på egen hand"],
      ["Rangordnar efter smakprofil", `${list.length} viner kvar${relax.length ? ", släppte " + relaxLabel(relax) : ""}${raised ? `, höjde budgeten till ${raised} kr` : ""}`],
    ];
    const t0 = performance.now();
    const thinkId = push({ kind: "think", steps: [], summary: null });
    const steps: Step[] = [];
    const update = (summary: string | null) => {
      R.current.items = R.current.items.map((it) => (it.id === thinkId ? ({ ...it, steps: [...steps], summary } as Item) : it));
      setItems(R.current.items);
    };
    for (const [h, s] of plan) {
      steps.push({ h, s, done: false }); update(null); scrollDown();
      await sleep(480);
      steps[steps.length - 1] = { h, s, done: true }; update(null);
    }
    await sleep(200);
    update(`Tänkte i ${((performance.now() - t0) / 1000).toLocaleString("sv-SE", { maximumFractionDigits: 1 })} s`);
    push({ kind: "results" });
    track({ type: "result", count: list.length });
    await sleep(250);
    push({ kind: "deep" });
    setBusyB(false);
  }, [W, push, scrollDown]);

  const nextQ = useCallback(() => {
    const a = R.current.answered;
    const n = QUESTIONS.findIndex((q, j) => j > R.current.cur && !a.includes(q.k));
    if (n >= 0) return ask(n);
    const first = QUESTIONS.findIndex((q) => !a.includes(q.k));
    if (first >= 0) return ask(first);
    void finish();
  }, [ask, finish]);

  const answerQ = (q: Question, itemId: number, next: CompassState, advance: "now" | "countdown" | "none") => {
    R.current.interacted = true;
    setState(next);
    if (!R.current.answered.includes(q.k)) setAns([...R.current.answered, q.k]);
    setOwners((o) => (o[q.k] ? o : { ...o, [q.k]: itemId }));
    track({ type: "answer", question: q.k, value: answerText(q, next) });
    if (R.current.done) refresh();

    const qIndex = QUESTIONS.indexOf(q);
    const go = () => {
      if (autoT.current) clearTimeout(autoT.current);
      setCountdown(null);
      if (R.current.cur === qIndex && !R.current.done && isLatest(itemId)) nextQ();
    };
    if (advance === "now") go();
    else if (advance === "countdown" && R.current.cur === qIndex && !R.current.done) {
      if (autoT.current) clearTimeout(autoT.current);
      setCountdown((c) => ({ item: itemId, run: (c?.run ?? 0) + 1 }));
      autoT.current = setTimeout(go, 1200);
    } else if (advance === "none") {
      if (autoT.current) clearTimeout(autoT.current);
      setCountdown(null);
    }
  };
  const isLatest = (itemId: number) => {
    const qs = R.current.items.filter((i) => i.kind === "q");
    return qs[qs.length - 1]?.id === itemId;
  };

  const onChip = (q: Question, itemId: number, v: string | null) => {
    const cur = R.current.S;
    if (v === null) { // Spelar ingen roll
      answerQ(q, itemId, { ...cur, [q.k]: q.multi ? [] : null }, "now");
      return;
    }
    if (q.multi) {
      let a = cur[q.k] as string[];
      if (a.includes(v)) a = a.filter((x) => x !== v);
      else { a = [...a, v]; if (q.none) a = v === q.none ? [v] : a.filter((x) => x !== q.none); }
      const next = { ...cur, [q.k]: a } as CompassState;
      const adv = a.length && !(q.none && a[0] === q.none) ? "countdown" : a.length ? "now" : "none";
      answerQ(q, itemId, next, adv);
    } else {
      answerQ(q, itemId, { ...cur, [q.k]: v } as CompassState, "now");
    }
  };

  // ── Fritext ──
  const reset = useCallback(() => {
    if (autoT.current) clearTimeout(autoT.current);
    const s = emptyState();
    setState(s); setAns([]); R.current.done = false; setDone(false); setShownN(FIRST_SHOWN); setPanels([]);
    setUpdated(false); setCountdown(null); setOwners({});
    R.current.items = []; setItems([]);
    R.current.cur = 0;
    window.history.replaceState(null, "", window.location.pathname);
    ask(0);
  }, [ask]);

  const freeText = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    R.current.interacted = true;
    while (R.current.busy) await sleep(120);
    if (/^börja om$/i.test(text)) return reset();
    push({ kind: "user", text });
    track({ type: "freetext", text: text.slice(0, 200) });
    const o = await regexInterpreter.parse(text, W);
    if (!understood(o)) {
      setBusyB(true);
      await say("Det där hängde jag inte riktigt med på. Berätta gärna färg, tillfälle eller vad du ska äta, till exempel ”ett rött till lammgryta” eller ”något friskt till balkongen”.");
      setBusyB(false);
      return;
    }
    const { state, answered: got, picked } = applyParsed(R.current.S, o, W);
    setState(state);
    const ans = [...new Set([...R.current.answered, ...got])];
    setAns(ans);
    const missing = QUESTIONS.map((q) => q.k).filter((k) => !ans.includes(k));
    if (autoT.current) clearTimeout(autoT.current);
    setCountdown(null);
    setBusyB(true);
    await say(reflect(o, text, W) + missingTail(missing, R.current.done), picked);
    setBusyB(false);
    if (R.current.done) { refresh(); return; }
    const first = QUESTIONS.findIndex((q) => !ans.includes(q.k));
    if (first >= 0) ask(first); else void finish();
  }, [W, ask, finish, push, refresh, reset, say]);

  const onSuggestion = async (s: string) => {
    R.current.interacted = true;
    if (s === "Mer mineraliskt") {
      push({ kind: "user", text: s });
      const cur = R.current.S;
      if (!cur.tags.includes("Mineralisk")) setState({ ...cur, tags: [...cur.tags, "Mineralisk"] });
      await say("Lade till mineraliskt."); refresh(); return;
    }
    if (s === "Lite mer funk") {
      push({ kind: "user", text: s });
      const cur = R.current.S;
      setState({ ...cur, adv: String(Math.min(3, Number(cur.adv || 1) + 1)) as CompassState["adv"] });
      if (!R.current.answered.includes("adv")) setAns([...R.current.answered, "adv"]);
      await say("Höjde funk-nivån."); refresh(); return;
    }
    void freeText(s);
  };

  // ── Delbar URL: läs vid start, skriv vid ändring ──
  // Läser den delbara URL:en en gång vid start (extern källa → state).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (![...p.keys()].length) return;
    const { state, answered: a } = paramsToState(p);
    if (!a.length && JSON.stringify(state) === JSON.stringify(emptyState())) return;
    setState(state); setAns(a);
    const qItems: Item[] = QUESTIONS.filter((q) => a.includes(q.k)).map((q, i) => ({ id: 100 + i, kind: "q", k: q.k, left: W.length }));
    setOwners(Object.fromEntries(qItems.map((it) => [(it as { k: QuestionKey }).k, it.id])));
    R.current.items = qItems; setItems(qItems);
    R.current.nextId = 200;
    const first = QUESTIONS.findIndex((q) => !a.includes(q.k));
    if (first >= 0) ask(first);
    else { R.current.cur = 3; void finish(); }
    // Körs bara vid första rendering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!answered.length && !S.tags.length && !S.country && !S.grape && !S.like && !S.shop) return;
    const qs = stateToParams(S, answered).toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [S, answered]);

  useEffect(() => () => { if (autoT.current) clearTimeout(autoT.current); }, []);

  // ── Härledda värden ──
  const result = useMemo(() => pick(S, W), [S, W]);
  const initialCount = W.length;
  const top = result.list[0];
  const stateQs = useMemo(() => stateToParams(S, answered).toString(), [S, answered]);
  const targets = { s: S.ax.s || undefined, f: S.ax.f || undefined, st: S.ax.st || undefined, fu: S.ax.fu || (S.adv ? ADV_TARGET[S.adv] : undefined) };
  const countries = useMemo(() => [...new Set(W.map((w) => w.c).filter(Boolean))].sort((a, b) => a.localeCompare(b, "sv")), [W]);
  const sortedWines = useMemo(() => [...W].sort((a, b) => a.n.localeCompare(b.n, "sv")), [W]);

  const togglePanel = (k: PanelKey) => {
    R.current.interacted = true;
    setPanels((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
    if (!panels.includes(k)) track({ type: "panel", panel: k });
  };
  const change = (next: CompassState) => { setState(next); refresh(); };

  // ── Rendering ──
  const renderQuestion = (item: Extract<Item, { kind: "q" }>) => {
    const q = QUESTIONS.find((x) => x.k === item.k)!;
    const n = QUESTIONS.indexOf(q) + 1;
    const value = S[q.k] as string | string[] | null;
    const isSel = (v: string) => (Array.isArray(value) ? value.includes(v) : value === v);
    const cd = countdown?.item === item.id ? countdown : null;
    const showBubble = owners[q.k] === item.id && answered.includes(q.k);
    return (
      <div key={item.id} className="space-y-4">
        <AgentRow>
          <p className="text-base font-semibold leading-snug">{q.h}</p>
          {q.s ? <p className="text-xs text-[var(--muted)] mt-0.5">{q.s}</p> : null}
          <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label={q.h}>
            {q.o.map(([v, l, c]) => (
              <button key={v} type="button" className={chipCls(isSel(v))} aria-pressed={isSel(v)} onClick={() => onChip(q, item.id, v)}>
                {c ? <span className="w-2.5 h-2.5 rounded-full border border-[var(--rule)]" style={{ background: `var(${c})` }} aria-hidden="true" /> : null}
                {l}
              </button>
            ))}
            <button type="button" className={skipCls} onClick={() => onChip(q, item.id, null)}>Spelar ingen roll</button>
          </div>
          {q.multi ? (
            <>
              <div className={`${css.auto} ${cd ? css.run : ""}`} key={cd ? `cd-${cd.run}` : "cd"} aria-hidden="true"><i /></div>
              <p className="text-xs text-[var(--muted)] mt-1.5 min-h-[1rem]">{cd ? "Välj fler om du vill, annars går jag vidare" : ""}</p>
            </>
          ) : null}
          <p className="text-[11px] text-[var(--muted)] mt-2">Fråga {n} av 4 · {item.left ?? initialCount} viner i urvalet just nu</p>
        </AgentRow>
        {showBubble ? <UserBubble text={answerText(q, S)} /> : null}
      </div>
    );
  };

  const renderThink = (item: Extract<Item, { kind: "think" }>) => (
    <AgentRow key={item.id}>
      <details open={!item.summary} className="group">
        <summary className="cursor-pointer list-none flex items-center gap-2 text-sm text-[var(--muted)] select-none">
          <GlassIcon className="w-4 h-4" />
          <span>{item.summary ?? "Kompassen letar…"}</span>
        </summary>
        <ol className="mt-3 space-y-2.5 border-l border-[var(--rule)] pl-4">
          {item.steps.map((s, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              {s.done ? (
                <svg viewBox="0 0 12 12" className="w-3 h-3 mt-1 shrink-0" aria-hidden="true"><path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
              ) : (
                <span className={`${css.spin} mt-1`} aria-hidden="true" />
              )}
              <div>
                {s.h}
                {s.done ? <small className="block text-xs text-[var(--muted)]">{s.s}</small> : null}
              </div>
            </li>
          ))}
        </ol>
      </details>
    </AgentRow>
  );

  const renderResults = (item: Extract<Item, { kind: "results" }>) => (
    <AgentRow key={item.id}>
      <div ref={resultsRef} className="scroll-mt-24">
        <p className="text-base leading-relaxed">
          {top ? `Mitt bästa förslag är ${top.w.n} från ${top.w.p}. Här är de som passar dig bäst.` : "Jag hittade inget som passar, prova att ändra ett svar."}
        </p>
        <div key={flashKey} className={`mt-4 space-y-3 ${flashKey ? css.flash : ""}`}>
          {result.relax.length || result.budget ? (
            <p className="text-sm border border-[var(--rule)] rounded-md px-3 py-2 text-[var(--muted)]">
              {relaxMessage(result.relax, result.budget)}
            </p>
          ) : null}
          {result.list.slice(0, shownN).map((sc, i) => (
            <CompassCard key={sc.w.id} scored={sc} first={i === 0} targets={targets} stateQs={stateQs} compensation={compensation} />
          ))}
          {result.list.length > shownN ? (
            <button type="button" className={`${chipCls(false)} w-full justify-center`} onClick={() => setShownN((n) => n + 7)}>
              Visa {Math.min(result.list.length - shownN, 7)} till ({result.list.length} passar)
            </button>
          ) : null}
        </div>
      </div>
    </AgentRow>
  );

  const renderPanel = (k: PanelKey) => {
    const box = "mt-3 border border-[var(--rule)] rounded-md p-4 bg-[var(--card)]";
    const h = (t: string) => <h4 className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--muted)] mb-3">{t}</h4>;
    switch (k) {
      case "shop":
        return (
          <div key={k} className={box}>{h("Hur vill du få vinet?")}
            <div className="flex flex-wrap gap-2">
              {([["", "Spelar ingen roll"], ["sb", "Hämta på Systembolaget"], ["web", "Hemleverans från webbutik"]] as const).map(([v, l]) => (
                <button key={v} type="button" className={chipCls(S.shop === v)} aria-pressed={S.shop === v} onClick={() => change({ ...S, shop: v })}>{l}</button>
              ))}
            </div>
          </div>
        );
      case "prof":
        return (
          <div key={k} className={box}>{h("Smakprofil")}
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
              {AXES.map(([a, n, lo, hi]) => (
                <div key={a}>
                  <label htmlFor={`ax-${a}`} className="flex justify-between text-sm mb-1">
                    {n}<span className="text-[var(--muted)] text-xs">{S.ax[a] ? `${S.ax[a]} av 5` : "Spelar ingen roll"}</span>
                  </label>
                  <input
                    id={`ax-${a}`} type="range" min={0} max={5} value={S.ax[a]}
                    className="w-full accent-[var(--fg)]"
                    onChange={(e) => change({ ...S, ax: { ...S.ax, [a]: Number(e.target.value) } as Record<AxisKey, number> })}
                  />
                  <div className="flex justify-between text-[11px] text-[var(--muted)]"><span>{lo}</span><span>{hi}</span></div>
                </div>
              ))}
            </div>
          </div>
        );
      case "tags":
      case "dfood": {
        const items: [string, string][] = k === "tags" ? TAGS.map((t) => [t, t]) : (Object.entries(FOOD) as [string, string][]);
        const arr = S[k] as string[];
        return (
          <div key={k} className={box}>{h(k === "tags" ? "Smak" : "Mat")}
            <div className="flex flex-wrap gap-2">
              {items.map(([v, l]) => (
                <button key={v} type="button" className={chipCls(arr.includes(v))} aria-pressed={arr.includes(v)}
                  onClick={() => change({ ...S, [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] } as CompassState)}>{l}</button>
              ))}
            </div>
          </div>
        );
      }
      case "country":
        return (
          <div key={k} className={box}>{h("Land")}
            <label htmlFor="compass-country" className="sr-only">Land</label>
            <select id="compass-country" value={S.country} onChange={(e) => change({ ...S, country: e.target.value })}
              className="w-full border border-[var(--rule)] rounded-md px-3 py-2 bg-[var(--bg)] text-sm">
              <option value="">Alla länder</option>
              {countries.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        );
      case "grape":
        return (
          <div key={k} className={box}>{h("Druva")}
            <label htmlFor="compass-grape" className="sr-only">Druva</label>
            <input id="compass-grape" type="search" value={S.grape} placeholder="t.ex. Chenin, Areni, Baga"
              onChange={(e) => change({ ...S, grape: e.target.value.trimStart() })}
              className="w-full border border-[var(--rule)] rounded-md px-3 py-2 bg-[var(--bg)] text-sm" />
          </div>
        );
      case "like":
        return (
          <div key={k} className={box}>{h("Liknar ett vin jag gillar")}
            <label htmlFor="compass-like" className="sr-only">Välj ett vin</label>
            <select id="compass-like" value={S.like} onChange={(e) => change({ ...S, like: e.target.value })}
              className="w-full border border-[var(--rule)] rounded-md px-3 py-2 bg-[var(--bg)] text-sm">
              <option value="">Välj ett vin</option>
              {sortedWines.map((w) => <option key={w.id} value={w.id}>{w.n} ({w.p})</option>)}
            </select>
          </div>
        );
    }
  };

  const renderDeep = (item: Extract<Item, { kind: "deep" }>) => (
    <AgentRow key={item.id}>
      <p className="text-base leading-relaxed">
        <TypeText text="Vill du finjustera? Välj vad du vill ändra, så uppdateras förslagen direkt." animate />
      </p>
      <div className="flex flex-wrap gap-2 mt-3">
        {PANELS.map(([k, l]) => (
          <button key={k} type="button" className={chipCls(panels.includes(k))} aria-pressed={panels.includes(k)} onClick={() => togglePanel(k)}>{l}</button>
        ))}
        <button type="button" className={skipCls} onClick={reset}>Börja om</button>
      </div>
      {panels.map(renderPanel)}
      {updated ? (
        <p className="text-sm text-[var(--muted)] mt-3">
          Förslagen uppdaterade, {result.list.length} viner passar.{" "}
          <a href="#" className="underline underline-offset-4 text-[var(--fg)]"
            onClick={(e) => { e.preventDefault(); resultsRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" }); }}>Visa ↑</a>
        </p>
      ) : null}
    </AgentRow>
  );

  const renderItem = (item: Item) => {
    switch (item.kind) {
      case "q": return renderQuestion(item);
      case "user": return <UserBubble key={item.id} text={item.text} />;
      case "agent": return (
        <AgentRow key={item.id}>
          <p className="text-base leading-relaxed">
            <TypeText text={item.text} animate={item.animate} onDone={() => { pendingDone.current.get(item.id)?.(); pendingDone.current.delete(item.id); }} />
          </p>
          {item.picked?.length ? (
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <span className="text-[11px] tracking-[0.12em] uppercase text-[var(--muted)] mr-1">Jag plockade upp</span>
              {item.picked.map((p) => <span key={p} className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--fg)] text-[var(--bg)]">{p}</span>)}
            </div>
          ) : null}
        </AgentRow>
      );
      case "think": return renderThink(item);
      case "results": return renderResults(item);
      case "deep": return renderDeep(item);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input;
    setInput("");
    void freeText(v);
  };

  return (
    <div className="relative">
      <div className="space-y-6 pb-8" aria-live="polite" aria-busy={busy}>
        {items.map(renderItem)}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 z-20 -mx-4 px-4 pt-3 pb-4 bg-white/80 backdrop-blur-md border-t border-[var(--rule)] rounded-b-xl">
        <form onSubmit={submit} className="flex items-end gap-2 bg-[var(--card)] border border-[var(--rule)] rounded-2xl pl-4 pr-1.5 py-1.5 focus-within:border-[var(--fg)]">
          <label htmlFor="compass-input" className="sr-only">Skriv till kompassen</label>
          <textarea
            id="compass-input"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); (e.currentTarget.form as HTMLFormElement).requestSubmit(); } }}
            placeholder="Skriv fritt, t.ex. ”vitt till skaldjur”"
            className="flex-1 resize-none bg-transparent text-base py-2 outline-none placeholder:text-[var(--muted)] max-h-32"
          />
          <button type="submit" disabled={!input.trim()} aria-label="Skicka"
            className="w-9 h-9 shrink-0 rounded-full bg-[var(--fg)] text-[var(--bg)] flex items-center justify-center disabled:opacity-25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--fg)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </form>
        <div className="flex gap-2 overflow-x-auto mt-2.5 pb-0.5 -mx-4 px-4 [scrollbar-width:none]">
          {(done ? S1 : S0).map((s) => (
            <button key={s} type="button" onClick={() => void onSuggestion(s)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-[var(--rule)] text-[var(--muted)] hover:text-[var(--fg)] hover:border-[var(--fg)] bg-[var(--bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--fg)]">
              {s}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] leading-snug text-[var(--muted)] mt-4">
        {RETAILER_DISCLAIMER} För dig som är 25 år eller äldre. Naturvinstipset drivs av grundaren av vinimportören Kellner &amp; Kellner. Viner från egen import är märkta och får ingen fördel i rankningen.
      </p>
    </div>
  );
}
