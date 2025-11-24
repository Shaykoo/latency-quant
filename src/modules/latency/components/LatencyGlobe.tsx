"use client";

import { Suspense, useEffect, useState, useRef, createContext, useContext } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { MarkersLayer } from "./markers-layer";
import { LatencyConnections } from "./latency-connections";
import { RegionVisualization } from "./region-visualization";
import { LatencyHeatmap } from "./latency-heatmap";
import { useLatencyStream } from "../hooks/use-latency-feed";
import { useTheme } from "../hooks/use-theme";
import * as THREE from "three";

// Context to share hover state between markers and controls
export const MarkerHoverContext = createContext<{
  isMarkerHovered: boolean;
  setMarkerHovered: (hovered: boolean) => void;
}>({
  isMarkerHovered: false,
  setMarkerHovered: () => {},
});

export function LatencyGlobe() {
  useLatencyStream();
  const theme = useTheme((state) => state.theme);
  const isDark = theme === "dark";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-3xl border shadow-2xl ${
        isDark
          ? "border-slate-800/80 bg-slate-950/60 shadow-sky-900/30"
          : "border-slate-300/80 bg-slate-50/90 shadow-sky-900/10"
      }`}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1.5, 2]}
        className="!h-full !w-full"
        gl={{ alpha: false }}
      >
        <MarkerHoverProvider>
          <Suspense fallback={null}>
            <SkyBackground isDark={isDark} />
            {isDark ? (
              <>
                <ambientLight intensity={0.3} />
                <directionalLight
                  position={[5, 5, 5]}
                  intensity={1.2}
                  color="#38bdf8"
                />
                <directionalLight
                  position={[-5, -3, -4]}
                  intensity={0.7}
                  color="#a855f7"
                />
                <Stars radius={50} depth={20} fade factor={4} saturation={1} />
              </>
            ) : (
              <>
                <ambientLight intensity={0.8} />
                <directionalLight
                  position={[5, 5, 5]}
                  intensity={1.5}
                  color="#ffffff"
                />
                <directionalLight
                  position={[-5, 3, -4]}
                  intensity={0.4}
                  color="#87ceeb"
                />
                <fog attach="fog" args={["#e0f2fe", 10, 50]} />
              </>
            )}
            <GlobeSurface isDark={isDark} />
            <LatencyHeatmap />
            <RegionVisualization />
            <LatencyConnections />
            <MarkersLayer />
          </Suspense>
          <SmoothOrbitControls />
        </MarkerHoverProvider>
      </Canvas>
      <div
        className={`pointer-events-none absolute inset-0 rounded-3xl ring-1 ${
          isDark ? "ring-slate-700/40" : "ring-slate-300/40"
        }`}
      />
    </div>
  );
}

function MarkerHoverProvider({ children }: { children: React.ReactNode }) {
  const [isMarkerHovered, setMarkerHovered] = useState(false);

  return (
    <MarkerHoverContext.Provider value={{ isMarkerHovered, setMarkerHovered }}>
      {children}
    </MarkerHoverContext.Provider>
  );
}

function SmoothOrbitControls() {
  const controlsRef = useRef<any>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const { isMarkerHovered } = useContext(MarkerHoverContext);

  // Update controls every frame for smooth damping
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      autoRotate={!isInteracting && !isMarkerHovered}
      autoRotateSpeed={0.35}
      // Smooth damping for natural feel
      dampingFactor={0.05}
      // Zoom constraints
      minDistance={2.5}
      maxDistance={8}
      // Pan constraints (limit how far you can pan away from center)
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      // Smooth transitions
      enableDamping={true}
      // Interaction callbacks
      onStart={() => setIsInteracting(true)}
      onEnd={() => {
        setIsInteracting(false);
      }}
      // Mouse/touch controls
      mouseButtons={{
        LEFT: 0, // Rotate
        MIDDLE: 1, // Pan (with modifier)
        RIGHT: 2, // Pan
      }}
      touches={{
        ONE: 0, // Rotate
        TWO: 2, // Zoom
      }}
      // Smooth zoom speed
      zoomSpeed={0.8}
      // Smooth rotation speed
      rotateSpeed={0.5}
      // Smooth pan speed
      panSpeed={0.8}
    />
  );
}

function SkyBackground({ isDark }: { isDark: boolean }) {
  const { scene } = useThree();
  
  useEffect(() => {
    if (isDark) {
      scene.background = new THREE.Color("#020617");
    } else {
      // Create a gradient sky background
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext("2d");
      if (context) {
        const gradient = context.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, "#bfdbfe"); // Light blue at top
        gradient.addColorStop(0.5, "#93c5fd"); // Medium blue in middle
        gradient.addColorStop(1, "#dbeafe"); // Very light blue at bottom
        context.fillStyle = gradient;
        context.fillRect(0, 0, 256, 256);
        const texture = new THREE.CanvasTexture(canvas);
        scene.background = texture;
      }
    }
  }, [isDark, scene]);

  return null;
}

function GlobeSurface({ isDark }: { isDark: boolean }) {
  return (
    <mesh>
      <sphereGeometry args={[1.5, 96, 96]} />
      <meshStandardMaterial
        color={isDark ? "#020617" : "#1e40af"}
        emissive={isDark ? "#0f172a" : "#3b82f6"}
        emissiveIntensity={isDark ? 0.1 : 0.3}
        roughness={isDark ? 0.3 : 0.5}
        metalness={isDark ? 0.2 : 0.1}
        envMapIntensity={isDark ? 0.6 : 0.8}
      />
    </mesh>
  );
}
