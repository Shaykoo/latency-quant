"use client";

import { useState } from "react";
import { useTheme } from "../hooks/use-theme";

type CollapsibleSectionProps = {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
};

export function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false,
  className = "",
}: CollapsibleSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";

  return (
    <div className={className}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`flex w-full items-center justify-between rounded-t-3xl border border-b-0 px-4 py-3 shadow-2xl transition-colors ${
          isDark
            ? "border-slate-800/80 bg-slate-950/60 shadow-sky-900/30 hover:bg-slate-900/40"
            : "border-slate-300/80 bg-slate-50/90 shadow-sky-900/10 hover:bg-slate-100/60"
        }`}
      >
        <h2
          className={`text-lg font-semibold ${
            isDark ? "text-slate-100" : "text-slate-900"
          }`}
        >
          {title}
        </h2>
        <svg
          className={`h-5 w-5 transition-transform ${
            isDark ? "text-slate-400" : "text-slate-600"
          } ${isCollapsed ? "" : "rotate-180"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        className={`overflow-hidden rounded-b-3xl border border-t-0 shadow-2xl transition-all duration-300 ease-in-out ${
          isDark
            ? "border-slate-800/80 bg-slate-950/60 shadow-sky-900/30"
            : "border-slate-300/80 bg-slate-50/90 shadow-sky-900/10"
        } ${isCollapsed ? "max-h-0 opacity-0" : "max-h-[2000px] opacity-100"}`}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

