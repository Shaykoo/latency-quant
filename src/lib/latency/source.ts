import { generateLatencyFrame } from "@/modules/latency/services/simulate-latency";
import { logLatencyEvent } from "@/lib/logger";

export type LatencyFrameListener = (payload: ReturnType<typeof generateLatencyFrame>) => void;

const STREAM_INTERVAL_MS = Number(process.env.LATENCY_STREAM_INTERVAL_MS ?? 5000);
const HEARTBEAT_INTERVAL_MS = 15_000;

export function createLatencyPoller(
  onFrame: LatencyFrameListener,
  signal: AbortSignal,
) {
  let timer: NodeJS.Timeout | undefined;

  const loop = () => {
    if (signal.aborted) {
      cleanup();
      return;
    }

    const envelope = generateLatencyFrame();
    const [sample] = envelope.frame.samples;
    if (sample) {
      logLatencyEvent(
        {
          service: "latency-simulator",
          exchange: sample.exchange,
          provider: sample.provider,
          latencyMs: sample.latencyMs,
          region: sample.region,
        },
        "simulated-latency-frame",
      );
    }
    onFrame(envelope);
  };

  const cleanup = () => {
    if (timer) safeClearInterval(timer);
  };

  loop();
  timer = setInterval(loop, STREAM_INTERVAL_MS);

  signal.addEventListener("abort", cleanup, { once: true });

  return cleanup;
}

export function createHeartbeat(
  safeEnqueue: (chunk: Uint8Array) => void,
) {
  const encoder = new TextEncoder();
  const interval = setInterval(() => {
    safeEnqueue(encoder.encode(`event: heartbeat\ndata: {}\n\n`));
  }, HEARTBEAT_INTERVAL_MS);

  return () => clearInterval(interval);
}

