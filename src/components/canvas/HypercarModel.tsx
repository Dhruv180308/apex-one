'use client';

import { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  useConfiguratorStore,
  WHEEL_STYLES,
  type ConfiguratorState,
} from '@/stores/useConfiguratorStore';

const TARGET_LENGTH = 4.5;

/** Heuristic: mesh is a wheel / rim / spoke */
function isWheelMesh(name: string, mat?: THREE.MeshStandardMaterial): boolean {
  const n = name.toLowerCase();
  if (
    n.includes('wheel') ||
    n.includes('rim') ||
    n.includes('spoke') ||
    n.includes('disk') ||
    n.includes('disc') ||
    n.includes('hub') ||
    n.includes('rotor')
  ) {
    // Prefer rim faces over tire rubber
    if (n.includes('tire') || n.includes('tyre') || n.includes('rubber')) {
      return false;
    }
    return true;
  }
  // Fallback: dark metallic small parts often are rims when unnamed
  if (mat && mat.metalness > 0.5 && mat.roughness < 0.6 && mat.color) {
    const hsl = { h: 0, s: 0, l: 0 };
    mat.color.getHSL(hsl);
    // Dark-ish metals
    if (hsl.l < 0.35 && hsl.s < 0.25) {
      // Only if name hints automotive hardware
      if (n.includes('rim') || n.includes('wheel') || n.includes('alloy')) return true;
    }
  }
  return false;
}

export function HypercarModel() {
  const { scene } = useGLTF('/models/hypercar.glb');
  const groupRef = useRef<THREE.Group>(null!);

  const [model] = useState(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = TARGET_LENGTH / (maxDim || 1);
    clone.scale.setScalar(scaleFactor);

    const scaledBox = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);

    clone.position.x -= center.x;
    clone.position.z -= center.z;
    clone.position.y -= scaledBox.min.y;

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return clone;
  });

  const paintColor = useConfiguratorStore((s: ConfiguratorState) => s.paintColor);
  const headlightsOn = useConfiguratorStore((s: ConfiguratorState) => s.headlightsOn);
  const activeWheel = useConfiguratorStore((s: ConfiguratorState) => s.activeWheel);

  // ── Body paint ──
  useEffect(() => {
    if (!model) return;
    const color = new THREE.Color(paintColor);

    model.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat || !mat.isMeshStandardMaterial) return;

      const name = (mesh.name || '').toLowerCase();

      if (isWheelMesh(name, mat)) return; // wheels handled separately

      const isGlass =
        mat.transparent ||
        mat.opacity < 0.9 ||
        name.includes('glass') ||
        name.includes('window') ||
        name.includes('light') ||
        name.includes('lens');
      const isRubber =
        mat.roughness > 0.85 &&
        mat.metalness < 0.1 &&
        (name.includes('tire') || name.includes('tyre') || name.includes('rubber'));
      const isChrome = mat.metalness > 0.9 && mat.roughness < 0.15;

      if (!isGlass && !isRubber && !isChrome) {
        mat.color.copy(color);
        mat.roughness = 0.25;
        mat.metalness = 0.7;
        mat.envMapIntensity = 1.4;
        mat.needsUpdate = true;
      }
    });
  }, [model, paintColor]);

  // ── Headlight lens emission ──
  useEffect(() => {
    if (!model) return;
    const emissiveColor = new THREE.Color('#FFE2A8');

    model.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat || !mat.isMeshStandardMaterial) return;

      const name = (mesh.name || '').toLowerCase();
      const isHeadlightLens =
        name.includes('light') ||
        name.includes('lamp') ||
        name.includes('lens') ||
        name.includes('drl') ||
        name.includes('led');

      // Don't treat wheel discs named "disc" as lights — already excluded by wheel check intent
      if (isHeadlightLens && !name.includes('brake') && !name.includes('rotor')) {
        if (headlightsOn) {
          mat.emissive = emissiveColor;
          mat.emissiveIntensity = 8.0;
        } else {
          mat.emissive = new THREE.Color('#000000');
          mat.emissiveIntensity = 0;
        }
        mat.needsUpdate = true;
      }
    });
  }, [model, headlightsOn]);

  // ── Wheel style materials ──
  useEffect(() => {
    if (!model) return;
    const style =
      WHEEL_STYLES.find((w) => w.id === activeWheel) ?? WHEEL_STYLES[0];
    const rimColor = new THREE.Color(style.color);

    model.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;

      // Support multi-material meshes
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (!mat || !mat.isMeshStandardMaterial) return;

        const name = (mesh.name || mat.name || '').toLowerCase();
        if (!isWheelMesh(name, mat)) return;

        mat.color.copy(rimColor);
        mat.metalness = style.metalness;
        mat.roughness = style.roughness;
        mat.envMapIntensity = style.envMapIntensity ?? 1.0;

        // clearcoat if supported (MeshPhysicalMaterial) — upgrade lightly
        if ('clearcoat' in mat) {
          (mat as THREE.MeshPhysicalMaterial).clearcoat = style.clearcoat ?? 0;
          (mat as THREE.MeshPhysicalMaterial).clearcoatRoughness =
            style.id === 'matte' ? 0.6 : 0.15;
        }

        mat.needsUpdate = true;
      });
    });
  }, [model, activeWheel]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y =
      Math.sin(t * 0.6) * 0.002 + Math.sin(t * 0.23) * 0.001;
  });

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

export default HypercarModel;

useGLTF.preload('/models/hypercar.glb');