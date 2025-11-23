"use client";

export function ProviderLegend() {
  const providers = [
    {
      name: "AWS",
      color: "#FF9900",
      emissive: "#CC7700",
    },
    {
      name: "GCP",
      color: "#4285F4",
      emissive: "#1A73E8",
    },
    {
      name: "Azure",
      color: "#0078D4",
      emissive: "#005A9E",
    },
    {
      name: "Fastly",
      color: "#FF6900",
      emissive: "#CC5400",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-xl shadow-sky-900/20">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Cloud Providers
      </h3>
      <div className="space-y-2.5">
        {providers.map((provider) => (
          <div
            key={provider.name}
            className="flex items-center gap-3 rounded-lg border border-slate-800/50 bg-slate-900/40 px-3 py-2.5 transition-colors hover:bg-slate-900/60"
          >
            <div className="relative flex-shrink-0">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: provider.color,
                  boxShadow: `0 0 8px ${provider.color}40, 0 0 12px ${provider.emissive}60`,
                }}
              />
              <div
                className="absolute inset-0 rounded-full blur-sm"
                style={{
                  backgroundColor: provider.emissive,
                  opacity: 0.6,
                }}
              />
            </div>
            <span className="text-sm font-medium text-slate-200">
              {provider.name}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[10px] text-slate-500">
        Markers are color-coded by cloud provider. Hover over markers to see
        detailed server information.
      </p>
    </div>
  );
}

