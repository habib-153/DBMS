import { Exo_2 as FontExo, Inter as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontExo = FontExo({
  subsets: ["latin"],
  variable: "--font-exo",
  weight: ["400", "500", "600", "700"],
});
