'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useConfiguratorStore } from '@/stores/useConfiguratorStore';

export default function VehicleTransitionController() {
  const swapped = useRef(false);

  useFrame((_, delta) => {
    const s = useConfiguratorStore.getState();
    if (!s.isVehicleTransitioning) {
      swapped.current = false;
      return;
    }

    // Advance animation (Total time ~1.6 seconds)
    const next = Math.min(1, s.transitionProgress + delta * 0.62);
    s.setTransitionProgress(next);

    // Mid-scan vehicle swap (Execute exactly once at 50%)
    if (!swapped.current && next >= 0.5 && s.pendingVehicleId) {
      swapped.current = true;
      s.executeMidTransitionSwap();
    }

    // Finish
    if (next >= 1) {
      s.endTransition();
      swapped.current = false;
    }
  });

  return null;
}