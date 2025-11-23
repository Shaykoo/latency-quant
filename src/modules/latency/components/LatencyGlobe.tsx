"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { MarkersLayer } from "./markers-layer";
import { useLatencyStream } from "../hooks/use-latency-feed";

export function LatencyGlobe() {
  useLatencyStream();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative aspect-square w-full max-w-[620px] overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/60 shadow-2xl shadow-sky-900/30">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1.5, 2]}
        className="bg-slate-950"
      >
        <Suspense fallback={null}>
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
          <GlobeSurface />
          <MarkersLayer />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.35}
        />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-slate-700/40" />
    </div>
  );
}

function GlobeSurface() {
  return (
    <mesh>
      <sphereGeometry args={[1.5, 96, 96]} />
      <meshStandardMaterial
        color="#020617"
        emissive="#0f172a"
        roughness={0.3}
        metalness={0.2}
        envMapIntensity={0.6}
      />
    </mesh>
  );
}
