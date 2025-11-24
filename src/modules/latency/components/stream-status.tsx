"use client";

import { useLatencyFeed } from "../hooks/use-latency-feed";
import { useTheme } from "../hooks/use-theme";

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

export function StreamStatus() {
  const status = useLatencyFeed((state) => state.status);
  const lastUpdated = useLatencyFeed((state) => state.lastUpdated);
  const errorMessage = useLatencyFeed((state) => state.errorMessage);
  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-3xl border p-3 sm:p-4 shadow-xl ${
        isDark
          ? "border-slate-800/80 bg-slate-950/50 text-slate-200 shadow-sky-900/20"
          : "border-slate-300/80 bg-slate-50/90 text-slate-800 shadow-sky-900/10"
      }`}
    >
      <h2
        className={`mb-2 sm:mb-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}
      >
        Stream status
      </h2>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: statusColor(status) }}
          />
          <p
            className={`text-sm sm:text-base font-medium ${
              isDark ? "text-slate-200" : "text-slate-900"
            }`}
          >
            {status === "streaming" && "Streaming live latency frames"}
            {status === "connecting" && "Connecting to latency stream…"}
            {status === "error" && "Stream disrupted"}
          </p>
        </div>
        {errorMessage ? (
          <p className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {errorMessage}
          </p>
        ) : (
          <p
            className={`text-xs uppercase tracking-[0.25em] ${
              isDark ? "text-slate-500" : "text-slate-600"
            }`}
          >
            Last update •{" "}
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "pending"}
          </p>
        )}
      </div>
    </div>
  );
}

