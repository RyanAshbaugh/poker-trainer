import React from 'react';
import { CardMesh } from './CardMesh';

type Props = {
  seatIndex: number; // 0..5
  faceUp?: boolean;
};

export function HoleCards({ seatIndex, faceUp = false }: Props) {
  const angle = (Math.PI * 2 * seatIndex) / 6 + Math.PI;
  const radius = 3.0;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return (
    <group position={[x, -0.39, z] as any}>
      <CardMesh position={[-0.3, 0, 0]} faceUp={faceUp} />
      <CardMesh position={[0.3, 0, 0]} faceUp={faceUp} />
    </group>
  );
}


