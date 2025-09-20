import React from 'react';

type Props = {
  position?: [number, number, number];
  rotationX?: number;
  faceUp?: boolean;
};

export function CardMesh({ position = [0, 0, 0], rotationX = -Math.PI / 2, faceUp = false }: Props) {
  return (
    <mesh position={position as any} rotation-x={rotationX}>
      <boxGeometry args={[0.63, 0.88, 0.02]} />
      <meshStandardMaterial color={faceUp ? '#ffffff' : '#cccccc'} />
    </mesh>
  );
}


