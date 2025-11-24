"use client";

import { create } from "zustand";

type DashboardFiltersState = {
  selectedExchanges: Set<string>;
  selectedProviders: Set<string>;
  latencyRange: [number, number];
  searchQuery: string;
  toggleExchange: (exchange: string) => void;
  toggleProvider: (provider: string) => void;
  setLatencyRange: (range: [number, number]) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
};

export const useDashboardFilters = create<DashboardFiltersState>((set) => ({
  selectedExchanges: new Set(),
  selectedProviders: new Set(),
  latencyRange: [0, 200],
  searchQuery: "",
  toggleExchange: (exchange) =>
    set((state) => {
      const newSet = new Set(state.selectedExchanges);
      if (newSet.has(exchange)) {
        newSet.delete(exchange);
      } else {
        newSet.add(exchange);
      }
      return { selectedExchanges: newSet };
    }),
  toggleProvider: (provider) =>
    set((state) => {
      const newSet = new Set(state.selectedProviders);
      if (newSet.has(provider)) {
        newSet.delete(provider);
      } else {
        newSet.add(provider);
      }
      return { selectedProviders: newSet };
    }),
  setLatencyRange: (range) => set({ latencyRange: range }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetFilters: () =>
    set({
      selectedExchanges: new Set(),
      selectedProviders: new Set(),
      latencyRange: [0, 200],
      searchQuery: "",
    }),
}));

