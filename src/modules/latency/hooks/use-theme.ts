"use client";

import { create } from "zustand";
import { useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeState = {
  theme: Theme;
  mounted: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setMounted: (mounted: boolean) => void;
};

const applyTheme = (theme: Theme) => {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.setAttribute("data-theme", theme);
};

export const useTheme = create<ThemeState>((set, get) => {
  // Always default to "dark" for SSR - will be updated on client mount
  return {
    theme: "dark",
    mounted: false,
    toggleTheme: () => {
      const currentTheme = get().theme;
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      set({ theme: newTheme });
      if (typeof window !== "undefined") {
        localStorage.setItem("latency-dashboard-theme", newTheme);
        applyTheme(newTheme);
      }
    },
    setTheme: (theme: Theme) => {
      set({ theme });
      if (typeof window !== "undefined") {
        localStorage.setItem("latency-dashboard-theme", theme);
        applyTheme(theme);
      }
    },
    setMounted: (mounted: boolean) => set({ mounted }),
  };
});

// Hook to sync theme on mount and prevent hydration mismatch
export function useThemeSync() {
  const { setTheme, setMounted } = useTheme();

  useEffect(() => {
    // Only after mount, read from localStorage and apply
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("latency-dashboard-theme") as Theme | null;
      // Default to "dark" if no saved preference, otherwise use saved preference
      const themeToApply = savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark";
      
      setTheme(themeToApply);
      applyTheme(themeToApply);
      setMounted(true);
    }
  }, [setTheme, setMounted]);
}

// Hook to check if theme is mounted (to prevent hydration mismatch)
export function useThemeMounted() {
  return useTheme((state) => state.mounted);
}

