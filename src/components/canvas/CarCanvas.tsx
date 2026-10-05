'use client';

import { Suspense, Component, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import HypercarModel from './HypercarModel';
import CameraRig from './CameraRig';
import Hotspots from './Hotspots';
import Effects from './Effects';
import { useConfiguratorStore } from '@/stores/useConfiguratorStore';

interface ModelCatchState {
  hasError: boolean;
}

class ModelCatch extends Component<{ children: ReactNode }, ModelCatchState> {
  state: ModelCatchState = { hasError: false };

  static getDerivedStateFromError(): ModelCatchState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <StudioFallbackCar />;
    }
    return this.props.children;
  }
}

function StudioFallbackCar() {
  return (
    <group position={[0, 0.4, 0]}>
      <mesh castShadow>
        <boxGeometry args={[4.2, 0.9, 1.9]} />
        <meshStandardMaterial color="#D92B2B" roughness={0.25} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.55, -0.2]} castShadow>
        <boxGeometry args={[1.8, 0.5, 1.7]} />
        <meshStandardMaterial color="#D92B2B" roughness={0.25} metalness={0.7} />
      </mesh>
    </group>
  );
}

function DynamicStudioLighting() {
  const keyLightRef = useRef<THREE.DirectionalLight>(null!);
  const spotLightRef = useRef<THREE.SpotLight>(null!);
  const floorMatRef = useRef<THREE.MeshStandardMaterial>(null!);

  const dayBg = useRef(new THREE.Color('#EAE6DF'));
  const nightBg = useRef(new THREE.Color('#0E0D0C'));

  const dayFloor = useRef(new THREE.Color('#EAE6DF'));
  const nightFloor = useRef(new THREE.Color('#141312'));

  useFrame(({ scene }) => {
    const p = useConfiguratorStore.getState().scrollProgress;
    const transition = Math.max(0, Math.min(1, (p - 0.45) / 0.5));

    scene.background = scene.background || new THREE.Color();
    (scene.background as THREE.Color).lerpColors(dayBg.current, nightBg.current, transition);

    if (floorMatRef.current) {
      floorMatRef.current.color.lerpColors(dayFloor.current, nightFloor.current, transition);
      floorMatRef.current.roughness = THREE.MathUtils.lerp(0.85, 0.4, transition);
    }

    if (keyLightRef.current) {
      keyLightRef.current.intensity = THREE.MathUtils.lerp(1.8, 0.3, transition);
    }

    if (spotLightRef.current) {
      const spotFactor = Math.max(0, Math.min(1, (p - 0.7) / 0.25));
      spotLightRef.current.intensity = THREE.MathUtils.lerp(0, 65, spotFactor);
    }
  });

  return (
    <>
      <directionalLight
        ref={keyLightRef}
        position={[8, 12, 5]}
        intensity={1.8}
        color="#FFF5E6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />

      <directionalLight position={[-5, 4, -3]} intensity={0.4} color="#C8D8F0" />
      <pointLight position={[-6, 3, 4]} intensity={15} color="#FFD4A0" distance={20} decay={2} />

      <spotLight
        ref={spotLightRef}
        position={[0, 8, 2]}
        target-position={[0, 0, 0]}
        angle={Math.PI / 4}
        penumbra={0.6}
        color="#FFE6A0"
        decay={1.5}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial ref={floorMatRef} color="#EAE6DF" roughness={0.85} metalness={0.05} />
      </mesh>
    </>
  );
}

export function CarCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        fov: 35,
        near: 0.1,
        far: 100,
        position: [5.5, 2.2, 5.5],
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      onPointerMissed={() => {
        useConfiguratorStore.getState().setActiveHotspot(null);
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      <Environment preset="sunset" background={false} environmentIntensity={0.8} />

      <DynamicStudioLighting />

      <Suspense fallback={null}>
        <ModelCatch>
          <HypercarModel />
        </ModelCatch>

        <Hotspots />

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.6}
          scale={14}
          blur={2.5}
          far={4}
          color="#000000"
          resolution={1024}
        />
      </Suspense>

      <CameraRig />
      <Effects />
    </Canvas>
  );
}

export default CarCanvas;