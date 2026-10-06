'use client';

import { useEffect, useRef } from 'react';
import { useConfiguratorStore } from '@/stores/useConfiguratorStore';

export function useScrollRig() {
  const target = useRef(0);
  const current = useRef(0);
  const velocity = useRef(0);
  const raf = useRef<number>(0);

  const touchY = useRef(0);
  const touchTime = useRef(0);

  useEffect(() => {
    const WHEEL_SENSITIVITY = 0.00115;
    const TOUCH_SENSITIVITY = 0.0016;
    const LERP = 0.08;

    const write = (v: number) => {
      useConfiguratorStore.getState().setScrollProgress(v);
    };

    const tick = () => {
      // Apply momentum velocity decay
      if (Math.abs(velocity.current) > 0.00005) {
        target.current = Math.max(0, Math.min(1, target.current + velocity.current));
        velocity.current *= 0.92; // Friction decay
      } else {
        velocity.current = 0;
      }

      current.current += (target.current - current.current) * LERP;

      if (Math.abs(target.current - current.current) < 0.0001) {
        current.current = target.current;
      }

      write(current.current);
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocity.current = 0; // Clear touch velocity on wheel
      const delta = e.deltaY * WHEEL_SENSITIVITY;
      target.current = Math.max(0, Math.min(1, target.current + delta));
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      velocity.current = 0;
      touchY.current = e.touches[0].clientY;
      touchTime.current = performance.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const y = e.touches[0].clientY;
      const deltaY = touchY.current - y;
      const dt = Math.max(1, performance.now() - touchTime.current);

      touchY.current = y;
      touchTime.current = performance.now();

      const scrollDelta = deltaY * TOUCH_SENSITIVITY;
      target.current = Math.max(0, Math.min(1, target.current + scrollDelta));

      // Calculate flick velocity for momentum
      velocity.current = (scrollDelta / dt) * 12;
    };

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