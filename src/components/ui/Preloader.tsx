'use client';

import { useState, useSyncExternalStore } from 'react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

// React 19 Rule #4 — Client mount detection via useSyncExternalStore
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function Preloader() {
  const { progress } = useProgress();
  const isClient = useIsClient();
  const [entered, setEntered] = useState(false);

  if (!isClient || entered) return null;

  const isLoaded = progress >= 100;

  return (
    <AnimatePresence>
      {!entered && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[999999] flex flex-col items-center justify-between p-8 md:p-12 bg-[#0E0D0C] text-[#EAE6DF] select-none pointer-events-auto"
        >
          {/* Top Brand Mark */}
          <div className="flex flex-col items-center gap-1 mt-4">
            <span className="font-mono text-[10px] tracking-[0.4em] text-[#D92B2B] uppercase">
              Atelier // Hypercar
            </span>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-white">
              APEX-ONE
            </h1>
          </div>

          {/* Center Progress & Enter Action */}
          <div className="flex flex-col items-center gap-6 my-auto">
            {!isLoaded ? (
              <div className="flex flex-col items-center gap-3">
                <span className="font-mono text-5xl md:text-6xl font-medium tracking-tighter text-white tabular-nums">
                  {Math.round(progress)}
                  <span className="text-sm font-normal text-[#D92B2B] font-mono ml-1">%</span>
                </span>

                <div className="w-48 h-[2px] rounded-full bg-white/10 overflow-hidden relative">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-[#D92B2B]"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.2 }}
                  />
                </div>

                <span className="font-mono text-[9px] tracking-[0.25em] text-[#78746D] uppercase mt-2">
                  Streaming Geometry & HDRI Maps
                </span>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <button
                  type="button"
                  onClick={() => setEntered(true)}
                  className="group relative px-8 py-4 rounded-full bg-[#D92B2B] hover:bg-[#b82020] text-white font-mono text-[10px] tracking-[0.3em] uppercase font-semibold shadow-[0_0_40px_rgba(217,43,43,0.5)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Enter Atelier →
                </button>
                <span className="font-mono text-[8px] tracking-[0.2em] text-[#78746D] uppercase">
                  WebGL 2.0 • Headlight & V8 Audio Ready
                </span>
              </motion.div>
            )}
          </div>

          {/* Footer Specs */}
          <div className="flex items-center justify-between w-full max-w-2xl font-mono text-[8px] tracking-[0.2em] text-[#78746D] uppercase border-t border-white/10 pt-4">
            <span>Koenigsegg One:1</span>
            <span>1,360 HP // 1,360 KG</span>
            <span>273 MPH VMAX</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Preloader;