'use client';

import React, { useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useConfiguratorStore,
  type ConfiguratorState,
  type PaintColor,
  type WheelStyle,
} from '@/stores/useConfiguratorStore';
import {
  DELIVERY_SLOTS,
  RESERVE_DEPOSIT,
  RESERVE_TOTAL_FROM,
  type DeliverySlot,
} from '@/config/reserve';

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ReserveModal() {
  const isClient = useIsClient();
  const reserveOpen = useConfiguratorStore(
    (s: ConfiguratorState) => s.reserveOpen
  );
  const setReserveOpen = useConfiguratorStore(
    (s: ConfiguratorState) => s.setReserveOpen
  );
  const reserveStep = useConfiguratorStore(
    (s: ConfiguratorState) => s.reserveStep
  );
  const activeManifest = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeManifest
  );

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && reserveStep !== 2) {
        setReserveOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reserveStep, setReserveOpen]);

  // Lock body scroll
  useEffect(() => {
    if (!reserveOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [reserveOpen]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {reserveOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8 pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => {
              if (reserveStep !== 2) setReserveOpen(false);
            }}
            className="absolute inset-0 bg-[#0E0D0C]/85 backdrop-blur-xl cursor-pointer"
          />

          {/* Dialog Body */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-[500px] max-h-[min(850px,90vh)] overflow-hidden rounded-2xl bg-[#F4F1EA] text-[#1F1E1C] border border-white/80 shadow-[0_30px_90px_rgba(0,0,0,0.6)] flex flex-col"
          >
            {/* Top Accent Line */}
            <div className="h-[3px] w-full bg-gradient-to-r from-[#D92B2B] via-[#E6A100] to-transparent shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2 shrink-0">
              <div>
                <p className="font-mono text-[8px] tracking-[0.28em] uppercase text-[#D92B2B]">
                  {activeManifest.brand} {activeManifest.name}
                </p>
                <h2 className="text-lg font-bold tracking-tight text-[#1F1E1C]">
                  {reserveStep === 3 ? 'Slot Confirmed' : 'Reserve Delivery'}
                </h2>
              </div>

              {reserveStep !== 2 && (
                <button
                  type="button"
                  onClick={() => setReserveOpen(false)}
                  className="w-8 h-8 rounded-full border border-[#1F1E1C]/15 bg-[#1F1E1C]/[0.05] text-[#1F1E1C] hover:bg-[#1F1E1C]/15 transition-colors text-sm cursor-pointer flex items-center justify-center font-bold"
                  aria-label="Close"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {reserveStep !== 3 && (
              <div className="px-6 pb-3 shrink-0">
                <div className="flex gap-1.5">
                  {[1, 2, 3].map((stepNum: number) => (
                    <div
                      key={stepNum}
                      className={`h-[2px] flex-1 rounded-full transition-colors duration-500 ${
                        reserveStep >= stepNum ? 'bg-[#D92B2B]' : 'bg-[#1F1E1C]/15'
                      }`}
                    />
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between font-mono text-[7px] tracking-[0.2em] uppercase text-[#78746D]">
                  <span>Configure</span>
                  <span>Verify</span>
                  <span>Confirm</span>
                </div>
              </div>
            )}

            {/* Form Scroll Area */}
            <div className="px-6 pb-6 overflow-y-auto flex-1">
              <AnimatePresence mode="wait">
                {reserveStep === 1 && <StepForm key="form" />}
                {reserveStep === 2 && <StepConfirming key="confirming" />}
                {reserveStep === 3 && <StepSuccess key="success" />}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function StepForm() {
  const name = useConfiguratorStore((s: ConfiguratorState) => s.reserveName);
  const email = useConfiguratorStore((s: ConfiguratorState) => s.reserveEmail);
  const phone = useConfiguratorStore((s: ConfiguratorState) => s.reservePhone);
  const slot = useConfiguratorStore((s: ConfiguratorState) => s.reserveSlot);
  const setName = useConfiguratorStore((s: ConfiguratorState) => s.setReserveName);
  const setEmail = useConfiguratorStore((s: ConfiguratorState) => s.setReserveEmail);
  const setPhone = useConfiguratorStore((s: ConfiguratorState) => s.setReservePhone);
  const setSlot = useConfiguratorStore((s: ConfiguratorState) => s.setReserveSlot);
  const setStep = useConfiguratorStore((s: ConfiguratorState) => s.setReserveStep);

  const activeManifest = useConfiguratorStore((s: ConfiguratorState) => s.activeManifest);
  const activeColor = useConfiguratorStore((s: ConfiguratorState) => s.activeColor);
  const activeWheel = useConfiguratorStore((s: ConfiguratorState) => s.activeWheel);

  const paint: PaintColor =
    activeManifest.paints.find((c: PaintColor) => c.id === activeColor) ??
    activeManifest.paints[0];
  const wheel: WheelStyle =
    activeManifest.wheels.find((w: WheelStyle) => w.id === activeWheel) ??
    activeManifest.wheels[0];

  const valid = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    return name.trim().length >= 2 && emailOk && slot.length > 0;
  }, [name, email, slot]);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!valid) return;
      setStep(2);
    },
    [valid, setStep]
  );

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4 pt-1"
    >
      {/* Spec Summary */}
      <div className="rounded-xl border border-[#1F1E1C]/10 bg-white/60 p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <span
            className="w-6 h-6 rounded-full border border-[#1F1E1C]/20 shadow-inner shrink-0"
            style={{ background: paint.hex }}
          />
          <div>
            <p className="text-[12px] font-bold text-[#1F1E1C] leading-none">
              {paint.name}
            </p>
            <p className="font-mono text-[8px] text-[#78746D] uppercase tracking-wider mt-1">
              {paint.finish} · {wheel.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[7px] tracking-[0.16em] uppercase text-[#78746D]">
            From
          </p>
          <p className="font-mono text-[11px] font-bold text-[#1F1E1C]">
            {RESERVE_TOTAL_FROM}
          </p>
        </div>
      </div>

      {/* Input Fields */}
      <div className="flex flex-col gap-2.5">
        <Field
          label="Full Name *"
          value={name}
          onChange={setName}
          placeholder="Christian von Koenigsegg"
          autoComplete="name"
          required
        />
        <Field
          label="Email Address *"
          value={email}
          onChange={setEmail}
          placeholder="owner@atelier.com"
          type="email"
          autoComplete="email"
          required
        />
        <Field
          label="Phone (Optional)"
          value={phone}
          onChange={setPhone}
          placeholder="+46 70 123 4567"
          type="tel"
          autoComplete="tel"
        />
      </div>

      {/* Slot Selection */}
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-[#78746D]">
          Delivery Allocation Slot *
        </span>
        <div className="flex flex-col gap-1.5">
          {DELIVERY_SLOTS.map((s: DeliverySlot) => {
            const active = slot === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSlot(s.id)}
                className={`
                  flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer
                  ${
                    active
                      ? 'bg-[#1F1E1C] border-[#1F1E1C] text-[#EAE6DF] shadow-md'
                      : 'bg-white/60 border-[#1F1E1C]/10 text-[#1F1E1C] hover:border-[#1F1E1C]/25'
                  }
                `}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold tracking-tight">
                      {s.label}
                    </span>
                    {s.premium && (
                      <span
                        className={`font-mono text-[7px] tracking-[0.18em] uppercase px-1.5 py-0.5 rounded ${
                          active
                            ? 'bg-[#D92B2B] text-white'
                            : 'bg-[#D92B2B]/10 text-[#D92B2B]'
                        }`}
                      >
                        Priority
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-mono text-[8.5px] tracking-wider ${
                      active ? 'text-[#EAE6DF]/60' : 'text-[#78746D]'
                    }`}
                  >
                    {s.window}
                  </span>
                </div>
                <span
                  className={`font-mono text-[9px] tabular-nums ${
                    active ? 'text-[#E6A100]' : 'text-[#78746D]'
                  }`}
                >
                  {s.remaining} left
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col gap-2 pt-1">
        <p className="text-[10px] leading-relaxed text-[#78746D]">
          Deposit of <span className="font-bold text-[#1F1E1C]">{RESERVE_DEPOSIT}</span> holds
          your allocation.
        </p>

        <button
          type="submit"
          disabled={!valid}
          className={`
            w-full h-11 rounded-xl font-mono text-[10px] tracking-[0.22em] uppercase font-bold transition-all duration-300
            ${
              valid
                ? 'bg-[#D92B2B] text-white shadow-[0_10px_28px_rgba(217,43,43,0.35)] hover:shadow-[0_14px_36px_rgba(217,43,43,0.5)] active:scale-[0.99] cursor-pointer'
                : 'bg-[#1F1E1C]/10 text-[#1F1E1C]/30 cursor-not-allowed'
            }
          `}
        >
          Hold Allocation →
        </button>
      </div>
    </motion.form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[7px] tracking-[0.24em] uppercase text-[#78746D]">
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-10 px-3.5 rounded-xl bg-white/80 border border-[#1F1E1C]/12 text-[12px] text-[#1F1E1C] placeholder:text-[#1F1E1C]/35 outline-none focus:border-[#D92B2B] focus:ring-2 focus:ring-[#D92B2B]/15 transition-all"
      />
    </label>
  );
}

function StepConfirming() {
  const setStep = useConfiguratorStore(
    (s: ConfiguratorState) => s.setReserveStep
  );

  useEffect(() => {
    const t = window.setTimeout(() => setStep(3), 2600);
    return () => window.clearTimeout(t);
  }, [setStep]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-12 gap-5"
    >
      <div className="relative w-14 h-14">
        <motion.div
          className="absolute inset-0 rounded-full border border-[#1F1E1C]/10"
          style={{ borderTopColor: '#D92B2B', borderWidth: 2 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border border-[#1F1E1C]/8"
          style={{ borderRightColor: '#E6A100', borderWidth: 1 }}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.4, ease: 'linear', repeat: Infinity }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-[#D92B2B] animate-pulse" />
        </div>
      </div>

      <div className="text-center">
        <p className="font-mono text-[8px] tracking-[0.28em] uppercase text-[#D92B2B] mb-1">
          Secure Channel
        </p>
        <p className="text-sm font-bold text-[#1F1E1C]">
          Allocating chassis…
        </p>
        <p className="mt-1 text-[11px] text-[#78746D]">
          Verifying specification against production ledger
        </p>
      </div>

      <div className="w-full max-w-[280px] flex flex-col gap-1.5 font-mono text-[9px] text-[#78746D]">
        {['SPEC HASH', 'PAINT LOCK', 'SLOT LEDGER', 'CLIENT TIER'].map(
          (row: string, i: number) => (
            <motion.div
              key={row}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.25 }}
              className="flex justify-between px-3 py-1.5 rounded-md bg-[#1F1E1C]/[0.04] border border-[#1F1E1C]/8"
            >
              <span className="tracking-[0.16em]">{row}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 + i * 0.25 }}
                className="text-[#3B5336] font-bold"
              >
                OK
              </motion.span>
            </motion.div>
          )
        )}
      </div>
    </motion.div>
  );
}

function StepSuccess() {
  const name = useConfiguratorStore((s: ConfiguratorState) => s.reserveName);
  const email = useConfiguratorStore((s: ConfiguratorState) => s.reserveEmail);
  const slotId = useConfiguratorStore((s: ConfiguratorState) => s.reserveSlot);
  const activeColor = useConfiguratorStore((s: ConfiguratorState) => s.activeColor);
  const activeWheel = useConfiguratorStore((s: ConfiguratorState) => s.activeWheel);
  const activeManifest = useConfiguratorStore((s: ConfiguratorState) => s.activeManifest);
  const setReserveOpen = useConfiguratorStore(
    (s: ConfiguratorState) => s.setReserveOpen
  );

  const slot: DeliverySlot =
    DELIVERY_SLOTS.find((s: DeliverySlot) => s.id === slotId) ?? DELIVERY_SLOTS[0];
  const paint: PaintColor =
    activeManifest.paints.find((c: PaintColor) => c.id === activeColor) ??
    activeManifest.paints[0];
  const wheel: WheelStyle =
    activeManifest.wheels.find((w: WheelStyle) => w.id === activeWheel) ??
    activeManifest.wheels[0];

  const code = useMemo(() => {
    const seed = `${name}|${email}|${slotId}|${activeColor}`
      .split('')
      .reduce((a: number, c: string) => {
        return (a * 33 + c.charCodeAt(0)) >>> 0;
      }, 5381);
    const hex = seed.toString(16).toUpperCase().padStart(8, '0');
    return `APX-${hex.slice(0, 4)}-${hex.slice(4)}`;
  }, [name, email, slotId, activeColor]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center text-center gap-4 py-2"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        className="w-14 h-14 rounded-full bg-[#1F1E1C] flex items-center justify-center shadow-[0_12px_30px_rgba(31,30,28,0.3)]"
      >
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
          <motion.path
            d="M7 15.5L12 20L21 9"
            stroke="#E6A100"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          />
        </svg>
      </motion.div>

      <div>
        <p className="font-mono text-[8px] tracking-[0.28em] uppercase text-[#D92B2B] mb-1">
          Allocation Secured
        </p>
        <h3 className="text-lg font-bold tracking-tight text-[#1F1E1C]">
          Welcome, {name.split(' ')[0] || 'Driver'}
        </h3>
        <p className="mt-1 text-[11px] leading-relaxed text-[#78746D] max-w-[36ch] mx-auto">
          Your {activeManifest.name} delivery slot is held. A client advisor will contact{' '}
          <span className="font-bold text-[#1F1E1C]">{email}</span> within 24 hours.
        </p>
      </div>

      <div className="w-full rounded-xl overflow-hidden border border-[#1F1E1C]/12 bg-white/60 text-left shadow-sm">
        <div className="px-4 py-2 border-b border-[#1F1E1C]/8 flex items-center justify-between bg-[#1F1E1C]/[0.03]">
          <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-[#78746D]">
            Reservation Code
          </span>
          <span className="font-mono text-[11px] font-bold text-[#1F1E1C] tracking-wider">
            {code}
          </span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          <TicketRow label="Allocation" value={slot.label} />
          <TicketRow label="Window" value={slot.window} />
          <TicketRow label="Finish" value={paint.name} />
          <TicketRow label="Wheels" value={wheel.name} />
          <TicketRow label="Deposit" value={RESERVE_DEPOSIT} />
          <TicketRow label="Status" value="HOLD ACTIVE" accent />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setReserveOpen(false)}
        className="w-full h-11 rounded-xl bg-[#1F1E1C] text-[#EAE6DF] font-mono text-[10px] tracking-[0.22em] uppercase font-bold hover:bg-[#1F1E1C]/90 transition-colors cursor-pointer"
      >
        Return to Atelier
      </button>
    </motion.div>
  );
}

function TicketRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-[#78746D]">
        {label}
      </span>
      <span
        className={`text-[11px] font-bold ${
          accent ? 'text-[#D92B2B]' : 'text-[#1F1E1C]'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default ReserveModal;