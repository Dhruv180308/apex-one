'use client';

import { useSyncExternalStore } from 'react';
import { CarCanvas } from '@/components/canvas/CarCanvas';
import { ColorPickerHUD } from '@/components/ui/ColorPickerHUD';
import { WheelSelectorHUD } from '@/components/ui/WheelSelectorHUD';
import { SectionHUD } from '@/components/ui/SectionHUD';
import { IgnitionHUD } from '@/components/ui/IgnitionHUD';
import { ReserveModal } from '@/components/ui/ReserveModal';
import { VaultGalleryModal } from '@/components/ui/VaultGalleryModal';
import { Preloader } from '@/components/ui/Preloader';
import { MaterializerOverlay } from '@/components/ui/MaterializerOverlay';
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
    <main
      id="main"
      role="main"
      aria-label="APEX-ONE Hypercar Digital Atelier"
      className="relative w-screen h-screen overflow-hidden bg-[#EAE6DF]"
    >
      {/* Skip link for accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100000] focus:px-4 focus:py-2 focus:bg-[#D92B2B] focus:text-white focus:rounded-lg focus:font-mono focus:text-xs"
      >
        Skip to atelier
      </a>

      <Preloader />

      {isClient && <CarCanvas />}

      <SectionHUD />
      <IgnitionHUD />
      <ReserveModal />
      <VaultGalleryModal />
      <MaterializerOverlay />

      <WheelSelectorHUD />
      <ColorPickerHUD />

      <div className="fixed bottom-8 right-8 z-20 hidden md:flex items-center gap-2 pointer-events-none mix-blend-multiply">
        <span className="font-mono text-[9px] tracking-[0.25em] text-[#78746D] uppercase">
          Scroll to Explore
        </span>
        <div className="w-8 h-[1px] bg-[#78746D]/40" />
      </div>
    </main>
  );
}