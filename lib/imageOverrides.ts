// Flaskbilder där butikens foto visar flaskan i en miljö (bord, butik, bar). De är utklippta
// med bildsegmentering 2026-11-13 och ligger som filer i public/flaskor/<slug>.webp.
// Används i stället för butikens bild, om inte admin själv har bytt bild (låst fält).

import type { Wine } from "./blob";

export const CUTOUT_SLUGS = new Set<string>([
  "jw-2018-ronchi-di-cialla-schioppettino-di-cialla",
  "jw-2025-il-farneto-god-save-the-wine",
  "vn-gratitude-tlz-n-2-2022",
  "wt-arianna-occhipinti-sp68-bianco",
  "wt-arnaud-combier-rose",
  "wt-arpent-sebastien-brunet",
  "wt-beaujolais-villages-alex-foillard",
  "wt-benje-tinto-envinate",
  "wt-bruno-duchene-la-luna-rouge-2024",
  "wt-bubbel-bubbel-rosell-mir-penedes",
  "wt-c-o-s-rosa-di-lupo-2025",
  "wt-calabretta-gaio-gaio",
  "wt-camillo-donati-lambrusco",
  "wt-corail-chateau-darlay",
  "wt-corcelette-jean-foillard",
  "wt-dard-ribo-crozes-hermitage-2024",
  "wt-dard-ribo-le-printemps",
  "wt-filipa-pato-3b-rose",
  "wt-filipa-pato-3b",
  "wt-filipa-pato-dinamica",
  "wt-fleurie-jean-foillard",
  "wt-ggg-weingut-schodl",
  "wt-hanami-calvez-bobinet",
  "wt-koi-chi-mera",
  "wt-lezer-foradori",
  "wt-mer-coquillages-domaine-julien-meyer",
  "wt-muscat-petit-fleur-julien-meyer-copy",
  "wt-pause-canon-blanc-raisins-et-lange-2024",
  "wt-pause-canon-rouge-raisins-et-lange-2024",
  "wt-podere-le-boncie-le-trame-2023",
  "wt-raisins-gaulois-domaine-lapierre",
  "wt-renaissance-vadin-plateau-champagne",
  "wt-ruben-calvez-bobinet",
  "wt-safari-weingut-schodl",
  "wt-samodia-rosato-frizzante",
  "wt-testalonga-chenin-blanc-de-maceration",
  "wt-testalonga-paysan-rouge",
  "wt-trinchero-vigna-del-noce-barbera-dasti-2016",
  "wt-vino-di-anna-sfuso",
]);

export function withCutoutImage(w: Wine): Wine {
  if (!CUTOUT_SLUGS.has(w.slug) || w.lockedFields?.includes("primaryImageUrl")) return w;
  return { ...w, primaryImageUrl: `/flaskor/${w.slug}.webp` };
}
