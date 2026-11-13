"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Vinkompassen" },
  { href: "/topp-100", label: "Topp 100" },
  { href: "/viner", label: "Alla viner" },
  { href: "/vad-ar-naturvin", label: "Vad är naturvin?" },
  { href: "/naturvinsbarer", label: "Naturvinsbarer" },
  { href: "/om-listan", label: "Om listan" },
  { href: "/blogg", label: "Blogg" },
  { href: "/om-oss", label: "Om oss" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)] border-b-[3px] border-[var(--ink)]">
      <div className="max-w-6xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-[var(--ink)] hover:text-[var(--accent)] transition-colors">
          <Image src="/logo.png" alt="" width={22} height={33} className="shrink-0" unoptimized />
          <span className="font-[family-name:var(--font-display)] font-black uppercase text-[26px] leading-none">Naturvinstipset</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex gap-6 text-[15px] font-bold">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={`py-1 border-b-[3px] transition-colors ${
                pathname === l.href
                  ? "text-[var(--ink)] border-[var(--accent)]"
                  : "text-[var(--ink)] border-transparent hover:border-[var(--ink)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile burger */}
        <button
          className="lg:hidden flex flex-col gap-[5px] p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Meny"
          aria-expanded={open}
        >
          <span className={`block h-[3px] w-7 bg-[var(--ink)] transition-all origin-center ${open ? "rotate-45 translate-y-[8px]" : ""}`} />
          <span className={`block h-[3px] w-7 bg-[var(--ink)] transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block h-[3px] w-7 bg-[var(--ink)] transition-all origin-center ${open ? "-rotate-45 -translate-y-[8px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t-[3px] border-[var(--ink)] bg-[var(--bg)]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block px-5 py-4 font-[family-name:var(--font-display)] font-black uppercase text-2xl border-b-2 border-[var(--rule)] ${
                pathname === l.href ? "text-[var(--accent)]" : "text-[var(--ink)]"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
