"use client";

import { create } from "zustand";
import type { LatencyFrame } from "../schema";

export type TimeRange = "1m" | "1h" | "24h" | "7d" | "30d";

export type HistoricalDataPoint = {
  timestamp: Date;
  exchange: string;
  provider: string;
  region: string;
  latencyMs: number;
};

type LatencyHistoryState = {
  data: HistoricalDataPoint[];
  addFrame: (frame: LatencyFrame) => void;
  getDataForPair: (
    exchange1: string,
    exchange2: string | null,
    timeRange: TimeRange,
  ) => HistoricalDataPoint[];
  getDataForRegion: (region: string, timeRange: TimeRange) => HistoricalDataPoint[];
  getStatistics: (
    data: HistoricalDataPoint[],
  ) => { min: number; max: number; avg: number };
  clearOldData: (maxAgeMs: number) => void;
};

const useLatencyHistoryStore = create<LatencyHistoryState>((set, get) => ({
  data: [],
  addFrame: (frame) => {
    // Always use current time when frame is received to ensure data is queryable
    // This ensures that when filtering by time range, we get recent data
    const now = new Date();
    const newPoints: HistoricalDataPoint[] = frame.samples.map((sample) => ({
      timestamp: now, // Use current time, not recordedAt, so data is always fresh
      exchange: sample.exchange,
      provider: sample.provider,
      region: sample.region,
      latencyMs: sample.latencyMs,
    }));

    set((state) => {
      const newData = [...state.data, ...newPoints];
      // Clean up old data (keep last 30 days) - but only if we have enough data
      if (newData.length > 1000) {
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return {
          data: newData.filter((point) => point.timestamp >= cutoff),
        };
      }
      return { data: newData };
    });
  },
  getDataForPair: (exchange1, exchange2, timeRange) => {
    const state = get();
    const cutoffTime = getCutoffTime(timeRange);
    const now = new Date();
    
    return state.data.filter((point) => {
      // Ensure timestamp is a Date object
      const pointTime = point.timestamp instanceof Date 
        ? point.timestamp 
        : new Date(point.timestamp);
      
      const isInRange = pointTime >= cutoffTime;
      const exchangeMatch = exchange2
        ? (point.exchange === exchange1 || point.exchange === exchange2)
        : point.exchange === exchange1;
      
      return isInRange && exchangeMatch;
    });
  },
  getDataForRegion: (region, timeRange) => {
    const state = get();
    const cutoffTime = getCutoffTime(timeRange);
    
    return state.data.filter((point) => {
      // Ensure timestamp is a Date object
      const pointTime = point.timestamp instanceof Date 
        ? point.timestamp 
        : new Date(point.timestamp);
      
      return point.region === region && pointTime >= cutoffTime;
    });
  },
  getStatistics: (data) => {
    if (data.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }
    const latencies = data.map((d) => d.latencyMs);
    return {
      min: Math.min(...latencies),
      max: Math.max(...latencies),
      avg: latencies.reduce((sum, val) => sum + val, 0) / latencies.length,
    };
  },
  clearOldData: (maxAgeMs) => {
    const cutoff = new Date(Date.now() - maxAgeMs);
    set((state) => ({
      data: state.data.filter((point) => point.timestamp >= cutoff),
    }));
  },
}));

function getCutoffTime(timeRange: TimeRange): Date {
  const now = Date.now();
  const ranges = {
    "1m": 2 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };
  return new Date(now - ranges[timeRange]);
}

export function useLatencyHistory() {
  return useLatencyHistoryStore();
}

// Export the store for direct access if needed
export { useLatencyHistoryStore };


