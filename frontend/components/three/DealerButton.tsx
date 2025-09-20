import React from 'react';

type Props = { position?: [number, number, number] };

export function DealerButton({ position = [0, -0.38, 0] }: Props) {
  return (
    <mesh position={position as any} rotation-x={-Math.PI / 2}>
      <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}


