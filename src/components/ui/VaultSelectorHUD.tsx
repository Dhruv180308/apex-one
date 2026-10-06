'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useConfiguratorStore,
  type ConfiguratorState,
} from '@/stores/useConfiguratorStore';
import { VEHICLE_REGISTRY } from '@/config/vehicles';

export function VaultSelectorHUD() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeVehicleId = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeVehicleId
  );
  const activeManifest = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeManifest
  );
  const requestVehicleChange = useConfiguratorStore(
    (s: ConfiguratorState) => s.requestVehicleChange
  );
  const setVaultGalleryOpen = useConfiguratorStore(
    (s: ConfiguratorState) => s.setVaultGalleryOpen
  );
  const scrollProgress = useConfiguratorStore(
    (s: ConfiguratorState) => s.scrollProgress
  );
  const isVehicleTransitioning = useConfiguratorStore(
    (s: ConfiguratorState) => s.isVehicleTransitioning
  );

  const isDarkStudio = scrollProgress > 0.65;

  return (
    <div className="relative pointer-events-auto z-50 flex items-center gap-2">
      {/* Vault Switcher Pill */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        disabled={isVehicleTransitioning}
        className={`group flex items-center gap-2.5 px-4 py-2 rounded-full border backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 active:scale-95 ${
          isVehicleTransitioning ? 'opacity-50 cursor-wait' : ''
        } ${
          isDarkStudio
            ? 'bg-[#121110]/90 border-white/20 text-[#EAE6DF] hover:border-white/40'
            : 'bg-[#F4F1EA]/90 border-[#1F1E1C]/15 text-[#1F1E1C] hover:border-[#1F1E1C]/35'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#D92B2B] shadow-[0_0_10px_#D92B2B] animate-pulse" />
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase font-bold">
          {activeManifest.brand} // {activeManifest.name}
        </span>
        <span className="font-mono text-[9px] opacity-60 transition-transform duration-200 group-hover:translate-y-0.5">
          {dropdownOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Launch Full Hangar Gallery */}
      <button
        type="button"
        onClick={() => setVaultGalleryOpen(true)}
        disabled={isVehicleTransitioning}
        title="Open Full Garage Hangar"
        className={`px-3 py-2 rounded-full border backdrop-blur-xl transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 active:scale-95 font-mono text-[9px] tracking-[0.2em] uppercase font-semibold ${
          isVehicleTransitioning ? 'opacity-50 cursor-wait' : ''
        } ${
          isDarkStudio
            ? 'bg-[#121110]/90 border-white/20 text-[#E6A100] hover:border-[#E6A100]'
            : 'bg-[#F4F1EA]/90 border-[#1F1E1C]/15 text-[#1F1E1C] hover:border-[#1F1E1C]/35'
        }`}
      >
        Hangar ⊞
      </button>

      {/* Vault Dropdown Menu */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 left-0 w-[280px] p-2 rounded-2xl bg-[#121110]/95 backdrop-blur-2xl border border-white/20 text-[#EAE6DF] shadow-[0_25px_60px_rgba(0,0,0,0.6)] z-50 flex flex-col gap-1.5"
          >
            <div className="px-3 py-2 border-b border-white/10 font-mono text-[8px] tracking-[0.25em] text-[#D92B2B] uppercase font-semibold flex items-center justify-between">
              <span>// Quick Vault Select</span>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  setVaultGalleryOpen(true);
                }}
                className="text-[#E6A100] hover:underline cursor-pointer"
              >
                Expand ⊞
              </button>
            </div>

            {Object.values(VEHICLE_REGISTRY).map((vehicle) => {
              const isActive = vehicle.id === activeVehicleId;
              return (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => {
                    requestVehicleChange(vehicle.id);
                    setDropdownOpen(false);
                  }}
                  disabled={isActive}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#D92B2B]/20 border-[#D92B2B]/60 text-white shadow-md'
                      : 'bg-white/5 border-transparent text-[#EAE6DF]/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div>
                    <p className="font-mono text-[8px] tracking-[0.2em] text-[#78746D] uppercase">
                      {vehicle.brand}
                    </p>
                    <p className="text-xs font-bold tracking-wide">
                      {vehicle.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[9px] text-[#E6A100] font-semibold block">
                      {vehicle.specs.power}
                    </span>
                    <span className="font-mono text-[7px] text-[#78746D] uppercase">
                      {vehicle.engineType}
                    </span>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default VaultSelectorHUD;