import type { PaintColor, WheelStyle, HotspotId } from '@/stores/useConfiguratorStore';

export type VehicleCategory = 'hypercar' | 'superbike' | 'truck' | 'concept';

export interface HotspotDef {
  id: Exclude<HotspotId, null>;
  position: [number, number, number];
  label: string;
  title: string;
  body: string;
  specs: { label: string; value: string }[];
  action?: 'toggle-headlights' | 'toggle-engine';
  emphasisRange?: [number, number];
}

export interface VehicleManifest {
  id: string;
  category: VehicleCategory;
  brand: string;
  name: string;
  subtitle: string;
  year: string;
  glbPath: string;
  targetLengthMeters: number;
  engineType: 'v8-turbo' | 'v12-na' | 'v10-na' | 'quad-ev' | 'bike-inline4';
  specs: {
    power: string;
    powerToWeight: string;
    topSpeed: string;
    acceleration: string;
  };
  paints: PaintColor[];
  wheels: WheelStyle[];
  hotspots: HotspotDef[];
}

export const VEHICLE_REGISTRY: Record<string, VehicleManifest> = {
  one1: {
    id: 'one1',
    category: 'hypercar',
    brand: 'Koenigsegg',
    name: 'One:1',
    subtitle: 'The World’s First Megacar',
    year: '2015',
    glbPath: '/models/hypercar.glb',
    targetLengthMeters: 4.5,
    engineType: 'v8-turbo',
    specs: {
      power: '1,360 HP',
      powerToWeight: '1.00 KG/HP',
      topSpeed: '273 MPH',
      acceleration: '0-400 KM/H 20.0s',
    },
    paints: [
      { id: 'rosso', name: 'Rosso Corsa', hex: '#D92B2B', finish: 'metallic' },
      { id: 'solaris', name: 'Solaris Gold', hex: '#E6A100', finish: 'metallic' },
      { id: 'verde', name: 'Verde Olive', hex: '#3B5336', finish: 'matte' },
      { id: 'sahara', name: 'Sahara Sand', hex: '#C2B280', finish: 'gloss' },
      { id: 'nero', name: 'Nero Carbon', hex: '#1A1918', finish: 'metallic' },
    ],
    wheels: [
      { id: 'forged', name: 'Forged Titanium', subtitle: 'CNC • Brushed', color: '#8A8680', metalness: 0.95, roughness: 0.32, clearcoat: 0.4 },
      { id: 'carbon', name: 'Exposed Carbon', subtitle: 'Twill • 2x2', color: '#1A1918', metalness: 0.35, roughness: 0.48, clearcoat: 0.85 },
      { id: 'matte', name: 'Matte Obsidian', subtitle: 'Stealth • Soft', color: '#0D0C0B', metalness: 0.15, roughness: 0.88 },
    ],
    hotspots: [
      {
        id: 'splitter',
        position: [0.0, 0.25, 2.15],
        label: 'AERO',
        title: 'Carbon Front Splitter',
        body: 'Pre-preg carbon fiber channeling air directly into undertray Venturi tunnels.',
        specs: [
          { label: 'Downforce', value: '200 KG @ 250 KM/H' },
          { label: 'Material', value: 'AUTOCLAVE CARBON' },
        ],
      },
      {
        id: 'headlight',
        position: [0.72, 0.62, 1.75],
        label: 'LIGHTS',
        title: 'LED Matrix Array',
        body: 'Custom lightweight LED projectors with integrated halo daytime running lights.',
        specs: [
          { label: 'System', value: 'FULL MATRIX LED' },
          { label: 'Power', value: '42 W / UNIT' },
        ],
        action: 'toggle-headlights',
      },
      {
        id: 'brake',
        position: [0.98, 0.38, 0.95],
        label: 'BRAKES',
        title: 'Carbon-Ceramic Discs',
        body: '420mm front ventilated carbon-ceramic rotors with 6-piston monoblock calipers.',
        specs: [
          { label: 'Front Disc', value: '420 MM CERAMIC' },
          { label: 'Caliper', value: '6-PISTON MONO' },
        ],
      },
      {
        id: 'cockpit',
        position: [0.0, 1.05, 0.1],
        label: 'CABIN',
        title: 'Carbon Monocoque',
        body: 'F1-derived structural cell weighing under 72 kg with integrated safety cage.',
        specs: [
          { label: 'Tub Weight', value: '72 KG' },
          { label: 'Torsional', value: '65,000 NM/DEG' },
        ],
      },
      {
        id: 'exhaust',
        position: [0.0, 0.58, -2.15],
        label: 'POWER',
        title: 'Twin-Turbo 5.0L V8',
        body: '1,360 HP megacar engine driving rear wheels via 7-speed dual-clutch transmission.',
        specs: [
          { label: 'Output', value: '1,360 HP @ 7,500 RPM' },
          { label: 'Torque', value: '1,371 NM' },
        ],
        action: 'toggle-engine',
      },
    ],
  },
  utopia: {
    id: 'utopia',
    category: 'hypercar',
    brand: 'Pagani',
    name: 'Utopia',
    subtitle: 'Kinetic Sculpture & Pure V12',
    year: '2024',
    glbPath: '/models/utopia.glb',
    targetLengthMeters: 4.6,
    engineType: 'v12-na',
    specs: {
      power: '864 HP',
      powerToWeight: '1.48 KG/HP',
      topSpeed: '238 MPH',
      acceleration: '0-100 KM/H 2.7s',
    },
    paints: [
      { id: 'bianco', name: 'Rinascimento White', hex: '#F0EDE6', finish: 'gloss' },
      { id: 'blu', name: 'Blu Tricolore', hex: '#1B2A4A', finish: 'metallic' },
      { id: 'bronzo', name: 'Bronzo Chiaro', hex: '#634B35', finish: 'metallic' },
      { id: 'nero-utopia', name: 'Carbonio Visibile', hex: '#141312', finish: 'matte' },
    ],
    wheels: [
      { id: 'forged', name: 'Turbine Forged', subtitle: 'Bronze • Monoblock', color: '#8C6F43', metalness: 0.9, roughness: 0.28 },
      { id: 'carbon', name: 'Aero Carbon Extractors', subtitle: 'Exposed Weave', color: '#1A1918', metalness: 0.4, roughness: 0.45 },
    ],
    hotspots: [
      {
        id: 'splitter',
        position: [0.0, 0.25, 2.15],
        label: 'AERO',
        title: 'Active Front Flaps',
        body: 'Independent active aerodynamic flaps balancing high-speed cornering stability.',
        specs: [
          { label: 'System', value: 'ACTIVE DYNAMIC FLAPS' },
          { label: 'Material', value: 'CARBO-TITANIUM' },
        ],
      },
      {
        id: 'headlight',
        position: [0.72, 0.62, 1.75],
        label: 'LIGHTS',
        title: 'Bi-LED Twin Projectors',
        body: 'Custom aluminum-housed projector pods inspired by haute horlogerie watchmaking.',
        specs: [
          { label: 'Housing', value: 'SOLID ALUMINUM BILLET' },
          { label: 'Design', value: 'DUAL POD ARRAY' },
        ],
        action: 'toggle-headlights',
      },
      {
        id: 'brake',
        position: [0.98, 0.38, 0.95],
        label: 'BRAKES',
        title: 'Brembo Carbo-Ceramic',
        body: '410mm front carbon-ceramic discs with lightweight 6-piston monolithic calipers.',
        specs: [
          { label: 'Discs', value: '410 MM BREMBO' },
          { label: 'Material', value: 'CARBO-CERAMIC' },
        ],
      },
      {
        id: 'cockpit',
        position: [0.0, 1.05, 0.1],
        label: 'CABIN',
        title: 'Exposed Gated Shifter',
        body: 'Exposed mechanical gear linkage crafted from solid aluminum billets.',
        specs: [
          { label: 'Mechanism', value: 'EXPOSED GATED MANUAL' },
          { label: 'Craftsmanship', value: 'BILLETS OF ALUMINUM' },
        ],
      },
      {
        id: 'exhaust',
        position: [0.0, 0.58, -2.15],
        label: 'POWER',
        title: 'AMG 6.0L Twin-Turbo V12',
        body: 'Bespoke Pagani V12 producing 864 HP with zero hybrid battery weight.',
        specs: [
          { label: 'Output', value: '864 HP @ 6,000 RPM' },
          { label: 'Torque', value: '1,100 NM' },
        ],
        action: 'toggle-engine',
      },
    ],
  },
  nevera: {
    id: 'nevera',
    category: 'hypercar',
    brand: 'Rimac',
    name: 'Nevera',
    subtitle: 'Quad-Motor Electric Pioneer',
    year: '2023',
    glbPath: '/models/nevera.glb',
    targetLengthMeters: 4.75,
    engineType: 'quad-ev',
    specs: {
      power: '1,914 HP',
      powerToWeight: '1.20 KG/HP',
      topSpeed: '258 MPH',
      acceleration: '0-60 MPH 1.74s',
    },
    paints: [
      { id: 'blue-never', name: 'Electric Blue', hex: '#0F52BA', finish: 'metallic' },
      { id: 'stellar', name: 'Stellar Black', hex: '#121110', finish: 'metallic' },
      { id: 'liquid', name: 'Liquid Silver', hex: '#C0C0C0', finish: 'metallic' },
      { id: 'rosso-nevera', name: 'Signature Red', hex: '#D92B2B', finish: 'gloss' },
    ],
    wheels: [
      { id: 'forged', name: 'Aero-Blade Forged', subtitle: 'Diamond Cut', color: '#B5B5B5', metalness: 0.98, roughness: 0.2 },
      { id: 'matte', name: 'Stealth EV Alloy', subtitle: 'Matte Grey', color: '#222222', metalness: 0.2, roughness: 0.8 },
      { id: 'carbon', name: 'Carbon Extractor', subtitle: 'Composite', color: '#1A1918', metalness: 0.4, roughness: 0.5 },
    ],
    hotspots: [
      {
        id: 'splitter',
        position: [0.0, 0.25, 2.15],
        label: 'AERO',
        title: 'Underbody Active Diffuser',
        body: 'Adjustable front undertray changing angle in milliseconds based on g-force.',
        specs: [
          { label: 'Actuation', value: 'MILLI-SECOND ACTIVE' },
          { label: 'Modes', value: 'LOW DRAG / HIGH DOWNFORCE' },
        ],
      },
      {
        id: 'headlight',
        position: [0.72, 0.62, 1.75],
        label: 'LIGHTS',
        title: 'Full LED DRL Lightbar',
        body: 'Integrated high-efficiency LED lightbar with sweep startup animation.',
        specs: [
          { label: 'Type', value: 'FULL MATRIX DRL' },
          { label: 'Voltage', value: '800 V SYSTEM' },
        ],
        action: 'toggle-headlights',
      },
      {
        id: 'brake',
        position: [0.98, 0.38, 0.95],
        label: 'BRAKES',
        title: 'Electro-Hydraulic Ceramic',
        body: '390mm carbon-ceramic brakes combined with 1.2MW regenerative braking.',
        specs: [
          { label: 'Regen Power', value: '1.2 MEGAWATTS' },
          { label: 'Disc Diameter', value: '390 MM' },
        ],
      },
      {
        id: 'cockpit',
        position: [0.0, 1.05, 0.1],
        label: 'CABIN',
        title: 'H-Shaped 120kWh Battery',
        body: 'Structural liquid-cooled lithium-manganese-nickel battery pack in carbon tub.',
        specs: [
          { label: 'Capacity', value: '120 KWH' },
          { label: 'Architecture', value: '800 VOLT HIGH-SPEED' },
        ],
      },
      {
        id: 'exhaust',
        position: [0.0, 0.58, -2.15],
        label: 'POWER',
        title: 'Quad-Motor Powertrain',
        body: 'Four independent surface-mounted permanent magnet electric motors with torque vectoring.',
        specs: [
          { label: 'Total Output', value: '1,914 HP / 2,360 NM' },
          { label: 'Vectoring', value: '100 TIMES / SECOND' },
        ],
        action: 'toggle-engine',
      },
    ],
  },
};