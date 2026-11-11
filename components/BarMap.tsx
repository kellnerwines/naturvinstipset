"use client";

// Egen karta över naturvinsbarerna (Leaflet med OpenStreetMaps kartbilder, tonade i
// grått så att prickarna syns). Ersätter den inbäddade Google-kartan, så att kartan alltid visar
// samma ställen som listan. Knapparna överst zoomar till en stad.

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Bar } from "@/lib/bars";

type MapBar = Pick<Bar, "slug" | "name" | "city" | "address" | "neighborhood" | "lat" | "lng" | "type">;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export default function BarMap({ bars, cities }: { bars: MapBar[]; cities: string[] }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const [city, setCity] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    void import("leaflet").then((L) => {
      if (cancelled || !el.current || map.current) return;
      const m = L.map(el.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(m);
      const icon = L.divIcon({ className: "", html: '<span class="bar-pin"></span>', iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -8] });
      for (const b of bars) {
        L.marker([b.lat, b.lng], { icon, title: b.name, alt: b.name })
          .addTo(m)
          .bindPopup(
            `<a href="/naturvinsbarer/${esc(b.slug)}" class="bar-popup"><strong>${esc(b.name)}</strong><span>${esc(b.type)} · ${esc(b.neighborhood)}, ${esc(b.city)}</span><span>${esc(b.address)}</span></a>`,
          );
      }
      // Hjulet zoomar först när man har klickat i kartan, så att sidan går att scrolla förbi den.
      m.on("click", () => m.scrollWheelZoom.enable());
      m.on("mouseout", () => m.scrollWheelZoom.disable());
      m.fitBounds(L.latLngBounds(bars.map((b) => [b.lat, b.lng] as [number, number])), { padding: [30, 30] });
      map.current = m;
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, [bars]);

  const show = (c: string) => {
    setCity(c);
    const m = map.current;
    if (!m) return;
    const pts = bars.filter((b) => !c || b.city === c).map((b) => [b.lat, b.lng] as [number, number]);
    void import("leaflet").then((L) => m.flyToBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 15, duration: 0.8 }));
  };

  const chip = (active: boolean) =>
    `shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
      active ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]" : "bg-[var(--bg)] text-[var(--fg)] border-[var(--rule)] hover:border-[var(--fg)]"
    }`;

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3" role="group" aria-label="Visa på kartan">
        <button type="button" className={chip(!city)} aria-pressed={!city} onClick={() => show("")}>Hela Sverige</button>
        {cities.map((c) => (
          <button key={c} type="button" className={chip(city === c)} aria-pressed={city === c} onClick={() => show(c)}>
            {c} <span className="opacity-60">{bars.filter((b) => b.city === c).length}</span>
          </button>
        ))}
      </div>
      <div
        ref={el}
        className="bar-map relative z-0 w-full h-[420px] md:h-[520px] rounded-xl overflow-hidden border border-[var(--rule)] bg-[var(--surface)]"
        role="region"
        aria-label="Karta över naturvinsbarer i Sverige"
      />
      <style>{`
        .bar-pin{display:block;width:18px;height:18px;border-radius:9999px;background:var(--wine-rott,#7a1f2b);border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)}
        .bar-map .leaflet-tile-pane{filter:grayscale(1) contrast(.85) brightness(1.08)}
        .bar-map .leaflet-popup-content-wrapper{border-radius:10px}
        .bar-map .leaflet-popup-content{margin:12px 14px}
        .bar-popup{display:flex;flex-direction:column;gap:2px;color:#0d0d0d;text-decoration:none;font-size:13px;line-height:1.35}
        .bar-popup strong{font-size:15px}
        .bar-popup span{color:rgba(13,13,13,.65)}
        .bar-popup:hover strong{text-decoration:underline}
      `}</style>
    </div>
  );
}
