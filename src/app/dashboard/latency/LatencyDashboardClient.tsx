"use client";

import { useEffect, useState } from "react";

import { LatencyGlobe } from "@/modules/latency/components/LatencyGlobe";
import { LatencySummary } from "@/modules/latency/components/latency-summary";
import { LatencyFeedTable } from "@/modules/latency/components/latency-feed-table";
import { StreamStatus } from "@/modules/latency/components/stream-status";
import { ProviderLegend } from "@/modules/latency/components/provider-legend";
import { LatencyTrendsChart } from "@/modules/latency/components/latency-trends-chart";
import { ProviderFilter } from "@/modules/latency/components/provider-filter";
import { useProviderFilter } from "@/modules/latency/hooks/use-provider-filter";
import { ControlPanel } from "@/modules/latency/components/control-panel";
import { PerformanceMetrics } from "@/modules/latency/components/performance-metrics";
import { useVisualizationLayers } from "@/modules/latency/hooks/use-visualization-layers";
import { useThemeSync } from "@/modules/latency/hooks/use-theme";
import { useTheme } from "@/modules/latency/hooks/use-theme";

function ConditionalLatencyTrendsChart() {
  const showHistorical = useVisualizationLayers((state) => state.showHistorical);
  if (!showHistorical) return null;
  return <LatencyTrendsChart />;
}

export function LatencyDashboardClient() {
  const isClientReady = useClientReady();
  useThemeSync();
  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <div className={`space-y-4 ${isDark ? "bg-transparent" : "bg-slate-50"}`}>
      <div
        className={`grid gap-4 lg:grid-cols-[1.1fr_0.9fr] ${
          isDark ? "bg-transparent" : "bg-slate-50"
        }`}
      >
        <div className="space-y-4">
          <div className="h-[80vh]">
            {isClientReady ? <LatencyGlobe /> : <LatencyGlobeSkeleton />}
          </div>
        </div>
        <aside className="h-[80vh] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/50">
          {isClientReady ? <StreamStatus /> : null}
          {isClientReady ? <ControlPanel /> : null}
          {isClientReady ? <PerformanceMetrics /> : null}
          {/* {isClientReady ? <ProviderFilterControl /> : null} */}
          {/* {isClientReady ? <ProviderLegend /> : null} */}
          {isClientReady ? <LatencyFeedTable /> : <LatencyFeedTableSkeleton />}
          {isClientReady ? <LatencySummary /> : <LatencySummarySkeleton />}
        </aside>
      </div>
      {isClientReady && <ConditionalLatencyTrendsChart />}
    </div>
  );
}

function useClientReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  return isReady;
}

function LatencyGlobeSkeleton() {
  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-3xl border shadow-2xl ${
        isDark
          ? "border-slate-800/80 bg-slate-950/40 shadow-sky-900/20"
          : "border-slate-300/80 bg-slate-50/40 shadow-sky-900/10"
      }`}
    >
      <div
        className={`absolute inset-0 animate-pulse bg-gradient-to-br ${
          isDark
            ? "from-slate-900/80 via-slate-950/70 to-slate-900/80"
            : "from-slate-200/80 via-slate-100/70 to-slate-200/80"
        }`}
      />
    </div>
  );
}

function LatencySummarySkeleton() {
  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <section
      className={`rounded-3xl border p-4 shadow-xl ${
        isDark
          ? "border-slate-800/80 bg-slate-950/50 shadow-sky-900/20"
          : "border-slate-300/80 bg-slate-50/90 shadow-sky-900/10"
      }`}
    >
      <div className="space-y-3">
        <div className="h-4 w-52 animate-pulse rounded-full bg-slate-800/60" />
        <div className="grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className={`rounded-xl border px-3 py-3 shadow-lg ${
                isDark
                  ? "border-slate-800/70 bg-slate-900/60 shadow-slate-950/40"
                  : "border-slate-300/70 bg-slate-100/60 shadow-slate-200/40"
              }`}
            >
              <div className="h-3 w-24 animate-pulse rounded-full bg-slate-800/60" />
              <div className="mt-2 h-6 w-20 animate-pulse rounded-full bg-slate-800/60" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatencyFeedTableSkeleton() {
  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <div
      className={`overflow-hidden rounded-3xl border ${
        isDark ? "border-slate-800/70 bg-slate-950/40" : "border-slate-300/70 bg-slate-50/90"
      }`}
    >
      <div className={`p-4 ${isDark ? "bg-slate-900/70" : "bg-slate-200/70"}`}>
        <div
          className={`h-3 w-32 animate-pulse rounded-full ${
            isDark ? "bg-slate-800/60" : "bg-slate-300/60"
          }`}
        />
      </div>
      <div className={`divide-y ${isDark ? "divide-slate-800/60" : "divide-slate-300/60"}`}>
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="flex items-center justify-between px-5 py-4">
            <div className="h-4 w-32 animate-pulse rounded-full bg-slate-800/60" />
            <div className="h-4 w-20 animate-pulse rounded-full bg-slate-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProviderFilterControl() {
  const visibleProviders = useProviderFilter((state) => state.visibleProviders);
  const toggleProvider = useProviderFilter((state) => state.toggleProvider);

  return (
    <ProviderFilter
      visibleProviders={visibleProviders}
      onToggleProvider={toggleProvider}
    />
  );
}

function HeroCopy() {
  return (
    <section className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-slate-900/60 p-6 shadow-2xl shadow-sky-900/30">
      <h1 className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">
        Realtime telemetry
      </h1>
      <p className="mt-4 text-3xl font-semibold leading-tight text-slate-100">
        Global exchange latency rendered on a cinematic, accessible 3D globe.
      </p>
      <p className="mt-4 text-sm text-slate-400">
        Every frame passes through `zod` schemas to eliminate drift, logs structured events
        (`service`, `exchange`, `latencyMs`), and keeps FPS at 60 via instanced meshes and
        memoized materials.
      </p>
      <div className="mt-6 grid gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
        <span>Streaming source • Simulated Cloudflare Radar feed</span>
        <span>Validation • modules/latency/schema.ts</span>
        <span>SSE endpoint • /api/latency/stream</span>
      </div>
    </section>
  );
}

