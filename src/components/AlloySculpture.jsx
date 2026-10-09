// src/components/AlloySculpture.jsx
// ALLOY — Signature 3D Revolving Sculpture & Interactive Revolving Ecosystem
// Matches the user's reference image with:
// - Three.js real-time revolving champagne-gold knot sculpture
// - Dual-tier travertine pedestal engraved with "ALLOY"
// - Luminous 3D orbital rings with traveling gold beads
// - Revolving cards matching the picture:
//   1. Creators card (with 5 circular avatars + '+')
//   2. Brands card (with Nike, Airbnb, Spotify + '+')
//   3. Video Card 1 (Fashion portrait with play button)
//   4. Video Card 2 (Skincare bottle with play button)
//   5. Video Card 3 (Mountain cinema with play button)
//   6. Product Still-Life Card
//   7. ✦ AI Match pill
//   8. 💡 Campaign Ideas pill
//   9. 👥 Creative Teams pill
// - Smooth continuous revolving orbital motion that pauses on hover and responds to clicks

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Sparkles, Lightbulb, Users, Plus } from 'lucide-react';

export default function AlloySculpture({ onOpenVideo, onExploreWork, onFindCreator }) {
  const mountRef = useRef(null);
  const isOrbitPausedRef = useRef(false);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Revolving orbital angle (radians)
  const [orbitAngle, setOrbitAngle] = useState(0);

  // -------------------------------------------------------------
  // 1. Three.js 3D WebGL Scene: Revolving Sculpture & Pedestal
  // -------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = container.clientWidth || 640;
    let height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 6.2);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('[ALLOY 3D] WebGL fallback:', e);
      return;
    }

    // --- Studio PMREM Environment Map for Brilliant Metallic Reflections & Shine ---
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512;
    envCanvas.height = 256;
    const eCtx = envCanvas.getContext('2d');
    
    // Background soft studio gradient
    const bgGrad = eCtx.createLinearGradient(0, 0, 0, 256);
    bgGrad.addColorStop(0, '#ECE2D2');
    bgGrad.addColorStop(0.5, '#F8F4EE');
    bgGrad.addColorStop(1, '#D8CEBE');
    eCtx.fillStyle = bgGrad;
    eCtx.fillRect(0, 0, 512, 256);

    // Primary bright studio softbox (produces crisp liquid-metal specular reflections)
    const sb1 = eCtx.createRadialGradient(150, 65, 0, 150, 65, 110);
    sb1.addColorStop(0, '#FFFFFF');
    sb1.addColorStop(0.35, '#FFF8EC');
    sb1.addColorStop(0.75, 'rgba(255, 238, 210, 0.55)');
    sb1.addColorStop(1, 'rgba(248, 244, 238, 0)');
    eCtx.fillStyle = sb1;
    eCtx.fillRect(0, 0, 512, 256);

    // Secondary rim softbox (adds crisp edge highlights)
    const sb2 = eCtx.createRadialGradient(390, 80, 0, 390, 80, 95);
    sb2.addColorStop(0, '#FFFFFF');
    sb2.addColorStop(0.45, 'rgba(255, 250, 242, 0.7)');
    sb2.addColorStop(1, 'rgba(248, 244, 238, 0)');
    eCtx.fillStyle = sb2;
    eCtx.fillRect(0, 0, 512, 256);

    // Warm champagne floor bounce (glows on lower curvature)
    const sb3 = eCtx.createRadialGradient(256, 220, 0, 256, 220, 90);
    sb3.addColorStop(0, '#E5C59C');
    sb3.addColorStop(1, 'rgba(216, 206, 190, 0)');
    eCtx.fillStyle = sb3;
    eCtx.fillRect(0, 0, 512, 256);

    const pmremGen = new THREE.PMREMGenerator(renderer);
    pmremGen.compileEquirectangularShader();
    const envTexture = new THREE.CanvasTexture(envCanvas);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    const envMap = pmremGen.fromEquirectangular(envTexture).texture;
    scene.environment = envMap;

    // --- Sculpture Master Group (Kinetic Gyroscopic Alloy Core) ---
    const sculptureGroup = new THREE.Group();
    sculptureGroup.position.y = 0.25;

    // 1. STREAM A: Liquid Champagne Gold Infinity Ribbon
    // Generates a graceful, aerodynamic 3D Möbius / Lemniscate spline
    const pointsA = [];
    const countA = 24;
    for (let i = 0; i < countA; i++) {
      const theta = (i / countA) * Math.PI * 2;
      const r = 1.48 + Math.sin(theta * 3) * 0.28;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta * 2) * 0.62;
      const z = Math.sin(theta) * r * 0.82;
      pointsA.push(new THREE.Vector3(x, y, z));
    }
    const curveA = new THREE.CatmullRomCurve3(pointsA, true, 'centripetal');
    const geomA = new THREE.TubeGeometry(curveA, 280, 0.088, 42, true);
    const goldStreamMat = new THREE.MeshPhysicalMaterial({
      color: 0xE8C592,        // Rich Luminous Champagne Gold
      metalness: 0.985,       // High-purity liquid gold alloy
      roughness: 0.058,       // Mirror-slick silky finish
      clearcoat: 1.0,         // Crisp lacquer clearcoat
      clearcoatRoughness: 0.02,
      reflectivity: 1.0,
      envMapIntensity: 2.6,
    });
    const meshStreamA = new THREE.Mesh(geomA, goldStreamMat);
    meshStreamA.castShadow = true;
    meshStreamA.receiveShadow = true;
    sculptureGroup.add(meshStreamA);

    // 2. STREAM B: Golden Inner Spiral Counter-Orbital Ribbon
    // Harmonized in matching rich champagne gold as referred in reference image
    const pointsB = [];
    const countB = 24;
    for (let i = 0; i < countB; i++) {
      const theta = (i / countB) * Math.PI * 2;
      const r = 1.42 + Math.cos(theta * 3) * 0.26;
      const x = Math.sin(theta) * r * 0.82;
      const y = Math.cos(theta * 2) * 0.62;
      const z = Math.cos(theta) * r;
      pointsB.push(new THREE.Vector3(x, y, z));
    }
    const curveB = new THREE.CatmullRomCurve3(pointsB, true, 'centripetal');
    const geomB = new THREE.TubeGeometry(curveB, 280, 0.082, 42, true);
    const goldInnerMat = new THREE.MeshPhysicalMaterial({
      color: 0xE2BE8A,        // Deep Warm Champagne Gold for inner spiral curves
      metalness: 0.985,
      roughness: 0.062,
      clearcoat: 1.0,
      clearcoatRoughness: 0.025,
      reflectivity: 1.0,
      envMapIntensity: 2.5,
    });
    const meshStreamB = new THREE.Mesh(geomB, goldInnerMat);
    meshStreamB.castShadow = true;
    meshStreamB.receiveShadow = true;
    sculptureGroup.add(meshStreamB);

    // 3. STREAM C: Delicate Whispering Equatorial Aero-Ring
    const ringGeomC = new THREE.TorusGeometry(1.92, 0.014, 24, 180);
    const ringMatC = new THREE.MeshPhysicalMaterial({
      color: 0xE8C89A,
      metalness: 0.96,
      roughness: 0.08,
      clearcoat: 0.9,
      envMapIntensity: 2.3
    });
    const meshRingC = new THREE.Mesh(ringGeomC, ringMatC);
    meshRingC.rotation.x = Math.PI * 0.44;
    meshRingC.rotation.y = Math.PI * 0.16;
    sculptureGroup.add(meshRingC);

    // 4. THE LUMINOUS GOLDEN CORE (Inside Spiral)
    // Floating refractive golden crystal sphere with internal warm gold light
    const coreGeom = new THREE.SphereGeometry(0.38, 48, 48);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xF7D8A4,        // Radiant Warm Gold Core
      transmission: 0.72,     // Golden crystal refraction
      transparent: true,
      opacity: 0.98,
      roughness: 0.045,
      ior: 1.54,
      thickness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      attenuationColor: 0xEBBF78,
      attenuationDistance: 0.5,
      envMapIntensity: 2.8,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    sculptureGroup.add(coreMesh);

    // Inner Radiant Golden Glow Source within the Core
    const coreGlowLight = new THREE.PointLight(0xFFC768, 3.4, 5, 2);
    coreMesh.add(coreGlowLight);

    // 5. ZERO-GRAVITY MOLTEN SATELLITES (Floating Liquid Gold Droplets)
    const dropletsGroup = new THREE.Group();
    const dropletConfigs = [
      { r: 0.085, mat: goldStreamMat, dist: 1.75, speed: 0.55, offset: 0, tilt: 0.3 },
      { r: 0.068, mat: goldInnerMat, dist: 2.05, speed: 0.42, offset: 2.1, tilt: -0.4 },
      { r: 0.076, mat: goldStreamMat, dist: 1.62, speed: 0.62, offset: 4.2, tilt: 0.6 },
      { r: 0.055, mat: goldInnerMat, dist: 2.25, speed: 0.35, offset: 1.3, tilt: -0.2 },
      { r: 0.062, mat: goldStreamMat, dist: 1.90, speed: 0.48, offset: 3.5, tilt: 0.15 },
    ];
    const droplets = dropletConfigs.map((cfg) => {
      const dMesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.r, 32, 32), cfg.mat);
      dMesh.castShadow = true;
      dropletsGroup.add(dMesh);
      return { mesh: dMesh, ...cfg };
    });
    sculptureGroup.add(dropletsGroup);

    scene.add(sculptureGroup);

    // --- Luminous 3D Orbital Outer Filament Tracks ---
    const orbitalTrackGroup = new THREE.Group();
    orbitalTrackGroup.position.y = 0.25;

    const outerRingGeom1 = new THREE.TorusGeometry(2.42, 0.009, 16, 180);
    const outerRingMat1 = new THREE.MeshPhysicalMaterial({
      color: 0xF0DEC8,
      metalness: 0.88,
      roughness: 0.15,
      transparent: true,
      opacity: 0.65,
    });
    const outerRing1 = new THREE.Mesh(outerRingGeom1, outerRingMat1);
    outerRing1.rotation.x = Math.PI * 0.40;
    outerRing1.rotation.y = Math.PI * 0.14;
    orbitalTrackGroup.add(outerRing1);

    const outerRingGeom2 = new THREE.TorusGeometry(2.25, 0.008, 16, 180);
    const outerRingMat2 = new THREE.MeshPhysicalMaterial({
      color: 0xE2C8AB,
      metalness: 0.88,
      roughness: 0.15,
      transparent: true,
      opacity: 0.55,
    });
    const outerRing2 = new THREE.Mesh(outerRingGeom2, outerRingMat2);
    outerRing2.rotation.x = Math.PI * 0.62;
    outerRing2.rotation.y = -Math.PI * 0.18;
    orbitalTrackGroup.add(outerRing2);

    scene.add(orbitalTrackGroup);

    // --- Ambient Floating Gold Dust Motes (Aesthetic Shimmer) ---
    const motesCount = 32;
    const motesPositions = new Float32Array(motesCount * 3);
    for (let i = 0; i < motesCount; i++) {
      const angle = (i / motesCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const rad = 1.4 + Math.random() * 1.6;
      motesPositions[i * 3] = Math.cos(angle) * rad;
      motesPositions[i * 3 + 1] = (Math.random() - 0.3) * 2.4;
      motesPositions[i * 3 + 2] = Math.sin(angle) * rad;
    }
    const motesGeom = new THREE.BufferGeometry();
    motesGeom.setAttribute('position', new THREE.BufferAttribute(motesPositions, 3));
    const motesMat = new THREE.PointsMaterial({
      color: 0xE8CDA5,
      size: 0.045,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const motesMesh = new THREE.Points(motesGeom, motesMat);
    scene.add(motesMesh);

    // --- Sleek Architectural Floating Plinth with "ALLOY" Inscription ---
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.y = -1.68;

    // Upper Tier: Ultra-Slim Chamfered Disc
    const plinthGeom = new THREE.CylinderGeometry(1.65, 1.72, 0.28, 64);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xEAE2D7, // Warm Travertine Stone
      roughness: 0.75,
      metalness: 0.04
    });
    const plinthMesh = new THREE.Mesh(plinthGeom, plinthMat);
    plinthMesh.receiveShadow = true;
    pedestalGroup.add(plinthMesh);

    // Illuminated Luminous Halo Ring Under the Plinth
    const haloGeom = new THREE.TorusGeometry(1.68, 0.018, 16, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xE8C89E,
      transparent: true,
      opacity: 0.75
    });
    const haloMesh = new THREE.Mesh(haloGeom, haloMat);
    haloMesh.rotation.x = Math.PI / 2;
    haloMesh.position.y = 0.13;
    pedestalGroup.add(haloMesh);

    // Lower Tier: Grounded Textured Travertine Foundation Base
    const baseGeom = new THREE.CylinderGeometry(1.95, 2.15, 0.26, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xDDD3C5,
      roughness: 0.9,
      metalness: 0.02
    });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.y = -0.27;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Engraved "ALLOY" Typography on Front Face
    const canvasText = document.createElement('canvas');
    canvasText.width = 512;
    canvasText.height = 128;
    const ctxText = canvasText.getContext('2d');
    ctxText.fillStyle = '#EAE2D7';
    ctxText.fillRect(0, 0, 512, 128);
    ctxText.font = 'bold 44px "Space Grotesk", sans-serif';
    ctxText.textAlign = 'center';
    ctxText.textBaseline = 'middle';
    ctxText.fillStyle = '#443C34';
    ctxText.letterSpacing = '16px';
    ctxText.fillText('A L L O Y', 256, 64);

    const textTexture = new THREE.CanvasTexture(canvasText);
    const plaqueMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.22, 0.24),
      new THREE.MeshBasicMaterial({ map: textTexture, transparent: true, opacity: 0.92 })
    );
    plaqueMesh.position.set(0, 0.01, 1.66);
    pedestalGroup.add(plaqueMesh);

    // Soft Ambient Contact Floor Shadow
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(40, 32, 22, 0.38)');
    grad.addColorStop(0.45, 'rgba(60, 48, 35, 0.14)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 256, 256);

    const floorShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 5.4),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shadowCanvas), transparent: true })
    );
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = -0.42;
    pedestalGroup.add(floorShadow);

    scene.add(pedestalGroup);

    // --- Studio Lighting Setup for Maximum Luster & Shine ---
    const ambientLight = new THREE.AmbientLight(0xFFF9F1, 1.8);
    scene.add(ambientLight);

    // High-angle studio key light
    const keyLight = new THREE.DirectionalLight(0xFFF7EC, 3.8);
    keyLight.position.set(4.5, 6, 4.5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Rim/fill light for crisp edge definitions
    const fillLight = new THREE.DirectionalLight(0xDFEAF5, 1.5);
    fillLight.position.set(-4.5, 2.5, 2);
    scene.add(fillLight);

    // Warm under-bounce from plinth
    const warmBounceLight = new THREE.DirectionalLight(0xE5C79E, 2.4);
    warmBounceLight.position.set(0, -1.8, 3.2);
    scene.add(warmBounceLight);

    // Dynamic Orbiting Specular Glint Light (sweeps across curves for sparkling traveling reflections)
    const glintLight = new THREE.PointLight(0xFFFFFF, 4.8, 15, 1.5);
    glintLight.position.set(2.5, 2.8, 3.5);
    scene.add(glintLight);

    // --- Pointer Parallax Listener ---
    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / height - 0.5) * 2;
      mouseRef.current.targetX = x * 0.45;
      mouseRef.current.targetY = y * 0.35;
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // --- Window Resize Listener ---
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 640;
      height = container.clientHeight || 560;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation & Continuous Revolution Loop ---
    let frameId;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Mouse Lerp Damping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // CONTINUOUS REVOLVING ROTATION & KINETIC HARMONY
      if (!prefersReducedMotion) {
        // Stream A (Champagne Gold): Smooth clockwise orbital flow
        meshStreamA.rotation.y += delta * 0.28;
        meshStreamA.rotation.x = Math.sin(time * 0.55) * 0.12;

        // Stream B (Rose-Platinum): Counter-inclined harmonic flow
        meshStreamB.rotation.y -= delta * 0.22;
        meshStreamB.rotation.z = Math.cos(time * 0.45) * 0.14;

        // Stream C (Equatorial Ring): Delicate counter-wobble
        meshRingC.rotation.z += delta * 0.15;

        // Core Breathing Pulse (Hypnotic Luminous Heart)
        const corePulse = 1.0 + Math.sin(time * 2.2) * 0.04;
        coreMesh.scale.set(corePulse, corePulse, corePulse);
        coreMesh.position.y = Math.sin(time * 1.5) * 0.04;
        coreGlowLight.intensity = 2.8 + Math.sin(time * 2.2) * 0.8;

        // Master Sculpture Floating Levitation
        sculptureGroup.position.y = 0.25 + Math.sin(time * 1.25) * 0.05;

        // Zero-Gravity Molten Droplets Orbiting
        droplets.forEach((d) => {
          const a = time * d.speed + d.offset;
          d.mesh.position.set(
            Math.cos(a) * d.dist,
            Math.sin(a * 1.2 + d.tilt) * (d.dist * 0.38),
            Math.sin(a) * d.dist
          );
        });

        // Dynamic Glint Light Counter-Orbit for Traveling Specular Gleams
        glintLight.position.x = Math.cos(time * 0.82) * 4.6;
        glintLight.position.y = 1.5 + Math.sin(time * 1.1) * 1.4;
        glintLight.position.z = Math.sin(time * 0.82) * 3.8 + 2.5;

        // Outer Orbital Rings Slow Cosmic Drift
        outerRing1.rotation.z = time * 0.08;
        outerRing2.rotation.z = -time * 0.06;

        // Ambient Motes Gentle Drift
        motesMesh.rotation.y = time * 0.05;
        motesMesh.position.y = Math.sin(time * 0.8) * 0.04;
      }

      // Parallax Camera Response
      camera.position.x = mouseRef.current.x * 0.45;
      camera.position.y = 0.5 - mouseRef.current.y * 0.3;
      camera.lookAt(0, 0.15, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      pmremGen?.dispose();
      envTexture?.dispose();
      envMap?.dispose();
      if (renderer?.domElement?.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, []);

  // -------------------------------------------------------------
  // 2. Revolving HTML Orbital Elements Loop
  // -------------------------------------------------------------
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Revolves along orbital tracks when not hovered
      if (!isOrbitPausedRef.current) {
        setOrbitAngle((prev) => (prev + dt * 0.16) % (Math.PI * 2));
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Helper function to calculate 3D elliptical coordinates & depth scale
  const getOrbitStyle = (angleOffset, radiusX = 220, radiusY = 120, tiltY = -20) => {
    const a = orbitAngle + angleOffset;
    const x = Math.cos(a) * radiusX;
    const y = Math.sin(a) * radiusY + tiltY;
    const depth = Math.sin(a); // -1 (back) to +1 (front)
    const scale = 0.94 + ((depth + 1) / 2) * 0.14; // 0.94 to 1.08
    const zIndex = depth > 0 ? 25 : 3;
    const opacity = depth > 0 ? 1 : 0.88;

    return {
      transform: `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(2)})`,
      zIndex,
      opacity,
      transition: isOrbitPausedRef.current ? 'transform 0.25s ease' : 'none'
    };
  };

  return (
    <div className="revolving-sculpture-container">
      
      {/* 3D WebGL Canvas Mount */}
      <div className="three-sculpture-viewport" ref={mountRef} />

      {/* Luminous Orbital Rings SVG Overlay for Delicate Glimmer */}
      <div className="orbital-rings-overlay" aria-hidden="true">
        <svg className="orbital-tracks-svg" viewBox="0 0 640 560" fill="none">
          <ellipse 
            cx="320" 
            cy="270" 
            rx="270" 
            ry="145" 
            stroke="rgba(199, 164, 123, 0.35)" 
            strokeWidth="1.2" 
            transform="rotate(-8 320 270)"
          />
          <ellipse 
            cx="320" 
            cy="275" 
            rx="235" 
            ry="120" 
            stroke="rgba(168, 132, 98, 0.25)" 
            strokeWidth="1" 
            transform="rotate(12 320 275)"
          />
        </svg>
      </div>

      {/* ========================================================
          REVOLVING ORBITAL ELEMENTS MATCHING THE REFERENCE IMAGE
          ======================================================== */}

      {/* 1. CREATORS CARD (Top-Center-Left) */}
      <div 
        className="revolving-card card-creators-roster"
        style={getOrbitStyle(Math.PI * 0.85, 200, 115, -125)}
        onMouseEnter={() => { isOrbitPausedRef.current = true; }}
        onMouseLeave={() => { isOrbitPausedRef.current = false; }}
        onClick={() => onExploreWork && onExploreWork()}
        title="View verified AI creator roster"
      >
        <span className="card-header-label">Creators</span>
        <div className="creators-avatar-row">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Creator" className="avatar-circle" />
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Creator" className="avatar-circle" />
          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80" alt="Creator" className="avatar-circle" />
          <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=80&q=80" alt="Creator" className="avatar-circle" />
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80" alt="Creator" className="avatar-circle" />
          <span className="avatar-plus-circle"><Plus size={11} /></span>
        </div>
      </div>

      {/* 2. BRANDS CARD (Top-Center-Right) */}
      <div 
        className="revolving-card card-brands-roster"
        style={getOrbitStyle(Math.PI * 0.25, 230, 110, -135)}
        onMouseEnter={() => { isOrbitPausedRef.current = true; }}
        onMouseLeave={() => { isOrbitPausedRef.current = false; }}
        onClick={() => onFindCreator && onFindCreator()}
        title="View brand collaboration network"
      >
        <span className="card-header-label">Brands</span>
        <div className="brands-logo-row">
          {/* Nike Swoosh */}
          <svg className="brand-svg-logo" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.7 8.3c-2.4 2.8-5.7 5.2-9.7 7.1-2.9 1.4-5.9 2-8.8 1.8-.7 0-1.2-.5-1.2-1.2 0-.6.3-1.1.8-1.4 3.8-2.3 8.3-5.2 11.2-8.5 2.1-2.4 4.5-4.3 6.9-4.8.5-.1 1 .2 1.1.7.2.7-.1 1.5-.7 2.1z"/>
          </svg>
          {/* Airbnb Symbol */}
          <svg className="brand-svg-logo" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.5 2 6 5.5 6 9.5c0 4.5 4.5 9 6 10.5 1.5-1.5 6-6 6-10.5 0-4-2.5-7.5-6-7.5zm0 10c-1.4 0-2.5-1.1-2.5-2.5S10.6 7 12 7s2.5 1.1 2.5 2.5S13.4 12 12 12z"/>
          </svg>
          {/* Spotify Symbol */}
          <svg className="brand-svg-logo" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.6 14.4c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-.4.1-.7-.2-.8-.5-.1-.4.2-.7.5-.8 4.1-1 7.6-.5 10.3 1.2.3.2.4.6.2.9zm1.2-2.7c-.3.4-.8.5-1.2.3-2.9-1.8-7.2-2.3-10.6-1.3-.5.1-.9-.2-1-.6-.1-.5.2-.9.6-1 3.9-1.2 8.7-.6 11.9 1.4.4.2.5.8.3 1.2zm.1-2.8c-3.5-2.1-9.2-2.3-12.5-1.3-.5.2-1.1-.1-1.3-.6-.2-.5.1-1.1.6-1.3 3.8-1.2 10.1-.9 14.2 1.5.5.3.6.9.3 1.4-.3.5-.9.6-1.3.3z"/>
          </svg>
          <span className="brand-plus-glyph">+</span>
        </div>
      </div>

      {/* 3. VIDEO CARD 1: Haute Couture (Left Orbit) */}
      <div 
        className="revolving-card video-card-left"
        style={getOrbitStyle(Math.PI * 1.05, 240, 125, -20)}
        onMouseEnter={() => { isOrbitPausedRef.current = true; }}
        onMouseLeave={() => { isOrbitPausedRef.current = false; }}
        onClick={() => onOpenVideo('Cinematic Haute Couture', 'Elena Rostova', '/assets/creasynq-universe.mp4')}
        title="Play AI Fashion Campaign"
      >
        <img 
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=300&q=80" 
          alt="Haute Couture" 
          className="video-poster-thumb"
        />
        <div className="card-play-bubble">
          <Play size={13} fill="currentColor" />
        </div>
      </div>

      {/* 4. VIDEO CARD 2: Skincare Bottle (Upper-Right Orbit) */}
      <div 
        className="revolving-card video-card-top-right"
        style={getOrbitStyle(Math.PI * 0.12, 255, 120, -45)}
        onMouseEnter={() => { isOrbitPausedRef.current = true; }}
        onMouseLeave={() => { isOrbitPausedRef.current = false; }}
        onClick={() => onOpenVideo('Aura Botanica Pure Hydration', 'Zora Vance', '/assets/reference-video.mp4')}
        title="Play Luxury Product Visual"
      >
        <img 
          src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80" 
          alt="Skincare Product" 
          className="video-poster-thumb"
        />
        <div className="card-play-bubble">
          <Play size={13} fill="currentColor" />
        </div>
      </div>

      {/* 5. VIDEO CARD 3: Mountain Cinema (Lower-Right Orbit) */}
      <div 
        className="revolving-card video-card-lower-right"
        style={getOrbitStyle(Math.PI * 1.75, 250, 130, 45)}
        onMouseEnter={() => { isOrbitPausedRef.current = true; }}
        onMouseLeave={() => { isOrbitPausedRef.current = false; }}
        onClick={() => onOpenVideo('Alpine Horizon Anamorphic', 'Maya Chen', '/assets/creasynq-universe.mp4')}
        title="Play Cinematic Brand Film"
      >
        <img 
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80" 
          alt="Mountain Cinema" 
          className="video-poster-thumb"
        />
        <div className="card-play-bubble">
          <Play size={13} fill="currentColor" />
        </div>
      </div>

      {/* 6. VISUAL CARD 4: Product Still-Life (Lower-Center-Left) */}
      <div 
        className="revolving-card visual-card-stilllife"
        style={getOrbitStyle(Math.PI * 1.45, 190, 115, 65)}
        onMouseEnter={() => { isOrbitPausedRef.current = true; }}
        onMouseLeave={() => { isOrbitPausedRef.current = false; }}
        onClick={() => onExploreWork && onExploreWork()}
        title="View 3D Spatial Renders"
      >
        <img 
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80" 
          alt="Still Life Product" 
          className="video-poster-thumb"
        />
      </div>

      {/* 7. PILL: AI Match (Lower-Left) */}
      <div 
        className="revolving-pill pill-ai-match-ref"
        style={getOrbitStyle(Math.PI * 1.25, 215, 120, 10)}
        onMouseEnter={() => { isOrbitPausedRef.current = true; }}
        onMouseLeave={() => { isOrbitPausedRef.current = false; }}
        onClick={() => onFindCreator && onFindCreator()}
      >
        <Sparkles size={12} className="pill-icon-gold" />
        <span className="pill-title-text">AI Match</span>
      </div>

      {/* 8. PILL: Campaign Ideas (Middle-Right) */}
      <div 
        className="revolving-pill pill-campaign-ideas-ref"
        style={getOrbitStyle(Math.PI * 1.95, 260, 115, 15)}
        onMouseEnter={() => { isOrbitPausedRef.current = true; }}
        onMouseLeave={() => { isOrbitPausedRef.current = false; }}
        onClick={() => onFindCreator && onFindCreator()}
      >
        <Lightbulb size={12} className="pill-icon-gold" />
        <span className="pill-title-text">Campaign Ideas</span>
      </div>

      {/* 9. PILL: Creative Teams (Lower-Right) */}
      <div 
        className="revolving-pill pill-creative-teams-ref"
        style={getOrbitStyle(Math.PI * 1.6, 210, 125, 75)}
        onMouseEnter={() => { isOrbitPausedRef.current = true; }}
        onMouseLeave={() => { isOrbitPausedRef.current = false; }}
        onClick={() => onFindCreator && onFindCreator()}
      >
        <Users size={12} className="pill-icon-gold" />
        <span className="pill-title-text">Creative Teams</span>
      </div>

    </div>
  );
}
