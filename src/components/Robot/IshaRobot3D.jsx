import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { createIshaRobot } from './RobotGeometry.js';
import { ASSISTANT_STATES } from '../../constants/assistant.js';

export const IshaRobot3D = ({
  assistantState,
  onHoverChange,
  className = '',
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const robotRigRef = useRef(null);
  const animationFrameId = useRef(null);

  // Interaction State
  const mousePos = useRef({ x: 0, y: 0 });
  const targetMousePos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const previousMouseX = useRef(0);
  const rotationVelocity = useRef(0);
  const currentRotationY = useRef(0);

  // Helper to sync state to robot eye visibility
  const syncEyeState = useCallback((state) => {
    if (!robotRigRef.current) return;
    const rig = robotRigRef.current;

    const isListeningState =
      state === ASSISTANT_STATES.WAKE_DETECTED ||
      state === ASSISTANT_STATES.LISTENING ||
      state === ASSISTANT_STATES.PROCESSING ||
      state === ASSISTANT_STATES.EXECUTING ||
      state === ASSISTANT_STATES.SPEAKING;

    if (isListeningState) {
      rig.eyeGroup.visible = true;
      rig.materials.eyeMaterial.opacity = 0.95;
    } else {
      rig.eyeGroup.visible = false;
      rig.materials.eyeMaterial.opacity = 0.0;
    }
  }, []);

  // Synchronize Assistant State to Robot Eyes whenever state updates
  useEffect(() => {
    syncEyeState(assistantState);
  }, [assistantState, syncEyeState]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // 2. Camera View
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.04, 5.0);
    camera.lookAt(0, -0.02, 0);

    // 3. WebGL Renderer with High-End Tonemapping
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Lighting: Cinematic Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x0e1420, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2.5, 3.4, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7dd3fc, 0.9);
    fillLight.position.set(-2.8, 1.8, 2.6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x00e5ff, 1.6);
    rimLight.position.set(2.8, 3.0, -3.0);
    scene.add(rimLight);

    const bounceLight = new THREE.DirectionalLight(0x0284c7, 0.45);
    bounceLight.position.set(0, -2.5, 1.5);
    scene.add(bounceLight);

    // 5. Build Robot 3D Rig
    const rig = createIshaRobot();
    robotRigRef.current = rig;

    const robotScale = 0.54;
    rig.rootGroup.scale.set(robotScale, robotScale, robotScale);
    rig.rootGroup.position.set(0, -0.02, 0);
    scene.add(rig.rootGroup);

    // Ground Shadow Catcher Plane
    const shadowPlaneGeo = new THREE.PlaneGeometry(6, 6);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.83 * robotScale - 0.02;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Immediately sync eye state for initial mount
    syncEyeState(assistantState);

    // 6. Animation Loop
    let clock = new THREE.Clock();
    let antennaJiggle = 0;

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mousePos.current.x += (targetMousePos.current.x - mousePos.current.x) * 0.06;
      mousePos.current.y += (targetMousePos.current.y - mousePos.current.y) * 0.06;

      // Platform Drag Momentum
      if (!isDragging.current) {
        currentRotationY.current += rotationVelocity.current;
        rotationVelocity.current *= 0.92;
      }
      rig.rootGroup.rotation.y = currentRotationY.current;
      rig.rootGroup.position.y = -0.02;

      // Torso Breathing
      const breathScale = 1 + Math.sin(elapsedTime * 2.2) * 0.015;
      rig.bodyGroup.scale.set(breathScale, 1.0, breathScale);

      // Head Mouse Tracking
      const targetHeadRotY = mousePos.current.x * 0.35;
      const targetHeadRotX = -mousePos.current.y * 0.22;
      const targetHeadTiltZ = -mousePos.current.x * 0.12;

      rig.headGroup.rotation.y += (targetHeadRotY - rig.headGroup.rotation.y) * 0.08;
      rig.headGroup.rotation.x += (targetHeadRotX - rig.headGroup.rotation.x) * 0.08;
      rig.headGroup.rotation.z += (targetHeadTiltZ - rig.headGroup.rotation.z) * 0.08;

      rig.bodyGroup.rotation.y = -mousePos.current.x * 0.08;
      rig.bodyGroup.rotation.x = -mousePos.current.y * 0.04;

      // Antenna Spring Physics
      antennaJiggle = Math.sin(elapsedTime * 3.5) * 0.03 + mousePos.current.x * 0.08;
      rig.antennaGroup.rotation.z = -0.48 + antennaJiggle;

      const tipGlow = 0.8 + Math.sin(elapsedTime * 2.8) * 0.25;
      rig.antennaTipLight.intensity = tipGlow;

      // Arm Idle Sway
      rig.leftArm.rotation.x = 0.18 + Math.sin(elapsedTime * 1.8) * 0.04;
      rig.rightArm.rotation.x = 0.18 - Math.sin(elapsedTime * 1.8) * 0.04;

      // Floating Holographic Halo Rotation & Oscillation
      if (rig.haloRingGroup) {
        rig.haloRingGroup.rotation.y = elapsedTime * 0.45;
        rig.haloRingGroup.position.y = 1.48 + Math.sin(elapsedTime * 2.0) * 0.03;
      }

      // Sci-Fi Floating Particle Field Drift
      if (rig.particleGroup) {
        rig.particleGroup.rotation.y = elapsedTime * 0.15;
      }

      // Pulsing Chest Core Reactor Light
      if (rig.chestCoreLight) {
        rig.chestCoreLight.intensity = 0.8 + Math.sin(elapsedTime * 3.2) * 0.35;
      }

      if (rig.eyeGroup.visible) {
        const eyePulse = 0.85 + Math.sin(elapsedTime * 6.0) * 0.15;
        rig.materials.eyeMaterial.opacity = eyePulse;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup & Memory Leak Prevention
    return () => {
      resizeObserver.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      // Dispose Three.js objects
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      scene.clear();
      robotRigRef.current = null;
    };
  }, [syncEyeState]);

  // Mouse & Touch Interaction Handlers
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    targetMousePos.current = { x, y };

    if (isDragging.current) {
      const deltaX = e.clientX - previousMouseX.current;
      rotationVelocity.current = deltaX * 0.008;
      currentRotationY.current += rotationVelocity.current;
      previousMouseX.current = e.clientX;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (typeof onHoverChange === 'function') {
      onHoverChange(true);
    }
  }, [onHoverChange]);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
    targetMousePos.current = { x: 0, y: 0 };
    if (typeof onHoverChange === 'function') {
      onHoverChange(false);
    }
  }, [onHoverChange]);

  const handleMouseDown = useCallback((e) => {
    isDragging.current = true;
    previousMouseX.current = e.clientX;
    rotationVelocity.current = 0;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      previousMouseX.current = e.touches[0].clientX;
      rotationVelocity.current = 0;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (isDragging.current && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - previousMouseX.current;
      rotationVelocity.current = deltaX * 0.008;
      currentRotationY.current += rotationVelocity.current;
      previousMouseX.current = e.touches[0].clientX;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div
      id="isha-3d-robot-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      <canvas
        id="isha-robot-canvas"
        ref={canvasRef}
        className="w-full h-full block touch-none"
      />
    </div>
  );
};
