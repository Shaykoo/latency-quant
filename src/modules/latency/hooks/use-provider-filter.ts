"use client";

import { create } from "zustand";

type ProviderFilterState = {
  visibleProviders: Set<string>;
  toggleProvider: (provider: string) => void;
  setProviderVisible: (provider: string, visible: boolean) => void;
  reset: () => void;
};

export const useProviderFilter = create<ProviderFilterState>((set) => ({
  visibleProviders: new Set(["AWS", "GCP", "Azure", "Fastly"]),
  toggleProvider: (provider) =>
    set((state) => {
      const newSet = new Set(state.visibleProviders);
      if (newSet.has(provider)) {
        newSet.delete(provider);
      } else {
        newSet.add(provider);
      }
      return { visibleProviders: newSet };
    }),
  setProviderVisible: (provider, visible) =>
    set((state) => {
      const newSet = new Set(state.visibleProviders);
      if (visible) {
        newSet.add(provider);
      } else {
        newSet.delete(provider);
      }
      return { visibleProviders: newSet };
    }),
  reset: () =>
    set({
      visibleProviders: new Set(["AWS", "GCP", "Azure", "Fastly"]),
    }),
}));

