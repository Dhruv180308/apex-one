'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/stores/useConfiguratorStore';

const SCAN_GOLD = new THREE.Color('#E6A100');
const SCAN_CYAN = new THREE.Color('#4BE8FF');

function LaserScanPlane() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(() => {
    const { isVehicleTransitioning, transitionProgress: p } =
      useConfiguratorStore.getState();

    if (!meshRef.current || !matRef.current) return;

    if (!isVehicleTransitioning) {
      matRef.current.opacity = 0;
      return;
    }

    // Sweep laser plane from Front (+2.8m) to Back (-2.8m)
    const scanZ = THREE.MathUtils.lerp(2.8, -2.8, p);
    meshRef.current.position.set(0, 0.75, scanZ);

    // Fade in during sweep, peak at center, fade out at end
    const opacityPeak = Math.sin(p * Math.PI);
    matRef.current.opacity = opacityPeak * 0.9;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.75, 2.8]}>
      <planeGeometry args={[4.2, 2.4]} />
      <meshBasicMaterial
        ref={matRef}
        color={SCAN_CYAN}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function LaserBeamLine() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(() => {
    const { isVehicleTransitioning, transitionProgress: p } =
      useConfiguratorStore.getState();

    if (!meshRef.current || !matRef.current) return;

    if (!isVehicleTransitioning) {
      matRef.current.opacity = 0;
      return;
    }

    const scanZ = THREE.MathUtils.lerp(2.8, -2.8, p);
    meshRef.current.position.set(0, 0.05, scanZ);

    const opacityPeak = Math.sin(p * Math.PI);
    matRef.current.opacity = opacityPeak * 1.0;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.05, 2.8]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4.5, 0.12]} />
      <meshBasicMaterial
        ref={matRef}
        color={SCAN_GOLD}
        transparent
        opacity={0}
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function MaterializerFX() {
  return (
    <group>
      <LaserScanPlane />
      <LaserBeamLine />
    </group>
  );
}