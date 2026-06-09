"use client";

import type { Bar } from "@/lib/bars";

interface Props {
  bars: Pick<Bar, "slug" | "name" | "address" | "neighborhood" | "lat" | "lng">[];
}

// Builds a Google Maps URL that opens all bars as a search in the right area
function buildMapsUrl(bars: Props["bars"]): string {
  const center = `${bars[0].lat},${bars[0].lng}`;
  const query = encodeURIComponent("naturvinsbarer stockholm");
  return `https://www.google.com/maps/search/${query}/@${center},13z`;
}

export default function BarMap({ bars }: Props) {
  const mapsUrl = buildMapsUrl(bars);

  // Embed a Google Maps search for naturvinsbarer in Stockholm
  const embedSrc =
    "https://maps.google.com/maps?q=naturvinsbarer+stockholm&output=embed&hl=sv&z=13&ll=59.326,18.055";

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-black/8">
      <iframe
        src={embedSrc}
        width="100%"
        height="480"
        style={{ border: 0, display: "block" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Naturvinsbarer i Stockholm"
      />
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 bg-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow text-[var(--fg)]"
      >
        Öppna i Google Maps ↗
      </a>
    </div>
  );
}
