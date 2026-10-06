'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useConfiguratorStore,
  type ConfiguratorState,
} from '@/stores/useConfiguratorStore';
import { type HotspotDef } from '@/config/vehicles';

function HotspotMarker({ data }: { data: HotspotDef }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  const activeHotspot = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeHotspot
  );
  const scrollProgress = useConfiguratorStore(
    (s: ConfiguratorState) => s.scrollProgress
  );
  const headlightsOn = useConfiguratorStore(
    (s: ConfiguratorState) => s.headlightsOn
  );
  const engineOn = useConfiguratorStore((s: ConfiguratorState) => s.engineOn);
  const setActiveHotspot = useConfiguratorStore(
    (s: ConfiguratorState) => s.setActiveHotspot
  );
  const toggleHeadlights = useConfiguratorStore(
    (s: ConfiguratorState) => s.toggleHeadlights
  );
  const toggleEngine = useConfiguratorStore(
    (s: ConfiguratorState) => s.toggleEngine
  );

  const isOpen = activeHotspot === data.id;
  const isHeadlight = data.id === 'headlight';
  const isAnotherOpen = activeHotspot !== null && !isOpen;

  const inEmphasis = useMemo(() => {
    if (!data.emphasisRange) return false;
    const [a, b] = data.emphasisRange;
    return scrollProgress >= a && scrollProgress <= b;
  }, [scrollProgress, data.emphasisRange]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const breath = 1 + Math.sin(t * 2.5) * 0.15;

    if (ringRef.current) {
      ringRef.current.scale.setScalar(breath);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = isAnotherOpen ? 0.1 : isOpen ? 1.0 : 0.85;
      }
    }

    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        if (isAnotherOpen) {
          mat.opacity = 0.15;
        } else if (isHeadlight && headlightsOn) {
          mat.color.set('#E6A100');
          mat.opacity = 1;
        } else if (isOpen) {
          mat.color.set('#D92B2B');
          mat.opacity = 1;
        } else {
          mat.color.set('#E6A100');
          mat.opacity = 1;
        }
      }
    }
  });

  const handleMeshClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      setActiveHotspot(isOpen ? null : data.id);
    },
    [data.id, isOpen, setActiveHotspot]
  );

  const handleDomClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      setActiveHotspot(isOpen ? null : data.id);
    },
    [data.id, isOpen, setActiveHotspot]
  );

  return (
    <group position={data.position}>
      {/* 3D Hit Area */}
      <mesh
        onClick={handleMeshClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Outer Glowing Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.075, 32]} />
        <meshBasicMaterial
          color={isOpen ? '#D92B2B' : '#E6A100'}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Core Glowing Dot */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshBasicMaterial
          color={isOpen ? '#D92B2B' : '#E6A100'}
          transparent
          opacity={1}
          depthWrite={false}
        />
      </mesh>

      {/* HTML Overlay Tag */}
      <Html
        center
        distanceFactor={10}
        position={[0, 0.2, 0]}
        style={{
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
        zIndexRange={isOpen ? [1000, 500] : [500, 100]}
      >
        <div className="relative flex flex-col items-center pointer-events-auto">
          {/* Vertical Leader Line */}
          {!isOpen && !isAnotherOpen && (
            <div className="w-[2px] h-6 bg-gradient-to-b from-transparent via-[#E6A100] to-[#E6A100] shadow-[0_0_10px_#E6A100]" />
          )}

          {/* Floating Tag Pill */}
          {!isOpen && (
            <button
              type="button"
              onClick={handleDomClick}
              className={`
                group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full cursor-pointer
                bg-[#121110]/95 backdrop-blur-2xl border border-[#E6A100]/80 shadow-[0_10px_30px_rgba(0,0,0,0.8)]
                hover:border-[#D92B2B] hover:scale-110 transition-all duration-200
                ${isAnotherOpen ? 'opacity-20' : 'opacity-100'}
              `}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isHeadlight && headlightsOn
                    ? 'bg-[#E6A100] shadow-[0_0_10px_#E6A100]'
                    : 'bg-[#D92B2B] shadow-[0_0_8px_#D92B2B]'
                }`}
              />
              <span className="font-mono text-[10px] tracking-[0.22em] font-bold text-white uppercase whitespace-nowrap">
                {data.label}
              </span>
            </button>
          )}

          {/* Detail Popover Card */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.94, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 8, scale: 0.97, filter: 'blur(4px)' }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-[280px] rounded-2xl overflow-hidden bg-[#121110]/95 backdrop-blur-2xl border border-[#D92B2B]/60 shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-4 flex flex-col gap-3 text-white pointer-events-auto"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-[#D92B2B] font-bold block mb-1">
                       {data.label}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {data.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(null)}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-[11px] leading-relaxed text-[#A8A49C]">
                  {data.body}
                </p>

                <div className="flex flex-col rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
                  {data.specs.map((s, i) => (
                    <div
                      key={s.label}
                      className={`flex items-center justify-between px-3 py-2 ${
                        i > 0 ? 'border-t border-white/5' : ''
                      }`}
                    >
                      <span className="font-mono text-[7.5px] tracking-[0.2em] uppercase text-[#78746D]">
                        {s.label}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-white">
                        {s.value}
                      </span>
                    </div>
                  ))}
                </div>

                {data.action === 'toggle-headlights' && (
                  <button
                    type="button"
                    onClick={() => toggleHeadlights()}
                    className={`
                      w-full py-2.5 rounded-xl font-mono text-[9px] tracking-[0.2em] uppercase font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
                      ${
                        headlightsOn
                          ? 'bg-[#E6A100] text-[#121110] shadow-[0_0_20px_rgba(230,161,0,0.5)]'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      }
                    `}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        headlightsOn ? 'bg-[#121110]' : 'bg-white/40'
                      }`}
                    />
                    {headlightsOn ? 'Matrix Beams Active' : 'Ignite Headlamps'}
                  </button>
                )}

                {data.action === 'toggle-engine' && (
                  <button
                    type="button"
                    onClick={() => toggleEngine()}
                    className={`
                      w-full py-2.5 rounded-xl font-mono text-[9px] tracking-[0.2em] uppercase font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer
                      ${
                        engineOn
                          ? 'bg-[#D92B2B] text-white shadow-[0_0_20px_rgba(217,43,43,0.5)]'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                      }
                    `}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        engineOn ? 'bg-white animate-pulse' : 'bg-[#D92B2B]'
                      }`}
                    />
                    {engineOn ? 'Engine Running' : 'Ignite Powertrain'}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Html>
    </group>
  );
}

function HeadlightBeams() {
  const headlightsOn = useConfiguratorStore(
    (s: ConfiguratorState) => s.headlightsOn
  );
  const flareL = useRef<THREE.Mesh>(null);
  const flareR = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = headlightsOn ? 0.85 + Math.sin(t * 30) * 0.05 : 0;

    for (const ref of [flareL, flareR]) {
      if (!ref.current) continue;
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity += (pulse - mat.opacity) * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={flareL} position={[0.68, 0.52, 1.82]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial
          color="#FFE6A0"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={flareR} position={[-0.68, 0.52, 1.82]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial
          color="#FFE6A0"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {headlightsOn && (
        <>
          <spotLight
            position={[0.68, 0.55, 1.8]}
            target-position={[0.68, 0, 7.0]}
            intensity={25}
            angle={Math.PI / 5}
            penumbra={0.7}
            decay={1.8}
            color="#FFF2D1"
            castShadow={false}
          />
          <spotLight
            position={[-0.68, 0.55, 1.8]}
            target-position={[-0.68, 0, 7.0]}
            intensity={25}
            angle={Math.PI / 5}
            penumbra={0.7}
            decay={1.8}
            color="#FFF2D1"
            castShadow={false}
          />
        </>
      )}
    </group>
  );
}

export function Hotspots() {
  const setActiveHotspot = useConfiguratorStore(
    (s: ConfiguratorState) => s.setActiveHotspot
  );
  const activeManifest = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeManifest
  );

  const handleMiss = useCallback(() => {
    setActiveHotspot(null);
  }, [setActiveHotspot]);

  const hotspotsList = (activeManifest?.hotspots || []) as HotspotDef[];

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        onClick={handleMiss}
      >
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {hotspotsList.map((h) => (
        <HotspotMarker key={h.id} data={h} />
      ))}

      <HeadlightBeams />
    </group>
  );
}

export default Hotspots;