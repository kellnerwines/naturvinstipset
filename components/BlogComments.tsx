"use client";

import { useState } from "react";
import type { BlogInteraction } from "@/lib/blob";

function getFingerprint(): string {
  if (typeof window === "undefined") return "";
  const key = "nvt_fp";
  let fp = localStorage.getItem(key);
  if (!fp) { fp = crypto.randomUUID(); localStorage.setItem(key, fp); }
  return fp;
}

type Comment = Pick<BlogInteraction, "id" | "name" | "comment" | "createdAt">;

export default function BlogComments({ blogId, initial }: { blogId: string; initial: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initial);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError("");

    const fingerprint = getFingerprint();
    const res = await fetch("/api/blog-interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogId, type: "comment", fingerprint, name: name.trim() || undefined, comment: text.trim() }),
    });

    if (res.ok) {
      const saved: Comment = await res.json();
      setComments((prev) => [...prev, saved]);
      setName("");
      setText("");
      setDone(true);
    } else {
      setError("Något gick fel. Försök igen.");
    }
    setSubmitting(false);
  }

  return (
    <div className="mt-10 pt-8 border-t border-[var(--rule)]">
      <h2 className="text-sm font-bold tracking-[0.15em] uppercase text-[var(--fg)] mb-6">
        Kommentarer{comments.length > 0 ? ` (${comments.length})` : ""}
      </h2>

      {/* Comment list */}
      {comments.length > 0 && (
        <div className="space-y-5 mb-8">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="mt-0.5 w-7 h-7 rounded-full bg-[var(--rule)] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-[var(--muted)] uppercase">
                  {(c.name ?? "A")[0]}
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[12px] font-semibold text-[var(--fg)]">
                    {c.name ?? "Anonym"}
                  </span>
                  <span className="text-[11px] text-[var(--faint)]">
                    {new Date(c.createdAt).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <p className="text-[13px] text-black/70 leading-relaxed">{c.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Ditt namn (valfritt)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          className="w-full px-3 py-2 text-[13px] bg-white border border-[var(--rule)] rounded-lg outline-none focus:border-[var(--fg)] transition-colors placeholder:text-[var(--faint)]"
        />
        <textarea
          placeholder="Skriv en kommentar…"
          value={text}
          onChange={(e) => { setText(e.target.value); setDone(false); }}
          maxLength={600}
          rows={3}
          required
          className="w-full px-3 py-2 text-[13px] bg-white border border-[var(--rule)] rounded-lg outline-none focus:border-[var(--fg)] transition-colors placeholder:text-[var(--faint)] resize-none"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="px-4 py-2 rounded-lg bg-[var(--fg)] text-[var(--bg)] text-[12px] font-semibold tracking-wide disabled:opacity-40 transition-opacity hover:opacity-80"
          >
            {submitting ? "Skickar…" : "Skicka"}
          </button>
          {done && <span className="text-[12px] text-[var(--muted)]">Kommentar publicerad!</span>}
          {error && <span className="text-[12px] text-red-500">{error}</span>}
        </div>
      </form>
    </div>
  );
}
