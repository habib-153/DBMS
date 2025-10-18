"use client";

import dynamic from "next/dynamic";

// Dynamically load the client-only analytics UI to prevent server-side
// rendering from importing browser-only modules (which reference `window`).
const EnhancedAnalytics = dynamic(() => import("./enhanced"), {
  ssr: false,
});

export default function AnalyticsPage() {
  return <EnhancedAnalytics />;
}
