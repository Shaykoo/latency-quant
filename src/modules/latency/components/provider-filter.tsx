"use client";

import { useState } from "react";

type ProviderFilterProps = {
  visibleProviders: Set<string>;
  onToggleProvider: (provider: string) => void;
};

export function ProviderFilter({
  visibleProviders,
  onToggleProvider,
}: ProviderFilterProps) {
  const providers = [
    { name: "AWS", color: "#FF9900" },
    { name: "GCP", color: "#4285F4" },
    { name: "Azure", color: "#0078D4" },
    { name: "Fastly", color: "#FF6900" },
  ];

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-xl shadow-sky-900/20">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Filter Cloud Providers
      </h3>
      <div className="space-y-2">
        {providers.map((provider) => {
          const isVisible = visibleProviders.has(provider.name);
          return (
            <button
              key={provider.name}
              onClick={() => onToggleProvider(provider.name)}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
                isVisible
                  ? "border-slate-700/50 bg-slate-900/60 hover:bg-slate-900/80"
                  : "border-slate-800/30 bg-slate-900/20 opacity-50 hover:opacity-70"
              }`}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: provider.color,
                    boxShadow: isVisible
                      ? `0 0 8px ${provider.color}40`
                      : "none",
                  }}
                />
              </div>
              <span
                className={`text-sm font-medium ${
                  isVisible ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {provider.name}
              </span>
              {isVisible && (
                <span className="ml-auto text-xs text-slate-500">Visible</span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-[10px] text-slate-500">
        Toggle providers to show/hide regions on the globe.
      </p>
    </div>
  );
}

