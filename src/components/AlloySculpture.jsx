// src/components/AlloySculpture.jsx
// ALLOY — Central 3D Animation Engine Container
// Integrates:
// 1. AlloyScene (React Three Fiber & Three.js 3D Sculpture on Minimal Stone Pedestal)
// 2. OrbitalCards (Standalone 4-Card Orbital Ecosystem with Slow Elliptical Motion & Metallic Spheres)

import React from 'react';
import AlloyScene from './AlloyScene';
import OrbitalCards from './OrbitalCards';

export default function AlloySculpture({ onOpenVideo, onExploreWork, onFindCreator }) {
  return (
    <div className="revolving-sculpture-container" id="alloy-animation-engine">
      {/* Central 3D Metallic Sculpture Canvas (React Three Fiber) */}
      <AlloyScene />

      {/* Orbiting Portfolio Cards & Metallic Spheres */}
      <OrbitalCards 
        onOpenVideo={onOpenVideo} 
        onExploreWork={onExploreWork} 
      />
    </div>
  );
}
