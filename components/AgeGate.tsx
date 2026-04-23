"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function AgeGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const ok = sessionStorage.getItem("age-verified");
    if (!ok) setVisible(true);
  }, []);

  function confirm() {
    sessionStorage.setItem("age-verified", "1");
    setVisible(false);
  }

  function deny() {
    window.location.href = "https://www.iq.se/";
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
         style={{ background: "rgba(13,13,13,0.82)", backdropFilter: "blur(6px)" }}>
      <div className="bg-[var(--bg)] w-full max-w-xs p-10 flex flex-col items-center text-center">
        <Image
          src="/logo.png"
          alt="Naturvinstipset"
          width={48}
          height={72}
          unoptimized
          className="mb-8 opacity-80"
        />

        <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-[var(--muted)] mb-4">
          Välkommen
        </p>

        <h2 className="text-xl font-extrabold tracking-tight uppercase text-[var(--fg)] mb-3">
          Är du över 20 år?
        </h2>

        <p className="text-xs text-[var(--muted)] leading-relaxed mb-8">
          Den här sidan handlar om alkohol. Du måste vara minst 20 år för att fortsätta.
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={confirm}
            className="flex-1 bg-[var(--fg)] text-[var(--bg)] text-[11px] font-bold tracking-[0.2em] uppercase py-3 hover:opacity-80 transition-opacity"
          >
            Ja
          </button>
          <button
            onClick={deny}
            className="flex-1 border border-[var(--rule)] text-[var(--muted)] text-[11px] font-bold tracking-[0.2em] uppercase py-3 hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors"
          >
            Nej
          </button>
        </div>

        <p className="text-[9px] text-[var(--faint)] mt-6 leading-relaxed">
          Genom att klicka Ja bekräftar du att du är 20 år eller äldre.
        </p>
      </div>
    </div>
  );
}
