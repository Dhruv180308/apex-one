'use client';

import {
  useConfiguratorStore,
  WHEEL_STYLES,
  type ConfiguratorState,
  type WheelStyleId,
} from '@/stores/useConfiguratorStore';

export function WheelSelectorHUD() {
  const activeWheel = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeWheel
  );
  const setActiveWheel = useConfiguratorStore(
    (s: ConfiguratorState) => s.setActiveWheel
  );

  const active = WHEEL_STYLES.find((w) => w.id === activeWheel) ?? WHEEL_STYLES[0];

  return (
    <div className="fixed bottom-8 left-8 z-30 flex flex-col items-start gap-2.5 pointer-events-auto">
      {/* Label */}
      <div className="flex items-center gap-2 px-1">
        <span className="font-mono text-[8px] tracking-[0.28em] uppercase text-[#78746D]">
          Wheels
        </span>
        <span className="font-mono text-[8px] tracking-[0.12em] text-[#1F1E1C]/50">
          {active.name}
        </span>
      </div>

      {/* Selector rail */}
      <div className="flex items-stretch gap-1.5 p-1.5 rounded-2xl bg-[#F4F1EA]/75 backdrop-blur-xl border border-white/50 shadow-[0_12px_40px_rgba(31,30,28,0.1)]">
        {WHEEL_STYLES.map((wheel) => {
          const isActive = activeWheel === wheel.id;
          return (
            <button
              key={wheel.id}
              type="button"
              onClick={() => setActiveWheel(wheel.id as WheelStyleId)}
              title={wheel.name}
              className={`
                relative flex flex-col items-start gap-1
                min-w-[96px] px-3 py-2.5 rounded-xl
                transition-all duration-300 ease-out
                ${
                  isActive
                    ? 'bg-[#1F1E1C] text-[#EAE6DF] shadow-lg scale-[1.02]'
                    : 'bg-transparent text-[#1F1E1C]/70 hover:bg-[#1F1E1C]/5 hover:text-[#1F1E1C]'
                }
              `}
            >
              {/* Material swatch */}
              <div className="flex items-center gap-2 w-full">
                <span
                  className={`
                    block w-4 h-4 rounded-full shrink-0 border
                    ${isActive ? 'border-white/20' : 'border-[#1F1E1C]/15'}
                  `}
                  style={{
                    background: wheel.color,
                    boxShadow: isActive
                      ? `inset 0 1px 2px rgba(255,255,255,0.15), 0 0 0 1px ${wheel.color}44`
                      : 'inset 0 1px 1px rgba(255,255,255,0.25)',
                  }}
                />
                <span
                  className={`font-mono text-[8px] tracking-[0.18em] uppercase leading-none ${
                    isActive ? 'text-[#EAE6DF]' : 'text-[#1F1E1C]/80'
                  }`}
                >
                  {wheel.id}
                </span>
              </div>

              <span
                className={`text-[9px] leading-tight tracking-wide ${
                  isActive ? 'text-[#EAE6DF]/70' : 'text-[#78746D]'
                }`}
              >
                {wheel.subtitle}
              </span>

              {/* Active accent hairline */}
              {isActive && (
                <span className="absolute left-2 right-2 bottom-1 h-px bg-gradient-to-r from-[#D92B2B] via-[#E6A100] to-transparent opacity-80" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default WheelSelectorHUD;