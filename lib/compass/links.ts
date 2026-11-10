// Köplänkar och spårning för Vinkompassen.
//
// buyHref: alla köplänkar går via /go/[shop]/[slug] som loggar klicket och
// svarar 302 till butiken (BRIEF-KOMPASSEN.md, 7.1).
//
// track: anonyma händelser (4.5) skickas med sendBeacon till /api/kompass-event.
// Ingen IP-adress och ingen kaka sparas; fritext kortas till 200 tecken.

import { goHref, type BuyContext } from "../clicks/util";

export type CompassEvent =
  | { type: "answer"; question: string; value: string }
  | { type: "freetext"; text: string }
  | { type: "panel"; panel: string }
  | { type: "buy"; wineId: string; shop: string; price: number }
  | { type: "result"; count: number };

export function buyHref(wineSlug: string, shop: string, ctx: BuyContext): string {
  return goHref(wineSlug, shop, ctx);
}

export function track(event: CompassEvent): void {
  // Köpklick loggas redan i /go, så de skickas inte dubbelt.
  if (event.type === "buy" || typeof window === "undefined") return;
  try {
    const body = JSON.stringify(event.type === "freetext" ? { ...event, text: event.text.slice(0, 200) } : event);
    if (navigator.sendBeacon) navigator.sendBeacon("/api/kompass-event", new Blob([body], { type: "application/json" }));
    else void fetch("/api/kompass-event", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
  } catch {
    // spårning får aldrig störa kompassen
  }
}

export const RETAILER_DISCLAIMER =
  "Vinerna köps och hämtas på Systembolaget eller köps från webbutiker med hemleverans, som säljer till Sverige med svensk alkoholskatt inräknad. Varken Systembolaget eller webbutikerna står bakom innehållet.";
