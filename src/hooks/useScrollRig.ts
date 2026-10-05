'use client';

import { useEffect, useRef } from 'react';
import { useConfiguratorStore } from '@/stores/useConfiguratorStore';

/**
 * Maps wheel + touch into a damped 0–1 scrollProgress written to Zustand.
 * Total virtual scroll distance ≈ 4.5 viewports for deliberate pacing.
 */
export function useScrollRig() {
  const target = useRef(0);
  const current = useRef(0);
  const raf = useRef<number>(0);
  const touchY = useRef(0);

  useEffect(() => {
    
    const WHEEL_SENSITIVITY = 0.00115;
    const TOUCH_SENSITIVITY = 0.0014;
    const LERP = 0.075;

    const write = (v: number) => {
      useConfiguratorStore.getState().setScrollProgress(v);
    };

    const tick = () => {
      current.current += (target.current - current.current) * LERP;
      // Snap when close
      if (Math.abs(target.current - current.current) < 0.00015) {
        current.current = target.current;
      }
      write(current.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * WHEEL_SENSITIVITY;
      target.current = Math.max(0, Math.min(1, target.current + delta));
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      const delta = (touchY.current - y) * TOUCH_SENSITIVITY;
      touchY.current = y;
      target.current = Math.max(0, Math.min(1, target.current + delta));
    };

    // Also allow keyboard
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        target.current = Math.max(0, Math.min(1, target.current + 0.08));
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        target.current = Math.max(0, Math.min(1, target.current - 0.08));
      }
      if (e.key === 'Home') target.current = 0;
      if (e.key === 'End') target.current = 1;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, []);
}

export default useScrollRig;