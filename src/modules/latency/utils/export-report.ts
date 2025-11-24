"use client";

// We need to import the store creators, but they're not exported
// So we'll access them through a different approach
// Let's create a function that takes the data as parameters instead

export interface LatencyReport {
  metadata: {
    generatedAt: string;
    reportVersion: string;
    totalSamples: number;
    timeRange: {
      start: string | null;
      end: string | null;
    };
  };
  currentData: {
    markers: Array<{
      exchange: string;
      provider: string;
      region: string;
      latencyMs: number;
      position: [number, number, number];
    }>;
    aggregated: {
      min: number;
      max: number;
      avg: number;
      p95?: number;
    } | null;
    lastUpdated: string | null;
    status: string;
  };
  historicalData: Array<{
    timestamp: string;
    exchange: string;
    provider: string;
    region: string;
    latencyMs: number;
  }>;
  summary: {
    totalExchanges: number;
    totalProviders: number;
    totalRegions: number;
    averageLatency: number;
    minLatency: number;
    maxLatency: number;
  };
}

export function generateLatencyReport(
  markers: Array<{
    exchange: string;
    provider: string;
    region: string;
    latencyMs: number;
    position: [number, number, number];
  }>,
  aggregated: { min: number; max: number; avg: number; p95?: number } | null,
  lastUpdated: Date | null,
  status: string,
  historyData: Array<{
    timestamp: Date | string;
    exchange: string;
    provider: string;
    region: string;
    latencyMs: number;
  }>
): LatencyReport {

  // Get unique counts
  const exchanges = new Set(markers.map((m) => m.exchange));
  const providers = new Set(markers.map((m) => m.provider));
  const regions = new Set(markers.map((m) => m.region));

  // Calculate summary statistics
  const allLatencies = markers.map((m) => m.latencyMs);
  const historicalLatencies = historyData.map((d) => d.latencyMs);
  const combinedLatencies = [...allLatencies, ...historicalLatencies];

  const summary = {
    totalExchanges: exchanges.size,
    totalProviders: providers.size,
    totalRegions: regions.size,
    averageLatency:
      combinedLatencies.length > 0
        ? combinedLatencies.reduce((a, b) => a + b, 0) / combinedLatencies.length
        : 0,
    minLatency: combinedLatencies.length > 0 ? Math.min(...combinedLatencies) : 0,
    maxLatency: combinedLatencies.length > 0 ? Math.max(...combinedLatencies) : 0,
  };

  // Get time range from historical data
  const timestamps = historyData.map((d) =>
    d.timestamp instanceof Date ? d.timestamp.getTime() : new Date(d.timestamp).getTime()
  );
  const timeRange = {
    start: timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : null,
    end: timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null,
  };

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      reportVersion: "1.0.0",
      totalSamples: markers.length + historyData.length,
      timeRange,
    },
    currentData: {
      markers: markers.map((m) => ({
        exchange: m.exchange,
        provider: m.provider,
        region: m.region,
        latencyMs: m.latencyMs,
        position: m.position,
      })),
      aggregated: aggregated
        ? {
            min: aggregated.min,
            max: aggregated.max,
            avg: aggregated.avg,
            ...(aggregated.p95 !== undefined ? { p95: aggregated.p95 } : {}),
          }
        : null,
      lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
      status,
    },
    historicalData: historyData.map((d) => ({
      timestamp: d.timestamp instanceof Date ? d.timestamp.toISOString() : d.timestamp,
      exchange: d.exchange,
      provider: d.provider,
      region: d.region,
      latencyMs: d.latencyMs,
    })),
    summary,
  };
}

export function exportReportAsJSON(report: LatencyReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `latency-report-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportReportAsCSV(report: LatencyReport): void {
  // Create CSV content
  const lines: string[] = [];

  // Metadata section
  lines.push("Latency Report - Metadata");
  lines.push(`Generated At,${report.metadata.generatedAt}`);
  lines.push(`Report Version,${report.metadata.reportVersion}`);
  lines.push(`Total Samples,${report.metadata.totalSamples}`);
  lines.push(`Time Range Start,${report.metadata.timeRange.start || "N/A"}`);
  lines.push(`Time Range End,${report.metadata.timeRange.end || "N/A"}`);
  lines.push("");

  // Summary section
  lines.push("Summary");
  lines.push(`Total Exchanges,${report.summary.totalExchanges}`);
  lines.push(`Total Providers,${report.summary.totalProviders}`);
  lines.push(`Total Regions,${report.summary.totalRegions}`);
  lines.push(`Average Latency,${report.summary.averageLatency.toFixed(2)}ms`);
  lines.push(`Min Latency,${report.summary.minLatency}ms`);
  lines.push(`Max Latency,${report.summary.maxLatency}ms`);
  lines.push("");

  // Current aggregated data
  if (report.currentData.aggregated) {
    lines.push("Current Aggregated Metrics");
    lines.push(`Min,${report.currentData.aggregated.min}ms`);
    lines.push(`Max,${report.currentData.aggregated.max}ms`);
    lines.push(`Average,${report.currentData.aggregated.avg.toFixed(2)}ms`);
    if (report.currentData.aggregated.p95) {
      lines.push(`P95,${report.currentData.aggregated.p95}ms`);
    }
    lines.push("");
  }

  // Current markers
  lines.push("Current Markers");
  lines.push("Exchange,Provider,Region,Latency (ms)");
  report.currentData.markers.forEach((marker) => {
    lines.push(`${marker.exchange},${marker.provider},${marker.region},${marker.latencyMs}`);
  });
  lines.push("");

  // Historical data
  lines.push("Historical Data");
  lines.push("Timestamp,Exchange,Provider,Region,Latency (ms)");
  report.historicalData.forEach((data) => {
    lines.push(
      `${data.timestamp},${data.exchange},${data.provider},${data.region},${data.latencyMs}`
    );
  });

  const csvContent = lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `latency-report-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

