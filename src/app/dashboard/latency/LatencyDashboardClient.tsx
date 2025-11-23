"use client";

import { useEffect, useState } from "react";

import { LatencyGlobe } from "@/modules/latency/components/LatencyGlobe";
import { LatencySummary } from "@/modules/latency/components/latency-summary";
import { LatencyFeedTable } from "@/modules/latency/components/latency-feed-table";

export function LatencyDashboardClient() {
  const isClientReady = useClientReady();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        {isClientReady ? <LatencyGlobe /> : <LatencyGlobeSkeleton />}
        {isClientReady ? <LatencySummary /> : <LatencySummarySkeleton />}
      </div>
      <aside className="space-y-6">
        <HeroCopy />
        {isClientReady ? <LatencyFeedTable /> : <LatencyFeedTableSkeleton />}
      </aside>
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
  return (
    <div className="relative aspect-square w-full max-w-[620px] overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/40 shadow-2xl shadow-sky-900/20">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-900/80 via-slate-950/70 to-slate-900/80" />
    </div>
  );
}

function LatencySummarySkeleton() {
  return (
    <section className="grid gap-4 rounded-3xl border border-slate-800/80 bg-slate-950/50 p-6 shadow-xl shadow-sky-900/20 md:grid-cols-2">
      <div className="space-y-4">
        <div className="h-4 w-48 animate-pulse rounded-full bg-slate-800/60" />
        <div className="h-6 w-56 animate-pulse rounded-full bg-slate-800/60" />
        <div className="h-3 w-40 animate-pulse rounded-full bg-slate-800/60" />
      </div>
      <div className="space-y-4">
        <div className="h-4 w-52 animate-pulse rounded-full bg-slate-800/60" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-4 py-5 shadow-lg shadow-slate-950/40"
            >
              <div className="h-3 w-24 animate-pulse rounded-full bg-slate-800/60" />
              <div className="mt-3 h-6 w-20 animate-pulse rounded-full bg-slate-800/60" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatencyFeedTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/40">
      <div className="bg-slate-900/70 p-4">
        <div className="h-3 w-32 animate-pulse rounded-full bg-slate-800/60" />
      </div>
      <div className="divide-y divide-slate-800/60">
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

