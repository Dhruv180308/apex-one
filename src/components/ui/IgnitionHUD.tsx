'use client';

import {
  useConfiguratorStore,
  type ConfiguratorState,
} from '@/stores/useConfiguratorStore';

export function IgnitionHUD() {
  const engineOn = useConfiguratorStore((s: ConfiguratorState) => s.engineOn);
  const toggleEngine = useConfiguratorStore(
    (s: ConfiguratorState) => s.toggleEngine
  );
  const audioMuted = useConfiguratorStore(
    (s: ConfiguratorState) => s.audioMuted
  );
  const toggleAudioMuted = useConfiguratorStore(
    (s: ConfiguratorState) => s.toggleAudioMuted
  );
  const throttle = useConfiguratorStore((s: ConfiguratorState) => s.throttle);
  const setThrottle = useConfiguratorStore(
    (s: ConfiguratorState) => s.setThrottle
  );
  const scrollProgress = useConfiguratorStore(
    (s: ConfiguratorState) => s.scrollProgress
  );

  // Display rpm estimate
  const rpmNorm = engineOn
    ? Math.min(1, 0.08 + Math.max(scrollProgress * 0.55, throttle * 0.85))
    : 0;
  const rpmDisplay = Math.round(900 + rpmNorm * 7350); // 900 idle → 8250 redline

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-auto">
      <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#121110]/80 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
        {/* Mute */}
        <button
          type="button"
          onClick={() => toggleAudioMuted()}
          title={audioMuted ? 'Unmute' : 'Mute'}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#EAE6DF]/70 hover:text-[#EAE6DF] hover:bg-white/10 transition-colors"
        >
          <span className="font-mono text-[9px] tracking-wider">
            {audioMuted ? 'MUTE' : 'AUD'}
          </span>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10" />

        {/* Ignition */}
        <button
          type="button"
          onClick={() => toggleEngine()}
          className={`
            relative flex items-center gap-2.5 h-9 px-4 rounded-full
            font-mono text-[9px] tracking-[0.22em] uppercase font-semibold
            transition-all duration-300
            ${
              engineOn
                ? 'bg-[#D92B2B] text-white shadow-[0_0_24px_rgba(217,43,43,0.45)]'
                : 'bg-white/10 text-[#EAE6DF] hover:bg-white/15'
            }
          `}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              engineOn
                ? 'bg-white animate-pulse'
                : 'bg-[#EAE6DF]/40'
            }`}
          />
          {engineOn ? 'ENGINE RUN' : 'IGNITION'}
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10" />

        {/* RPM readout */}
        <div className="flex flex-col items-end justify-center px-3 min-w-[72px]">
          <span className="font-mono text-[8px] tracking-[0.2em] text-[#78746D] uppercase leading-none">
            RPM
          </span>
          <span
            className={`font-mono text-[12px] font-medium tabular-nums leading-none mt-0.5 ${
              rpmNorm > 0.85
                ? 'text-[#D92B2B]'
                : engineOn
                  ? 'text-[#EAE6DF]'
                  : 'text-[#EAE6DF]/35'
            }`}
          >
            {engineOn ? rpmDisplay.toLocaleString() : '—'}
          </span>
        </div>
      </div>

      {/* Throttle bar — only when engine live */}
      {engineOn && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121110]/65 backdrop-blur-md border border-white/8">
          <span className="font-mono text-[7px] tracking-[0.2em] text-[#78746D] uppercase">
            Thr
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={throttle}
            onChange={(e) => setThrottle(parseFloat(e.target.value))}
            className="w-28 h-1 appearance-none rounded-full bg-white/15 cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[#E6A100]
              [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(230,161,0,0.5)]"
          />
          <span className="font-mono text-[9px] tabular-nums text-[#EAE6DF]/70 w-6 text-right">
            {Math.round(throttle * 100)}
          </span>
        </div>
      )}
    </div>
  );
}

export default IgnitionHUD;