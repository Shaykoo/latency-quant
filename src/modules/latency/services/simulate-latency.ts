import { nanoid } from "nanoid";
import {
  LatencyFrameSchema,
  LatencySample,
  LatencyStreamEnvelope,
} from "../schema";

type LatencyLocation = {
  exchange: LatencySample["exchange"];
  provider: LatencySample["provider"];
  region: string;
  latitude: number;
  longitude: number;
};

const LOCATIONS: LatencyLocation[] = [
  {
    exchange: "Binance",
    provider: "AWS",
    region: "ap-southeast-1",
    latitude: 1.3521,
    longitude: 103.8198,
  },
  {
    exchange: "Bybit",
    provider: "Fastly",
    region: "eu-west-3",
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    exchange: "Deribit",
    provider: "GCP",
    region: "us-central1",
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    exchange: "OKX",
    provider: "Azure",
    region: "jp-east",
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    exchange: "Coinbase",
    provider: "AWS",
    region: "us-east-1",
    latitude: 37.7749,
    longitude: -122.4194,
  },
];

export function generateLatencyFrame(): LatencyStreamEnvelope {
  const samples = LOCATIONS.map((location) => {
    // Calculate time-based jitter
    const jitter = Math.sin(Date.now() / 60000 + location.latitude) * 12;
    // Get provider-specific base latency
    const baseLatency =
      location.provider === "Fastly"
        ? randomBetween(45, 80)
        : location.provider === "Azure"
          ? randomBetween(60, 95)
          : randomBetween(55, 90);
    const latencyMs = Math.max(10, Math.round(baseLatency + jitter));

    return {
      id: nanoid(),
      exchange: location.exchange,
      provider: location.provider,
      region: location.region,
      latitude: location.latitude,
      longitude: location.longitude,
      latencyMs,
      recordedAt: new Date(),
    } satisfies LatencySample;
  });

  const values = samples.map((sample) => sample.latencyMs);
  const aggregated = {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: Number(
      (values.reduce((acc, current) => acc + current, 0) / values.length).toFixed(2),
    ),
    p95: percentile(values, 0.95),
  };

  const frame = LatencyFrameSchema.parse({
    frameId: nanoid(),
    samples,
    aggregated,
  });

  return { frame };
}

// Helper functions
function percentile(values: number[], percentileValue: number) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor(percentileValue * (sorted.length - 1));
  return sorted[index];
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

