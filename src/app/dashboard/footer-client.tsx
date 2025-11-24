"use client";

import { useTheme } from "@/modules/latency/hooks/use-theme";

export function DashboardFooterClient() {
  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <footer
      className={`border-t py-4 text-center text-xs ${
        isDark
          ? "border-slate-800/60 bg-slate-950/90 text-slate-500"
          : "border-slate-300/60 bg-slate-50/90 text-slate-600"
      }`}
    >
      <p>
        Latency telemetry simulated for development. Replace data providers via
        <code
          className={`ml-1 rounded px-1 py-0.5 text-[10px] ${
            isDark
              ? "bg-slate-900 text-slate-300"
              : "bg-slate-200 text-slate-700"
          }`}
        >
          lib/latency/source.ts
        </code>
      </p>
    </footer>
  );
}

