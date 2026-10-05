'use client';

import { useEffect, useRef } from 'react';
import { getEngineAudio } from '@/audio/EngineAudio';
import { useConfiguratorStore } from '@/stores/useConfiguratorStore';

/**
 * Bridges Zustand engine state → Web Audio synthesizer.
 * RPM = blend(scrollProgress, throttle)
 * Must be called from a client component after user gesture for autoplay policy.
 */
export function useEngineAudio() {
  const engine = useRef(getEngineAudio());
  const prevOn = useRef(false);

  useEffect(() => {
    const unsub = useConfiguratorStore.subscribe((state, prev) => {
      const audio = engine.current;

      // Ignition edge
      if (state.engineOn && !prevOn.current) {
        void audio.startEngine();
      } else if (!state.engineOn && prevOn.current) {
        audio.stopEngine();
      }
      prevOn.current = state.engineOn;

      // Mute
      if (state.audioMuted !== prev.audioMuted) {
        audio.setMuted(state.audioMuted);
      }

      // RPM mapping while running
      if (state.engineOn) {
        // Idle floor 0.08, scroll adds cruise, throttle adds peak
        const scrollRev = state.scrollProgress * 0.55;
        const throttleRev = state.throttle * 0.85;
        const rpm = Math.min(1, 0.08 + Math.max(scrollRev, throttleRev));
        audio.setRpm(rpm);
      }
    });

    return () => {
      unsub();
      engine.current.stopEngine();
    };
  }, []);
}