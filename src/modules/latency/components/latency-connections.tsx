"use client";

import { memo, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useLatencyFeed } from "../hooks/use-latency-feed";
import { useProviderFilter } from "../hooks/use-provider-filter";
import { useDashboardFilters } from "../hooks/use-dashboard-filters";
import { useVisualizationLayers } from "../hooks/use-visualization-layers";
import * as THREE from "three";

export const LatencyConnections = memo(function LatencyConnections() {
  const markers = useLatencyFeed((state) => state.markers);
  const visibleProviders = useProviderFilter((state) => state.visibleProviders);
  const { selectedExchanges, selectedProviders, latencyRange } = useDashboardFilters();
  const showConnections = useVisualizationLayers(
    (state) => state.showConnections,
  );

  // Filter markers using the same logic as MarkersLayer
  const filteredMarkers = useMemo(() => {
    return markers.filter((marker) => {
      // Provider filter
      if (!visibleProviders.has(marker.provider)) return false;

      // Exchange filter
      if (
        selectedExchanges.size > 0 &&
        !selectedExchanges.has(marker.exchange)
      ) {
        return false;
      }

      // Provider filter from control panel
      if (
        selectedProviders.size > 0 &&
        !selectedProviders.has(marker.provider)
      ) {
        return false;
      }

      // Latency range filter
      if (
        marker.latencyMs < latencyRange[0] ||
        marker.latencyMs > latencyRange[1]
      ) {
        return false;
      }

      return true;
    });
  }, [markers, visibleProviders, selectedExchanges, selectedProviders, latencyRange]);

  // Create connections between filtered markers only
  const connections = useMemo(() => {
    if (!showConnections) return [];
    const conns: Array<{
      from: [number, number, number];
      to: [number, number, number];
      latency: number;
      color: string;
    }> = [];

    for (let i = 0; i < filteredMarkers.length; i++) {
      for (let j = i + 1; j < filteredMarkers.length; j++) {
        const from = filteredMarkers[i];
        const to = filteredMarkers[j];
        // Use average latency for connection color
        const avgLatency = (from.latencyMs + to.latencyMs) / 2;
        conns.push({
          from: from.position,
          to: to.position,
          latency: avgLatency,
          color: latencyToConnectionColor(avgLatency),
        });
      }
    }

    return conns;
  }, [filteredMarkers, showConnections]);

  if (!showConnections) return null;

  return (
    <>
      {connections.map((conn, index) => (
        <AnimatedConnection
          key={`${conn.from[0]}-${conn.from[1]}-${conn.to[0]}-${conn.to[1]}-${index}`}
          from={conn.from}
          to={conn.to}
          color={conn.color}
          latency={conn.latency}
        />
      ))}
    </>
  );
});

function AnimatedConnection({
  from,
  to,
  color,
  latency,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
  latency: number;
}) {
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Create curved path between two points
  const curve = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);

    // Calculate midpoint and elevate it to create an arc
    const midpoint = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    const elevation = distance * 0.3; // Arc height
    midpoint.normalize().multiplyScalar(1.5 + elevation);

    const curve = new THREE.CatmullRomCurve3([start, midpoint, end]);
    return curve;
  }, [from, to]);

  // Create geometry for the connection line
  const geometry = useMemo(() => {
    const points = curve.getPoints(50);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [curve]);

  // Animate pulse along the connection
  useFrame((state, delta) => {
    timeRef.current += delta * 0.8; // Speed of pulse animation

    if (pulseRef.current) {
      // Move pulse along the curve
      const progress = (timeRef.current % 2.5) / 2.5; // 0 to 1, loops every 2.5 seconds
      const point = curve.getPointAt(progress);
      pulseRef.current.position.copy(point);

      // Scale pulse based on progress for smooth animation
      const scale = Math.sin(progress * Math.PI) * 0.4 + 0.6;
      pulseRef.current.scale.setScalar(scale);
    }

    // Animate line opacity for breathing effect
    if (materialRef.current) {
      const opacity = 0.25 + Math.sin(timeRef.current * 0.8) * 0.15;
      materialRef.current.opacity = Math.max(0.2, Math.min(0.5, opacity));
    }

    // Position latency label at midpoint
    if (labelRef.current) {
      const midpoint = curve.getPointAt(0.5);
      labelRef.current.position.copy(midpoint);
    }
  });

  return (
    <group>
      {/* Main connection arc */}
      <line>
        <primitive object={geometry} />
        <lineBasicMaterial
          ref={materialRef}
          color={color}
          transparent
          opacity={0.35}
          linewidth={1.5}
        />
      </line>

      {/* Animated pulse sphere traveling along the connection */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Latency value label at midpoint */}
      <group ref={labelRef}>
        <Html
          center
          className="pointer-events-none select-none"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          <div
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm"
            style={{
              backgroundColor: `${color}20`,
              color: color,
              border: `1px solid ${color}40`,
              boxShadow: `0 0 8px ${color}30`,
            }}
          >
            {latency.toFixed(0)}ms
          </div>
        </Html>
      </group>
    </group>
  );
}

/**
 * Maps latency to connection color
 * Green for low (< 60ms), Yellow for medium (60-100ms), Red for high (> 100ms)
 */
function latencyToConnectionColor(latency: number): string {
  if (latency < 60) return "#22c55e"; // Green - low latency
  if (latency < 100) return "#eab308"; // Yellow - medium latency
  return "#ef4444"; // Red - high latency
}

