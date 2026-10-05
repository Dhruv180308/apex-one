'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useConfiguratorStore,
  type ConfiguratorState,
} from '@/stores/useConfiguratorStore';
import { getSectionAtProgress, type ScrollSection } from '@/config/camera-paths';

export function SectionHUD() {
  const scrollProgress = useConfiguratorStore(
    (s: ConfiguratorState) => s.scrollProgress
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
    <div className="fixed top-0 left-0 z-20 w-full h-full pointer-events-none overflow-hidden">
      {/* Top-left brand lockup */}
      <div className="absolute top-8 left-8 flex flex-col gap-1 pointer-events-auto">
        <span
          className={`font-mono text-[10px] tracking-[0.35em] uppercase transition-colors duration-500 ${
            isDarkStudio ? 'text-[#EAE6DF]/60' : 'text-[#78746D]'
          }`}
        >
          Koenigsegg // One:1
        </span>
      </div>

      {/* Top-right header */}
      <div className="absolute top-8 right-8 flex items-center gap-3 pointer-events-auto z-30">
        <div className="hidden sm:flex items-center gap-2">
          <SpecPill label="Power" value="1,360 HP" isDark={isDarkStudio} />
          <SpecPill label="P/W" value="1 KG/HP" isDark={isDarkStudio} />
          <SpecPill label="Vmax" value="273 MPH" isDark={isDarkStudio} />
        </div>

        <button
          type="button"
          onClick={() => setReserveOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D92B2B] hover:bg-[#b82020] text-white font-mono text-[9px] tracking-[0.2em] uppercase font-medium shadow-[0_0_20px_rgba(217,43,43,0.35)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Reserve</span>
          <span className="opacity-60">→</span>
        </button>
      </div>

      {/* Left section narrative */}
      <div className="absolute left-8 bottom-32 w-[min(420px,42vw)] pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-3"
          >
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#D92B2B] uppercase">
              {section.label}
            </span>

            <h2
              className={`text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] transition-colors duration-500 ${
                isDarkStudio ? 'text-[#EAE6DF]' : 'text-[#1F1E1C]'
              }`}
            >
              {section.title}
            </h2>

            <p
              className={`text-sm md:text-[15px] leading-relaxed max-w-[34ch] transition-colors duration-500 ${
                isDarkStudio ? 'text-[#EAE6DF]/70' : 'text-[#78746D]'
              }`}
            >
              {section.description}
            </p>

            {section.spec && (
              <div
                className={`mt-2 inline-flex items-center gap-3 self-start px-3 py-2 rounded-lg border backdrop-blur-sm transition-colors duration-500 ${
                  isDarkStudio
                    ? 'bg-white/10 border-white/15 text-[#EAE6DF]'
                    : 'bg-[#1F1E1C]/5 border-[#1F1E1C]/8 text-[#1F1E1C]'
                }`}
              >
                <span
                  className={`font-mono text-[9px] tracking-[0.2em] uppercase ${
                    isDarkStudio ? 'text-[#EAE6DF]/60' : 'text-[#78746D]'
                  }`}
                >
                  {section.spec.label}
                </span>
                <span className="font-mono text-sm font-medium">
                  {section.spec.value}
                </span>
              </div>
            )}

            {/* End of Scroll Action Climax Button */}
            {isClimaxSection && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => setReserveOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-[#D92B2B] text-white font-mono text-[10px] tracking-[0.25em] uppercase font-semibold shadow-[0_10px_30px_rgba(217,43,43,0.4)] hover:shadow-[0_15px_40px_rgba(217,43,43,0.6)] hover:scale-105 transition-all cursor-pointer"
                >
                  Configure Allocation 01 →
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress rail */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <div
          className={`relative w-[2px] h-32 rounded-full overflow-hidden transition-colors duration-500 ${
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
          className={`font-mono text-[9px] tracking-widest transition-colors duration-500 ${
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
        className={`font-mono text-[9px] tracking-[0.2em] uppercase ${
          isDark ? 'text-[#EAE6DF]/50' : 'text-[#78746D]'
        }`}
      >
        {label}
      </span>
      <span className="font-mono text-[11px] font-medium">{value}</span>
    </div>
  );
}

export default SectionHUD;