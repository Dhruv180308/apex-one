'use client';

import React from 'react';
import {
  useConfiguratorStore,
  type ConfiguratorState,
  type WheelStyleId,
  type WheelStyle,
} from '@/stores/useConfiguratorStore';

export function WheelSelectorHUD() {
  const activeManifest = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeManifest
  );
  const activeWheel = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeWheel
  );
  const setActiveWheel = useConfiguratorStore(
    (s: ConfiguratorState) => s.setActiveWheel
  );

  const wheels = activeManifest.wheels;
  const active: WheelStyle =
    wheels.find((w: WheelStyle) => w.id === activeWheel) ?? wheels[0];

  return (
    <div className="fixed bottom-8 left-8 z-30 flex flex-col items-start gap-2 pointer-events-auto select-none">
      {/* Header Label */}
      <div className="flex items-center gap-2 px-1">
        <span className="font-mono text-[8px] tracking-[0.28em] uppercase text-[#78746D] font-bold">
          Wheels
        </span>
        <span className="font-mono text-[8px] tracking-[0.12em] text-[#1F1E1C]/70 font-semibold">
          • {active.name}
        </span>
      </div>

      {/* Selector Rail */}
      <div className="flex items-stretch gap-1.5 p-1.5 rounded-2xl bg-[#F4F1EA]/90 backdrop-blur-2xl border border-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.15)]">
        {wheels.map((wheel: WheelStyle) => {
          const isActive = activeWheel === wheel.id;
          return (
            <button
              key={wheel.id}
              type="button"
              onClick={() => setActiveWheel(wheel.id as WheelStyleId)}
              title={wheel.name}
              className={`
                relative flex flex-col items-start gap-1
                min-w-[98px] px-3 py-2.5 rounded-xl cursor-pointer
                transition-all duration-300 ease-out
                ${
                  isActive
                    ? 'bg-[#1F1E1C] text-[#EAE6DF] shadow-xl scale-[1.02]'
                    : 'bg-transparent text-[#1F1E1C]/70 hover:bg-[#1F1E1C]/10 hover:text-[#1F1E1C]'
                }
              `}
            >
              <div className="flex items-center gap-2 w-full">
                <span
                  className={`block w-3.5 h-3.5 rounded-full shrink-0 border ${
                    isActive ? 'border-white/40 shadow-inner' : 'border-[#1F1E1C]/20'
                  }`}
                  style={{ backgroundColor: wheel.color }}
                />
                <span
                  className={`font-mono text-[8px] tracking-[0.18em] uppercase leading-none font-bold ${
                    isActive ? 'text-[#EAE6DF]' : 'text-[#1F1E1C]/80'
                  }`}
                >
                  {wheel.id}
                </span>
              </div>
              <span
                className={`text-[8.5px] leading-tight tracking-wide font-medium ${
                  isActive ? 'text-[#EAE6DF]/70' : 'text-[#78746D]'
                }`}
              >
                {wheel.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default WheelSelectorHUD;