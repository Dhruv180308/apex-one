'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useGyroParallax() {
  const gyroRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // React 19 Rule: Lazy initializers to avoid setState inside useEffect
  const [isSupported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'DeviceOrientationEvent' in window;
  });

  const [hasGyroPermission, setHasGyroPermission] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null;
    if (!('DeviceOrientationEvent' in window)) return false;

    const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    return typeof DeviceOrientation.requestPermission === 'function' ? false : true;
  });

  useEffect(() => {
    if (!hasGyroPermission || typeof window === 'undefined') return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;

      const clampedGamma = Math.max(-45, Math.min(45, e.gamma));
      const clampedBeta = Math.max(15, Math.min(75, e.beta)) - 45;

      gyroRef.current.targetX = clampedGamma / 45;
      gyroRef.current.targetY = clampedBeta / 30;
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [hasGyroPermission]);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return false;

    const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (typeof DeviceOrientation.requestPermission === 'function') {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === 'granted') {
          setHasGyroPermission(true);
          return true;
        }
        setHasGyroPermission(false);
        return false;
      } catch {
        setHasGyroPermission(false);
        return false;
      }
    }

    setHasGyroPermission(true);
    return true;
  }, []);

  return {
    gyroRef,
    isSupported,
    hasGyroPermission,
    requestPermission,
  };
}