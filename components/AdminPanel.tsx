"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { Wine, BlogPost, Rating } from "@/lib/blob";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "viner" | "bloggar" | "betyg";

const WINE_TYPES = ["Rött", "Vitt", "Rosé", "Orange", "Mousserande", "Pét Nat"];
const FLAVOR_OPTIONS = ["Fruktig", "Blommig", "Mineralisk", "Krispig", "Jordig", "Syrlig", "Tanninrik", "Lättsam", "Komplex", "Bubblande", "Örtig", "Rund"];

const emptyWine = (): Omit<Wine, "id" | "slug" | "createdAt"> => ({
  name: "", producer: "", country: "", region: "", grape: "",
  wineType: "Rött", year: "", price: "", systembolagetUrl: "",
  description: "", longDescription: "", flavorTags: [],
  syra: 3, fyllighet: 3, funk: 2, stravhet: 2, flavorNotes: "",
  primaryImageUrl: "", galleryImages: [], adminRating: 4, wineOfMonth: false, published: false,
});

const emptyBlog = (): Omit<BlogPost, "id" | "slug"> => ({
  title: "", excerpt: "", content: "", imageUrl: "",
  publishedAt: new Date().toISOString().slice(0, 10), published: false,
});

// ─── Image upload field ───────────────────────────────────────────────────────
function ImageField({ value, onChange, label = "Bild" }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (res.ok) { const { url } = await res.json(); onChange(url); }
    setUploading(false);
  };

  return (
    <div>
      <label className="text-xs font-semibold text-black/50 block mb-1">{label}</label>
      <div
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) upload(f); }}
        onDragOver={(e) => e.preventDefault()}
        className="border border-dashed border-black/20 rounded p-3 bg-black/[.02]"
      >
        {value ? (
          <div className="flex items-center gap-3">
            <Image src={value} alt="Preview" width={56} height={56} className="object-cover rounded" unoptimized />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-black/40 truncate">{value}</p>
              <button onClick={() => onChange("")} className="text-xs text-red-400 hover:text-red-600 mt-1">Ta bort</button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center gap-1 cursor-pointer py-2">
            <span className="text-xl text-black/20">📷</span>
            <p className="text-xs text-black/40">{uploading ? "Laddar upp..." : "Dra hit eller klicka"}</p>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
          </label>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full border border-black/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--green)]";
const labelCls = "text-xs font-semibold text-black/50 block mb-1";

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("viner");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"ok" | "err">("ok");

  const [wines, setWines] = useState<Wine[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  const [editWine, setEditWine] = useState<Partial<Wine> | null>(null);
  const [editBlog, setEditBlog] = useState<Partial<BlogPost> | null>(null);

  const [seeding, setSeeding] = useState(false);

  const flash = (m: string, t: "ok" | "err" = "ok") => { setMsg(m); setMsgType(t); setTimeout(() => setMsg(""), 3500); };

  const seed = async () => {
    if (!confirm("Migrera data/wines.json till Blob-storage? Befintlig data skrivs över.")) return;
    setSeeding(true);
    const res = await fetch("/api/seed", { method: "POST" });
    if (res.ok) {
      const d = await res.json();
      flash(`Seed klar! ${d.wines} viner och ${d.ratings} betyg kopierade till Blob.`);
      fetchAll();
    } else {
      flash("Seed misslyckades.", "err");
    }
    setSeeding(false);
  };

  const fetchAll = useCallback(async () => {
    const [wRes, bRes, rRes] = await Promise.all([fetch("/api/wines"), fetch("/api/blogs"), fetch("/api/ratings")]);
    if (wRes.ok) setWines(await wRes.json());
    if (bRes.ok) setBlogs(await bRes.json());
    if (rRes.ok) setRatings(await rRes.json());
  }, []);

  useEffect(() => { fetch("/api/auth-check").then((r) => { if (r.ok) { setAuthed(true); fetchAll(); } }); }, []); // eslint-disable-line
  useEffect(() => { if (authed) fetchAll(); }, [authed, fetchAll]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    if (res.ok) setAuthed(true);
    else { const d = await res.json(); setLoginError(d.error || "Fel uppgifter"); }
  };

  const save = async (url: string, body: unknown, msg: string, cb: () => void) => {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { flash(msg); cb(); fetchAll(); }
    else flash("Fel – kunde inte spara.", "err");
  };

  const del = async (url: string, id: string, msg: string) => {
    if (!confirm(msg)) return;
    await fetch(url, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    flash("Borttaget."); fetchAll();
  };

  // ─── Login ────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--green-light)] px-6">
        <div className="bg-white p-8 w-full max-w-sm rounded-xl shadow-sm">
          <div className="text-center mb-6">
            <span className="text-3xl">🍇</span>
            <h1 className="text-lg font-bold text-[var(--green-dark)] mt-2">Admin – Naturvinstipset</h1>
          </div>
          <form onSubmit={login} className="flex flex-col gap-4">
            <input className={inputCls} placeholder="Användarnamn" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" className={inputCls} placeholder="Lösenord" value={password} onChange={(e) => setPassword(e.target.value)} />
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button type="submit" className="bg-[var(--green)] text-white py-2 rounded-lg font-semibold hover:bg-[var(--green-dark)]">Logga in</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "viner",   label: `Viner (${wines.length})` },
    { key: "bloggar", label: `Blogginlägg (${blogs.length})` },
    { key: "betyg",   label: `Betyg (${ratings.length})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[var(--green-dark)] text-white px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold">🍇 Admin – Naturvinstipset</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={seed}
            disabled={seeding}
            className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {seeding ? "Seeder..." : "⬆ Seed data → Blob"}
          </button>
          <button onClick={async () => { await fetch("/api/logout", { method: "POST" }); setAuthed(false); }} className="text-sm text-white/60 hover:text-white">Logga ut</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-black/10 bg-white px-6 flex gap-6">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`py-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${tab === t.key ? "border-[var(--green-dark)] text-[var(--green-dark)]" : "border-transparent text-black/40 hover:text-black/70"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {msg && <div className={`px-6 py-3 text-sm border-l-4 ${msgType === "err" ? "bg-red-50 border-red-500 text-red-700" : "bg-green-50 border-green-500 text-green-700"}`}>{msg}</div>}

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* ══════════ VINER ══════════ */}
        {tab === "viner" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--green-dark)]">Viner</h2>
              <button onClick={() => setEditWine(emptyWine())} className="bg-[var(--green)] text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-[var(--green-dark)]">+ Nytt vin</button>
            </div>

            {editWine && (
              <div className="bg-white rounded-xl border border-black/10 p-6 mb-6 space-y-4">
                <h3 className="font-semibold text-[var(--green-dark)]">{editWine.id ? "Redigera vin" : "Nytt vin"}</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Namn *</label><input className={inputCls} value={editWine.name ?? ""} onChange={(e) => setEditWine({ ...editWine, name: e.target.value })} /></div>
                  <div><label className={labelCls}>Producent *</label><input className={inputCls} value={editWine.producer ?? ""} onChange={(e) => setEditWine({ ...editWine, producer: e.target.value })} /></div>
                  <div><label className={labelCls}>Land *</label><input className={inputCls} value={editWine.country ?? ""} onChange={(e) => setEditWine({ ...editWine, country: e.target.value })} /></div>
                  <div><label className={labelCls}>Region</label><input className={inputCls} value={editWine.region ?? ""} onChange={(e) => setEditWine({ ...editWine, region: e.target.value })} /></div>
                  <div><label className={labelCls}>Druva</label><input className={inputCls} value={editWine.grape ?? ""} onChange={(e) => setEditWine({ ...editWine, grape: e.target.value })} /></div>
                  <div>
                    <label className={labelCls}>Vintyp</label>
                    <select className={inputCls} value={editWine.wineType ?? "Rött"} onChange={(e) => setEditWine({ ...editWine, wineType: e.target.value })}>
                      {WINE_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Årgång</label><input className={inputCls} value={editWine.year ?? ""} onChange={(e) => setEditWine({ ...editWine, year: e.target.value })} /></div>
                  <div><label className={labelCls}>Pris (kr)</label><input className={inputCls} value={editWine.price ?? ""} onChange={(e) => setEditWine({ ...editWine, price: e.target.value })} /></div>
                </div>

                <div><label className={labelCls}>Systembolaget-länk</label><input className={inputCls} value={editWine.systembolagetUrl ?? ""} onChange={(e) => setEditWine({ ...editWine, systembolagetUrl: e.target.value })} placeholder="https://www.systembolaget.se/produkt/..." /></div>

                <div><label className={labelCls}>Kort beskrivning * (visas i listan)</label><textarea rows={2} className={inputCls} value={editWine.description ?? ""} onChange={(e) => setEditWine({ ...editWine, description: e.target.value })} /></div>
                <div><label className={labelCls}>Lång beskrivning (visas på vinsidan)</label><textarea rows={5} className={inputCls} value={editWine.longDescription ?? ""} onChange={(e) => setEditWine({ ...editWine, longDescription: e.target.value })} /></div>

                {/* Flavor tags */}
                <div>
                  <label className={labelCls}>Smakprofil</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {FLAVOR_OPTIONS.map((f) => {
                      const active = (editWine.flavorTags ?? []).includes(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => {
                            const tags = editWine.flavorTags ?? [];
                            setEditWine({ ...editWine, flavorTags: active ? tags.filter((t) => t !== f) : [...tags, f] });
                          }}
                          className={`text-xs px-3 py-1 rounded-full border transition-colors ${active ? "bg-[var(--green)] text-white border-[var(--green)]" : "border-black/20 text-black/50 hover:border-[var(--green)]"}`}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Smakprofil */}
                <div>
                  <label className={labelCls}>Smakprofil (1 = låg, 5 = hög)</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {([ ["syra", "Syra", "sky"], ["fyllighet", "Fyllighet", "amber"], ["funk", "Funk", "purple"], ["stravhet", "Strävhet", "stone"] ] as [keyof typeof editWine, string, string][]).map(([field, label, _color]) => (
                      <div key={field}>
                        <p className="text-xs text-black/50 mb-1">{label}: <span className="font-semibold text-black/70">{(editWine[field] as number | undefined) ?? 3}</span></p>
                        <input
                          type="range" min={1} max={5} step={1}
                          value={(editWine[field] as number | undefined) ?? 3}
                          onChange={(e) => setEditWine({ ...editWine, [field]: Number(e.target.value) })}
                          className="w-full accent-[var(--green)]"
                        />
                        <div className="flex justify-between text-xs text-black/20"><span>1</span><span>5</span></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flavor notes free-text */}
                <div>
                  <label className={labelCls}>Smaknoter (fritext — visas på vinsidan)</label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="T.ex. Gula plommon, citrus och en hint av brioche. Frisch syra och lång avslutning."
                    value={editWine.flavorNotes ?? ""}
                    onChange={(e) => setEditWine({ ...editWine, flavorNotes: e.target.value })}
                  />
                </div>

                {/* Admin rating */}
                <div>
                  <label className={labelCls}>Redaktionellt betyg (1–5)</label>
                  <div className="flex gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setEditWine({ ...editWine, adminRating: n })}
                        className={`w-10 h-10 rounded-lg text-sm font-bold border transition-colors ${editWine.adminRating === n ? "bg-amber-400 border-amber-400 text-white" : "border-black/20 text-black/40 hover:border-amber-400"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <ImageField label="Bild" value={editWine.primaryImageUrl ?? ""} onChange={(v) => setEditWine({ ...editWine, primaryImageUrl: v })} />

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="pub-wine" checked={editWine.published ?? false} onChange={(e) => setEditWine({ ...editWine, published: e.target.checked })} />
                  <label htmlFor="pub-wine" className="text-sm">Publicerat (visas på sajten)</label>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <input type="checkbox" id="motm-wine" checked={editWine.wineOfMonth ?? false} onChange={(e) => setEditWine({ ...editWine, wineOfMonth: e.target.checked })} className="accent-amber-500" />
                  <label htmlFor="motm-wine" className="text-sm font-semibold text-amber-700">⭐ Månadens vin (visas på plats #1 med glödande ram)</label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => save("/api/wines", editWine, "Sparat!", () => setEditWine(null))}
                    className="bg-[var(--green)] text-white px-5 py-2 text-sm font-semibold rounded-lg hover:bg-[var(--green-dark)]"
                  >
                    Spara
                  </button>
                  <button onClick={() => setEditWine(null)} className="text-sm text-black/40 hover:text-black px-3">Avbryt</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {wines.map((w) => {
                const wineRatings = ratings.filter((r) => r.wineId === w.id);
                return (
                  <div
                    key={w.id}
                    onClick={() => setEditWine(w)}
                    className="bg-white rounded-xl border border-black/8 p-4 flex items-center gap-4 cursor-pointer hover:border-[var(--green)] hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-12 bg-[var(--green-light)] rounded flex items-center justify-center shrink-0">
                      {w.primaryImageUrl
                        ? <Image src={w.primaryImageUrl} alt={w.name} width={40} height={48} className="object-cover w-full h-full rounded" unoptimized />
                        : <span className="text-lg">🍷</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--green-dark)] truncate">{w.name}{w.year ? ` ${w.year}` : ""}</p>
                      <p className="text-xs text-black/40">{w.producer} · {w.wineType} · ⭐ {w.adminRating} admin · {wineRatings.length} betyg</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${w.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {w.published ? "Publicerad" : "Utkast"}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); del("/api/wines", w.id, `Ta bort "${w.name}"?`); }}
                      className="shrink-0 text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Ta bort
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════ BLOGGAR ══════════ */}
        {tab === "bloggar" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--green-dark)]">Blogginlägg</h2>
              <button onClick={() => setEditBlog(emptyBlog())} className="bg-[var(--green)] text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-[var(--green-dark)]">+ Nytt inlägg</button>
            </div>

            {editBlog && (
              <div className="bg-white rounded-xl border border-black/10 p-6 mb-6 space-y-4">
                <h3 className="font-semibold text-[var(--green-dark)]">{editBlog.id ? "Redigera inlägg" : "Nytt inlägg"}</h3>
                <div><label className={labelCls}>Titel *</label><input className={inputCls} value={editBlog.title ?? ""} onChange={(e) => setEditBlog({ ...editBlog, title: e.target.value })} /></div>
                <div><label className={labelCls}>Ingress (visas i listan)</label><textarea rows={2} className={inputCls} value={editBlog.excerpt ?? ""} onChange={(e) => setEditBlog({ ...editBlog, excerpt: e.target.value })} /></div>
                <div><label className={labelCls}>Innehåll</label><textarea rows={10} className={inputCls} value={editBlog.content ?? ""} onChange={(e) => setEditBlog({ ...editBlog, content: e.target.value })} /></div>
                <div><label className={labelCls}>Publiceringsdatum</label><input type="date" className={inputCls} value={(editBlog.publishedAt ?? "").slice(0, 10)} onChange={(e) => setEditBlog({ ...editBlog, publishedAt: e.target.value })} /></div>
                <ImageField label="Omslagsbild" value={editBlog.imageUrl ?? ""} onChange={(v) => setEditBlog({ ...editBlog, imageUrl: v })} />
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="pub-blog" checked={editBlog.published ?? false} onChange={(e) => setEditBlog({ ...editBlog, published: e.target.checked })} />
                  <label htmlFor="pub-blog" className="text-sm">Publicerat</label>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => save("/api/blogs", editBlog, "Sparat!", () => setEditBlog(null))} className="bg-[var(--green)] text-white px-5 py-2 text-sm font-semibold rounded-lg hover:bg-[var(--green-dark)]">Spara</button>
                  <button onClick={() => setEditBlog(null)} className="text-sm text-black/40 hover:text-black px-3">Avbryt</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {blogs.map((b) => (
                <div key={b.id} className="bg-white rounded-xl border border-black/8 p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--green-dark)] truncate">{b.title}</p>
                    <p className="text-xs text-black/40">{new Date(b.publishedAt).toLocaleDateString("sv-SE")}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${b.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{b.published ? "Publicerad" : "Utkast"}</span>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setEditBlog(b)} className="text-xs text-[var(--green)] hover:underline">Redigera</button>
                    <button onClick={() => del("/api/blogs", b.id, `Ta bort "${b.title}"?`)} className="text-xs text-red-400 hover:text-red-600">Ta bort</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ BETYG ══════════ */}
        {tab === "betyg" && (
          <div>
            <h2 className="text-xl font-bold text-[var(--green-dark)] mb-6">Användarnas betyg</h2>
            {ratings.length === 0 ? (
              <p className="text-black/40 text-sm">Inga betyg än.</p>
            ) : (
              <div className="space-y-2">
                {[...ratings]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((r) => {
                    const wine = wines.find((w) => w.id === r.wineId);
                    return (
                      <div key={r.id} className="bg-white rounded-xl border border-black/8 p-4 flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{wine?.name ?? "Okänt vin"}</p>
                          <p className="text-xs text-black/40">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)} · {new Date(r.createdAt).toLocaleDateString("sv-SE")}</p>
                          {r.comment && <p className="text-xs text-black/60 mt-1 italic">"{r.comment}"</p>}
                        </div>
                        <button onClick={() => del("/api/ratings", r.id, "Ta bort det här betyget?")} className="text-xs text-red-400 hover:text-red-600 shrink-0">Ta bort</button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
