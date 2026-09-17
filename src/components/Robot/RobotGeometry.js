import * as THREE from 'three';
import {
  createPlushTextures,
  createSeamlessVisorGeometry,
  createSeamlessPlushHeadGeometry,
} from './PlushTextures.js';

/**
 * Rebuilds the I.S.H.A 3D character with 100% fidelity to the master reference render.
 */
export function createIshaRobot() {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'IshaRobotRoot';

  // 1. Generate Procedural Textures & Environment Map
  const { headTexture, plushBumpMap, bodyTexture, envTexture } = createPlushTextures();

  // 2. High-End Physical Materials
  const whitePlushMat = new THREE.MeshPhysicalMaterial({
    map: headTexture,
    bumpMap: plushBumpMap,
    bumpScale: 0.018,
    color: new THREE.Color(0xffffff),
    roughness: 0.82,
    metalness: 0.0,
    sheen: 1.0,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(0xffffff),
    clearcoat: 0.0,
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
  });

  const bluePlushMat = new THREE.MeshPhysicalMaterial({
    map: bodyTexture,
    bumpMap: plushBumpMap,
    bumpScale: 0.015,
    color: new THREE.Color(0xffffff),
    roughness: 0.84,
    metalness: 0.0,
    sheen: 0.95,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color(0xaae0fc),
  });

  const earBlueMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x8bc7ea),
    bumpMap: plushBumpMap,
    bumpScale: 0.012,
    roughness: 0.78,
    metalness: 0.02,
    sheen: 0.9,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color(0xc2ebff),
  });

  const blackScreenMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x020204),
    roughness: 0.04,
    metalness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMap: envTexture,
    envMapIntensity: 1.6,
    reflectivity: 0.98,
    side: THREE.DoubleSide,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
  });

  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x22d3ee),
    emissive: new THREE.Color(0x00f0ff),
    emissiveIntensity: 2.8,
    roughness: 0.15,
    metalness: 0.1,
  });

  const antennaStemMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xf1f5f9),
    roughness: 0.35,
    metalness: 0.1,
  });

  const bellyButtonMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xfcfcfc),
    roughness: 0.35,
    metalness: 0.05,
  });

  const earRimMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x78bce0),
    roughness: 0.5,
    metalness: 0.05,
    clearcoat: 0.2,
  });

  const eyeMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x00f0ff),
    transparent: true,
    opacity: 0.0,
  });

  // ==================== HEAD GROUP ====================
  const headGroup = new THREE.Group();
  headGroup.name = 'HeadGroup';
  headGroup.position.set(0, 0.45, 0);

  const visorGeo = createSeamlessVisorGeometry(2.16, 1.48, 1.20, 32, 72);
  const screenMesh = new THREE.Mesh(visorGeo, blackScreenMat);
  screenMesh.name = 'ScreenMesh';
  screenMesh.position.set(0, 0.02, 0.15);
  screenMesh.castShadow = false;
  screenMesh.receiveShadow = true;
  headGroup.add(screenMesh);

  const headGeo = createSeamlessPlushHeadGeometry(2.16, 1.48, 1.20, 72, 36);
  const headMesh = new THREE.Mesh(headGeo, whitePlushMat);
  headMesh.name = 'HeadMesh';
  headMesh.position.set(0, 0.02, 0.15);
  headMesh.castShadow = true;
  headMesh.receiveShadow = true;
  headGroup.add(headMesh);

  // --- Assistant Glowing Eyes ---
  const eyeGroup = new THREE.Group();
  eyeGroup.name = 'EyeGroup';
  eyeGroup.position.set(0, 0.04, 1.28);
  eyeGroup.visible = false;

  const eyeGeo = new THREE.CapsuleGeometry(0.09, 0.14, 16, 24);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
  leftEye.position.set(-0.46, 0, 0);
  eyeGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
  rightEye.position.set(0.46, 0, 0);
  eyeGroup.add(rightEye);

  headGroup.add(eyeGroup);

  // ==================== TOP-RIGHT ANTENNA ====================
  const antennaGroup = new THREE.Group();
  antennaGroup.name = 'AntennaGroup';
  antennaGroup.position.set(0.70, 1.02, 0.30);
  antennaGroup.rotation.set(0.12, -0.05, -0.72);

  const socketGeo = new THREE.CylinderGeometry(0.08, 0.11, 0.06, 24);
  const socketMesh = new THREE.Mesh(socketGeo, whitePlushMat);
  socketMesh.position.set(0, 0.03, 0);
  antennaGroup.add(socketMesh);

  const collarRingGeo = new THREE.TorusGeometry(0.075, 0.012, 16, 32);
  collarRingGeo.rotateX(Math.PI / 2);
  const collarRingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xdbeafe),
    metalness: 0.85,
    roughness: 0.2,
  });
  const collarRingMesh = new THREE.Mesh(collarRingGeo, collarRingMat);
  collarRingMesh.position.set(0, 0.06, 0);
  antennaGroup.add(collarRingMesh);

  const stemHeight = 0.44;
  const stemGeo = new THREE.CylinderGeometry(0.024, 0.026, stemHeight, 24);
  stemGeo.translate(0, stemHeight / 2, 0);
  const stemMesh = new THREE.Mesh(stemGeo, antennaStemMat);
  stemMesh.castShadow = true;
  antennaGroup.add(stemMesh);

  const midRingGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.02, 24);
  const midRingMesh = new THREE.Mesh(midRingGeo, collarRingMat);
  midRingMesh.position.set(0, stemHeight * 0.58, 0);
  antennaGroup.add(midRingMesh);

  const orbBaseGeo = new THREE.CylinderGeometry(0.05, 0.035, 0.03, 24);
  const orbBaseMesh = new THREE.Mesh(orbBaseGeo, collarRingMat);
  orbBaseMesh.position.set(0, stemHeight + 0.015, 0);
  antennaGroup.add(orbBaseMesh);

  const tipGeo = new THREE.SphereGeometry(0.125, 32, 24);
  const antennaTipMesh = new THREE.Mesh(tipGeo, cyanGlowMat);
  antennaTipMesh.position.set(0, stemHeight + 0.11, 0);
  antennaGroup.add(antennaTipMesh);

  const antennaTipLight = new THREE.PointLight(0x00f0ff, 1.3, 3.5, 2.0);
  antennaTipLight.position.copy(antennaTipMesh.position);
  antennaGroup.add(antennaTipLight);

  headGroup.add(antennaGroup);

  // ==================== SIDE EAR MODULES ====================
  function createEarModule(isLeft) {
    const earGroup = new THREE.Group();
    earGroup.name = isLeft ? 'LeftEarModule' : 'RightEarModule';

    const baseGeo = new THREE.CylinderGeometry(0.36, 0.4, 0.12, 32);
    baseGeo.rotateZ(Math.PI / 2);
    baseGeo.scale(1.0, 1.35, 1.0);
    const baseMesh = new THREE.Mesh(baseGeo, whitePlushMat);
    earGroup.add(baseMesh);

    const cupGeo = new THREE.CylinderGeometry(0.34, 0.35, 0.18, 32);
    cupGeo.rotateZ(Math.PI / 2);
    cupGeo.scale(1.0, 1.32, 1.0);
    const cupMesh = new THREE.Mesh(cupGeo, earBlueMat);
    const xCupOffset = isLeft ? -0.09 : 0.09;
    cupMesh.position.set(xCupOffset, 0, 0);
    cupMesh.castShadow = true;
    earGroup.add(cupMesh);

    const earBezelGeo = new THREE.TorusGeometry(0.33, 0.016, 16, 36);
    earBezelGeo.rotateY(Math.PI / 2);
    earBezelGeo.scale(1.0, 1.3, 1.0);
    const earBezelMesh = new THREE.Mesh(earBezelGeo, earRimMat);
    earBezelMesh.position.set(isLeft ? -0.18 : 0.18, 0, 0);
    earGroup.add(earBezelMesh);

    const neonStripGeo = new THREE.CapsuleGeometry(0.048, 0.36, 16, 24);
    const neonStripMesh = new THREE.Mesh(neonStripGeo, cyanGlowMat);
    const xStripOffset = isLeft ? -0.195 : 0.195;
    neonStripMesh.position.set(xStripOffset, 0, 0);
    earGroup.add(neonStripMesh);

    const stripBackdropGeo = new THREE.CapsuleGeometry(0.062, 0.38, 16, 24);
    const stripBackdropMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x0284c7),
      roughness: 0.3,
    });
    const stripBackdrop = new THREE.Mesh(stripBackdropGeo, stripBackdropMat);
    stripBackdrop.position.set(isLeft ? -0.185 : 0.185, 0, 0);
    earGroup.add(stripBackdrop);

    const earLight = new THREE.PointLight(0x00f0ff, 0.5, 2.2, 2.2);
    earLight.position.set(xStripOffset * 1.3, 0, 0);
    earGroup.add(earLight);

    return earGroup;
  }

  const leftEarMesh = createEarModule(true);
  leftEarMesh.position.set(-1.42, -0.04, 0.15);
  leftEarMesh.rotation.set(0, 0, -0.03);
  headGroup.add(leftEarMesh);

  const rightEarMesh = createEarModule(false);
  rightEarMesh.position.set(1.42, -0.04, 0.15);
  rightEarMesh.rotation.set(0, 0, 0.03);
  headGroup.add(rightEarMesh);

  rootGroup.add(headGroup);

  // ==================== BODY GROUP ====================
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'BodyGroup';
  bodyGroup.position.set(0, -0.92, 0);

  const bellyGeo = new THREE.SphereGeometry(0.64, 48, 36);
  bellyGeo.scale(1.06, 0.94, 0.96);
  const bellyMesh = new THREE.Mesh(bellyGeo, bluePlushMat);
  bellyMesh.position.set(0, -0.06, 0.02);
  bellyMesh.castShadow = true;
  bellyMesh.receiveShadow = true;
  bodyGroup.add(bellyMesh);

  const collarGeo = new THREE.CylinderGeometry(0.52, 0.62, 0.32, 36);
  const collarMesh = new THREE.Mesh(collarGeo, whitePlushMat);
  collarMesh.position.set(0, 0.22, 0.01);
  collarMesh.castShadow = true;
  bodyGroup.add(collarMesh);

  // ==================== CHEST REACTOR CORE & BUTTON ====================
  const buttonGroup = new THREE.Group();
  buttonGroup.position.set(0, -0.08, 0.62);

  const buttonGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.035, 32);
  buttonGeo.rotateX(Math.PI / 2);
  const buttonMesh = new THREE.Mesh(buttonGeo, bellyButtonMat);
  buttonMesh.castShadow = true;
  buttonGroup.add(buttonMesh);

  const buttonRimGeo = new THREE.TorusGeometry(0.075, 0.012, 16, 32);
  const buttonRimMesh = new THREE.Mesh(buttonRimGeo, bellyButtonMat);
  buttonRimMesh.position.set(0, 0, 0.018);
  buttonGroup.add(buttonRimMesh);

  // High-tech inner energy core sphere & light
  const chestCoreGeo = new THREE.SphereGeometry(0.042, 24, 24);
  const chestCoreMesh = new THREE.Mesh(chestCoreGeo, cyanGlowMat);
  chestCoreMesh.position.set(0, 0, 0.024);
  buttonGroup.add(chestCoreMesh);

  const chestCoreLight = new THREE.PointLight(0x00f0ff, 0.8, 1.8, 2.0);
  chestCoreLight.position.set(0, 0, 0.05);
  buttonGroup.add(chestCoreLight);

  bodyGroup.add(buttonGroup);

  // ==================== BACK POWER PACK / DUAL THRUSTERS ====================
  const backPackGroup = new THREE.Group();
  backPackGroup.name = 'BackPackGroup';
  backPackGroup.position.set(0, 0.02, -0.54);

  const packMainGeo = new THREE.BoxGeometry(0.48, 0.42, 0.16);
  const packMainMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x0f172a),
    metalness: 0.8,
    roughness: 0.2,
  });
  const packMainMesh = new THREE.Mesh(packMainGeo, packMainMat);
  packMainMesh.castShadow = true;
  backPackGroup.add(packMainMesh);

  // Emissive power core lines on backpack
  const powerLineGeo = new THREE.BoxGeometry(0.36, 0.03, 0.02);
  const powerLineMesh = new THREE.Mesh(powerLineGeo, cyanGlowMat);
  powerLineMesh.position.set(0, 0.08, -0.085);
  backPackGroup.add(powerLineMesh);

  const powerLine2Mesh = new THREE.Mesh(powerLineGeo, cyanGlowMat);
  powerLine2Mesh.position.set(0, -0.08, -0.085);
  backPackGroup.add(powerLine2Mesh);

  // Twin Thruster Nozzles
  const thrusterGeo = new THREE.CylinderGeometry(0.08, 0.11, 0.14, 24);
  thrusterGeo.rotateX(Math.PI / 2);
  const thrusterMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1e293b),
    metalness: 0.9,
    roughness: 0.15,
  });

  const leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
  leftThruster.position.set(-0.15, -0.12, -0.10);
  backPackGroup.add(leftThruster);

  const rightThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
  rightThruster.position.set(0.15, -0.12, -0.10);
  backPackGroup.add(rightThruster);

  // Thruster Glow Rings
  const thrusterGlowGeo = new THREE.TorusGeometry(0.08, 0.015, 16, 32);
  const leftThrusterGlow = new THREE.Mesh(thrusterGlowGeo, cyanGlowMat);
  leftThrusterGlow.position.set(-0.15, -0.12, -0.17);
  backPackGroup.add(leftThrusterGlow);

  const rightThrusterGlow = new THREE.Mesh(thrusterGlowGeo, cyanGlowMat);
  rightThrusterGlow.position.set(0.15, -0.12, -0.17);
  backPackGroup.add(rightThrusterGlow);

  bodyGroup.add(backPackGroup);

  // ==================== ARMS & METALLIC WRIST CUFFS ====================
  function createArm(isLeft) {
    const armGroup = new THREE.Group();
    armGroup.name = isLeft ? 'LeftArm' : 'RightArm';

    const armLength = 0.38;
    const armGeo = new THREE.CapsuleGeometry(0.13, armLength, 16, 24);
    armGeo.translate(0, -armLength / 2, 0);
    const armMesh = new THREE.Mesh(armGeo, whitePlushMat);
    armMesh.castShadow = true;
    armGroup.add(armMesh);

    // Metallic Wrist Cuff Accent
    const cuffGeo = new THREE.TorusGeometry(0.135, 0.014, 16, 32);
    cuffGeo.rotateX(Math.PI / 2);
    const cuffMesh = new THREE.Mesh(cuffGeo, collarRingMat);
    cuffMesh.position.set(0, -armLength + 0.06, 0);
    armGroup.add(cuffMesh);

    // Cyan wrist indicator dot
    const dotGeo = new THREE.SphereGeometry(0.02, 16, 16);
    const dotMesh = new THREE.Mesh(dotGeo, cyanGlowMat);
    dotMesh.position.set(isLeft ? -0.138 : 0.138, -armLength + 0.06, 0);
    armGroup.add(dotMesh);

    const sign = isLeft ? -1 : 1;
    armGroup.rotation.set(0.16, 0, sign * 0.52);

    return armGroup;
  }

  const leftArm = createArm(true);
  leftArm.position.set(-0.56, 0.12, 0.04);
  bodyGroup.add(leftArm);

  const rightArm = createArm(false);
  rightArm.position.set(0.56, 0.12, 0.04);
  bodyGroup.add(rightArm);

  // ==================== FEET & ANKLE METALLIC CUFFS ====================
  const footGeo = new THREE.SphereGeometry(0.19, 32, 24);
  footGeo.scale(1.12, 0.84, 1.42);
  const fPos = footGeo.attributes.position;
  for (let i = 0; i < fPos.count; i++) {
    let fy = fPos.getY(i);
    if (fy < -0.065) {
      fy = -0.065 + (fy - -0.065) * 0.1;
    }
    fPos.setY(i, fy);
  }
  footGeo.computeVertexNormals();

  const leftFootGroup = new THREE.Group();
  const leftFoot = new THREE.Mesh(footGeo, whitePlushMat);
  leftFoot.name = 'LeftFoot';
  leftFoot.castShadow = true;
  leftFoot.receiveShadow = true;
  leftFootGroup.add(leftFoot);

  const ankleCuffGeo = new THREE.TorusGeometry(0.155, 0.012, 16, 32);
  ankleCuffGeo.rotateX(Math.PI / 2);
  const leftAnkleCuff = new THREE.Mesh(ankleCuffGeo, collarRingMat);
  leftAnkleCuff.position.set(0, 0.08, 0);
  leftFootGroup.add(leftAnkleCuff);

  leftFootGroup.position.set(-0.24, -0.74, 0.07);
  leftFootGroup.rotation.set(0.04, 0.12, 0.04);
  bodyGroup.add(leftFootGroup);

  const rightFootGroup = new THREE.Group();
  const rightFoot = new THREE.Mesh(footGeo, whitePlushMat);
  rightFoot.name = 'RightFoot';
  rightFoot.castShadow = true;
  rightFoot.receiveShadow = true;
  rightFootGroup.add(rightFoot);

  const rightAnkleCuff = new THREE.Mesh(ankleCuffGeo, collarRingMat);
  rightAnkleCuff.position.set(0, 0.08, 0);
  rightFootGroup.add(rightAnkleCuff);

  rightFootGroup.position.set(0.24, -0.74, 0.07);
  rightFootGroup.rotation.set(0.04, -0.12, -0.04);
  bodyGroup.add(rightFootGroup);

  rootGroup.add(bodyGroup);

  // ==================== FLOATING HOLOGRAPHIC HALO RING ====================
  const haloRingGroup = new THREE.Group();
  haloRingGroup.name = 'HaloRingGroup';
  haloRingGroup.position.set(0, 1.48, 0.15);

  const haloGeo = new THREE.TorusGeometry(0.85, 0.008, 16, 64);
  haloGeo.rotateX(Math.PI / 2.3);
  const haloMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x00f0ff),
    transparent: true,
    opacity: 0.65,
  });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  haloRingGroup.add(haloMesh);

  // Orbiting Energy Nodes on Halo
  const nodeGeo = new THREE.SphereGeometry(0.022, 16, 16);
  for (let n = 0; n < 4; n++) {
    const nodeMesh = new THREE.Mesh(nodeGeo, cyanGlowMat);
    const angle = (n * Math.PI) / 2;
    nodeMesh.position.set(Math.cos(angle) * 0.85, 0, Math.sin(angle) * 0.85);
    haloRingGroup.add(nodeMesh);
  }

  headGroup.add(haloRingGroup);

  // ==================== FLOATING SCI-FI PARTICLE FIELD ====================
  const particleGroup = new THREE.Group();
  particleGroup.name = 'ParticleGroup';
  particleGroup.position.set(0, -0.4, 0);

  const particleCount = 28;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let p = 0; p < particleCount; p++) {
    const radius = 1.0 + Math.random() * 1.2;
    const theta = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 2.2;
    particlePositions[p * 3] = Math.cos(theta) * radius;
    particlePositions[p * 3 + 1] = y;
    particlePositions[p * 3 + 2] = Math.sin(theta) * radius;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: new THREE.Color(0x00f0ff),
    size: 0.035,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  particleGroup.add(particleSystem);
  rootGroup.add(particleGroup);

  // ==================== METALLIC THICK DISC PLATFORM ====================
  const platformGroup = new THREE.Group();
  platformGroup.name = 'PlatformGroup';
  platformGroup.position.set(0, -1.8, 0);

  // High-End Physical & Metallic Materials
  const darkAlloyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x111625),
    metalness: 0.92,
    roughness: 0.16,
    clearcoat: 0.6,
    clearcoatRoughness: 0.12,
    reflectivity: 0.9,
    envMap: envTexture,
    envMapIntensity: 1.4,
  });

  const brushedSteelMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x243248),
    metalness: 0.96,
    roughness: 0.1,
    clearcoat: 0.85,
    clearcoatRoughness: 0.08,
    envMap: envTexture,
    envMapIntensity: 1.8,
  });

  const topPanelMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x090d16),
    metalness: 0.86,
    roughness: 0.2,
    clearcoat: 0.3,
    envMap: envTexture,
    envMapIntensity: 1.2,
  });

  // 1. Heavy Base Foundation Tier (Bottom Slanted Ring)
  const baseFoundationGeo = new THREE.CylinderGeometry(1.68, 1.76, 0.06, 64);
  const baseFoundationMesh = new THREE.Mesh(baseFoundationGeo, darkAlloyMat);
  baseFoundationMesh.position.y = -0.22;
  baseFoundationMesh.castShadow = true;
  baseFoundationMesh.receiveShadow = true;
  platformGroup.add(baseFoundationMesh);

  // 2. Main Thick Metallic Disc Body
  const mainDiscGeo = new THREE.CylinderGeometry(1.60, 1.66, 0.16, 64);
  const mainDiscMesh = new THREE.Mesh(mainDiscGeo, darkAlloyMat);
  mainDiscMesh.position.y = -0.10;
  mainDiscMesh.castShadow = true;
  mainDiscMesh.receiveShadow = true;
  platformGroup.add(mainDiscMesh);

  // 3. Side Wall Recessed Cyan Glow Strip
  const sideGlowGeo = new THREE.TorusGeometry(1.635, 0.009, 16, 96);
  sideGlowGeo.rotateX(Math.PI / 2);
  const sideGlowMesh = new THREE.Mesh(sideGlowGeo, cyanGlowMat);
  sideGlowMesh.position.y = -0.10;
  platformGroup.add(sideGlowMesh);

  // 4. Polished Steel Top Edge Bevel Rim
  const topBevelRimGeo = new THREE.TorusGeometry(1.60, 0.022, 16, 96);
  topBevelRimGeo.rotateX(Math.PI / 2);
  const topBevelRimMesh = new THREE.Mesh(topBevelRimGeo, brushedSteelMat);
  topBevelRimMesh.position.y = -0.01;
  topBevelRimMesh.castShadow = true;
  platformGroup.add(topBevelRimMesh);

  // 5. Inset Top Faceplate
  const topFaceGeo = new THREE.CylinderGeometry(1.57, 1.57, 0.02, 64);
  const topFaceMesh = new THREE.Mesh(topFaceGeo, topPanelMat);
  topFaceMesh.position.y = 0.00;
  topFaceMesh.receiveShadow = true;
  platformGroup.add(topFaceMesh);

  // 6. Side Tech Brackets & LED Accents (12 Radial Metallic Clamps)
  const bracketGeo = new THREE.BoxGeometry(0.04, 0.14, 0.06);
  const ledGeo = new THREE.SphereGeometry(0.012, 8, 8);
  for (let b = 0; b < 12; b++) {
    const angle = (b * Math.PI * 2) / 12;
    const bracketMesh = new THREE.Mesh(bracketGeo, brushedSteelMat);
    const radius = 1.64;
    bracketMesh.position.set(Math.cos(angle) * radius, -0.10, Math.sin(angle) * radius);
    bracketMesh.rotation.y = -angle;
    bracketMesh.castShadow = true;
    platformGroup.add(bracketMesh);

    // Cyan LED dot on each bracket
    const ledMesh = new THREE.Mesh(ledGeo, cyanGlowMat);
    ledMesh.position.set(Math.cos(angle) * (radius + 0.031), -0.10, Math.sin(angle) * (radius + 0.031));
    platformGroup.add(ledMesh);
  }

  // 7. Foot Shadow Decals (Preserving exact robot foot shadows on top surface)
  const footShadowGeo = new THREE.CircleGeometry(0.24, 32);
  footShadowGeo.rotateX(-Math.PI / 2);
  footShadowGeo.scale(1.0, 1.0, 1.4);
  const footShadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.65,
  });
  const leftFootShadow = new THREE.Mesh(footShadowGeo, footShadowMat);
  leftFootShadow.position.set(-0.24, 0.012, 0.07);
  leftFootShadow.rotation.y = 0.12;
  platformGroup.add(leftFootShadow);

  const rightFootShadow = new THREE.Mesh(footShadowGeo, footShadowMat);
  rightFootShadow.position.set(0.24, 0.012, 0.07);
  rightFootShadow.rotation.y = -0.12;
  platformGroup.add(rightFootShadow);

  // 8. Top Surface Sci-Fi Illuminated Ring Circuits
  const ringOuterGeo = new THREE.TorusGeometry(1.52, 0.012, 16, 96);
  ringOuterGeo.rotateX(Math.PI / 2);
  const ringMesh = new THREE.Mesh(ringOuterGeo, cyanGlowMat);
  ringMesh.position.y = 0.014;
  platformGroup.add(ringMesh);

  const innerRingGeo = new THREE.TorusGeometry(0.98, 0.006, 12, 64);
  innerRingGeo.rotateX(Math.PI / 2);
  const innerRingMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x1e3a5f),
    transparent: true,
    opacity: 0.55,
  });
  const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
  innerRingMesh.position.y = 0.014;
  platformGroup.add(innerRingMesh);

  // 9. Precision Radial Tick Marks / Power Bar Notches on Top Face
  const tickGeo = new THREE.BoxGeometry(0.12, 0.005, 0.02);
  const tickMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  for (let t = 0; t < 12; t++) {
    const tickMesh = new THREE.Mesh(tickGeo, tickMat);
    const angle = (t * Math.PI * 2) / 12;
    tickMesh.position.set(Math.cos(angle) * 1.35, 0.014, Math.sin(angle) * 1.35);
    tickMesh.rotation.y = -angle;
    platformGroup.add(tickMesh);
  }

  rootGroup.add(platformGroup);

  return {
    rootGroup,
    headGroup,
    bodyGroup,
    antennaGroup,
    antennaTipMesh,
    antennaTipLight,
    leftEarMesh,
    rightEarMesh,
    leftArm,
    rightArm,
    leftFoot,
    rightFoot,
    screenMesh,
    eyeGroup,
    leftEye,
    rightEye,
    platformGroup,
    haloRingGroup,
    particleGroup,
    chestCoreLight,
    backPackGroup,
    materials: {
      whitePlush: whitePlushMat,
      bluePlush: bluePlushMat,
      blackScreen: blackScreenMat,
      cyanGlow: cyanGlowMat,
      antennaStem: antennaStemMat,
      eyeMaterial,
    },
  };
}
