import { Big_Shoulders_Display, Karla } from "next/font/google";

/*
  Stilriktningen "Etiketten" (2026-11-13): smal, tung rubrikstil som på naturvinsetiketter
  och affischer, och Karla för brödtext. Färgerna är två tryckfärger, se globals.css.
  Delas av den svenska och den engelska rotlayouten.
*/
export const display = Big_Shoulders_Display({
  subsets: ["latin"],
  variable: "--font-display-face",
  weight: ["700", "900"],
  display: "swap",
});
export const body = Karla({
  subsets: ["latin"],
  variable: "--font-body-face",
  weight: ["400", "500", "700"],
  display: "swap",
});
