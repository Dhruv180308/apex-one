'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';


export function PointerMiss() {
  const { gl } = useThree();

  useEffect(() => {
    
    return () => {};
  }, [gl]);

  return null;
}