"use client";

import type { Bar } from "@/lib/bars";

interface Props {
  bars: Pick<Bar, "slug" | "name" | "address" | "neighborhood" | "lat" | "lng">[];
}

const EMBED_SRC = "https://www.google.com/maps/d/embed?mid=1nl5vV26Az8Pldo2cySAaqZvIF2h0Lvg";

export default function BarMap({ bars: _ }: Props) {
  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-black/8">
      <iframe
        src={EMBED_SRC}
        width="100%"
        height="480"
        style={{ border: 0, display: "block" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Naturvinsbarer i Stockholm"
      />
    </div>
  );
}
