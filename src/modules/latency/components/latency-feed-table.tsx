"use client";

import { useMemo } from "react";

import { useLatencyFeed } from "../hooks/use-latency-feed";
import { useProviderFilter } from "../hooks/use-provider-filter";
import { useDashboardFilters } from "../hooks/use-dashboard-filters";
import { useTheme } from "../hooks/use-theme";

export function LatencyFeedTable() {
  const markers = useLatencyFeed((state) => state.markers);
  const visibleProviders = useProviderFilter((state) => state.visibleProviders);
  const { selectedExchanges, selectedProviders, latencyRange } = useDashboardFilters();
  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";

  // Filter markers using the same logic as MarkersLayer
  const filteredMarkers = useMemo(() => {
    return markers.filter((marker) => {
      // Provider filter
      if (!visibleProviders.has(marker.provider)) return false;

      // Exchange filter
      if (
        selectedExchanges.size > 0 &&
        !selectedExchanges.has(marker.exchange)
      ) {
        return false;
      }

      // Provider filter from control panel
      if (
        selectedProviders.size > 0 &&
        !selectedProviders.has(marker.provider)
      ) {
        return false;
      }

      // Latency range filter
      if (
        marker.latencyMs < latencyRange[0] ||
        marker.latencyMs > latencyRange[1]
      ) {
        return false;
      }

      return true;
    });
  }, [markers, visibleProviders, selectedExchanges, selectedProviders, latencyRange]);

  const sortedMarkers = useMemo(
    () => [...filteredMarkers].sort((a, b) => b.latencyMs - a.latencyMs),
    [filteredMarkers],
  );

  if (sortedMarkers.length === 0) {
    return (
      <div
        className={`rounded-3xl border p-4 text-sm ${
          isDark
            ? "border-slate-800/70 bg-slate-950/40 text-slate-400"
            : "border-slate-300/70 bg-slate-50/90 text-slate-600"
        }`}
      >
        Waiting for latency frames…
      </div>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded-3xl border ${
        isDark ? "border-slate-800/70 bg-slate-950/40" : "border-slate-300/70 bg-slate-50/90"
      }`}
    >
      <div className="min-w-[500px]">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead
            className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] ${
              isDark ? "bg-slate-900/70 text-slate-500" : "bg-slate-200/70 text-slate-600"
            }`}
          >
            <tr>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left">Exchange</th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left">Provider</th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left">Region</th>
              <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right">Latency (ms)</th>
            </tr>
          </thead>
          <tbody>
            {sortedMarkers.map((marker) => (
              <tr
                key={marker.id}
                className={`border-t ${
                  isDark
                    ? "border-slate-800/60 bg-slate-950/60 hover:bg-slate-900/60"
                    : "border-slate-300/60 bg-slate-50/60 hover:bg-slate-100/60"
                }`}
              >
                <td
                  className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 font-medium ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {marker.label.split(" • ")[0]}
                </td>
                <td className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {marker.provider}
                </td>
                <td className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {marker.region}
                </td>
                <td
                  className={`px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {marker.latencyMs.toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

