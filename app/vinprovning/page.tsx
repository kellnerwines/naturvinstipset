import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vinprovning – Naturvinsupplevelser för grupper | Naturvinstipset",
  description:
    "Skräddarsydda vinprovningar med fokus på naturvin — anpassade helt efter er grupp. After work, nybörjarkvällar och privata middagar. Hör av dig!",
  openGraph: { url: "https://naturvinstipset.se/vinprovning" },
};

export default function VinprovningPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <p className="text-xs font-semibold tracking-widest text-[var(--green)] uppercase mb-3">Upplev</p>
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--green-dark)] mb-6 leading-tight">
        Naturvinsupplevelser för grupper
      </h1>
      <p className="text-lg text-black/70 leading-relaxed mb-4">
        Vi erbjuder vinprovningar med fokus på naturvin — utformade helt efter er grupp och vad ni vill ha ut av kvällen.
      </p>
      <p className="text-lg text-black/70 leading-relaxed mb-12">
        Vi anpassar allt efter er — antal personer, plats, nivå och känsla. Nybörjare som aldrig testat naturvin? Perfekt. Redan övertygade naturvinsälskare som vill gräva djupare? Också perfekt.
      </p>

      <div className="mb-12">
        <p className="text-sm font-semibold text-black/40 uppercase tracking-widest mb-4">Vi har gjort provningar för</p>
        <div className="flex flex-wrap gap-3">
          {["After work", "Nybörjarkvällar", "Privata middagar"].map((item) => (
            <span key={item} className="border border-[var(--green)] text-[var(--green-dark)] text-sm font-medium px-4 py-2">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white border border-black/10 p-8 text-center">
        <h2 className="text-xl font-bold text-[var(--green-dark)] mb-2">Hör av dig</h2>
        <p className="text-black/60 mb-6 text-sm">Så hittar vi ett upplägg som passar er.</p>
        <a
          href="mailto:hej@naturvinstipset.se?subject=Vinprovningsförfrågan"
          className="inline-block bg-[var(--green)] text-white font-semibold px-8 py-3 hover:bg-[var(--green-dark)] transition-colors"
        >
          hej@naturvinstipset.se →
        </a>
      </div>
    </div>
  );
}
