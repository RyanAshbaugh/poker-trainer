import React from 'react';

type Props = {
  index: number; // 0..5 around the circle
  radius?: number;
  label: string;
};

export function Seat({ index, radius = 3.4, label }: Props) {
  const angle = (Math.PI * 2 * index) / 6 + Math.PI; // rotate to face top
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return (
    <group position={[x, -0.39, z] as any}>
      <mesh rotation-x={-Math.PI / 2}>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
        <meshStandardMaterial color="#424242" />
      </mesh>
      <mesh position={[0, 0.05, 0] as any}>
        <boxGeometry args={[0.9, 0.02, 0.3]} />
        <meshStandardMaterial color="#212121" />
      </mesh>
      <mesh position={[0, 0.08, 0] as any}>
        <boxGeometry args={[0.8, 0.02, 0.22]} />
        <meshStandardMaterial color="#616161" />
      </mesh>
    </group>
  );
}


