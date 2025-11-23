"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { LatencyFrame } from "../schema";

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
      markers: frame.samples.map((sample) => ({
        id: sample.id,
        position: latLongToCartesian(sample.latitude, sample.longitude, 1.5),
        color: latencyToColor(sample.latencyMs),
        emissive: latencyToEmissive(sample.latencyMs),
        label: `${sample.exchange} • ${sample.latencyMs.toFixed(0)}ms`,
        latencyMs: sample.latencyMs,
        exchange: sample.exchange,
        provider: sample.provider,
        region: sample.region,
      })),
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

function latencyToColor(latency: number) {
  if (latency <= 40) return "#22d3ee";
  if (latency <= 70) return "#38bdf8";
  if (latency <= 100) return "#fb923c";
  return "#f87171";
}

function latencyToEmissive(latency: number) {
  if (latency <= 40) return "#0e7490";
  if (latency <= 70) return "#0369a1";
  if (latency <= 100) return "#b45309";
  return "#b91c1c";
}

