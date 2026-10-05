'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useConfiguratorStore } from '@/stores/useConfiguratorStore';

export function PointerMiss() {
  const { gl } = useThree();

  useEffect(() => {
    const handler = () => {
      // R3F fires pointermissed on the canvas event system;
      // we also listen to native clicks on empty areas via the ground catcher in Hotspots.
    };
    return () => {};
  }, [gl]);

  return null;
}