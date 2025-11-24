"use client";

import { memo, useMemo, useState } from "react";
import { Html } from "@react-three/drei";
import { useLatencyFeed } from "../hooks/use-latency-feed";
import { useProviderFilter } from "../hooks/use-provider-filter";
import { useVisualizationLayers } from "../hooks/use-visualization-layers";
import * as THREE from "three";

type RegionCluster = {
  provider: string;
  region: string;
  position: [number, number, number];
  markers: Array<{
    exchange: string;
    position: [number, number, number];
  }>;
};

export const RegionVisualization = memo(function RegionVisualization() {
  const markers = useLatencyFeed((state) => state.markers);
  const visibleProviders = useProviderFilter((state) => state.visibleProviders);
  const showRegions = useVisualizationLayers((state) => state.showRegions);

  // Group markers by provider and region
  const regionClusters = useMemo(() => {
    if (!showRegions) return [];
    const clusters = new Map<string, RegionCluster>();

    markers.forEach((marker) => {
      if (!visibleProviders.has(marker.provider)) return;

      const key = `${marker.provider}-${marker.region}`;
      if (!clusters.has(key)) {
        clusters.set(key, {
          provider: marker.provider,
          region: marker.region,
          position: marker.position,
          markers: [],
        });
      }

      clusters.get(key)!.markers.push({
        exchange: marker.exchange,
        position: marker.position,
      });
    });

    // Calculate center position for each cluster
    return Array.from(clusters.values()).map((cluster) => {
      if (cluster.markers.length > 1) {
        const avgX =
          cluster.markers.reduce((sum, m) => sum + m.position[0], 0) /
          cluster.markers.length;
        const avgY =
          cluster.markers.reduce((sum, m) => sum + m.position[1], 0) /
          cluster.markers.length;
        const avgZ =
          cluster.markers.reduce((sum, m) => sum + m.position[2], 0) /
          cluster.markers.length;
        cluster.position = [avgX, avgY, avgZ];
      }
      return cluster;
    });
  }, [markers, visibleProviders, showRegions]);

  if (!showRegions) return null;

  return (
    <>
      {regionClusters.map((cluster, index) => (
        <RegionCluster
          key={`${cluster.provider}-${cluster.region}-${index}`}
          cluster={cluster}
        />
      ))}
    </>
  );
});

function RegionCluster({ cluster }: { cluster: RegionCluster }) {
  const [isHovered, setIsHovered] = useState(false);
  const radius = 0.12 + cluster.markers.length * 0.015;

  const providerColors = {
    AWS: { color: "#FF9900", emissive: "#CC7700" },
    GCP: { color: "#4285F4", emissive: "#1A73E8" },
    Azure: { color: "#0078D4", emissive: "#005A9E" },
    Fastly: { color: "#FF6900", emissive: "#CC5400" },
  };

  const colors = providerColors[cluster.provider as keyof typeof providerColors] || {
    color: "#94A3B8",
    emissive: "#64748B",
  };

  return (
    <group position={cluster.position}>
      {/* Region boundary circle - positioned slightly above globe surface */}
      <mesh
        onPointerEnter={() => setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
      >
        <ringGeometry args={[radius * 0.6, radius, 32]} />
        <meshStandardMaterial
          color={colors.color}
          emissive={colors.emissive}
          transparent
          opacity={isHovered ? 0.5 : 0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center indicator dot */}
      <mesh>
        <circleGeometry args={[radius * 0.25, 16]} />
        <meshStandardMaterial
          color={colors.color}
          emissive={colors.emissive}
          emissiveIntensity={isHovered ? 1.5 : 1}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Region info label */}
      {isHovered && (
        <Html
          position={[0, radius + 0.1, 0]}
          center
          className="pointer-events-none select-none"
        >
          <RegionInfoTooltip
            provider={cluster.provider}
            region={cluster.region}
            serverCount={cluster.markers.length}
            exchanges={cluster.markers.map((m) => m.exchange)}
          />
        </Html>
      )}
    </group>
  );
}

function RegionInfoTooltip({
  provider,
  region,
  serverCount,
  exchanges,
}: {
  provider: string;
  region: string;
  serverCount: number;
  exchanges: string[];
}) {
  return (
    <div className="min-w-[220px] rounded-xl border border-slate-700/60 bg-slate-950/95 p-4 shadow-2xl shadow-slate-900/80 backdrop-blur-md">
      <div className="space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Cloud Provider
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-100">
            {provider}
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Region Code
          </div>
          <div className="mt-1 text-sm font-medium text-slate-200">{region}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">
            Server Count
          </div>
          <div className="mt-1 text-sm font-semibold text-cyan-400">
            {serverCount} {serverCount === 1 ? "server" : "servers"}
          </div>
        </div>
        {exchanges.length > 0 && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                Exchanges
              </div>
              <div className="mt-1 text-xs font-medium text-slate-300">
                {exchanges.join(", ")}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

