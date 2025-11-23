"use client";

import { useLatencyFeed } from "../hooks/use-latency-feed";

const statConfig = [
  { key: "avg", label: "Avg Latency", unit: "ms" },
  { key: "min", label: "Fastest", unit: "ms" },
  { key: "max", label: "Slowest", unit: "ms" },
  { key: "p95", label: "P95", unit: "ms" },
] as const;

export function LatencySummary() {
  const aggregated = useLatencyFeed((state) => state.aggregated);
  const status = useLatencyFeed((state) => state.status);
  const lastUpdated = useLatencyFeed((state) => state.lastUpdated);
  const errorMessage = useLatencyFeed((state) => state.errorMessage);

  return (
    <section className="grid gap-4 rounded-3xl border border-slate-800/80 bg-slate-950/50 p-6 text-sm text-slate-200 shadow-xl shadow-sky-900/20 md:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-base font-semibold uppercase tracking-[0.4em] text-slate-400">
          Stream status
        </h2>
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-3 w-3 rounded-full"
            style={{ backgroundColor: statusColor(status) }}
          />
          <p className="text-lg font-medium">
            {status === "streaming" && "Streaming live latency frames"}
            {status === "connecting" && "Connecting to latency stream…"}
            {status === "error" && "Stream disrupted"}
          </p>
        </div>
        {errorMessage ? (
          <p className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </p>
        ) : (
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Last update •{" "}
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "pending"}
          </p>
        )}
      </div>
      <div className="space-y-4">
        <h2 className="text-base font-semibold uppercase tracking-[0.4em] text-slate-400">
          Aggregated metrics
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
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
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-5 shadow-lg shadow-slate-950/40">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-50">
        {value !== undefined ? value : "—"}
        <span className="ml-1 text-sm text-slate-400">{unit}</span>
      </p>
    </div>
  );
}

function statusColor(status: "connecting" | "streaming" | "error") {
  switch (status) {
    case "streaming":
      return "#38bdf8";
    case "connecting":
      return "#facc15";
    case "error":
    default:
      return "#f87171";
  }
}

