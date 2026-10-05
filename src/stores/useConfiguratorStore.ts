import { create } from 'zustand';

export interface PaintColor {
  id: string;
  name: string;
  hex: string;
  finish: 'metallic' | 'gloss' | 'matte';
}

export const PAINT_COLORS: PaintColor[] = [
  { id: 'rosso', name: 'Rosso Corsa', hex: '#D92B2B', finish: 'metallic' },
  { id: 'solaris', name: 'Solaris Gold', hex: '#E6A100', finish: 'metallic' },
  { id: 'verde', name: 'Verde Olive', hex: '#3B5336', finish: 'matte' },
  { id: 'sahara', name: 'Sahara Sand', hex: '#C2B280', finish: 'gloss' },
  { id: 'nero', name: 'Nero Carbon', hex: '#1A1918', finish: 'metallic' },
];

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

export const WHEEL_STYLES: WheelStyle[] = [
  {
    id: 'forged',
    name: 'Forged Titanium',
    subtitle: 'CNC • Brushed',
    color: '#8A8680',
    metalness: 0.95,
    roughness: 0.32,
    clearcoat: 0.4,
    envMapIntensity: 1.6,
  },
  {
    id: 'carbon',
    name: 'Exposed Carbon',
    subtitle: 'Twill • 2×2',
    color: '#1A1918',
    metalness: 0.35,
    roughness: 0.48,
    clearcoat: 0.85,
    envMapIntensity: 1.2,
  },
  {
    id: 'matte',
    name: 'Matte Obsidian',
    subtitle: 'Stealth • Soft',
    color: '#0D0C0B',
    metalness: 0.15,
    roughness: 0.88,
    clearcoat: 0.05,
    envMapIntensity: 0.4,
  },
];

export type HotspotId =
  | 'splitter'
  | 'headlight'
  | 'brake'
  | 'cockpit'
  | 'exhaust'
  | null;

export interface ConfiguratorState {
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

  // Reserve flow
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

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  scrollProgress: 0,
  setScrollProgress: (progress: number) => set({ scrollProgress: progress }),

  activeColor: 'rosso',
  paintColor: '#D92B2B',
  setPaintColor: (color: PaintColor) =>
    set({ activeColor: color.id, paintColor: color.hex }),

  activeWheel: 'forged',
  setActiveWheel: (id: WheelStyleId) => set({ activeWheel: id }),

  headlightsOn: false,
  toggleHeadlights: () =>
    set((s: ConfiguratorState) => ({ headlightsOn: !s.headlightsOn })),

  doorsOpen: false,
  toggleDoors: () =>
    set((s: ConfiguratorState) => ({ doorsOpen: !s.doorsOpen })),

  activeHotspot: null,
  setActiveHotspot: (id: HotspotId) => set({ activeHotspot: id }),

  engineOn: false,
  setEngineOn: (on: boolean) => set({ engineOn: on }),
  toggleEngine: () =>
    set((s: ConfiguratorState) => ({ engineOn: !s.engineOn })),

  throttle: 0,
  setThrottle: (v: number) => set({ throttle: Math.max(0, Math.min(1, v)) }),

  audioMuted: false,
  toggleAudioMuted: () =>
    set((s: ConfiguratorState) => ({ audioMuted: !s.audioMuted })),

  reserveOpen: false,
  setReserveOpen: (open: boolean) =>
    set((s: ConfiguratorState) => ({
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