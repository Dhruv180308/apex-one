// src/config/camera-paths.ts
import * as THREE from 'three';

/**
 * APEX-ONE Camera Choreography — 8-point CatmullRom
 * Car at origin, 4.5m long, ground y=0, FOV 35
 *
 * Progress map:
 *  0.00 → Hero front 3/4
 *  0.12 → Front splitter dive
 *  0.28 → Side skirt / dihedral synchro low
 *  0.42 → Mid-body profile (doors / side mirror)
 *  0.55 → Rear haunches climb
 *  0.68 → Rear wing top-down reveal
 *  0.82 → Cockpit canopy zoom
 *  1.00 → Front low CTA hero
 */

export const CAMERA_POSITIONS: [number, number, number][] = [
  [5.2,  2.0,  5.0],  // 0.00 — Hero front 3/4
  [3.8,  0.55, 4.2],  // 0.12 — Front splitter dive
  [6.2,  0.7,  0.8],  // 0.28 — Side skirt low
  [5.8,  1.3, -1.5],  // 0.42 — Mid profile
  [-2.5, 1.8, -5.2],  // 0.55 — Rear haunches
  [-3.2, 3.2, -3.8],  // 0.68 — Wing elevated
  [1.2,  1.6,  2.4],  // 0.82 — Cockpit zoom
  [3.2,  0.75, 5.5],  // 1.00 — Front low CTA
];

export const CAMERA_TARGETS: [number, number, number][] = [
  [0.0,  0.55,  0.4],  // 0 — Hood center
  [0.0,  0.12,  2.0],  // 1 — Front splitter tip
  [0.3,  0.25,  0.2],  // 2 — Side skirt / rocker
  [0.0,  0.55, -0.3],  // 3 — Door / mid body
  [0.0,  0.65, -1.6],  // 4 — Rear haunch / diffuser
  [0.0,  1.05, -1.9],  // 5 — Top of rear wing
  [0.0,  0.95,  0.15], // 6 — Cockpit canopy / steering
  [0.0,  0.35,  1.5],  // 7 — Front intake / CTA
];

export const cameraPositionCurve = new THREE.CatmullRomCurve3(
  CAMERA_POSITIONS.map((p) => new THREE.Vector3(...p)),
  false,
  'catmullrom',
  0.28
);

export const cameraTargetCurve = new THREE.CatmullRomCurve3(
  CAMERA_TARGETS.map((t) => new THREE.Vector3(...t)),
  false,
  'catmullrom',
  0.28
);

/** Section metadata driven by scrollProgress ranges */
export interface ScrollSection {
  id: string;
  label: string;
  title: string;
  description: string;
  /** Inclusive start of progress range */
  range: [number, number];
  spec?: { label: string; value: string };
}

export const SCROLL_SECTIONS: ScrollSection[] = [
  {
    id: 'hero',
    label: '01 — OVERVIEW',
    title: 'ONE:1',
    description: 'The world\'s first production megacar. One horsepower per kilogram.',
    range: [0.0, 0.11],
    spec: { label: 'Power-to-Weight', value: '1:1' },
  },
  {
    id: 'splitter',
    label: '02 — AERODYNAMICS',
    title: 'FRONT SPLITTER',
    description: 'Carbon fiber splitter generating 200 kg of front downforce at 250 km/h.',
    range: [0.11, 0.25],
    spec: { label: 'Front Downforce', value: '200 KG' },
  },
  {
    id: 'side',
    label: '03 — BODYWORK',
    title: 'DIHEDRAL SYNCRO',
    description: 'Side skirts channel airflow into the Venturi tunnels beneath the chassis.',
    range: [0.25, 0.40],
    spec: { label: 'Drag Coefficient', value: '0.45 Cd' },
  },
  {
    id: 'profile',
    label: '04 — PROPORTION',
    title: 'SIDE PROFILE',
    description: '4.5 meters of sculpted carbon. Every surface has an aerodynamic purpose.',
    range: [0.40, 0.52],
    spec: { label: 'Length', value: '4,500 MM' },
  },
  {
    id: 'haunch',
    label: '05 — POWERTRAIN',
    title: 'REAR HAUNCHES',
    description: 'Twin-turbo 5.0L V8. 1,360 HP. The haunches house the intercoolers.',
    range: [0.52, 0.64],
    spec: { label: 'Torque', value: '1,371 NM' },
  },
    {
    id: 'wing',
    label: '06 — DOWNFORCE',
    title: 'REAR AERO',
    description: 'Sculpted rear deck and diffuser managing extraction and high-speed stability.',
    range: [0.64, 0.76],
    spec: { label: 'Total Downforce', value: '830 KG' },
  },
  {
    id: 'cockpit',
    label: '07 — INTERIOR',
    title: 'COCKPIT',
    description: 'Carbon monocoque tub. Race-derived. Built around the driver.',
    range: [0.76, 0.90],
    spec: { label: 'Dry Weight', value: '1,360 KG' },
  },
  {
    id: 'cta',
    label: '08 — LEGACY',
    title: 'RESERVE YOURS',
    description: 'Only 6 produced. A ratio that will never be repeated.',
    range: [0.90, 1.01],
    spec: { label: 'Top Speed', value: '273 MPH' },
  },
];

/** Resolve active section from normalized scroll 0–1 */
export function getSectionAtProgress(progress: number): ScrollSection {
  const p = Math.max(0, Math.min(1, progress));
  for (let i = SCROLL_SECTIONS.length - 1; i >= 0; i--) {
    if (p >= SCROLL_SECTIONS[i].range[0]) return SCROLL_SECTIONS[i];
  }
  return SCROLL_SECTIONS[0];
}