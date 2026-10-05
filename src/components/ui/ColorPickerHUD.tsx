'use client';

import {
  useConfiguratorStore,
  PAINT_COLORS,
  type ConfiguratorState,
  type PaintColor,
} from '@/stores/useConfiguratorStore';

export function ColorPickerHUD() {
  const activeColor = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeColor
  );
  const setPaintColor = useConfiguratorStore(
    (s: ConfiguratorState) => s.setPaintColor
  );

  const activeColorObj =
    PAINT_COLORS.find((c) => c.id === activeColor) || PAINT_COLORS[0];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
      {/* Active Color Label */}
      <div className="px-4 py-1.5 rounded-full bg-[#1F1E1C]/80 backdrop-blur-md border border-white/10 text-xs font-mono tracking-widest text-[#EAE6DF] uppercase shadow-lg">
        {activeColorObj.name} •{' '}
        <span className="text-[#78746D]">{activeColorObj.finish}</span>
      </div>

      {/* Color Swatch Bar */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#F4F1EA]/80 backdrop-blur-xl border border-white/40 shadow-2xl">
        {PAINT_COLORS.map((color: PaintColor) => {
          const isActive = activeColor === color.id;
          return (
            <button
              key={color.id}
              onClick={() => setPaintColor(color)}
              title={color.name}
              className={`relative group w-8 h-8 rounded-full transition-all duration-300 ease-out flex items-center justify-center ${
                isActive ? 'scale-125 ring-2 ring-offset-2 ring-[#D92B2B]' : 'hover:scale-110 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: color.hex }}
            >
              <span className="sr-only">{color.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ColorPickerHUD;