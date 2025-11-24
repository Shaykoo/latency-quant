"use client";

import { useMemo } from "react";
import { useLatencyFeed } from "../hooks/use-latency-feed";
import { useDashboardFilters } from "../hooks/use-dashboard-filters";
import { useVisualizationLayers } from "../hooks/use-visualization-layers";

export function ControlPanel() {
  const markers = useLatencyFeed((state) => state.markers);
  const status = useLatencyFeed((state) => state.status);
  const aggregated = useLatencyFeed((state) => state.aggregated);

  const {
    selectedExchanges,
    selectedProviders,
    latencyRange,
    searchQuery,
    toggleExchange,
    toggleProvider,
    setLatencyRange,
    setSearchQuery,
    resetFilters,
  } = useDashboardFilters();

  const {
    showRealtime,
    showHistorical,
    showRegions,
    showConnections,
    toggleRealtime,
    toggleHistorical,
    toggleRegions,
    toggleConnections,
  } = useVisualizationLayers();

  // Get unique exchanges and regions
  const exchanges = useMemo(() => {
    const unique = new Set(markers.map((m) => m.exchange));
    return Array.from(unique).sort();
  }, [markers]);

  const regions = useMemo(() => {
    const unique = new Set(markers.map((m) => m.region));
    return Array.from(unique).sort();
  }, [markers]);

  // Filter exchanges/regions by search query
  const filteredExchanges = useMemo(() => {
    if (!searchQuery) return exchanges;
    const query = searchQuery.toLowerCase();
    return exchanges.filter(
      (ex) =>
        ex.toLowerCase().includes(query) ||
        regions.some((r) => r.toLowerCase().includes(query)),
    );
  }, [exchanges, regions, searchQuery]);

  const filteredRegions = useMemo(() => {
    if (!searchQuery) return regions;
    const query = searchQuery.toLowerCase();
    return regions.filter((r) => r.toLowerCase().includes(query));
  }, [regions, searchQuery]);

  // Calculate max latency for range slider
  const maxLatency = useMemo(() => {
    if (!aggregated) return 200;
    return Math.max(aggregated.max, 200);
  }, [aggregated]);

  return (
    <div className="rounded-3xl border border-slate-800/80 bg-slate-950/60 p-6 shadow-2xl shadow-sky-900/30">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Control Panel</h2>
        <button
          onClick={resetFilters}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-slate-200"
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Search Exchanges & Regions
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to search..."
            className="w-full rounded-lg border border-slate-700/50 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Exchange Filter */}
        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Filter by Exchange
          </label>
          <div className="max-h-32 space-y-1.5 overflow-y-auto">
            {filteredExchanges.length > 0 ? (
              filteredExchanges.map((exchange) => {
                const isSelected = selectedExchanges.has(exchange);
                return (
                  <button
                    key={exchange}
                    onClick={() => toggleExchange(exchange)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all ${
                      isSelected
                        ? "border-sky-600/50 bg-sky-600/20 text-slate-100"
                        : "border-slate-700/50 bg-slate-900/30 text-slate-300 hover:bg-slate-900/50"
                    }`}
                  >
                    <span>{exchange}</span>
                    {isSelected && (
                      <span className="text-xs text-sky-400">✓</span>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="py-2 text-xs text-slate-500">No matches found</p>
            )}
          </div>
          {selectedExchanges.size > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              {selectedExchanges.size} exchange(s) selected
            </p>
          )}
        </div>

        {/* Provider Filter */}
        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Filter by Cloud Provider
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["AWS", "GCP", "Azure", "Fastly"].map((provider) => {
              const isSelected = selectedProviders.has(provider);
              const colors = {
                AWS: "#FF9900",
                GCP: "#4285F4",
                Azure: "#0078D4",
                Fastly: "#FF6900",
              };
              return (
                <button
                  key={provider}
                  onClick={() => toggleProvider(provider)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${
                    isSelected
                      ? "border-slate-700/50 bg-slate-900/60"
                      : "border-slate-800/30 bg-slate-900/20 opacity-50"
                  }`}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: colors[provider as keyof typeof colors] }}
                  />
                  <span className={isSelected ? "text-slate-200" : "text-slate-500"}>
                    {provider}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Latency Range Filter */}
        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Latency Range: {latencyRange[0]}ms - {latencyRange[1]}ms
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={maxLatency}
              value={latencyRange[1]}
              onChange={(e) =>
                setLatencyRange([latencyRange[0], Number(e.target.value)])
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>0ms</span>
              <span>{maxLatency}ms</span>
            </div>
          </div>
        </div>

        {/* Visualization Layer Toggles */}
        <div>
          <label className="mb-2 block text-xs font-medium text-slate-400">
            Visualization Layers
          </label>
          <div className="space-y-2">
            <ToggleSwitch
              label="Real-time Markers"
              enabled={showRealtime}
              onToggle={toggleRealtime}
            />
            <ToggleSwitch
              label="Historical Trends"
              enabled={showHistorical}
              onToggle={toggleHistorical}
            />
            <ToggleSwitch
              label="Region Boundaries"
              enabled={showRegions}
              onToggle={toggleRegions}
            />
            <ToggleSwitch
              label="Latency Connections"
              enabled={showConnections}
              onToggle={toggleConnections}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/30 px-3 py-2.5 transition-colors hover:bg-slate-900/50"
    >
      <span className="text-sm text-slate-200">{label}</span>
      <div
        className={`relative h-5 w-9 rounded-full transition-colors ${
          enabled ? "bg-sky-600" : "bg-slate-700"
        }`}
      >
        <div
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}

