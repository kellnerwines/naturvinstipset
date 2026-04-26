"use client";

import { useState, useEffect } from "react";

function getFingerprint(): string {
  if (typeof window === "undefined") return "";
  const key = "nvt_fp";
  let fp = localStorage.getItem(key);
  if (!fp) { fp = crypto.randomUUID(); localStorage.setItem(key, fp); }
  return fp;
}

export default function BlogLikeButton({ blogId, initialCount }: { blogId: string; initialCount: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem("nvt_blog_liked") ?? "[]") as string[];
    if (liked.includes(blogId)) setLiked(true);
  }, [blogId]);

  async function handleLike() {
    if (liked || loading) return;
    setLoading(true);
    const fingerprint = getFingerprint();
    const res = await fetch("/api/blog-interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogId, type: "like", fingerprint }),
    });
    if (res.ok || res.status === 409) {
      setLiked(true);
      if (res.ok) {
        setCount((c) => c + 1);
        const arr = JSON.parse(localStorage.getItem("nvt_blog_liked") ?? "[]") as string[];
        arr.push(blogId);
        localStorage.setItem("nvt_blog_liked", JSON.stringify(arr));
      }
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked || loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
        liked
          ? "bg-red-50 border-red-200 text-red-500 cursor-default"
          : "border-[var(--rule)] text-[var(--muted)] hover:border-red-300 hover:text-red-500 hover:bg-red-50"
      }`}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      {liked ? `Gillad${count > 0 ? ` · ${count}` : ""}` : `Gilla${count > 0 ? ` · ${count}` : ""}`}
    </button>
  );
}
