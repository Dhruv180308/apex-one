'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { cameraPositionCurve, cameraTargetCurve } from '@/config/camera-paths';
import { useConfiguratorStore } from '@/stores/useConfiguratorStore';

export function CameraRig() {
  const { camera } = useThree();
  const smoothProgress = useRef(0);
  const currentPos = useRef(new THREE.Vector3());
  const currentTarget = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useFrame((_, delta) => {
    // React 19 Rule #5 — imperative store read in useFrame
    const targetProgress = useConfiguratorStore.getState().scrollProgress;

    // Adaptive damping: slower (more cinematic) in mid-scroll detail zones
    const isDetailZone = targetProgress > 0.1 && targetProgress < 0.9;
    const baseDamping = isDetailZone ? 0.0004 : 0.001;
    const dampingFactor = 1 - Math.pow(baseDamping, delta);

    smoothProgress.current += (targetProgress - smoothProgress.current) * dampingFactor;
    const t = Math.max(0, Math.min(1, smoothProgress.current));

    const targetPos = cameraPositionCurve.getPointAt(t);
    const targetLookAt = cameraTargetCurve.getPointAt(t);

    if (!initialized.current) {
      currentPos.current.copy(targetPos);
      currentTarget.current.copy(targetLookAt);
      camera.position.copy(targetPos);
      camera.lookAt(targetLookAt);
      initialized.current = true;
      return;
    }

    currentPos.current.lerp(targetPos, dampingFactor);
    currentTarget.current.lerp(targetLookAt, dampingFactor);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
}

export default CameraRig;