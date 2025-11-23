import { z } from "zod";

const ExchangeEnum = z.enum(["Binance", "Bybit", "Deribit", "OKX", "Coinbase"]);
const ProviderEnum = z.enum(["AWS", "GCP", "Azure", "Fastly"]);

export const LatencySampleSchema = z.object({
  id: z.string(),
  exchange: ExchangeEnum,
  provider: ProviderEnum,
  region: z.string().min(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  latencyMs: z.number().min(0),
  recordedAt: z.coerce.date(),
});

export const AggregatedLatencySchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0),
  avg: z.number().min(0),
  p95: z.number().min(0),
});

export const LatencyFrameSchema = z.object({
  frameId: z.string(),
  samples: z.array(LatencySampleSchema).min(1),
  aggregated: AggregatedLatencySchema,
});

export const LatencyStreamEnvelopeSchema = z.object({
  frame: LatencyFrameSchema,
});

export type LatencySample = z.infer<typeof LatencySampleSchema>;
export type LatencyFrame = z.infer<typeof LatencyFrameSchema>;
export type LatencyStreamEnvelope = z.infer<
  typeof LatencyStreamEnvelopeSchema
>;

