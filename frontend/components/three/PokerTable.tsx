import React from 'react';

export function PokerTable() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.5, 0] as any}>
      <cylinderGeometry args={[3.2, 3.2, 0.2, 64]} />
      <meshStandardMaterial color="#2e7d32" />
    </mesh>
  );
}


