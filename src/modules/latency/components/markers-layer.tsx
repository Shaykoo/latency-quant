"use client";

import { memo } from "react";
import { Sphere, Html } from "@react-three/drei";
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
};

function Marker({ position, color, emissive, label, latencyMs }: MarkerProps) {
  return (
    <group position={position}>
      <Sphere args={[0.045, 16, 16]}>
        <meshStandardMaterial color={color} emissive={emissive} />
      </Sphere>
      <Html
        position={[0, 0.12, 0]}
        center
        className="pointer-events-none select-none rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-100 shadow-lg shadow-slate-900/70 backdrop-blur"
      >
        {label}
        <span className="ml-2 text-[11px] text-slate-400">{latencyMs}ms</span>
      </Html>
    </group>
  );
}

