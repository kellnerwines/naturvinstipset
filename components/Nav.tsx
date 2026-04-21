"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Topp 100" },
  { href: "/vad-ar-naturvin", label: "Vad är naturvin?" },
  { href: "/blogg", label: "Blogg" },
  { href: "/om-oss", label: "Om oss" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg)] border-b border-[var(--rule)]">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-75 transition-opacity">
          <Image
            src="/logo.png"
            alt="Naturvinstipset"
            width={22}
            height={33}
            className="shrink-0"
            unoptimized
          />
          <span className="text-sm font-bold tracking-tight text-[var(--fg)]">Naturvinstipset</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-8 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition-opacity ${
                pathname === l.href
                  ? "text-[var(--fg)] font-medium opacity-100"
                  : "text-[var(--fg)] opacity-40 hover:opacity-80"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Mobile burger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-1"
          onClick={() => setOpen(!open)}
          aria-label="Meny"
        >
          <span className={`block h-px w-6 bg-[var(--fg)] transition-all origin-center ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block h-px w-6 bg-[var(--fg)] transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-6 bg-[var(--fg)] transition-all origin-center ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--rule)] bg-[var(--bg)]">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block px-6 py-4 text-sm border-b border-[var(--rule-xs)] ${
                pathname === l.href ? "font-medium" : "opacity-50"
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
