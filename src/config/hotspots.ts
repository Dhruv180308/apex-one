import type { HotspotId } from '@/stores/useConfiguratorStore';

export interface HotspotDef {
  id: Exclude<HotspotId, null>;
  /** World-space position on the 4.5m normalized car */
  position: [number, number, number];
  label: string;
  title: string;
  body: string;
  specs: { label: string; value: string }[];
  action?: 'toggle-headlights' | 'toggle-engine';
  /** Scroll range where this hotspot is emphasized */
  emphasisRange?: [number, number];
}

export const HOTSPOTS: HotspotDef[] = [
  {
    id: 'splitter',
    position: [0.0, 0.15, 2.1],
    label: 'AERO',
    title: 'Carbon Front Splitter',
    body: 'Hand-laid pre-preg carbon fiber channeling air directly into undertray Venturi tunnels.',
    specs: [
      { label: 'Downforce', value: '200 KG @ 250 KM/H' },
      { label: 'Material', value: 'AUTOCLAVE CARBON' },
    ],
    emphasisRange: [0.11, 0.25],
  },
  {
    id: 'headlight',
    position: [0.68, 0.52, 1.75],
    label: 'LIGHTS',
    title: 'LED Matrix Array',
    body: 'Custom lightweight LED projectors with integrated halo daytime running lights.',
    specs: [
      { label: 'System', value: 'FULL MATRIX LED' },
      { label: 'Power', value: '42 W / UNIT' },
    ],
    action: 'toggle-headlights',
    emphasisRange: [0.0, 0.15],
  },
  {
    id: 'brake',
    position: [0.92, 0.32, 0.95],
    label: 'BRAKES',
    title: 'Carbon-Ceramic Discs',
    body: '420mm front ventilated carbon-ceramic rotors paired with 6-piston monoblock calipers.',
    specs: [
      { label: 'Front Disc', value: '420 MM CERAMIC' },
      { label: 'Caliper', value: '6-PISTON MONO' },
    ],
    emphasisRange: [0.25, 0.4],
  },
  {
    id: 'cockpit',
    position: [0.0, 0.92, 0.0],
    label: 'CABIN',
    title: 'Carbon Monocoque',
    body: 'F1-derived structural cell weighing under 72 kg with integrated safety cage.',
    specs: [
      { label: 'Tub Weight', value: '72 KG' },
      { label: 'Torsional', value: '65,000 NM/DEG' },
    ],
    emphasisRange: [0.76, 0.9],
  },
  {
    id: 'exhaust',
    position: [0.0, 0.48, -2.15],
    label: 'POWER',
    title: 'Twin-Turbo 5.0L V8',
    body: '1,360 HP megacar engine driving rear wheels via 7-speed dual-clutch transmission.',
    specs: [
      { label: 'Output', value: '1,360 HP @ 7,500 RPM' },
      { label: 'Torque', value: '1,371 NM' },
    ],
    action: 'toggle-engine',
    emphasisRange: [0.52, 0.68],
  },
];