"use client";

import { useState, useEffect } from "react";

function getFingerprint(): string {
  if (typeof window === "undefined") return "";
  const key = "nvt_fp";
  let fp = localStorage.getItem(key);
  if (!fp) { fp = crypto.randomUUID(); localStorage.setItem(key, fp); }
  return fp;
}

export default function LikeButton({
  wineId,
  likeCount,
  small = false,
}: {
  wineId: string;
  likeCount: number;
  small?: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(likeCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rated = JSON.parse(localStorage.getItem("nvt_rated") ?? "[]") as string[];
    if (rated.includes(wineId)) setLiked(true);
  }, [wineId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked || loading) return;
    setLoading(true);

    const fingerprint = getFingerprint();
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wineId, liked: true, fingerprint }),
    });

    if (res.ok || res.status === 409) {
      setLiked(true);
      if (res.ok) {
        setCount((c) => c + 1);
        const rated = JSON.parse(localStorage.getItem("nvt_rated") ?? "[]") as string[];
        rated.push(wineId);
        localStorage.setItem("nvt_rated", JSON.stringify(rated));
      }
    }
    setLoading(false);
  };

  if (small) {
    return (
      <button
        onClick={handleLike}
        disabled={liked || loading}
        className={`flex items-center gap-1 transition-all ${liked ? "text-red-500" : "text-[var(--muted)] hover:text-red-400"}`}
        title={liked ? "Du har gillat det här vinet" : "Gilla vinet"}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        <span className="text-[10px] tracking-wide">{count > 0 ? count : ""}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked || loading}
      className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all border ${
        liked
          ? "bg-red-50 border-red-200 text-red-500 cursor-default"
          : "bg-white border-black/15 text-[var(--fg)] hover:border-red-300 hover:text-red-500 hover:bg-red-50"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      {liked ? `Gillad · ${count}` : `Gilla · ${count}`}
    </button>
  );
}
