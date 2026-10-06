'use client';

import React from 'react';
import {
  useConfiguratorStore,
  type ConfiguratorState,
  type PaintColor,
} from '@/stores/useConfiguratorStore';

export function ColorPickerHUD() {
  const activeManifest = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeManifest
  );
  const activeColor = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeColor
  );
  const setPaintColor = useConfiguratorStore(
    (s: ConfiguratorState) => s.setPaintColor
  );

  const colors = activeManifest.paints;
  const activeColorObj: PaintColor =
    colors.find((c: PaintColor) => c.id === activeColor) ?? colors[0];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2.5 pointer-events-auto select-none">
      {/* Active Paint Label Badge */}
      <div className="px-4 py-1.5 rounded-full bg-[#121110]/90 backdrop-blur-xl border border-white/20 text-[10px] font-mono tracking-[0.25em] text-[#EAE6DF] uppercase shadow-2xl flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full border border-white/30 shadow-sm shrink-0"
          style={{ backgroundColor: activeColorObj.hex }}
        />
        <span className="font-bold text-white">{activeColorObj.name}</span>
        <span className="text-[#78746D] font-medium">• {activeColorObj.finish}</span>
      </div>

      {/* Color Swatches Bar */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#F4F1EA]/90 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        {colors.map((color: PaintColor) => {
          const isActive = activeColor === color.id;
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => setPaintColor(color)}
              title={`${color.name} (${color.finish})`}
              className={`relative w-8 h-8 rounded-full transition-all duration-300 ease-out flex items-center justify-center cursor-pointer ${
                isActive
                  ? 'scale-125 ring-2 ring-offset-2 ring-[#D92B2B] shadow-lg'
                  : 'hover:scale-110 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-md" />
              )}
              <span className="sr-only">{color.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ColorPickerHUD;