'use client';

import { useSyncExternalStore } from 'react';
import { CarCanvas } from '@/components/canvas/CarCanvas';
import { ColorPickerHUD } from '@/components/ui/ColorPickerHUD';
import { WheelSelectorHUD } from '@/components/ui/WheelSelectorHUD';
import { SectionHUD } from '@/components/ui/SectionHUD';
import { IgnitionHUD } from '@/components/ui/IgnitionHUD';
import { ReserveModal } from '@/components/ui/ReserveModal';
import { Preloader } from '@/components/ui/Preloader';
import { useScrollRig } from '@/hooks/useScrollRig';
import { useEngineAudio } from '@/hooks/useEngineAudio';

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function HomePage() {
  const isClient = useIsClient();
  useScrollRig();
  useEngineAudio();

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#EAE6DF]">
      <Preloader />

      {isClient && <CarCanvas />}

      <SectionHUD />
      <IgnitionHUD />
      <ReserveModal />

      <WheelSelectorHUD />
      <ColorPickerHUD />

      <div className="fixed bottom-8 right-8 z-20 flex items-center gap-2 pointer-events-none mix-blend-multiply">
        <span className="font-mono text-[9px] tracking-[0.25em] text-[#78746D] uppercase">
          Scroll to Explore
        </span>
        <div className="w-8 h-[1px] bg-[#78746D]/40" />
      </div>
    </main>
  );
}