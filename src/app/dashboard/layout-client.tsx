"use client";

import type { ReactNode } from "react";
import { useTheme, useThemeMounted } from "@/modules/latency/hooks/use-theme";

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const theme = useTheme((state) => state.theme);
  const mounted = useThemeMounted();
  // Default to dark during SSR to match initial client render
  const isDark = mounted ? theme === "dark" : true;

  return (
    <div
      className={`flex min-h-screen flex-col ${
        isDark ? "bg-slate-950/95 text-slate-100" : "bg-slate-50/95 text-slate-900"
      }`}
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}

