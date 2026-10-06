'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useConfiguratorStore,
  type ConfiguratorState,
} from '@/stores/useConfiguratorStore';
import { VEHICLE_REGISTRY, type VehicleManifest } from '@/config/vehicles';
import { getEngineAudio } from '@/audio/EngineAudio';

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function VaultGalleryModal() {
  const isClient = useIsClient();
  const vaultGalleryOpen = useConfiguratorStore(
    (s: ConfiguratorState) => s.vaultGalleryOpen
  );
  const setVaultGalleryOpen = useConfiguratorStore(
    (s: ConfiguratorState) => s.setVaultGalleryOpen
  );
  const activeVehicleId = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeVehicleId
  );
  const requestVehicleChange = useConfiguratorStore(
    (s: ConfiguratorState) => s.requestVehicleChange
  );
  const isVehicleTransitioning = useConfiguratorStore(
    (s: ConfiguratorState) => s.isVehicleTransitioning
  );

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVaultGalleryOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setVaultGalleryOpen]);

  // Lock body scroll while open
  useEffect(() => {
    if (!vaultGalleryOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [vaultGalleryOpen]);

  if (!isClient) return null;

  const vehiclesList = Object.values(VEHICLE_REGISTRY);

  return createPortal(
    <AnimatePresence>
      {vaultGalleryOpen && (
        <div className="fixed inset-0 z-[99998] flex flex-col justify-between p-6 md:p-12 pointer-events-auto select-none overflow-y-auto bg-[#0A0A09]/95 backdrop-blur-3xl text-[#EAE6DF]">
          {/* Top Bar */}
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto shrink-0 pb-6 border-b border-white/10">
            <div>
              <span className="font-mono text-[9px] tracking-[0.35em] text-[#D92B2B] uppercase font-semibold">
                APEX Atelier // Hangar Collection
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
                The Megacar Vault
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setVaultGalleryOpen(false)}
              className="px-5 py-2.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-white font-mono text-[10px] tracking-[0.2em] uppercase transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Close Hangar</span>
              <span className="text-xs">✕</span>
            </button>
          </div>

          {/* Vehicle Hangar Grid */}
          <div className="w-full max-w-7xl mx-auto my-auto py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {vehiclesList.map((vehicle: VehicleManifest) => {
              const isSelected = vehicle.id === activeVehicleId;
              return (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`group relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-500 ${
                    isSelected
                      ? 'bg-[#121110] border-[#D92B2B] shadow-[0_0_50px_rgba(217,43,43,0.25)]'
                      : 'bg-[#121110]/60 border-white/10 hover:border-white/30 hover:bg-[#121110]'
                  }`}
                >
                  {/* Top Header info */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[8px] tracking-[0.25em] text-[#78746D] uppercase font-semibold">
                        {vehicle.brand} • {vehicle.year}
                      </span>
                      <span
                        className={`font-mono text-[8px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full ${
                          vehicle.engineType === 'quad-ev'
                            ? 'bg-[#0F52BA]/20 text-[#0F52BA] border border-[#0F52BA]/30'
                            : 'bg-[#E6A100]/20 text-[#E6A100] border border-[#E6A100]/30'
                        }`}
                      >
                        {vehicle.engineType}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-[#D92B2B] transition-colors">
                      {vehicle.name}
                    </h3>
                    <p className="text-xs leading-relaxed text-[#78746D] mt-1.5">
                      {vehicle.subtitle}
                    </p>
                  </div>

                  {/* Stat Grid */}
                  <div className="grid grid-cols-2 gap-2 my-6 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-[9px]">
                    <div>
                      <span className="text-[#78746D] uppercase block text-[7px] tracking-[0.18em]">
                        Output
                      </span>
                      <span className="font-semibold text-white">
                        {vehicle.specs.power}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#78746D] uppercase block text-[7px] tracking-[0.18em]">
                        Vmax
                      </span>
                      <span className="font-semibold text-white">
                        {vehicle.specs.topSpeed}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-[#78746D] uppercase block text-[7px] tracking-[0.18em]">
                        P/W Ratio
                      </span>
                      <span className="font-semibold text-white">
                        {vehicle.specs.powerToWeight}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className="text-[#78746D] uppercase block text-[7px] tracking-[0.18em]">
                        Accel
                      </span>
                      <span className="font-semibold text-[#E6A100]">
                        {vehicle.specs.acceleration}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isVehicleTransitioning || isSelected}
                      onClick={() => {
                        requestVehicleChange(vehicle.id);
                        setVaultGalleryOpen(false);
                      }}
                      className={`flex-1 py-3 rounded-xl font-mono text-[9px] tracking-[0.22em] uppercase font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#D92B2B] text-white shadow-[0_0_20px_rgba(217,43,43,0.4)]'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      } ${
                        isVehicleTransitioning ? 'opacity-50 cursor-wait' : ''
                      }`}
                    >
                      {isSelected ? 'Active Atelier →' : 'Materialize →'}
                    </button>

                    {/* Audio Preview Button */}
                    <button
                      type="button"
                      title="Audition Engine Note"
                      onClick={() => {
                        const audio = getEngineAudio();
                        audio.setProfile(vehicle.engineType);
                        void audio.startEngine();
                        window.setTimeout(() => audio.stopEngine(), 1800);
                      }}
                      className="px-3 py-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[#E6A100] font-mono text-[9px] cursor-pointer transition-colors"
                    >
                      🔊
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto shrink-0 pt-6 border-t border-white/10 font-mono text-[8px] tracking-[0.2em] text-[#78746D] uppercase">
            <span>3 Hypercars Registered</span>
            <span>Real-time WebGL Normalization Active</span>
            <span>APEX Atelier 2026</span>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default VaultGalleryModal;