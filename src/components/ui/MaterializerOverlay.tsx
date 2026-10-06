'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useConfiguratorStore,
  type ConfiguratorState,
} from '@/stores/useConfiguratorStore';

export function MaterializerOverlay() {
  const on = useConfiguratorStore(
    (s: ConfiguratorState) => s.isVehicleTransitioning
  );
  const p = useConfiguratorStore(
    (s: ConfiguratorState) => s.transitionProgress
  );
  const name = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeManifest.name
  );

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          className="fixed inset-0 z-[90] pointer-events-none flex flex-col items-center justify-end pb-28 select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Subtle Flash Overlay at 50% swap point */}
          <div
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
            style={{
              background: '#0E0D0C',
              opacity: p > 0.42 && p < 0.58 ? 0.82 : 0,
            }}
          />

          {/* Floating Telemetry Badge */}
          <div className="relative px-5 py-2.5 rounded-full bg-[#121110]/90 border border-[#E6A100]/40 backdrop-blur-2xl flex flex-col items-center gap-1.5 shadow-[0_0_40px_rgba(230,161,0,0.2)]">
            <span className="font-mono text-[9px] tracking-[0.35em] uppercase text-[#E6A100] font-bold">
               Materializing {name}
            </span>
            <div className="h-[2px] w-44 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#D92B2B] via-[#E6A100] to-[#4BE8FF]"
                style={{ width: `${p * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MaterializerOverlay;