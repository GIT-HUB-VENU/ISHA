import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createIshaRobot } from './RobotGeometry.js';
import { ASSISTANT_STATES } from '../../constants/assistant.js';

/**
 * Returns configuration parameters for each assistant state expression.
 * Primary style reference: LISTENING state expression.
 */
function getExpressionConfig(state) {
  switch (state) {
    case ASSISTANT_STATES.IDLE:
    case ASSISTANT_STATES.OFFLINE:
    case ASSISTANT_STATES.READY:
    default:
      return {
        key: 'IDLE',
        scaleX: 0.95,
        scaleY: 0.70, // Relaxed, slightly lowered eyelids
        posY: -0.01,
        leftScaleYMult: 1.0,
        rightScaleYMult: 1.0,
        leftRotZ: 0.0,
        rightRotZ: 0.0,
        leftPosYOffset: 0.0,
        rightPosYOffset: 0.0,
        blinkInterval: 2.0, // Blink every 2 seconds in IDLE state
        blinkDuration: 0.20,
        pulseSpeed: 3.2,
        baseOpacity: 0.88,
        pulseAmp: 0.07,
        driftSpeedX: 0.0,
        driftSpeedY: 0.0,
        driftAmpX: 0.0,
        driftAmpY: 0.0,
      };

    case ASSISTANT_STATES.WAKE_DETECTED:
      return {
        key: 'WAKE_DETECTED',
        scaleX: 1.05,
        scaleY: 1.15, // Perked, slightly wider alert gaze
        posY: 0.015, // Subtle upward movement
        leftScaleYMult: 1.0,
        rightScaleYMult: 1.0,
        leftRotZ: -0.02,
        rightRotZ: 0.02,
        leftPosYOffset: 0.0,
        rightPosYOffset: 0.0,
        blinkInterval: 2.8,
        blinkDuration: 0.14, // Quick alert reaction
        pulseSpeed: 8.0,
        baseOpacity: 0.92,
        pulseAmp: 0.08,
        driftSpeedX: 0.0,
        driftSpeedY: 0.0,
        driftAmpX: 0.0,
        driftAmpY: 0.0,
      };

    case ASSISTANT_STATES.LISTENING:
      // EXACT REFERENCE: Keep current listening expression untouched
      return {
        key: 'LISTENING',
        scaleX: 1.0,
        scaleY: 1.0,
        posY: 0.0,
        leftScaleYMult: 1.0,
        rightScaleYMult: 1.0,
        leftRotZ: 0.0,
        rightRotZ: 0.0,
        leftPosYOffset: 0.0,
        rightPosYOffset: 0.0,
        blinkInterval: 3.5,
        blinkDuration: 0.18,
        pulseSpeed: 6.0,
        baseOpacity: 0.85,
        pulseAmp: 0.15, // 0.85 + Math.sin(t * 6.0) * 0.15
        driftSpeedX: 0.0,
        driftSpeedY: 0.0,
        driftAmpX: 0.0,
        driftAmpY: 0.0,
      };

    case ASSISTANT_STATES.PROCESSING:
    case ASSISTANT_STATES.EXECUTING:
      return {
        key: 'PROCESSING',
        scaleX: 0.95,
        scaleY: 0.84, // Slightly narrowed, focused eyes
        posY: 0.01,
        leftScaleYMult: 1.0,
        rightScaleYMult: 1.0,
        leftRotZ: 0.015,
        rightRotZ: -0.015,
        leftPosYOffset: 0.0,
        rightPosYOffset: 0.0,
        blinkInterval: 4.2,
        blinkDuration: 0.22,
        pulseSpeed: 4.5,
        baseOpacity: 0.88,
        pulseAmp: 0.10,
        driftSpeedX: 1.8, // Organic subtle drift while considering information
        driftSpeedY: 1.3,
        driftAmpX: 0.032,
        driftAmpY: 0.015,
      };

    case ASSISTANT_STATES.SPEAKING:
      // CURVED HAPPY CLOSED EYES (∩ ∩) EXPRESSION
      return {
        key: 'SPEAKING',
        scaleX: 1.0,
        scaleY: 1.0,
        posY: 0.0,
        leftScaleYMult: 1.0,
        rightScaleYMult: 1.0,
        leftRotZ: 0.0,
        rightRotZ: 0.0,
        leftPosYOffset: 0.0,
        rightPosYOffset: 0.0,
        blinkInterval: 4.0,
        blinkDuration: 0.18,
        pulseSpeed: 6.5,
        baseOpacity: 0.90,
        pulseAmp: 0.10,
        driftSpeedX: 0.0,
        driftSpeedY: 0.0,
        driftAmpX: 0.0,
        driftAmpY: 0.0,
      };

    case ASSISTANT_STATES.ERROR:
      return {
        key: 'ERROR',
        scaleX: 0.95,
        scaleY: 0.78, // Narrowed eyes with subtle awkward asymmetry
        posY: 0.0,
        leftScaleYMult: 0.82, // One eye slightly more closed
        rightScaleYMult: 1.06, // Slight "hmm?" look
        leftRotZ: 0.08, // Mild confusion tilt
        rightRotZ: -0.04,
        leftPosYOffset: -0.008,
        rightPosYOffset: 0.006,
        blinkInterval: 3.2,
        blinkDuration: 0.20,
        pulseSpeed: 4.0,
        baseOpacity: 0.86,
        pulseAmp: 0.08,
        driftSpeedX: 0.0,
        driftSpeedY: 0.0,
        driftAmpX: 0.0,
        driftAmpY: 0.0,
      };
  }
}

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

  // Eye Animation State
  const currentEyeStateRef = useRef({
    scaleX: 1.0,
    scaleY: 1.0,
    posY: 0.0,
    leftScaleYMult: 1.0,
    rightScaleYMult: 1.0,
    leftRotZ: 0.0,
    rightRotZ: 0.0,
    leftPosYOffset: 0.0,
    rightPosYOffset: 0.0,
    arcScaleX: 0.0,
    arcScaleY: 0.0,
    lastBlinkTime: 0,
    nextBlinkInterval: 3.5,
    isBlinking: false,
    blinkStartTime: 0,
    prevStateKey: null,
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Three.js Scene Setup (Transparent to merge seamlessly with background)
    const scene = new THREE.Scene();

    // 2. Camera View
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.04, 5.0);
    camera.lookAt(0, -0.02, 0);

    // 3. WebGL Renderer with High-End Tonemapping & Alpha Transparency
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
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

    // Ensure eye group is visible
    rig.eyeGroup.visible = true;

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

      // ==================== STATE-DRIVEN EYE EXPRESSION ANIMATION ENGINE ====================
      const config = getExpressionConfig(assistantState);
      const eyeState = currentEyeStateRef.current;
      const isSpeaking = config.key === 'SPEAKING';

      // Trigger quick alert blink when entering WAKE_DETECTED or ERROR state
      if (eyeState.prevStateKey !== config.key) {
        if (config.key === 'WAKE_DETECTED' || config.key === 'ERROR') {
          eyeState.isBlinking = true;
          eyeState.blinkStartTime = elapsedTime;
        }
        eyeState.prevStateKey = config.key;
      }

      // Targets for capsule vs curved arc eyes
      const targetCapsuleScaleX = isSpeaking ? 0.0 : config.scaleX;
      const targetCapsuleScaleY = isSpeaking ? 0.0 : config.scaleY;
      const targetArcScale = isSpeaking ? 1.0 : 0.0;

      // Smooth lerp transition (~0.12 lerp speed for smooth 150ms transitions)
      const lerp = 0.12;
      eyeState.scaleX += (targetCapsuleScaleX - eyeState.scaleX) * lerp;
      eyeState.scaleY += (targetCapsuleScaleY - eyeState.scaleY) * lerp;
      eyeState.posY += (config.posY - eyeState.posY) * lerp;
      eyeState.leftScaleYMult += (config.leftScaleYMult - eyeState.leftScaleYMult) * lerp;
      eyeState.rightScaleYMult += (config.rightScaleYMult - eyeState.rightScaleYMult) * lerp;
      eyeState.leftRotZ += (config.leftRotZ - eyeState.leftRotZ) * lerp;
      eyeState.rightRotZ += (config.rightRotZ - eyeState.rightRotZ) * lerp;
      eyeState.leftPosYOffset += (config.leftPosYOffset - eyeState.leftPosYOffset) * lerp;
      eyeState.rightPosYOffset += (config.rightPosYOffset - eyeState.rightPosYOffset) * lerp;

      eyeState.arcScaleX += (targetArcScale - eyeState.arcScaleX) * lerp;
      eyeState.arcScaleY += (targetArcScale - eyeState.arcScaleY) * lerp;

      // Organic subtle drift (PROCESSING)
      let driftX = 0;
      let driftY = 0;
      if (config.driftAmpX > 0 && !isSpeaking) {
        driftX = Math.sin(elapsedTime * config.driftSpeedX) * config.driftAmpX;
      }
      if (config.driftAmpY > 0 && !isSpeaking) {
        driftY = Math.cos(elapsedTime * config.driftSpeedY) * config.driftAmpY;
      }

      // Natural Blinking Logic
      if (!eyeState.isBlinking && elapsedTime - eyeState.lastBlinkTime > eyeState.nextBlinkInterval) {
        eyeState.isBlinking = true;
        eyeState.blinkStartTime = elapsedTime;
        eyeState.lastBlinkTime = elapsedTime;
        eyeState.nextBlinkInterval = config.blinkInterval + (Math.random() - 0.5) * 0.3;
      }

      let blinkScaleY = 1.0;
      if (eyeState.isBlinking && !isSpeaking) {
        const duration = config.blinkDuration || 0.18;
        const progress = (elapsedTime - eyeState.blinkStartTime) / duration;
        if (progress >= 1.0) {
          eyeState.isBlinking = false;
        } else {
          const factor = Math.sin(progress * Math.PI);
          blinkScaleY = 1.0 - factor * 0.95;
        }
      }

      // Render Capsule Eyes (for IDLE, WAKE_DETECTED, LISTENING, PROCESSING, ERROR)
      const baseLeftX = -0.46;
      const baseRightX = 0.46;

      const effectiveScaleY = eyeState.scaleY * blinkScaleY;
      const finalLeftScaleY = Math.max(0.0, effectiveScaleY * eyeState.leftScaleYMult);
      const finalRightScaleY = Math.max(0.0, effectiveScaleY * eyeState.rightScaleYMult);
      const finalScaleX = Math.max(0.0, eyeState.scaleX);

      rig.leftEye.scale.set(finalScaleX, finalLeftScaleY, 1.0);
      rig.rightEye.scale.set(finalScaleX, finalRightScaleY, 1.0);

      rig.leftEye.position.set(
        baseLeftX + driftX,
        eyeState.posY + eyeState.leftPosYOffset + driftY,
        0
      );
      rig.rightEye.position.set(
        baseRightX + driftX,
        eyeState.posY + eyeState.rightPosYOffset + driftY,
        0
      );
      rig.leftEye.rotation.z = eyeState.leftRotZ;
      rig.rightEye.rotation.z = eyeState.rightRotZ;

      // Render Curved Arc Happy Eyes (∩ ∩) for SPEAKING
      if (rig.leftArcEye && rig.rightArcEye) {
        let speechCadenceX = 0;
        let speechCadenceY = 0;
        if (isSpeaking && eyeState.arcScaleX > 0.05) {
          speechCadenceX = Math.sin(elapsedTime * 4.5) * 0.035;
          speechCadenceY = Math.cos(elapsedTime * 3.2) * 0.02;
        }

        let arcBlinkScaleY = 1.0;
        if (isSpeaking && eyeState.isBlinking) {
          const duration = config.blinkDuration || 0.18;
          const progress = (elapsedTime - eyeState.blinkStartTime) / duration;
          if (progress >= 1.0) {
            eyeState.isBlinking = false;
          } else {
            const factor = Math.sin(progress * Math.PI);
            arcBlinkScaleY = 1.0 - factor * 0.82; // Gently flattens during speech blink
          }
        }

        const finalArcScaleX = Math.max(0.0, (eyeState.arcScaleX + speechCadenceX));
        const finalArcScaleY = Math.max(0.0, (eyeState.arcScaleY + speechCadenceY) * arcBlinkScaleY);

        rig.leftArcEye.scale.set(finalArcScaleX, finalArcScaleY, eyeState.arcScaleX);
        rig.rightArcEye.scale.set(finalArcScaleX, finalArcScaleY, eyeState.arcScaleX);

        const arcDriftY = isSpeaking ? Math.sin(elapsedTime * 2.0) * 0.004 : 0;
        rig.leftArcEye.position.set(baseLeftX, -0.04 + arcDriftY, 0.005);
        rig.rightArcEye.position.set(baseRightX, -0.04 + arcDriftY, 0.005);
      }

      // Make eye group visible & apply cyan glow pulsing
      rig.eyeGroup.visible = true;
      const eyePulse = config.baseOpacity + Math.sin(elapsedTime * config.pulseSpeed) * config.pulseAmp;
      rig.materials.eyeMaterial.opacity = eyePulse;

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
  }, [assistantState]);

  // Mouse & Touch Interaction Handlers
  const handleMouseMove = (e) => {
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
  };

  const handleMouseEnter = () => {
    if (typeof onHoverChange === 'function') {
      onHoverChange(true);
    }
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    targetMousePos.current = { x: 0, y: 0 };
    if (typeof onHoverChange === 'function') {
      onHoverChange(false);
    }
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    previousMouseX.current = e.clientX;
    rotationVelocity.current = 0;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      previousMouseX.current = e.touches[0].clientX;
      rotationVelocity.current = 0;
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging.current && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - previousMouseX.current;
      rotationVelocity.current = deltaX * 0.008;
      currentRotationY.current += rotationVelocity.current;
      previousMouseX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

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
