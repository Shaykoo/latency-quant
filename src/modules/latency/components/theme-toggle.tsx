"use client";

import { useTheme, useThemeMounted } from "../hooks/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const mounted = useThemeMounted();
  // Default to dark during SSR to match initial client render
  const isDark = mounted ? theme === "dark" : true;
  const displayTheme = mounted ? theme : "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
        isDark
          ? "border-slate-700/50 bg-slate-900/50 text-slate-300 hover:bg-slate-800/70 hover:text-slate-100"
          : "border-slate-300/50 bg-slate-100/50 text-slate-700 hover:bg-slate-200/70 hover:text-slate-900"
      }`}
      aria-label={`Switch to ${displayTheme === "dark" ? "light" : "dark"} mode`}
      suppressHydrationWarning
    >
      {displayTheme === "dark" ? (
        <>
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}

