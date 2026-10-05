'use client';

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

export function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.45}
        luminanceThreshold={1.2}
        luminanceSmoothing={0.75}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.2} darkness={0.65} />
    </EffectComposer>
  );
}

export default Effects;