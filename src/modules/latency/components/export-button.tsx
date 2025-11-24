"use client";

import { useState } from "react";
import { useTheme } from "../hooks/use-theme";
import { useLatencyFeed } from "../hooks/use-latency-feed";
import { useLatencyHistoryStore } from "../hooks/use-latency-history";
import { generateLatencyReport, exportReportAsJSON, exportReportAsCSV } from "../utils/export-report";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";
  
  // Get data from stores
  const markers = useLatencyFeed((state) => state.markers);
  const aggregated = useLatencyFeed((state) => state.aggregated);
  const lastUpdated = useLatencyFeed((state) => state.lastUpdated);
  const status = useLatencyFeed((state) => state.status);
  const historyData = useLatencyHistoryStore((state) => state.data);

  const handleExport = async (format: "json" | "csv") => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      const report = generateLatencyReport(
        markers.map((m) => ({
          exchange: m.exchange,
          provider: m.provider,
          region: m.region,
          latencyMs: m.latencyMs,
          position: m.position,
        })),
        aggregated,
        lastUpdated,
        status,
        historyData
      );
      if (format === "json") {
        exportReportAsJSON(report);
      } else {
        exportReportAsCSV(report);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
          isDark
            ? "border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white"
            : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-200 hover:text-slate-900"
        } ${isExporting ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        {isExporting ? "Exporting..." : "Export Report"}
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div
            className={`absolute right-0 top-full mt-2 z-20 min-w-[180px] rounded-lg border shadow-lg ${
              isDark
                ? "border-slate-700 bg-slate-900 shadow-slate-900/50"
                : "border-slate-300 bg-slate-50 shadow-slate-900/20"
            }`}
          >
            <div className="p-1">
              <button
                onClick={() => handleExport("json")}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                  isDark
                    ? "text-slate-200 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  <span>Export as JSON</span>
                </div>
              </button>
              <button
                onClick={() => handleExport("csv")}
                className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                  isDark
                    ? "text-slate-200 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Export as CSV</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

