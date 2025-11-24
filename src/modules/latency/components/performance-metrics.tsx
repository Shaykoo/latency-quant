"use client";

import { useMemo } from "react";
import { useLatencyFeed } from "../hooks/use-latency-feed";

export function PerformanceMetrics() {
  const status = useLatencyFeed((state) => state.status);
  const aggregated = useLatencyFeed((state) => state.aggregated);
  const lastUpdated = useLatencyFeed((state) => state.lastUpdated);
  const markers = useLatencyFeed((state) => state.markers);

  const uptime = useMemo(() => {
    if (!lastUpdated) return "0s";
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  }, [lastUpdated]);

  const statusColor = {
    connecting: "text-yellow-400",
    streaming: "text-green-400",
    error: "text-red-400",
  }[status];

  const statusIndicator = {
    connecting: "bg-yellow-400",
    streaming: "bg-green-400",
    error: "bg-red-400",
  }[status];

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-2xl shadow-sky-900/30">
      <h2 className="mb-6 text-lg font-semibold text-slate-100">
        Performance Metrics
      </h2>

      <div className="space-y-4">
        {/* System Status */}
        <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-400">System Status</div>
              <div className={`mt-1 text-lg font-semibold ${statusColor}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </div>
            </div>
            <div
              className={`h-3 w-3 rounded-full ${statusIndicator} ${
                status === "streaming" ? "animate-pulse" : ""
              }`}
            />
          </div>
        </div>

        {/* Latency Statistics */}
        {aggregated && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-4">
              <div className="text-xs font-medium text-slate-400">Min Latency</div>
              <div className="mt-1 text-lg font-semibold text-green-400">
                {aggregated.min.toFixed(0)}ms
              </div>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-4">
              <div className="text-xs font-medium text-slate-400">Avg Latency</div>
              <div className="mt-1 text-lg font-semibold text-cyan-400">
                {aggregated.avg.toFixed(1)}ms
              </div>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-4">
              <div className="text-xs font-medium text-slate-400">Max Latency</div>
              <div className="mt-1 text-lg font-semibold text-red-400">
                {aggregated.max.toFixed(0)}ms
              </div>
            </div>
          </div>
        )}

        {/* System Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-4">
            <div className="text-xs font-medium text-slate-400">Active Servers</div>
            <div className="mt-1 text-lg font-semibold text-slate-100">
              {markers.length}
            </div>
          </div>
          <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-4">
            <div className="text-xs font-medium text-slate-400">Uptime</div>
            <div className="mt-1 text-lg font-semibold text-slate-100">{uptime}</div>
          </div>
        </div>

        {/* P95 Latency */}
        {aggregated && "p95" in aggregated && (
          <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-4">
            <div className="text-xs font-medium text-slate-400">P95 Latency</div>
            <div className="mt-1 text-lg font-semibold text-yellow-400">
              {aggregated.p95.toFixed(0)}ms
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              95% of requests are below this value
            </div>
          </div>
        )}

        {/* Last Update */}
        {lastUpdated && (
          <div className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-4">
            <div className="text-xs font-medium text-slate-400">Last Update</div>
            <div className="mt-1 text-sm font-medium text-slate-200">
              {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

