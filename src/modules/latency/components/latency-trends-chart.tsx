"use client";

import { useMemo, useState, useEffect } from "react";
import { useLatencyFeed } from "../hooks/use-latency-feed";
import {
  useLatencyHistory,
  type TimeRange,
  type HistoricalDataPoint,
} from "../hooks/use-latency-history";
import { useVisualizationLayers } from "../hooks/use-visualization-layers";
import { useTheme } from "../hooks/use-theme";

const CHART_HEIGHT = 300;
const CHART_PADDING = { top: 20, right: 20, bottom: 40, left: 60 };

export function LatencyTrendsChart() {
  const markers = useLatencyFeed((state) => state.markers);
  const showHistorical = useVisualizationLayers(
    (state) => state.showHistorical,
  );
  const historyStore = useLatencyHistory();
  const { getDataForPair, getDataForRegion, getStatistics, data: allHistoryData } = historyStore;
  const [selectedExchange1, setSelectedExchange1] = useState<string>("");
  const [selectedExchange2, setSelectedExchange2] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [viewMode, setViewMode] = useState<"pair" | "region">("pair");
  const [timeRange, setTimeRange] = useState<TimeRange>("1m");

  // Get available exchanges and regions
  const exchanges = useMemo(() => {
    const unique = new Set(markers.map((m) => m.exchange));
    return Array.from(unique).sort();
  }, [markers]);

  const regions = useMemo(() => {
    const unique = new Set(markers.map((m) => m.region));
    return Array.from(unique).sort();
  }, [markers]);

  // Auto-select first exchange/region if none selected and options are available
  useEffect(() => {
    if (viewMode === "pair" && !selectedExchange1 && exchanges.length > 0) {
      setSelectedExchange1(exchanges[0]);
    }
    if (viewMode === "region" && !selectedRegion && regions.length > 0) {
      setSelectedRegion(regions[0]);
    }
  }, [viewMode, exchanges.length, regions.length, selectedExchange1, selectedRegion]);

  // Get total data count for debugging
  const totalDataCount = allHistoryData.length;

  // Get data based on view mode
  const chartData = useMemo(() => {
    if (viewMode === "pair") {
      if (!selectedExchange1) return [];
      return getDataForPair(selectedExchange1, selectedExchange2, timeRange);
    } else {
      if (!selectedRegion) return [];
      return getDataForRegion(selectedRegion, timeRange);
    }
  }, [
    viewMode,
    selectedExchange1,
    selectedExchange2,
    selectedRegion,
    timeRange,
    getDataForPair,
    getDataForRegion,
    allHistoryData.length, // Add this to trigger recalculation when data changes
  ]);

  const statistics = useMemo(() => {
    return getStatistics(chartData);
  }, [chartData, getStatistics]);

  // Group data by timestamp for smoother visualization
  const groupedData = useMemo(() => {
    if (!showHistorical) return [];
    const grouped = new Map<number, HistoricalDataPoint[]>();
    chartData.forEach((point) => {
      const time = point.timestamp.getTime();
      const rounded = Math.floor(time / (5 * 60 * 1000)) * (5 * 60 * 1000); // 5-minute buckets
      if (!grouped.has(rounded)) {
        grouped.set(rounded, []);
      }
      grouped.get(rounded)!.push(point);
    });

    return Array.from(grouped.entries())
      .map(([timestamp, points]) => ({
        timestamp: new Date(timestamp),
        avgLatency:
          points.reduce((sum, p) => sum + p.latencyMs, 0) / points.length,
        minLatency: Math.min(...points.map((p) => p.latencyMs)),
        maxLatency: Math.max(...points.map((p) => p.latencyMs)),
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [chartData]);

  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <div
      className={`rounded-3xl border p-4 shadow-2xl ${
        isDark
          ? "border-slate-800/80 bg-slate-950/60 shadow-sky-900/30"
          : "border-slate-300/80 bg-slate-50/90 shadow-sky-900/10"
      }`}
    >
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className={`text-lg font-semibold ${
              isDark ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Historical Latency Trends
          </h2>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("pair")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "pair"
                ? "bg-sky-600 text-white"
                : isDark
                  ? "bg-slate-800/50 text-slate-300 hover:bg-slate-800/70"
                  : "bg-slate-200/50 text-slate-700 hover:bg-slate-300/70"
            }`}
          >
            Exchange Pairs
          </button>
          <button
            onClick={() => setViewMode("region")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "region"
                ? "bg-sky-600 text-white"
                : isDark
                  ? "bg-slate-800/50 text-slate-300 hover:bg-slate-800/70"
                  : "bg-slate-200/50 text-slate-700 hover:bg-slate-300/70"
            }`}
          >
            Regions
          </button>
        </div>

        {/* Selection Controls */}
        {viewMode === "pair" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                className={`mb-1.5 block text-xs font-medium ${
                  isDark ? "text-slate-400" : "text-slate-700"
                }`}
              >
                Exchange 1
              </label>
              <select
                value={selectedExchange1}
                onChange={(e) => setSelectedExchange1(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                  isDark
                    ? "border-slate-700/50 bg-slate-900/50 text-slate-100"
                    : "border-slate-300/50 bg-slate-100/90 text-slate-900"
                }`}
              >
                <option value="">Select exchange...</option>
                {exchanges.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className={`mb-1.5 block text-xs font-medium ${
                  isDark ? "text-slate-400" : "text-slate-700"
                }`}
              >
                Exchange 2 (Optional)
              </label>
              <select
                value={selectedExchange2 || ""}
                onChange={(e) =>
                  setSelectedExchange2(e.target.value || null)
                }
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                  isDark
                    ? "border-slate-700/50 bg-slate-900/50 text-slate-100"
                    : "border-slate-300/50 bg-slate-100/90 text-slate-900"
                }`}
              >
                <option value="">None (Single exchange)</option>
                {exchanges
                  .filter((ex) => ex !== selectedExchange1)
                  .map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ) : (
          <div>
            <label
              className={`mb-1.5 block text-xs font-medium ${
                isDark ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Region
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
                isDark
                  ? "border-slate-700/50 bg-slate-900/50 text-slate-100"
                  : "border-slate-300/50 bg-slate-100/90 text-slate-900"
              }`}
            >
              <option value="">Select region...</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Time Range Selector */}
        <div>
          <label
            className={`mb-1.5 block text-xs font-medium ${
              isDark ? "text-slate-400" : "text-slate-700"
            }`}
          >
            Time Range
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(["1m", "1h", "24h", "7d", "30d"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  timeRange === range
                    ? "bg-sky-600 text-white"
                    : isDark
                      ? "bg-slate-800/50 text-slate-300 hover:bg-slate-800/70"
                      : "bg-slate-200/50 text-slate-700 hover:bg-slate-300/70"
                }`}
              >
                {range === "1m"
                  ? "1 Min"
                  : range === "1h"
                    ? "1 Hour"
                    : range === "24h"
                      ? "24 Hours"
                      : range === "7d"
                        ? "7 Days"
                        : "30 Days"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {chartData.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div
            className={`rounded-xl border p-4 ${
              isDark
                ? "border-slate-800/70 bg-slate-900/40"
                : "border-slate-300/70 bg-slate-100/60"
            }`}
          >
            <div
              className={`text-xs font-medium ${
                isDark ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Min Latency
            </div>
            <div className="mt-1 text-lg font-semibold text-green-500">
              {statistics.min.toFixed(0)}ms
            </div>
          </div>
          <div
            className={`rounded-xl border p-4 ${
              isDark
                ? "border-slate-800/70 bg-slate-900/40"
                : "border-slate-300/70 bg-slate-100/60"
            }`}
          >
            <div
              className={`text-xs font-medium ${
                isDark ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Average Latency
            </div>
            <div className="mt-1 text-lg font-semibold text-cyan-600">
              {statistics.avg.toFixed(1)}ms
            </div>
          </div>
          <div
            className={`rounded-xl border p-4 ${
              isDark
                ? "border-slate-800/70 bg-slate-900/40"
                : "border-slate-300/70 bg-slate-100/60"
            }`}
          >
            <div
              className={`text-xs font-medium ${
                isDark ? "text-slate-400" : "text-slate-700"
              }`}
            >
              Max Latency
            </div>
            <div className="mt-1 text-lg font-semibold text-red-500">
              {statistics.max.toFixed(0)}ms
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      {groupedData.length > 0 ? (
        <TimeSeriesChart data={groupedData} />
      ) : (
        <div
          className={`flex h-[300px] flex-col items-center justify-center rounded-xl border ${
            isDark
              ? "border-slate-800/70 bg-slate-900/20"
              : "border-slate-300/70 bg-slate-100/20"
          }`}
        >
          <p
            className={`text-sm ${
              isDark ? "text-slate-500" : "text-slate-600"
            }`}
          >
            {selectedExchange1 || selectedRegion
              ? "No data available for the selected criteria"
              : "Select an exchange pair or region to view trends"}
          </p>
          {totalDataCount === 0 && (
            <div className="mt-4 space-y-2 text-center">
              <p
                className={`text-xs ${
                  isDark ? "text-slate-600" : "text-slate-700"
                }`}
              >
                Waiting for data to accumulate...
              </p>
              <p
                className={`text-[10px] ${
                  isDark ? "text-slate-700" : "text-slate-800"
                }`}
              >
                Data updates every 5 seconds. Please wait a moment.
              </p>
            </div>
          )}
          {totalDataCount > 0 && (selectedExchange1 || selectedRegion) && chartData.length === 0 && (
            <div className="mt-4 space-y-2 text-center">
              <p
                className={`text-xs ${
                  isDark ? "text-slate-600" : "text-slate-700"
                }`}
              >
                No data found for the selected criteria.
              </p>
              <p
                className={`text-[10px] ${
                  isDark ? "text-slate-700" : "text-slate-800"
                }`}
              >
                Found {chartData.length} matching points (Total in store: {totalDataCount})
              </p>
              <p
                className={`text-[10px] ${
                  isDark ? "text-slate-700" : "text-slate-800"
                }`}
              >
                Selected: {viewMode === "pair" 
                  ? `${selectedExchange1}${selectedExchange2 ? ` & ${selectedExchange2}` : ""}` 
                  : selectedRegion} | Time range: {timeRange}
              </p>
              <p
                className={`text-[10px] ${
                  isDark ? "text-slate-700" : "text-slate-800"
                }`}
              >
                Try selecting a different exchange/region or a longer time range.
              </p>
              {/* Debug info */}
              <details className="mt-4 text-left">
                <summary
                  className={`cursor-pointer text-[10px] ${
                    isDark ? "text-slate-600" : "text-slate-700"
                  }`}
                >
                  Debug Info
                </summary>
                <div
                  className={`mt-2 space-y-1 text-[9px] ${
                    isDark ? "text-slate-700" : "text-slate-800"
                  }`}
                >
                  <p>Cutoff time: {new Date(Date.now() - (timeRange === "1m" ? 60000 : timeRange === "1h" ? 3600000 : timeRange === "24h" ? 86400000 : timeRange === "7d" ? 604800000 : 2592000000)).toISOString()}</p>
                  <p>Current time: {new Date().toISOString()}</p>
                  <p>Sample exchanges in store: {Array.from(new Set(allHistoryData.slice(0, 10).map(d => d.exchange))).join(", ")}</p>
                  <p>Sample regions in store: {Array.from(new Set(allHistoryData.slice(0, 10).map(d => d.region))).join(", ")}</p>
                  <p>Oldest data point: {allHistoryData.length > 0 ? new Date(Math.min(...allHistoryData.map(d => d.timestamp instanceof Date ? d.timestamp.getTime() : new Date(d.timestamp).getTime()))).toISOString() : "N/A"}</p>
                  <p>Newest data point: {allHistoryData.length > 0 ? new Date(Math.max(...allHistoryData.map(d => d.timestamp instanceof Date ? d.timestamp.getTime() : new Date(d.timestamp).getTime()))).toISOString() : "N/A"}</p>
                </div>
              </details>
            </div>
          )}
          {totalDataCount > 0 && !selectedExchange1 && !selectedRegion && (
            <p
              className={`mt-2 text-xs ${
                isDark ? "text-slate-600" : "text-slate-700"
              }`}
            >
              {totalDataCount} data points available. Select filters above to view trends.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function TimeSeriesChart({
  data,
}: {
  data: Array<{
    timestamp: Date;
    avgLatency: number;
    minLatency: number;
    maxLatency: number;
  }>;
}) {
  const width = 800;
  const height = CHART_HEIGHT;
  const chartWidth = width - CHART_PADDING.left - CHART_PADDING.right;
  const chartHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;

  // Calculate scales
  const minTime = data[0]?.timestamp.getTime() || 0;
  const maxTime = data[data.length - 1]?.timestamp.getTime() || 0;
  const timeRange = maxTime - minTime || 1;

  const allLatencies = data.flatMap((d) => [d.minLatency, d.maxLatency]);
  const minLatency = Math.min(...allLatencies, 0);
  const maxLatency = Math.max(...allLatencies, 100);
  const latencyRange = maxLatency - minLatency || 100;

  // Generate points for the line
  const points = data.map((d, i) => {
    const x =
      CHART_PADDING.left +
      ((d.timestamp.getTime() - minTime) / timeRange) * chartWidth;
    const y =
      CHART_PADDING.top +
      chartHeight -
      ((d.avgLatency - minLatency) / latencyRange) * chartHeight;
    return { x, y, ...d };
  });

  // Create path for the line
  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Create area path
  const areaPath = `${pathData} L ${points[points.length - 1]?.x || 0} ${
    CHART_PADDING.top + chartHeight
  } L ${points[0]?.x || 0} ${CHART_PADDING.top + chartHeight} Z`;

  // Format time labels
  const timeLabels = useMemo(() => {
    const count = 6;
    const step = Math.max(1, Math.floor(data.length / count));
    return data
      .filter((_, i) => i % step === 0 || i === data.length - 1)
      .map((d) => ({
        time: d.timestamp,
        x: CHART_PADDING.left + ((d.timestamp.getTime() - minTime) / timeRange) * chartWidth,
      }));
  }, [data, minTime, timeRange, chartWidth]);

  // Generate Y-axis labels
  const yLabels = useMemo(() => {
    const count = 5;
    const step = latencyRange / count;
    return Array.from({ length: count + 1 }, (_, i) => {
      const value = minLatency + step * i;
      const y = CHART_PADDING.top + chartHeight - (step * i / latencyRange) * chartHeight;
      return { value, y };
    });
  }, [minLatency, latencyRange, chartHeight]);

  return (
    <div className="overflow-x-auto">
      <svg
        width={width}
        height={height}
        className="w-full"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Grid lines */}
        {yLabels.map((label, i) => (
          <line
            key={i}
            x1={CHART_PADDING.left}
            y1={label.y}
            x2={CHART_PADDING.left + chartWidth}
            y2={label.y}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-slate-800"
            strokeDasharray="2,2"
          />
        ))}

        {/* Area fill */}
        <path
          d={areaPath}
          fill="url(#gradient)"
          opacity={0.2}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Main line */}
        <path
          d={pathData}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="3"
            fill="#38bdf8"
            className="hover:r-4 transition-all"
          />
        ))}

        {/* Y-axis labels */}
        {yLabels.map((label, i) => (
          <text
            key={i}
            x={CHART_PADDING.left - 10}
            y={label.y + 4}
            textAnchor="end"
            className="text-[10px] fill-slate-400"
          >
            {label.value.toFixed(0)}ms
          </text>
        ))}

        {/* X-axis labels */}
        {timeLabels.map((label, i) => (
          <text
            key={i}
            x={label.x}
            y={CHART_PADDING.top + chartHeight + 20}
            textAnchor="middle"
            className="text-[10px] fill-slate-400"
          >
            {label.time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </text>
        ))}

        {/* Axes */}
        <line
          x1={CHART_PADDING.left}
          y1={CHART_PADDING.top}
          x2={CHART_PADDING.left}
          y2={CHART_PADDING.top + chartHeight}
          stroke="currentColor"
          strokeWidth="1"
          className="text-slate-700"
        />
        <line
          x1={CHART_PADDING.left}
          y1={CHART_PADDING.top + chartHeight}
          x2={CHART_PADDING.left + chartWidth}
          y2={CHART_PADDING.top + chartHeight}
          stroke="currentColor"
          strokeWidth="1"
          className="text-slate-700"
        />
      </svg>
    </div>
  );
}

