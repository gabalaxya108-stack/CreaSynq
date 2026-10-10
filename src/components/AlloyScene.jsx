// src/components/AlloyScene.jsx
// ALLOY — 3D Metallic Sculpture Animation Engine
// Built with React Three Fiber (@react-three/fiber) and Three.js
// Features:
// - Intertwined metallic knot sculpted from multiple smooth interlocking 3D tube curves
// - Champagne-gold and brushed-bronze physical materials with realistic specular highlights & studio lighting
// - Minimalist circular stone pedestal (clean architectural plinth)
// - Continuous rotation: 1 complete rotation every 35 seconds (2π / 35 rad/s)
// - Subtle vertical floating & gentle secondary depth rotation in useFrame without React state updates
// - Respects prefers-reduced-motion
// - Robust WebGL fallback with graceful degradation

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// 1. Sculpture Sub-Component (Interlocking Metallic Ribbons)
// ---------------------------------------------------------------------------
function MetallicSculpture({ isReducedMotion }) {
  const masterRef = useRef();
  const glintLightRef = useRef();

  // Curve A: Champagne Gold Ribbon Spline
  const { geomA, goldMaterial } = useMemo(() => {
    const points = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const r = 1.44 + Math.sin(theta * 3) * 0.26;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta * 2) * 0.58;
      const z = Math.sin(theta) * r * 0.82;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
    const geom = new THREE.TubeGeometry(curve, 260, 0.088, 38, true);

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xE6C392,        // Rich Champagne Gold
      metalness: 0.985,
      roughness: 0.065,       // High-polish silky sheen
      clearcoat: 1.0,         // Crisp protective clearcoat reflection
      clearcoatRoughness: 0.025,
      reflectivity: 1.0,
      envMapIntensity: 2.4,
    });

    return { geomA: geom, goldMaterial: mat };
  }, []);

  // Curve B: Brushed Bronze Interlocking Counter-Ribbon
  const { geomB, bronzeMaterial } = useMemo(() => {
    const points = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const r = 1.38 + Math.cos(theta * 3) * 0.24;
      const x = Math.sin(theta) * r * 0.82;
      const y = Math.cos(theta * 2) * 0.58;
      const z = Math.cos(theta) * r;
      points.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
    const geom = new THREE.TubeGeometry(curve, 260, 0.082, 38, true);

    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xBA946E,        // Brushed Warm Bronze
      metalness: 0.95,
      roughness: 0.14,        // Satin brushed texture
      clearcoat: 0.75,
      clearcoatRoughness: 0.08,
      reflectivity: 0.9,
      envMapIntensity: 1.9,
    });

    return { geomB: geom, bronzeMaterial: mat };
  }, []);

  // Curve C: Equatorial Whispering Accent Halo
  const { geomC, accentMaterial } = useMemo(() => {
    const geom = new THREE.TorusGeometry(1.88, 0.012, 16, 140);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xE8C89A,
      metalness: 0.94,
      roughness: 0.08,
      clearcoat: 0.8,
      envMapIntensity: 2.0
    });
    return { geomC: geom, accentMaterial: mat };
  }, []);

  // Interior Golden Catalyst Core (Glowing heart of the fusion)
  const { coreGeom, coreMaterial } = useMemo(() => {
    const geom = new THREE.SphereGeometry(0.36, 42, 42);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xF7D8A4,
      transmission: 0.72,
      transparent: true,
      opacity: 0.98,
      roughness: 0.045,
      ior: 1.54,
      thickness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      attenuationColor: 0xEBBF78,
      attenuationDistance: 0.5,
      envMapIntensity: 2.6
    });
    return { coreGeom: geom, coreMaterial: mat };
  }, []);

  // Constant rotation speed: Exactly 1 full 360° rotation (2π rad) every 35 seconds
  const radPerSec = (Math.PI * 2) / 35; // ~0.17951958 rad/s

  // R3F useFrame Loop — runs directly on GPU/Three.js transforms without updating React state
  useFrame((state, delta) => {
    if (!masterRef.current || isReducedMotion) return;

    const time = state.clock.elapsedTime;

    // 1. Precise 35s Continuous Vertical Axis Rotation
    masterRef.current.rotation.y += delta * radPerSec;

    // 2. Very subtle vertical floating
    masterRef.current.position.y = 0.26 + Math.sin(time * 1.25) * 0.045;

    // 3. Gentle secondary rotation revealing depth (tilt & pitch)
    masterRef.current.rotation.x = Math.sin(time * 0.42) * 0.055;
    masterRef.current.rotation.z = Math.cos(time * 0.32) * 0.04;

    // 4. Traveling specular glint light for moving highlights
    if (glintLightRef.current) {
      glintLightRef.current.position.x = Math.cos(time * 0.75) * 4.2;
      glintLightRef.current.position.y = 1.4 + Math.sin(time * 1.05) * 1.2;
      glintLightRef.current.position.z = Math.sin(time * 0.75) * 3.6 + 2.4;
    }
  });

  return (
    <>
      {/* Master Rotating Sculpture Group */}
      <group ref={masterRef} position={[0, 0.26, 0]}>
        {/* Primary Champagne-Gold Knot Stream */}
        <mesh geometry={geomA} material={goldMaterial} castShadow receiveShadow />

        {/* Secondary Brushed-Bronze Knot Stream */}
        <mesh geometry={geomB} material={bronzeMaterial} castShadow receiveShadow />

        {/* Equatorial Delicate Accent Halo */}
        <mesh 
          geometry={geomC} 
          material={accentMaterial} 
          rotation={[Math.PI * 0.44, Math.PI * 0.16, 0]} 
        />

        {/* Interior Luminous Catalyst Core */}
        <mesh geometry={coreGeom} material={coreMaterial}>
          <pointLight color="#FFC768" intensity={3.0} distance={4.5} decay={2} />
        </mesh>
      </group>

      {/* Orbiting Dynamic Specular Glint Light */}
      <pointLight ref={glintLightRef} position={[2.5, 2.5, 3.5]} intensity={4.2} distance={14} decay={1.6} color="#FFFFFF" />
    </>
  );
}

// ---------------------------------------------------------------------------
// 2. Minimal Circular Stone Pedestal (Architectural Travertine Plinth)
// ---------------------------------------------------------------------------
function StonePedestal() {
  const plinthMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xEAE2D7, // Warm Travertine Stone
    roughness: 0.78,
    metalness: 0.04
  }), []);

  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xDDD3C5, // Grounded Textured Stone
    roughness: 0.92,
    metalness: 0.02
  }), []);

  const haloMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0xE8C89E,
    transparent: true,
    opacity: 0.65
  }), []);

  // Radial Soft Shadow Texture
  const shadowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 122);
    grad.addColorStop(0, 'rgba(40, 32, 22, 0.38)');
    grad.addColorStop(0.48, 'rgba(60, 48, 35, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <group position={[0, -1.68, 0]}>
      {/* Upper Tier: Slim Minimal Circular Stone Disc */}
      <mesh position={[0, 0, 0]} receiveShadow material={plinthMat}>
        <cylinderGeometry args={[1.65, 1.72, 0.28, 64]} />
      </mesh>

      {/* Illuminated Halo Ring Under Plinth */}
      <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]} material={haloMat}>
        <torusGeometry args={[1.68, 0.016, 16, 64]} />
      </mesh>

      {/* Lower Foundation Base Tier */}
      <mesh position={[0, -0.27, 0]} receiveShadow material={baseMat}>
        <cylinderGeometry args={[1.95, 2.15, 0.26, 48]} />
      </mesh>

      {/* Soft Contact Floor Shadow */}
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.4, 5.4]} />
        <meshBasicMaterial map={shadowTexture} transparent={true} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. Studio Lighting & Procedural PMREM Environment Setup
// ---------------------------------------------------------------------------
function StudioLighting() {
  return (
    <>
      {/* Soft Omnidirectional Ambient Light */}
      <ambientLight color="#FFF9F1" intensity={1.8} />

      {/* Studio Key Light (High-Angle Soft Warmth) */}
      <directionalLight
        position={[4.5, 6, 4.5]}
        intensity={3.6}
        color="#FFF7EC"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* Rim / Fill Light for Crisp Silhouette Definition */}
      <directionalLight
        position={[-4.5, 2.5, 2]}
        intensity={1.4}
        color="#DFEAF5"
      />

      {/* Warm Plinth Under-Bounce Light */}
      <directionalLight
        position={[0, -1.8, 3.2]}
        intensity={2.2}
        color="#E5C79E"
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// 4. Main AlloyScene Component with Fallback & Performance Guard
// ---------------------------------------------------------------------------
export default function AlloyScene({ className = '' }) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [webGLFailed, setWebGLFailed] = useState(false);

  useEffect(() => {
    // Detect prefers-reduced-motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mq.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (webGLFailed) {
    // Graceful static fallback if WebGL is unavailable on device
    return (
      <div className={`alloy-webgl-fallback ${className}`} aria-label="ALLOY 3D Sculpture preview">
        <img 
          src="/assets/alloy-login-sculpture.png" 
          alt="ALLOY Metallic Sculpture" 
          className="fallback-static-img"
        />
      </div>
    );
  }

  return (
    <div className={`alloy-scene-canvas-wrapper ${className}`}>
      <Canvas
        camera={{ position: [0, 0.45, 5.9], fov: 38, near: 0.1, far: 50 }}
        dpr={[1, typeof window !== 'undefined' && window.innerWidth < 768 ? 1.5 : 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.35
        }}
        shadows
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        onError={() => setWebGLFailed(true)}
      >
        <StudioLighting />
        <MetallicSculpture isReducedMotion={isReducedMotion} />
        <StonePedestal />
      </Canvas>
    </div>
  );
}
