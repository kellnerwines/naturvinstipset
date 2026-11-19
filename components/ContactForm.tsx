"use client";

import { useState } from "react";
import { tr, type Lang } from "@/lib/i18n";

// Ämnena står på svenska i meddelandet; bara visningen översätts.
const SUBJECTS: [string, string][] = [["Vintips", "Wine tip"], ["Vinprovning", "Wine tasting"], ["Fråga", "Question"], ["Samarbete", "Collaboration"]];

export default function ContactForm({ lang = "sv", subject = "" }: { lang?: Lang; subject?: string }) {
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS.some(([s]) => s === subject) ? subject : "Fråga", message: "" });
  const [honey, setHoney] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/kontakt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, website: honey, page: window.location.pathname }),
    }).catch(() => null);
    if (res?.ok) return setStatus("done");
    const msg = lang === "sv" ? (await res?.json().catch(() => ({})))?.error : "";
    setError(msg || tr(lang, "Något gick fel, försök igen.", "Something went wrong, please try again."));
    setStatus("error");
  };

  if (status === "done") {
    return (
      <div className="border-[3px] border-[var(--ink)] bg-[var(--paper)] p-6">
        <p className="font-bold text-[var(--ink)] text-lg mb-1">{tr(lang, "Tack, meddelandet är skickat.", "Thanks, your message has been sent.")}</p>
        <p className="text-[var(--muted)]">{tr(lang, "Vi svarar till mejladressen du angav.", "We will reply to the email address you gave.")}</p>
      </div>
    );
  }

  const input = "w-full border-[3px] border-[var(--ink)] bg-white px-4 py-3 text-[15px] focus:outline-none focus:border-[var(--accent)]";
  const label = "block text-sm font-bold text-[var(--ink)] mb-1";
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="kontakt-namn" className={label}>{tr(lang, "Namn", "Name")}</label>
          <input id="kontakt-namn" required className={input} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label htmlFor="kontakt-mejl" className={label}>{tr(lang, "Mejl", "Email")}</label>
          <input id="kontakt-mejl" required type="email" className={input} value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
      </div>
      <div>
        <label htmlFor="kontakt-amne" className={label}>{tr(lang, "Ämne", "Subject")}</label>
        <select id="kontakt-amne" className={input} value={form.subject} onChange={(e) => set("subject", e.target.value)}>
          {SUBJECTS.map(([sv, en]) => <option key={sv} value={sv}>{tr(lang, sv, en)}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="kontakt-meddelande" className={label}>{tr(lang, "Meddelande", "Message")}</label>
        <textarea id="kontakt-meddelande" required rows={6} className={input} value={form.message} onChange={(e) => set("message", e.target.value)} />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={honey} onChange={(e) => setHoney(e.target.value)} />
      {status === "error" ? <p className="text-sm text-[var(--accent)] font-bold">{error}</p> : null}
      <button type="submit" disabled={status === "loading"} className="rounded-full bg-[var(--accent)] text-[var(--fg)] border-[3px] border-[var(--ink)] font-bold px-6 py-3 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors disabled:opacity-50">
        {status === "loading" ? tr(lang, "Skickar...", "Sending...") : tr(lang, "Skicka", "Send")}
      </button>
    </form>
  );
}
