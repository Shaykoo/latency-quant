"use client";

import { create } from "zustand";

type VisualizationLayersState = {
  showRealtime: boolean;
  showHistorical: boolean;
  showRegions: boolean;
  showConnections: boolean;
  toggleRealtime: () => void;
  toggleHistorical: () => void;
  toggleRegions: () => void;
  toggleConnections: () => void;
};

export const useVisualizationLayers = create<VisualizationLayersState>((set) => ({
  showRealtime: true,
  showHistorical: true,
  showRegions: true,
  showConnections: true,
  toggleRealtime: () => set((state) => ({ showRealtime: !state.showRealtime })),
  toggleHistorical: () =>
    set((state) => ({ showHistorical: !state.showHistorical })),
  toggleRegions: () => set((state) => ({ showRegions: !state.showRegions })),
  toggleConnections: () =>
    set((state) => ({ showConnections: !state.showConnections })),
}));

