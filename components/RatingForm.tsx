"use client";

import { useState, useEffect } from "react";
import { StarPicker } from "./Stars";

function getFingerprint(): string {
  if (typeof window === "undefined") return "";
  const key = "nvt_fp";
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem(key, fp);
  }
  return fp;
}

export default function RatingForm({ wineId }: { wineId: string }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");

  useEffect(() => {
    const rated = JSON.parse(localStorage.getItem("nvt_rated") ?? "[]") as string[];
    if (rated.includes(wineId)) setStatus("already");
  }, [wineId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stars) return;
    setStatus("loading");

    const fingerprint = getFingerprint();
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wineId, stars, comment, fingerprint }),
    });

    if (res.status === 409) {
      setStatus("already");
      return;
    }
    if (!res.ok) {
      setStatus("error");
      return;
    }

    // Remember locally
    const rated = JSON.parse(localStorage.getItem("nvt_rated") ?? "[]") as string[];
    rated.push(wineId);
    localStorage.setItem("nvt_rated", JSON.stringify(rated));
    setStatus("success");
  };

  if (status === "already") {
    return (
      <div className="bg-[var(--green-light)] rounded-xl p-5 text-center text-sm text-[var(--green-dark)]">
        ✓ Du har redan betygsatt det här vinet. Tack!
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="bg-[var(--green-light)] rounded-xl p-5 text-center">
        <p className="text-2xl mb-2">🎉</p>
        <p className="font-semibold text-[var(--green-dark)]">Tack för ditt betyg!</p>
        <p className="text-sm text-black/50 mt-1">Det påverkar rankingen direkt.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-black/8 p-6 space-y-5">
      <div>
        <p className="text-sm font-medium text-black/70 mb-3">Ditt betyg *</p>
        <StarPicker value={stars} onChange={setStars} />
      </div>

      <div>
        <label className="text-sm font-medium text-black/70 block mb-2">
          Kommentar <span className="font-normal text-black/30">– valfritt</span>
        </label>
        <textarea
          rows={3}
          maxLength={300}
          className="w-full border border-black/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--green)] resize-none"
          placeholder="Vad tyckte du? Hur smakade det?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <p className="text-xs text-black/30 text-right mt-1">{comment.length}/300</p>
      </div>

      {status === "error" && (
        <p className="text-sm text-red-500">Något gick fel. Försök igen.</p>
      )}

      <button
        type="submit"
        disabled={!stars || status === "loading"}
        className="bg-[var(--green)] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[var(--green-dark)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Skickar..." : "Skicka betyg"}
      </button>
    </form>
  );
}
