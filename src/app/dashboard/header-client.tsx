"use client";

import Link from "next/link";
import { ThemeToggle } from "@/modules/latency/components/theme-toggle";
import { ExportButton } from "@/modules/latency/components/export-button";
import { useThemeSync, useTheme } from "@/modules/latency/hooks/use-theme";

const navItems = [
  {
    href: "/dashboard/latency",
    label: "Latency Globe",
  },
];

export function DashboardHeaderClient() {
  useThemeSync();
  const theme = useTheme((state) => state.theme);
  const mounted = useTheme((state) => state.mounted);
  // Default to dark during SSR to match initial client render
  const isDark = mounted ? theme === "dark" : true;

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur ${
        isDark
          ? "border-slate-800/60 bg-slate-950/80"
          : "border-slate-300/60 bg-slate-50/80"
      }`}
      suppressHydrationWarning
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full ring-1 ${
              isDark
                ? "bg-sky-500/20 text-sky-300 ring-sky-500/40"
                : "bg-sky-500/30 text-sky-600 ring-sky-500/50"
            }`}
          >
            QT
          </span>
          <div>
            <p
              className={`text-sm font-semibold uppercase tracking-[0.3em] ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Quant Test
            </p>
            <p
              className={`text-lg font-semibold ${
                isDark ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Latency Intelligence
            </p>
          </div>
        </div>
        <nav className="flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-1.5 transition ${
                isDark
                  ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                  : "text-slate-700 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className={`hidden rounded-full border px-4 py-1.5 transition md:inline-flex ${
              isDark
                ? "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
                : "border-slate-300 text-slate-700 hover:border-slate-400 hover:text-slate-900"
            }`}
          >
            View Docs
          </a>
          <ExportButton />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

