// Köplänkar och spårning för Vinkompassen.
//
// buyHref: i steg 6 (BRIEF-KOMPASSEN.md, 7.1) ska alla köplänkar gå via
// /go/[shop]/[slug] som loggar klicket och svarar 302. Tills dess pekar länken
// direkt på butiken, men all kod går via den här funktionen så att bytet blir
// en enda ändring.
//
// track: anonyma händelser (4.5). Lagringen (Neon) byggs i steg 6; fram till
// dess är detta en no-op så att anropen redan sitter på rätt ställen.

export type CompassEvent =
  | { type: "answer"; question: string; value: string }
  | { type: "freetext"; text: string }
  | { type: "panel"; panel: string }
  | { type: "buy"; wineId: string; shop: string; price: number }
  | { type: "result"; count: number };

/* eslint-disable @typescript-eslint/no-unused-vars -- parametrarna används i steg 6 */
export function buyHref(wineSlug: string, shop: string, url: string): string {
  return url;
}

export function track(event: CompassEvent): void {
  // no-op tills klickloggen finns (steg 6)
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export const RETAILER_DISCLAIMER =
  "Vinerna köps och hämtas på Systembolaget eller köps från webbutiker med hemleverans, som säljer till Sverige med svensk alkoholskatt inräknad. Varken Systembolaget eller webbutikerna står bakom innehållet.";
