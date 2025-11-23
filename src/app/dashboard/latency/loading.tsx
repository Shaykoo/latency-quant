"use client";

export default function LatencyDashboardLoading() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <Skeleton className="aspect-square w-full max-w-[620px]" />
      <div className="grid gap-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-3xl border border-slate-800/60 bg-slate-900/60 ${className ?? ""}`}
    />
  );
}

