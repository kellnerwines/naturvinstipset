"use client";

import { useEffect, useRef } from "react";
import type { Bar } from "@/lib/bars";

interface Props {
  bars: Pick<Bar, "slug" | "name" | "address" | "neighborhood" | "lat" | "lng" | "type" | "price_level">[];
}

export default function BarMap({ bars }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;

      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [59.326, 18.055],
        zoom: 13,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:28px;height:28px;
          background:#2d6a4f;
          border:2.5px solid white;
          border-radius:50%;
          box-shadow:0 2px 6px rgba(0,0,0,0.25);
          display:flex;align-items:center;justify-content:center;
          color:white;font-size:13px;font-weight:700;line-height:1;
        ">🍷</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      bars.forEach((bar) => {
        const popup = L.popup({ maxWidth: 220 }).setContent(`
          <div style="font-family:system-ui,sans-serif;padding:2px 0">
            <strong style="font-size:14px;display:block;margin-bottom:3px">${bar.name}</strong>
            <span style="font-size:12px;color:#666">${bar.address} · ${bar.neighborhood}</span><br/>
            <span style="font-size:11px;color:#888;margin-top:2px;display:inline-block">${bar.type} · ${bar.price_level}</span>
            <br/><a href="/naturvinsbarer/${bar.slug}" style="font-size:12px;color:#2d6a4f;font-weight:600;margin-top:6px;display:inline-block">Mer info →</a>
          </div>
        `);
        L.marker([bar.lat, bar.lng], { icon }).addTo(map).bindPopup(popup);
      });
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [bars]);

  return (
    <div
      ref={containerRef}
      style={{ height: "480px", width: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
    />
  );
}
