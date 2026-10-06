'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  useConfiguratorStore,
  type ConfiguratorState,
  type WheelStyle,
  type PaintColor,
} from '@/stores/useConfiguratorStore';

function disposeMaterial(mat: THREE.Material) {
  mat.dispose();
  const record = mat as unknown as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const value = record[key];
    if (
      value &&
      typeof value === 'object' &&
      'isTexture' in value &&
      (value as THREE.Texture).isTexture
    ) {
      (value as THREE.Texture).dispose();
    }
  }
}

function disposeThreeScene(scene: THREE.Object3D) {
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => disposeMaterial(m));
        } else {
          disposeMaterial(mesh.material);
        }
      }
    }
  });
}

function getMeshRadius(mesh: THREE.Mesh): number {
  if (!mesh.geometry) return 0;
  if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
  return mesh.geometry.boundingSphere
    ? mesh.geometry.boundingSphere.radius * Math.abs(mesh.scale.x)
    : 0;
}

function isRubberOrBrake(mesh: THREE.Mesh, mat: THREE.MeshStandardMaterial): boolean {
  const combined = `${mesh.name || ''} ${mat.name || ''}`.toLowerCase();
  if (
    combined.includes('tire') ||
    combined.includes('tyre') ||
    combined.includes('rubber') ||
    combined.includes('tread') ||
    combined.includes('brake') ||
    combined.includes('caliper') ||
    combined.includes('rotor') ||
    combined.includes('disc')
  ) {
    return true;
  }
  if (mat.roughness > 0.82 && mat.metalness < 0.12 && mat.color.r < 0.12) {
    return true;
  }
  return false;
}

function isWheelRimMesh(mesh: THREE.Mesh, mat: THREE.MeshStandardMaterial): boolean {
  if (isRubberOrBrake(mesh, mat)) return false;
  const combined = `${mesh.name || ''} ${mat.name || ''}`.toLowerCase();
  if (
    combined.includes('arch') ||
    combined.includes('house') ||
    combined.includes('well') ||
    combined.includes('fender') ||
    combined.includes('skirt')
  ) {
    return false;
  }
  const isRimNamed =
    combined.includes('wheel') ||
    combined.includes('rim') ||
    combined.includes('spoke') ||
    combined.includes('alloy') ||
    combined.includes('hub') ||
    combined.includes('centerlock');
  const r = getMeshRadius(mesh);
  return isRimNamed && (r === 0 || r < 0.62);
}

function isBodyPaintMesh(mesh: THREE.Mesh, mat: THREE.MeshStandardMaterial): boolean {
  if (isRubberOrBrake(mesh, mat) || isWheelRimMesh(mesh, mat)) return false;
  const combined = `${mesh.name || ''} ${mat.name || ''}`.toLowerCase();
  if (
    mat.transparent ||
    mat.opacity < 0.88 ||
    combined.includes('glass') ||
    combined.includes('window') ||
    combined.includes('lens') ||
    combined.includes('light') ||
    combined.includes('lamp') ||
    combined.includes('interior') ||
    combined.includes('seat') ||
    combined.includes('engine') ||
    combined.includes('exhaust')
  ) {
    return false;
  }
  if (
    combined.includes('body') ||
    combined.includes('paint') ||
    combined.includes('shell') ||
    combined.includes('exterior') ||
    combined.includes('chassis') ||
    combined.includes('hood') ||
    combined.includes('door') ||
    combined.includes('fender') ||
    combined.includes('bumper') ||
    combined.includes('panel') ||
    combined.includes('primary') ||
    combined.includes('color') ||
    combined.includes('nevera') ||
    combined.includes('utopia') ||
    combined.includes('one1')
  ) {
    return true;
  }
  if (mat.roughness < 0.88) return true;
  return false;
}

export function DynamicVehicleModel() {
  const activeManifest = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeManifest
  );
  const activeColor = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeColor
  );
  const activeWheel = useConfiguratorStore(
    (s: ConfiguratorState) => s.activeWheel
  );
  const headlightsOn = useConfiguratorStore(
    (s: ConfiguratorState) => s.headlightsOn
  );

  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(activeManifest.glbPath);

  const normalizedModel = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scaleFactor =
      activeManifest.targetLengthMeters / (Math.max(size.x, size.y, size.z) || 1);
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
    clone.updateMatrixWorld(true);
    return clone;
  }, [scene, activeManifest.targetLengthMeters, activeManifest.glbPath]);

  useEffect(() => {
    return () => {
      if (normalizedModel) disposeThreeScene(normalizedModel);
    };
  }, [normalizedModel]);

  // Body Paint Application
  useEffect(() => {
    if (!normalizedModel) return;
    normalizedModel.updateMatrixWorld(true);
    const paintObj: PaintColor =
      activeManifest.paints.find((p) => p.id === activeColor) ||
      activeManifest.paints[0];
    const color = new THREE.Color(paintObj.hex);

    normalizedModel.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      mats.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (!mat || !mat.isMeshStandardMaterial) return;
        if (isBodyPaintMesh(mesh, mat)) {
          if (mat.map) mat.map = null;
          mat.color.copy(color);
          if (paintObj.finish === 'metallic') {
            mat.metalness = 0.75;
            mat.roughness = 0.22;
            mat.envMapIntensity = 1.6;
          } else if (paintObj.finish === 'gloss') {
            mat.metalness = 0.15;
            mat.roughness = 0.08;
            mat.envMapIntensity = 1.8;
          } else if (paintObj.finish === 'matte') {
            mat.metalness = 0.05;
            mat.roughness = 0.78;
            mat.envMapIntensity = 0.5;
          }
          mat.needsUpdate = true;
        }
      });
    });
  }, [normalizedModel, activeColor, activeManifest]);

  // Wheel Style Application
  useEffect(() => {
    if (!normalizedModel) return;
    normalizedModel.updateMatrixWorld(true);
    const style: WheelStyle =
      activeManifest.wheels.find((w) => w.id === activeWheel) ||
      activeManifest.wheels[0];
    const rimColor = new THREE.Color(style.color);

    normalizedModel.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      mats.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (!mat || !mat.isMeshStandardMaterial) return;
        if (isWheelRimMesh(mesh, mat)) {
          if (mat.map) mat.map = null;
          mat.color.copy(rimColor);
          mat.metalness = style.metalness;
          mat.roughness = style.roughness;
          mat.envMapIntensity = style.envMapIntensity ?? 1.2;
          if ('clearcoat' in mat)
            (mat as THREE.MeshPhysicalMaterial).clearcoat =
              style.clearcoat ?? 0.2;
          mat.needsUpdate = true;
        }
      });
    });
  }, [normalizedModel, activeWheel, activeManifest]);

  // Headlight Ignition
  useEffect(() => {
    if (!normalizedModel) return;
    const emissiveColor = new THREE.Color('#FFE2A8');
    normalizedModel.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat || !mat.isMeshStandardMaterial) return;
      const c = (mesh.name || '').toLowerCase();
      if (
        (c.includes('light') ||
          c.includes('lamp') ||
          c.includes('lens') ||
          c.includes('led')) &&
        !c.includes('brake') &&
        !c.includes('rotor')
      ) {
        mat.emissive = headlightsOn ? emissiveColor : new THREE.Color('#000000');
        mat.emissiveIntensity = headlightsOn ? 8.0 : 0;
        mat.needsUpdate = true;
      }
    });
  }, [normalizedModel, headlightsOn]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y =
      Math.sin(t * 0.6) * 0.002 + Math.sin(t * 0.23) * 0.001;
  });

  return (
    <group ref={groupRef} key={activeManifest.id}>
      <primitive object={normalizedModel} key={normalizedModel.uuid} />
    </group>
  );
}

export default DynamicVehicleModel;

useGLTF.preload('/models/hypercar.glb');
useGLTF.preload('/models/utopia.glb');
useGLTF.preload('/models/nevera.glb');