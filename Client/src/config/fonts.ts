import { Exo_2 as FontExo, Inter as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "arial"],
});

export const fontExo = FontExo({
  subsets: ["latin"],
  variable: "--font-exo",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "arial"],
});
