"use client";

// Bakgrundsvideo för toppen av startsidan. Videon är stor (13 MB), så den
// laddas först när sidan har visats och tonar in när den kan spelas. Den
// hoppas över vid "reducera rörelse" och dataspar, och då syns bara den
// mörka bakgrunden.

import { useEffect, useState } from "react";

export default function HeroVideo({ src }: { src: string }) {
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || conn?.saveData) return;
    const start = () => setLoad(true);
    if (document.readyState === "complete") { const t = setTimeout(start, 300); return () => clearTimeout(t); }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  if (!load) return null;
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
      onCanPlay={() => setReady(true)}
      className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
