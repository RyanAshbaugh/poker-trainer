// @ts-nocheck
import React from 'react';

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
    </>
  );
}


