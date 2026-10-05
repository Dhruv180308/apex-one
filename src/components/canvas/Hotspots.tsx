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
import { HOTSPOTS, type HotspotDef } from '@/config/hotspots';

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
  const engineOn = useConfiguratorStore(
    (s: ConfiguratorState) => s.engineOn
  );
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
    const breath = 1 + Math.sin(t * 2.2) * 0.08;

    if (ringRef.current) {
      ringRef.current.scale.setScalar(breath);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = isAnotherOpen
        ? 0.05
        : isOpen
          ? 0.8
          : inEmphasis
            ? 0.5
            : 0.25;
    }

    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      if (isAnotherOpen) {
        mat.opacity = 0.1;
      } else if (isHeadlight && headlightsOn) {
        mat.color.set('#E6A100');
        mat.opacity = 1;
      } else if (isOpen) {
        mat.color.set('#D92B2B');
        mat.opacity = 1;
      } else {
        mat.color.set('#1A1918');
        mat.opacity = 0.8;
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
      {/* Invisible 3D hit target */}
      <mesh
        onClick={handleMeshClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Pulse ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.035, 0.042, 32]} />
        <meshBasicMaterial
          color={isOpen ? '#D92B2B' : '#1A1918'}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Core dot */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial
          color="#1A1918"
          transparent
          opacity={0.8}
          depthWrite={false}
        />
      </mesh>

      {/* Fixed-pixel HTML overlay */}
      <Html
        center
        position={[0, 0, 0]}
        style={{
          pointerEvents: isOpen ? 'auto' : 'none',
          userSelect: 'none',
        }}
        zIndexRange={isOpen ? [100, 0] : [10, 0]}
      >
        <div className="relative flex flex-col items-center">
          {/* ── Liquid glass tag pill ── */}
          {!isOpen && (
            <motion.button
              type="button"
              onClick={handleDomClick}
              initial={false}
              animate={{
                opacity: isAnotherOpen ? 0.2 : 1,
                scale: inEmphasis ? 1.06 : 1,
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.22 }}
              className="pointer-events-auto group relative flex items-center gap-1.5 px-2.5 py-[5px] rounded-full cursor-pointer"
              style={{
                background:
                  'linear-gradient(165deg, rgba(28,27,25,0.75) 0%, rgba(14,13,12,0.88) 100%)',
                backdropFilter: 'blur(20px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow:
                  '0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <span
                className="pointer-events-none absolute -inset-[1px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(217,43,43,0.5), rgba(230,161,0,0.3), rgba(255,255,255,0.15))',
                  zIndex: -1,
                }}
              />
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isHeadlight && headlightsOn
                    ? 'bg-[#E6A100] shadow-[0_0_8px_#E6A100]'
                    : inEmphasis
                      ? 'bg-[#D92B2B] shadow-[0_0_6px_rgba(217,43,43,0.7)]'
                      : 'bg-white/35'
                }`}
              />
              <span className="font-mono text-[8.5px] tracking-[0.2em] font-medium text-[#EAE6DF] uppercase">
                {data.label}
              </span>
            </motion.button>
          )}

          {/* ── Liquid Glass Atelier Card ── */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.94, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 8, scale: 0.97, filter: 'blur(4px)' }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-[280px] pointer-events-auto"
                style={{
                  filter:
                    'drop-shadow(0 24px 48px rgba(0,0,0,0.45)) drop-shadow(0 0 40px rgba(217,43,43,0.08))',
                }}
              >
                {/* Chromatic rim */}
                <div
                  className="absolute -inset-[1px] rounded-[18px] opacity-90"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(217,43,43,0.55) 0%, rgba(230,161,0,0.35) 28%, rgba(255,255,255,0.18) 50%, rgba(230,161,0,0.2) 72%, rgba(217,43,43,0.4) 100%)',
                  }}
                />

                {/* Glass body */}
                <div
                  className="relative overflow-hidden rounded-[17px]"
                  style={{
                    background:
                      'linear-gradient(165deg, rgba(28,27,25,0.82) 0%, rgba(14,13,12,0.92) 48%, rgba(18,17,16,0.88) 100%)',
                    backdropFilter: 'blur(40px) saturate(1.4)',
                    WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(0,0,0,0.35), inset 1px 0 0 rgba(255,255,255,0.04)',
                  }}
                >
                  {/* Specular liquid highlight */}
                  <div
                    className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[140%] h-28 opacity-[0.18]"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, transparent 70%)',
                    }}
                  />

                  {/* Fine noise film */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    }}
                  />

                  {/* Top hairline accent */}
                  <div
                    className="h-[1.5px] w-full"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent 0%, #D92B2B 18%, #E6A100 50%, rgba(255,255,255,0.35) 78%, transparent 100%)',
                    }}
                  />

                  <div className="relative p-4 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="w-1 h-1 rounded-full shrink-0"
                            style={{
                              background: '#D92B2B',
                              boxShadow: '0 0 8px rgba(217,43,43,0.8)',
                            }}
                          />
                          <span className="font-mono text-[8px] tracking-[0.32em] text-[#D92B2B] uppercase">
                            {data.label}
                          </span>
                        </div>
                        <h3 className="text-[14px] font-semibold tracking-[-0.015em] text-[#F7F4EE] leading-snug">
                          {data.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveHotspot(null)}
                        aria-label="Close"
                        className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer group"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)',
                        }}
                      >
                        <span className="text-[11px] text-[#EAE6DF]/55 group-hover:text-white leading-none transition-colors">
                          ✕
                        </span>
                      </button>
                    </div>

                    {/* Body */}
                    <p className="text-[11.5px] leading-[1.6] text-[#A8A49C]">
                      {data.body}
                    </p>

                    {/* Specs */}
                    <div
                      className="flex flex-col overflow-hidden rounded-[12px]"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                      }}
                    >
                      {data.specs.map((s, i) => (
                        <div
                          key={s.label}
                          className="flex items-center justify-between px-3 py-2.5"
                          style={{
                            borderTop:
                              i === 0
                                ? 'none'
                                : '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <span className="font-mono text-[7.5px] tracking-[0.2em] uppercase text-[#78746D]">
                            {s.label}
                          </span>
                          <span className="font-mono text-[11px] font-medium tracking-wide text-[#F4F1EA] tabular-nums">
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Headlight CTA */}
                    {data.action === 'toggle-headlights' && (
                      <button
                        type="button"
                        onClick={() => toggleHeadlights()}
                        className="relative mt-0.5 w-full py-2.5 rounded-[12px] font-mono text-[9px] tracking-[0.22em] uppercase font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer overflow-hidden"
                        style={
                          headlightsOn
                            ? {
                                background:
                                  'linear-gradient(135deg, #E6A100 0%, #F0C14A 50%, #E6A100 100%)',
                                color: '#121110',
                                boxShadow:
                                  '0 0 28px rgba(230,161,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35)',
                              }
                            : {
                                background: 'rgba(255,255,255,0.06)',
                                color: '#EAE6DF',
                                border: '1px solid rgba(255,255,255,0.12)',
                                boxShadow:
                                  'inset 0 1px 0 rgba(255,255,255,0.08)',
                              }
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            headlightsOn
                              ? 'bg-[#121110]'
                              : 'bg-[#EAE6DF]/40'
                          }`}
                        />
                        {headlightsOn
                          ? 'Matrix Beams Active'
                          : 'Ignite Headlamps'}
                      </button>
                    )}

                    {/* Engine CTA */}
                    {data.action === 'toggle-engine' && (
                      <button
                        type="button"
                        onClick={() => toggleEngine()}
                        className="relative mt-0.5 w-full py-2.5 rounded-[12px] font-mono text-[9px] tracking-[0.22em] uppercase font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer overflow-hidden"
                        style={
                          engineOn
                            ? {
                                background:
                                  'linear-gradient(135deg, #D92B2B 0%, #E85A5A 50%, #D92B2B 100%)',
                                color: '#fff',
                                boxShadow:
                                  '0 0 28px rgba(217,43,43,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                              }
                            : {
                                background: 'rgba(255,255,255,0.06)',
                                color: '#EAE6DF',
                                border: '1px solid rgba(255,255,255,0.12)',
                                boxShadow:
                                  'inset 0 1px 0 rgba(255,255,255,0.08)',
                              }
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            engineOn
                              ? 'bg-white animate-pulse'
                              : 'bg-[#D92B2B] shadow-[0_0_8px_rgba(217,43,43,0.8)]'
                          }`}
                        />
                        {engineOn ? 'Engine Running' : 'Ignite Powertrain'}
                      </button>
                    )}
                  </div>

                  {/* Bottom inner reflection */}
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 opacity-[0.07]"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(255,255,255,0.5), transparent)',
                    }}
                  />
                </div>
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

  const handleMiss = useCallback(() => {
    setActiveHotspot(null);
  }, [setActiveHotspot]);

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

      {HOTSPOTS.map((h) => (
        <HotspotMarker key={h.id} data={h} />
      ))}

      <HeadlightBeams />
    </group>
  );
}

export default Hotspots;