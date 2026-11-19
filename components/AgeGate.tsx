"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { tr, type Lang } from "@/lib/i18n";

export default function AgeGate({ lang = "sv" }: { lang?: Lang }) {
  const [visible, setVisible] = useState(false);
  const [denied, setDenied] = useState(false);

  // Läser webbläsarens lagring en gång vid start.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const ok = sessionStorage.getItem("age-verified");
    if (!ok) setVisible(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function confirm() {
    sessionStorage.setItem("age-verified", "1");
    setVisible(false);
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

        {denied ? (
          <>
            <h2 className="text-xl font-extrabold tracking-tight uppercase text-[var(--fg)] mb-3">
              {tr(lang, "Välkommen tillbaka", "Welcome back")}
            </h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {tr(lang, "Den här webbplatsen är avsedd för personer som fyllt 20 år.", "This website is intended for people aged 20 or over.")}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold text-[var(--muted)] mb-4">
              {tr(lang, "Välkommen", "Welcome")}
            </p>

            <h2 className="text-xl font-extrabold tracking-tight uppercase text-[var(--fg)] mb-3">
              {tr(lang, "Är du över 20 år?", "Are you over 20?")}
            </h2>

            <p className="text-xs text-[var(--muted)] leading-relaxed mb-8">
              {tr(lang, "Den här sidan handlar om alkohol. Du måste vara minst 20 år för att fortsätta.", "This site is about alcohol. You must be at least 20 to continue.")}
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={confirm}
                className="flex-1 bg-[var(--fg)] text-[var(--bg)] text-xs font-bold py-3 hover:opacity-80 transition-opacity"
              >
                {tr(lang, "Ja", "Yes")}
              </button>
              <button
                onClick={() => setDenied(true)}
                className="flex-1 border border-[var(--rule)] text-[var(--muted)] text-xs font-bold py-3 hover:border-[var(--fg)] hover:text-[var(--fg)] transition-colors"
              >
                {tr(lang, "Nej", "No")}
              </button>
            </div>

            <p className="text-[9px] text-[var(--muted)] mt-6 leading-relaxed">
              {tr(lang, "Genom att klicka Ja bekräftar du att du är 20 år eller äldre.", "By clicking Yes you confirm that you are 20 or older.")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
