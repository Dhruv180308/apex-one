'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useConfiguratorStore,
  type ConfiguratorState,
} from '@/stores/useConfiguratorStore';
import { getSectionAtProgress, type ScrollSection } from '@/config/camera-paths';
import { VaultSelectorHUD } from './VaultSelectorHUD';

export function SectionHUD() {
  const scrollProgress = useConfiguratorStore(
    (s: ConfiguratorState) => s.scrollProgress
  );
  const activeManifest = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeManifest
  );
  const setReserveOpen = useConfiguratorStore(
    (s: ConfiguratorState) => s.setReserveOpen
  );

  const section: ScrollSection = useMemo(
    () => getSectionAtProgress(scrollProgress),
    [scrollProgress]
  );

  const isDarkStudio = scrollProgress > 0.65;
  const isClimaxSection = section.id === 'cta' || scrollProgress >= 0.88;

  return (
    <div className="fixed top-0 left-0 z-20 w-full h-full pointer-events-none overflow-hidden select-none">
      {/* Top-Left Vault Selector Button */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col gap-1 pointer-events-auto z-40">
        <VaultSelectorHUD />
      </div>

      {/* Top-Right Header */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2 md:gap-3 pointer-events-auto z-30">
        <div className="hidden lg:flex items-center gap-2">
          <SpecPill label="Power" value={activeManifest.specs.power} isDark={isDarkStudio} />
          <SpecPill label="P/W" value={activeManifest.specs.powerToWeight} isDark={isDarkStudio} />
          <SpecPill label="Vmax" value={activeManifest.specs.topSpeed} isDark={isDarkStudio} />
        </div>

        <button
          type="button"
          onClick={() => setReserveOpen(true)}
          className="flex items-center gap-1.5 md:gap-2 px-3.5 py-1.5 md:px-4 md:py-2 rounded-full bg-[#D92B2B] hover:bg-[#b82020] text-white font-mono text-[8.5px] md:text-[9px] tracking-[0.2em] uppercase font-semibold shadow-[0_0_20px_rgba(217,43,43,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Reserve</span>
          <span className="opacity-60">→</span>
        </button>
      </div>

      {/* Left Section Narrative */}
      <div className="absolute left-4 bottom-32 md:left-8 md:bottom-32 w-[min(380px,85vw)] pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeManifest.id}-${section.id}`}
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-2 md:gap-3"
          >
            <span className="font-mono text-[8.5px] md:text-[10px] tracking-[0.3em] text-[#D92B2B] uppercase font-semibold">
              {section.label}
            </span>

            <h2
              className={`text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] transition-colors duration-500 ${
                isDarkStudio ? 'text-[#EAE6DF]' : 'text-[#1F1E1C]'
              }`}
            >
              {section.id === 'hero' ? activeManifest.name : section.title}
            </h2>

            <p
              className={`text-xs md:text-[15px] leading-relaxed max-w-[34ch] transition-colors duration-500 ${
                isDarkStudio ? 'text-[#EAE6DF]/70' : 'text-[#78746D]'
              }`}
            >
              {section.id === 'hero'
                ? activeManifest.subtitle
                : section.description}
            </p>

            {section.spec && (
              <div
                className={`mt-1 inline-flex items-center gap-2.5 self-start px-3 py-1.5 rounded-lg border backdrop-blur-sm transition-colors duration-500 ${
                  isDarkStudio
                    ? 'bg-white/10 border-white/15 text-[#EAE6DF]'
                    : 'bg-[#1F1E1C]/5 border-[#1F1E1C]/8 text-[#1F1E1C]'
                }`}
              >
                <span
                  className={`font-mono text-[8px] md:text-[9px] tracking-[0.2em] uppercase ${
                    isDarkStudio ? 'text-[#EAE6DF]/60' : 'text-[#78746D]'
                  }`}
                >
                  {section.spec.label}
                </span>
                <span className="font-mono text-xs md:text-sm font-semibold">
                  {section.spec.value}
                </span>
              </div>
            )}

            {isClimaxSection && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => setReserveOpen(true)}
                  className="px-5 py-3 rounded-xl bg-[#D92B2B] text-white font-mono text-[9px] md:text-[10px] tracking-[0.25em] uppercase font-bold shadow-[0_10px_30px_rgba(217,43,43,0.4)] hover:shadow-[0_15px_40px_rgba(217,43,43,0.6)] active:scale-95 transition-all cursor-pointer"
                >
                  Configure {activeManifest.name} Allocation →
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Rail */}
      <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <div
          className={`relative w-[2px] h-24 md:h-32 rounded-full overflow-hidden transition-colors duration-500 ${
            isDarkStudio ? 'bg-white/15' : 'bg-[#1F1E1C]/10'
          }`}
        >
          <motion.div
            className="absolute top-0 left-0 w-full bg-[#D92B2B] origin-top"
            style={{ height: `${scrollProgress * 100}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
        <span
          className={`font-mono text-[8px] md:text-[9px] tracking-widest transition-colors duration-500 ${
            isDarkStudio ? 'text-[#EAE6DF]/60' : 'text-[#78746D]'
          }`}
        >
          {String(Math.round(scrollProgress * 100)).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

function SpecPill({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-sm transition-colors duration-500 ${
        isDark
          ? 'bg-[#121110]/80 border-white/15 text-[#EAE6DF]'
          : 'bg-[#F4F1EA]/70 border-white/50 text-[#1F1E1C]'
      }`}
    >
      <span
        className={`font-mono text-[8.5px] tracking-[0.2em] uppercase ${
          isDark ? 'text-[#EAE6DF]/50' : 'text-[#78746D]'
        }`}
      >
        {label}
      </span>
      <span className="font-mono text-[10.5px] font-semibold">{value}</span>
    </div>
  );
}

export default SectionHUD;