import pino from "pino";

export const serverLogger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        }
      : undefined,
});

export type LatencyLogPayload = {
  service: "latency-stream" | "latency-api" | "latency-simulator";
  exchange: string;
  provider: string;
  latencyMs: number;
  region: string;
};

export function logLatencyEvent(payload: LatencyLogPayload, message: string) {
  serverLogger.info(payload, message);
}

