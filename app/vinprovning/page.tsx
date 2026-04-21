import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vinprovning",
  description:
    "Vill ni ha en naturvinsupplevelse för er grupp eller företag? Vi erbjuder skräddarsydda vinprovningar med fokus på naturliga och spännande viner.",
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
        Är ni en grupp eller ett företag som vill upptäcka unika och spännande naturviner?
      </p>
      <p className="text-lg text-black/70 leading-relaxed mb-4">
        Vi erbjuder vinprovningar med fokus på naturliga viner – tillgängliga, roliga och utan pretentioner.
        Perfekt för after work, teambuilding eller en riktigt trevlig kväll.
      </p>
      <p className="text-lg text-black/70 leading-relaxed mb-12">
        Tveka inte att höra av dig – vi återkommer med ett förslag anpassat efter era önskemål och budget.
        Vi är flexibla och kan ordna de flesta upplägg!
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-16">
        {[
          { icon: "🎉", title: "After work", text: "Avslappnad vinprovning för grupper 5–20 pers." },
          { icon: "🏢", title: "Företagsevent", text: "Tematiska provningar anpassade för er." },
          { icon: "🎓", title: "Nybörjarkvällar", text: "Lär dig grunderna i naturvin från scratch." },
        ].map((item) => (
          <div key={item.title} className="bg-[var(--green-light)] rounded-xl p-5 text-center">
            <div className="text-3xl mb-3">{item.icon}</div>
            <p className="font-semibold text-[var(--green-dark)] mb-1">{item.title}</p>
            <p className="text-sm text-black/60">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-black/10 p-8 text-center">
        <h2 className="text-xl font-bold text-[var(--green-dark)] mb-2">Kontakta oss</h2>
        <p className="text-black/60 mb-6 text-sm">Berätta lite om er grupp och vad ni är ute efter.</p>
        <a
          href="mailto:hej@naturvinstipset.se?subject=Vinprovningsförfrågan"
          className="inline-block bg-[var(--green)] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[var(--green-dark)] transition-colors"
        >
          Skicka ett mail →
        </a>
        <p className="text-xs text-black/30 mt-4">hej@naturvinstipset.se</p>
      </div>
    </div>
  );
}
