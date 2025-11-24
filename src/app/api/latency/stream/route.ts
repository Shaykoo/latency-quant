import { NextResponse } from "next/server";
import { createLatencyPoller, createHeartbeat } from "@/lib/latency/source";
import { logLatencyEvent, serverLogger } from "@/lib/logger";
import { LatencyStreamEnvelopeSchema } from "@/modules/latency/schema";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const abortController = new AbortController();
      let isClosed = false;

      const shutdown = (reason?: unknown) => {
        if (isClosed) return;
        isClosed = true;

        abortController.abort();
        heartbeatCleanup();
        controller.close();
        serverLogger.info({ service: "latency-stream", reason }, "stream-closed");
      };

      const safeEnqueue = (chunk: Uint8Array) => {
        if (isClosed) return;

        try {
          controller.enqueue(chunk);
        } catch (error) {
          isClosed = true;
          serverLogger.warn(
            {
              service: "latency-stream",
              error: error instanceof Error ? error.message : error,
            },
            "stream-enqueue-failed",
          );
        }
      };

      const pollerCleanup = createLatencyPoller(
        (payload) => {
          if (isClosed) return;

          const envelope = LatencyStreamEnvelopeSchema.parse(payload);
          envelope.frame.samples.slice(0, 3).forEach((sample) =>
            logLatencyEvent(
              {
                service: "latency-stream",
                exchange: sample.exchange,
                provider: sample.provider,
                latencyMs: sample.latencyMs,
                region: sample.region,
              },
              "latency-frame-broadcast",
            ),
          );

          safeEnqueue(
            encoder.encode(
              `event: latency-frame\ndata: ${JSON.stringify(envelope)}\n\n`,
            ),
          );
        },
        abortController.signal,
      );

      const heartbeatCleanup = createHeartbeat(safeEnqueue);

      safeEnqueue(encoder.encode(`event: ready\ndata: {}\n\n`));

      abortController.signal.addEventListener(
        "abort",
        () => pollerCleanup(),
        { once: true },
      );

      return () => shutdown("client-disconnected");
    },
    cancel(reason) {
      serverLogger.warn({ service: "latency-stream", reason }, "stream-cancelled");
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    },
  });
}

