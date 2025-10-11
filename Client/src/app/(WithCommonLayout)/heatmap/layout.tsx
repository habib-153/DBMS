import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Crime Heatmap | WARDEN",
  description:
    "Interactive crime heatmap showing incident density across Bangladesh. View statistics, explore hotspots, and stay informed about safety in different regions.",
};

export default function HeatmapLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
