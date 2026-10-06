import { create } from 'zustand';
import {
  VEHICLE_REGISTRY,
  type VehicleManifest,
} from '@/config/vehicles';

export interface PaintColor {
  id: string;
  name: string;
  hex: string;
  finish: 'metallic' | 'gloss' | 'matte';
}

export type WheelStyleId = 'forged' | 'carbon' | 'matte';

export interface WheelStyle {
  id: WheelStyleId;
  name: string;
  subtitle: string;
  color: string;
  metalness: number;
  roughness: number;
  clearcoat?: number;
  envMapIntensity?: number;
}

export type HotspotId =
  | 'splitter'
  | 'headlight'
  | 'brake'
  | 'cockpit'
  | 'exhaust'
  | null;

export interface ConfiguratorState {
  activeVehicleId: string;
  activeManifest: VehicleManifest;
  setActiveVehicle: (id: string) => void; // Immediate swap

  // Cinematic Transition State
  isVehicleTransitioning: boolean;
  transitionProgress: number;
  pendingVehicleId: string | null;
  requestVehicleChange: (id: string) => void;
  setTransitionProgress: (v: number) => void;
  executeMidTransitionSwap: () => void;
  endTransition: () => void;

  vaultGalleryOpen: boolean;
  setVaultGalleryOpen: (open: boolean) => void;
  toggleVaultGallery: () => void;

  scrollProgress: number;
  setScrollProgress: (progress: number) => void;

  activeColor: string;
  paintColor: string;
  setPaintColor: (color: PaintColor) => void;

  activeWheel: WheelStyleId;
  setActiveWheel: (id: WheelStyleId) => void;

  headlightsOn: boolean;
  toggleHeadlights: () => void;

  doorsOpen: boolean;
  toggleDoors: () => void;

  activeHotspot: HotspotId;
  setActiveHotspot: (id: HotspotId) => void;

  engineOn: boolean;
  setEngineOn: (on: boolean) => void;
  toggleEngine: () => void;

  throttle: number;
  setThrottle: (v: number) => void;

  audioMuted: boolean;
  toggleAudioMuted: () => void;

  reserveOpen: boolean;
  setReserveOpen: (open: boolean) => void;
  reserveStep: 1 | 2 | 3;
  setReserveStep: (step: 1 | 2 | 3) => void;
  reserveName: string;
  setReserveName: (v: string) => void;
  reserveEmail: string;
  setReserveEmail: (v: string) => void;
  reservePhone: string;
  setReservePhone: (v: string) => void;
  reserveSlot: string;
  setReserveSlot: (v: string) => void;
}

const initialVehicle = VEHICLE_REGISTRY['one1'];

export const useConfiguratorStore = create<ConfiguratorState>((set, get) => ({
  activeVehicleId: 'one1',
  activeManifest: initialVehicle,
  
  // Instant swap (used for initial load)
  setActiveVehicle: (id: string) => {
    const manifest = VEHICLE_REGISTRY[id] || initialVehicle;
    set({
      activeVehicleId: id,
      activeManifest: manifest,
      activeColor: manifest.paints[0].id,
      paintColor: manifest.paints[0].hex,
      activeWheel: manifest.wheels[0].id as WheelStyleId,
      activeHotspot: null,
      engineOn: false,
      throttle: 0,
    });
  },

  // ── Cinematic Transition Methods ──
  isVehicleTransitioning: false,
  transitionProgress: 0,
  pendingVehicleId: null,

  requestVehicleChange: (id: string) => {
    const state = get();
    if (id === state.activeVehicleId || state.isVehicleTransitioning) return;
    if (!VEHICLE_REGISTRY[id]) return;

    set({
      isVehicleTransitioning: true,
      transitionProgress: 0,
      pendingVehicleId: id,
      engineOn: false, // Kill engine during materialization
      throttle: 0,
      activeHotspot: null, // Close popovers
    });
  },

  setTransitionProgress: (v: number) => set({ transitionProgress: Math.max(0, Math.min(1, v)) }),

  // Called halfway through the scan animation to swap the 3D model
  executeMidTransitionSwap: () => {
    const state = get();
    if (!state.pendingVehicleId) return;
    
    const manifest = VEHICLE_REGISTRY[state.pendingVehicleId] || initialVehicle;
    set({
      activeVehicleId: state.pendingVehicleId,
      activeManifest: manifest,
      activeColor: manifest.paints[0].id,
      paintColor: manifest.paints[0].hex,
      activeWheel: manifest.wheels[0].id as WheelStyleId,
    });
  },

  // Called when scan is finished
  endTransition: () => {
    set({
      isVehicleTransitioning: false,
      transitionProgress: 0,
      pendingVehicleId: null,
    });
  },
  // ─────────────────────────────────

  vaultGalleryOpen: false,
  setVaultGalleryOpen: (open: boolean) => set({ vaultGalleryOpen: open }),
  toggleVaultGallery: () => set((s) => ({ vaultGalleryOpen: !s.vaultGalleryOpen })),

  scrollProgress: 0,
  setScrollProgress: (progress: number) => set({ scrollProgress: progress }),

  activeColor: initialVehicle.paints[0].id,
  paintColor: initialVehicle.paints[0].hex,
  setPaintColor: (color: PaintColor) => set({ activeColor: color.id, paintColor: color.hex }),

  activeWheel: initialVehicle.wheels[0].id as WheelStyleId,
  setActiveWheel: (id: WheelStyleId) => set({ activeWheel: id }),

  headlightsOn: false,
  toggleHeadlights: () => set((s) => ({ headlightsOn: !s.headlightsOn })),

  doorsOpen: false,
  toggleDoors: () => set((s) => ({ doorsOpen: !s.doorsOpen })),

  activeHotspot: null,
  setActiveHotspot: (id: HotspotId) => set({ activeHotspot: id }),

  engineOn: false,
  setEngineOn: (on: boolean) => set({ engineOn: on }),
  toggleEngine: () => set((s) => ({ engineOn: !s.engineOn })),

  throttle: 0,
  setThrottle: (v: number) => set({ throttle: Math.max(0, Math.min(1, v)) }),

  audioMuted: false,
  toggleAudioMuted: () => set((s) => ({ audioMuted: !s.audioMuted })),

  reserveOpen: false,
  setReserveOpen: (open: boolean) =>
    set((s) => ({
      reserveOpen: open,
      reserveStep: open ? 1 : s.reserveStep,
    })),
  reserveStep: 1,
  setReserveStep: (step: 1 | 2 | 3) => set({ reserveStep: step }),
  reserveName: '',
  setReserveName: (v: string) => set({ reserveName: v }),
  reserveEmail: '',
  setReserveEmail: (v: string) => set({ reserveEmail: v }),
  reservePhone: '',
  setReservePhone: (v: string) => set({ reservePhone: v }),
  reserveSlot: 'Q3-2026',
  setReserveSlot: (v: string) => set({ reserveSlot: v }),
}));