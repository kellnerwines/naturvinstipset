// Översikt över svarssidorna.

import type { Metadata } from "next";
import Link from "next/link";
import { ANSWER_PAGES } from "@/lib/answers";

export const metadata: Metadata = {
  title: "Vanliga frågor om naturvin",
  description: "Vinkompassen svarar på vanliga frågor om naturvin: till mat, under 200 kr, för nybörjare, med hemleverans och på Systembolaget.",
  alternates: { canonical: "/svar" },
};

export default function SvarIndex() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-14">
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-3">Vinkompassen svarar</p>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-8">Vanliga frågor om naturvin</h1>
      <ul className="space-y-2">
        {ANSWER_PAGES.map((p) => (
          <li key={p.slug}>
            <Link href={`/svar/${p.slug}`} className="block border border-[var(--rule)] rounded-lg px-4 py-3 hover:border-[var(--fg)]">
              <span className="font-semibold">{p.question}</span>
              <span className="block text-sm text-[var(--muted)] mt-0.5">{p.lead}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
