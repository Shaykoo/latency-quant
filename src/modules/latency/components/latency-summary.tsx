"use client";

import { useLatencyFeed } from "../hooks/use-latency-feed";
import { useTheme } from "../hooks/use-theme";

const statConfig = [
  { key: "avg", label: "Avg Latency", unit: "ms" },
  { key: "min", label: "Fastest", unit: "ms" },
  { key: "max", label: "Slowest", unit: "ms" },
  { key: "p95", label: "P95", unit: "ms" },
] as const;

export function LatencySummary() {
  const aggregated = useLatencyFeed((state) => state.aggregated);
  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <section
      className={`rounded-3xl border p-3 sm:p-4 text-sm shadow-xl ${
        isDark
          ? "border-slate-800/80 bg-slate-950/50 text-slate-200 shadow-sky-900/20"
          : "border-slate-300/80 bg-slate-50/90 text-slate-800 shadow-sky-900/10"
      }`}
    >
      <div className="space-y-2 sm:space-y-3">
        <h2
          className={`text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Aggregated metrics
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {statConfig.map((stat) => (
            <StatCard
              key={stat.key}
              label={stat.label}
              value={
                aggregated ? Math.round(aggregated[stat.key]) : undefined
              }
              unit={stat.unit}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value?: number;
  unit: string;
}) {
  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-xl border px-2 sm:px-3 py-2 sm:py-3 shadow-lg ${
        isDark
          ? "border-slate-800/70 bg-slate-900/60 shadow-slate-950/40"
          : "border-slate-300/70 bg-slate-100/60 shadow-slate-200/40"
      }`}
    >
      <p
        className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] ${
          isDark ? "text-slate-500" : "text-slate-600"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1 sm:mt-2 text-lg sm:text-xl md:text-2xl font-semibold ${
          isDark ? "text-slate-50" : "text-slate-900"
        }`}
      >
        {value !== undefined ? value : "—"}
        <span
          className={`ml-1 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          {unit}
        </span>
      </p>
    </div>
  );
}


