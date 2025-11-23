"use client";

import { useMemo } from "react";

import { useLatencyFeed } from "../hooks/use-latency-feed";

export function LatencyFeedTable() {
  const markers = useLatencyFeed((state) => state.markers);
  const sortedMarkers = useMemo(
    () => [...markers].sort((a, b) => b.latencyMs - a.latencyMs),
    [markers],
  );

  if (sortedMarkers.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/40 p-6 text-sm text-slate-400">
        Waiting for latency frames…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/40">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-900/70 text-xs uppercase tracking-[0.3em] text-slate-500">
          <tr>
            <th className="px-5 py-4 text-left">Exchange</th>
            <th className="px-5 py-4 text-left">Provider</th>
            <th className="px-5 py-4 text-left">Region</th>
            <th className="px-5 py-4 text-right">Latency (ms)</th>
          </tr>
        </thead>
        <tbody>
          {sortedMarkers.map((marker) => (
            <tr
              key={marker.id}
              className="border-t border-slate-800/60 bg-slate-950/60 hover:bg-slate-900/60"
            >
              <td className="px-5 py-4 font-medium text-slate-100">
                {marker.label.split(" • ")[0]}
              </td>
              <td className="px-5 py-4 text-slate-300">
                {marker.provider}
              </td>
              <td className="px-5 py-4 text-slate-300">
                {marker.region}
              </td>
              <td className="px-5 py-4 text-right text-slate-100">
                {marker.latencyMs.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

