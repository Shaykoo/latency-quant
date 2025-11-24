"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { LatencyFrame } from "../schema";
import { useLatencyHistoryStore } from "./use-latency-history";

type Marker = {
  id: string;
  position: [number, number, number];
  color: string;
  emissive: string;
  label: string;
  latencyMs: number;
  exchange: string;
  provider: string;
  region: string;
};

type LatencyFeedState = {
  status: "connecting" | "streaming" | "error";
  markers: Marker[];
  aggregated: LatencyFrame["aggregated"] | null;
  lastUpdated: Date | null;
  errorMessage: string | null;
  setFrame: (frame: LatencyFrame) => void;
  setError: (message: string) => void;
};

const useLatencyFeedStore = create<LatencyFeedState>((set) => ({
  status: "connecting",
  markers: [],
  aggregated: null,
  lastUpdated: null,
  errorMessage: null,
  setFrame: (frame) =>
    set({
      status: "streaming",
      markers: frame.samples.map((sample) => {
        const providerColors = providerToColor(sample.provider);
        return {
        id: sample.id,
        position: latLongToCartesian(sample.latitude, sample.longitude, 1.5),
          color: providerColors.color,
          emissive: providerColors.emissive,
          label: sample.exchange,
        latencyMs: sample.latencyMs,
          exchange: sample.exchange,
        provider: sample.provider,
        region: sample.region,
        };
      }),
      aggregated: frame.aggregated,
      lastUpdated: new Date(frame.samples[0]?.recordedAt ?? Date.now()),
      errorMessage: null,
    }),
  setError: (message) =>
    set({
      status: "error",
      errorMessage: message,
    }),
}));

export function useLatencyFeed<T>(
  selector: (state: LatencyFeedState) => T,
): T {
  return useLatencyFeedStore(selector);
}

export function useLatencyStream() {
  useEffect(() => {
    let eventSource: EventSource | null = null;
    const reconnectTimeout = { current: 0 };

    const connect = () => {
      if (eventSource) {
        eventSource.close();
      }

      eventSource = new EventSource("/api/latency/stream");

      eventSource.addEventListener("ready", () => {
        useLatencyFeedStore.setState({ status: "streaming" });
      });

      eventSource.addEventListener("latency-frame", (event) => {
        try {
          const payload = JSON.parse(event.data) as { frame: LatencyFrame };
          useLatencyFeedStore.getState().setFrame(payload.frame);
          // Accumulate historical data
          useLatencyHistoryStore.getState().addFrame(payload.frame);
        } catch (error) {
          useLatencyFeedStore
            .getState()
            .setError(
              error instanceof Error ? error.message : "Failed to parse frame",
            );
        }
      });

      eventSource.onerror = () => {
        useLatencyFeedStore
          .getState()
          .setError("Latency stream disconnected. Attempting to reconnect…");
        eventSource?.close();

        window.clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = window.setTimeout(() => {
          useLatencyFeedStore.setState({ status: "connecting" });
          connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      window.clearTimeout(reconnectTimeout.current);
    };
  }, []);
}

function latLongToCartesian(
  latitude: number,
  longitude: number,
  radius: number,
): [number, number, number] {
  const phi = ((90 - latitude) * Math.PI) / 180;
  const theta = ((longitude + 180) * Math.PI) / 180;

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}

/**
 * Maps cloud providers to their distinct brand colors
 * Each provider has a unique, recognizable color scheme
 */
function providerToColor(provider: string): { color: string; emissive: string } {
  switch (provider) {
    case "AWS":
      return {
        color: "#FF9900", // AWS Orange
        emissive: "#CC7700", // Darker orange for glow
      };
    case "GCP":
      return {
        color: "#4285F4", // Google Cloud Blue
        emissive: "#1A73E8", // Darker blue for glow
      };
    case "Azure":
      return {
        color: "#0078D4", // Microsoft Azure Blue
        emissive: "#005A9E", // Darker blue for glow
      };
    case "Fastly":
      return {
        color: "#FF6900", // Fastly Orange
        emissive: "#CC5400", // Darker orange for glow
      };
    default:
      return {
        color: "#94A3B8", // Neutral slate for unknown providers
        emissive: "#64748B",
      };
  }
}

