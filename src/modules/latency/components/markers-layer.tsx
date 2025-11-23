"use client";

import { memo, useState, useRef, useEffect } from "react";
import { Html } from "@react-three/drei";
import type { Mesh } from "three";
import { useLatencyFeed } from "../hooks/use-latency-feed";

export const MarkersLayer = memo(function MarkersLayer() {
  const markers = useLatencyFeed((state) => state.markers);

  return (
    <>
      {markers.map(({ id, ...markerProps }) => (
        <Marker key={id} {...markerProps} />
      ))}
    </>
  );
});

type MarkerProps = (typeof useLatencyFeed extends never ? never : never) & {
  position: [number, number, number];
  color: string;
  emissive: string;
  label: string;
  latencyMs: number;
  exchange: string;
  provider: string;
  region: string;
};

function Marker({
  position,
  color,
  emissive,
  label,
  latencyMs,
  exchange,
  provider,
  region,
}: MarkerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const meshRef = useRef<Mesh>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!isHovered) return;

    const handleClickOutside = () => {
      setIsHovered(false);
    };

    // Small delay to avoid immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside, true);
    };
  }, [isHovered]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          if (document.body) {
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setIsHovered(false);
          if (document.body) {
            document.body.style.cursor = "auto";
          }
        }}
      >
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isHovered ? 1.5 : 1}
        />
      </mesh>
      <Html
        position={[0, 0.12, 0]}
        center
        className="pointer-events-none select-none rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-100 shadow-lg shadow-slate-900/70 backdrop-blur"
      >
        {label}
      </Html>
      {isHovered && (
        <Html
          position={[0, 0.25, 0]}
          center
          className="pointer-events-none select-none"
        >
          <ServerInfoTooltip
            exchange={exchange}
            region={region}
            provider={provider}
            latencyMs={latencyMs}
          />
        </Html>
      )}
    </group>
  );
}

function ServerInfoTooltip({
  exchange,
  region,
  provider,
  latencyMs,
}: {
  exchange: string;
  region: string;
  provider: string;
  latencyMs: number;
}) {
  return (
    <div className="min-w-[200px] rounded-xl border border-slate-700/60 bg-slate-950/95 p-4 shadow-2xl shadow-slate-900/80 backdrop-blur-md">
      <div className="space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Exchange
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-100">
            {exchange}
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Location
          </div>
          <div className="mt-1 text-sm font-medium text-slate-200">{region}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Cloud Provider
          </div>
          <div className="mt-1 text-sm font-medium text-slate-200">{provider}</div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Latency
          </div>
          <div className="mt-1 text-sm font-semibold text-cyan-400">
            {latencyMs.toFixed(0)}ms
          </div>
        </div>
      </div>
    </div>
  );
}

