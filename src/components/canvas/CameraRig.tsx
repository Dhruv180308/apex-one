'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import {
  cameraPositionCurve,
  cameraTargetCurve,
} from '@/config/camera-paths';
import { useConfiguratorStore } from '@/stores/useConfiguratorStore';
import { useGyroParallax } from '@/hooks/useGyroParallax';

export function CameraRig() {
  const { camera } = useThree();
  const { gyroRef } = useGyroParallax();

  const smoothProgress = useRef(0);
  const currentPos = useRef(new THREE.Vector3());
  const currentTarget = useRef(new THREE.Vector3());
  const mousePos = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  useFrame((_, delta) => {
    const targetProgress = useConfiguratorStore.getState().scrollProgress;

    const isDetailZone = targetProgress > 0.1 && targetProgress < 0.9;
    const baseDamping = isDetailZone ? 0.0004 : 0.001;
    const dampingFactor = 1 - Math.pow(baseDamping, delta);

    smoothProgress.current +=
      (targetProgress - smoothProgress.current) * dampingFactor;
    const t = Math.max(0, Math.min(1, smoothProgress.current));

    const splinePos = cameraPositionCurve.getPointAt(t);
    const splineTarget = cameraTargetCurve.getPointAt(t);

    // Lerp gyro tracking ref values
    gyroRef.current.x += (gyroRef.current.targetX - gyroRef.current.x) * 0.05;
    gyroRef.current.y += (gyroRef.current.targetY - gyroRef.current.y) * 0.05;

    const parallaxX = mousePos.current.x * 0.25 + gyroRef.current.x * 0.4;
    const parallaxY = mousePos.current.y * 0.15 + gyroRef.current.y * 0.25;

    const finalPos = splinePos
      .clone()
      .add(new THREE.Vector3(parallaxX, parallaxY, 0));
    const finalTarget = splineTarget
      .clone()
      .add(new THREE.Vector3(parallaxX * 0.5, parallaxY * 0.5, 0));

    if (!initialized.current) {
      currentPos.current.copy(finalPos);
      currentTarget.current.copy(finalTarget);
      camera.position.copy(finalPos);
      camera.lookAt(finalTarget);
      initialized.current = true;
      return;
    }

    currentPos.current.lerp(finalPos, dampingFactor);
    currentTarget.current.lerp(finalTarget, dampingFactor);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentTarget.current);
  });

  return null;
}

export default CameraRig;