"use client";

import { useMemo, useEffect, useRef } from "react";
import { useLatencyFeed } from "../hooks/use-latency-feed";
import { useVisualizationLayers } from "../hooks/use-visualization-layers";
import { useProviderFilter } from "../hooks/use-provider-filter";
import { useDashboardFilters } from "../hooks/use-dashboard-filters";
import * as THREE from "three";

// Convert lat/long to UV coordinates (0-1 range)
function latLongToUV(lat: number, lon: number): [number, number] {
  const u = (lon + 180) / 360;
  const v = 1 - (lat + 90) / 180;
  return [u, v];
}

// Convert 3D position back to lat/long (approximate)
function cartesianToLatLong(x: number, y: number, z: number): [number, number] {
  const radius = 1.5;
  const lat = Math.asin(Math.max(-1, Math.min(1, y / radius))) * (180 / Math.PI);
  const lon = Math.atan2(-x, z) * (180 / Math.PI);
  return [lat, lon];
}

// Heatmap color gradient: blue (low) -> green -> yellow -> red (high)
function latencyToColor(latency: number, minLatency: number, maxLatency: number): string {
  const normalized = Math.max(0, Math.min(1, (latency - minLatency) / (maxLatency - minLatency || 1)));
  
  if (normalized < 0.25) {
    // Blue to Cyan
    const t = normalized / 0.25;
    const r = Math.round(0);
    const g = Math.round(100 + t * 155);
    const b = Math.round(200 + t * 55);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (normalized < 0.5) {
    // Cyan to Green
    const t = (normalized - 0.25) / 0.25;
    const r = Math.round(0);
    const g = Math.round(255);
    const b = Math.round(255 - t * 255);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (normalized < 0.75) {
    // Green to Yellow
    const t = (normalized - 0.5) / 0.25;
    const r = Math.round(t * 255);
    const g = Math.round(255);
    const b = Math.round(0);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Yellow to Red
    const t = (normalized - 0.75) / 0.25;
    const r = Math.round(255);
    const g = Math.round(255 - t * 255);
    const b = Math.round(0);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// Create heatmap texture from marker data
function createHeatmapTexture(
  markers: Array<{
    position: [number, number, number];
    latencyMs: number;
    exchange: string;
  }>,
  width: number = 1024,
  height: number = 512
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, width, height);

  if (markers.length === 0) {
    return new THREE.CanvasTexture(canvas);
  }

  // Get latency range
  const latencies = markers.map((m) => m.latencyMs);
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);

  // Create a grid for heatmap interpolation
  const gridSize = 64;
  const grid: number[][] = Array(gridSize)
    .fill(0)
    .map(() => Array(gridSize * 2).fill(0));
  const weights: number[][] = Array(gridSize)
    .fill(0)
    .map(() => Array(gridSize * 2).fill(0));

  // Project markers onto grid with Gaussian falloff
  const radius = 0.15; // Influence radius in UV space
  markers.forEach((marker) => {
    // Convert 3D position back to lat/long
    const [x, y, z] = marker.position;
    const [lat, lon] = cartesianToLatLong(x, y, z);
    const [u, v] = latLongToUV(lat, lon);

    const gridX = Math.floor(u * gridSize * 2);
    const gridY = Math.floor(v * gridSize);

    // Apply Gaussian falloff to nearby grid cells
    for (let dy = -Math.ceil(radius * gridSize); dy <= Math.ceil(radius * gridSize); dy++) {
      for (let dx = -Math.ceil(radius * gridSize * 2); dx <= Math.ceil(radius * gridSize * 2); dx++) {
        const gx = gridX + dx;
        const gy = gridY + dy;
        if (gx >= 0 && gx < gridSize * 2 && gy >= 0 && gy < gridSize) {
          const dist = Math.sqrt(dx * dx + dy * dy) / (gridSize * radius);
          if (dist < 1) {
            const weight = Math.exp(-(dist * dist) * 2);
            grid[gy][gx] += marker.latencyMs * weight;
            weights[gy][gx] += weight;
          }
        }
      }
    }
  });

  // Normalize grid values
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize * 2; x++) {
      if (weights[y][x] > 0) {
        grid[y][x] /= weights[y][x];
      }
    }
  }

  // Render heatmap
  const cellWidth = width / (gridSize * 2);
  const cellHeight = height / gridSize;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize * 2; x++) {
      if (grid[y][x] > 0) {
        const color = latencyToColor(grid[y][x], minLatency, maxLatency);
        ctx.fillStyle = color;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
  }

  // Apply blur for smoother transitions
  ctx.filter = "blur(8px)";
  ctx.globalAlpha = 0.6;
  ctx.drawImage(canvas, 0, 0);
  ctx.globalAlpha = 1.0;
  ctx.filter = "none";

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return texture;
}

export function LatencyHeatmap() {
  const showHeatmap = useVisualizationLayers((state) => state.showHeatmap);
  const markers = useLatencyFeed((state) => state.markers);
  const visibleProviders = useProviderFilter((state) => state.visibleProviders);
  const { selectedExchanges, selectedProviders, latencyRange } = useDashboardFilters();
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  // Filter markers
  const filteredMarkers = useMemo(() => {
    return markers.filter((marker) => {
      if (!visibleProviders.has(marker.provider)) return false;
      if (selectedExchanges.size > 0 && !selectedExchanges.has(marker.exchange)) return false;
      if (selectedProviders.size > 0 && !selectedProviders.has(marker.provider)) return false;
      if (marker.latencyMs < latencyRange[0] || marker.latencyMs > latencyRange[1]) return false;
      return true;
    });
  }, [markers, visibleProviders, selectedExchanges, selectedProviders, latencyRange]);

  // Create or update heatmap texture
  useEffect(() => {
    if (!showHeatmap || filteredMarkers.length === 0) {
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
      return;
    }

    const texture = createHeatmapTexture(filteredMarkers);
    textureRef.current = texture;

    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.map = texture;
      material.needsUpdate = true;
    }

    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
      }
    };
  }, [showHeatmap, filteredMarkers]);

  if (!showHeatmap || filteredMarkers.length === 0) {
    return null;
  }

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.501, 96, 96]} />
      <meshStandardMaterial
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
        map={textureRef.current || undefined}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

