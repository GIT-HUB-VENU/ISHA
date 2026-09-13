import * as THREE from 'three';

/**
 * Ultra-Detailed Procedural Texture Generator for I.S.H.A Robot
 * Recreates tactile plush fleece felt, perimeter embroidery stitches,
 * soft airbrushed pink cheek blushes, fine fabric weave bump, and romper tailoring.
 */
export function createPlushTextures() {
  // 1. High-Resolution Head Diffuse & Blush Texture (2048x2048)
  const headCanvas = document.createElement('canvas');
  headCanvas.width = 2048;
  headCanvas.height = 2048;
  const ctx = headCanvas.getContext('2d');

  if (ctx) {
    // Base warm soft white plush
    ctx.fillStyle = '#f7f9fd';
    ctx.fillRect(0, 0, 2048, 2048);

    // Micro-felt noise pass (stippled plush fibers)
    const imgData = ctx.getImageData(0, 0, 2048, 2048);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Airbrushed Soft Fuzzy Pink Cheeks
    function drawBlush(x, y, radiusX, radiusY) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radiusX);
      gradient.addColorStop(0, 'rgba(255, 120, 155, 0.88)');
      gradient.addColorStop(0.35, 'rgba(255, 145, 175, 0.62)');
      gradient.addColorStop(0.7, 'rgba(255, 175, 195, 0.25)');
      gradient.addColorStop(1, 'rgba(255, 195, 210, 0)');

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, radiusY / radiusX);
      ctx.beginPath();
      ctx.arc(0, 0, radiusX, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    }

    drawBlush(420, 1420, 280, 220);
    drawBlush(1628, 1420, 280, 220);

    // Subtle tailored vertical forehead seam line
    ctx.strokeStyle = 'rgba(205, 218, 235, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(1024, 350);
    ctx.lineTo(1024, 800);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(1025.5, 350);
    ctx.lineTo(1025.5, 800);
    ctx.stroke();

    // Subtle warm forehead radiance
    const foreheadGrad = ctx.createRadialGradient(1024, 750, 0, 1024, 750, 650);
    foreheadGrad.addColorStop(0, 'rgba(255, 242, 246, 0.35)');
    foreheadGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = foreheadGrad;
    ctx.fillRect(0, 0, 2048, 1200);
  }

  const headTexture = new THREE.CanvasTexture(headCanvas);
  headTexture.wrapS = THREE.ClampToEdgeWrapping;
  headTexture.wrapT = THREE.ClampToEdgeWrapping;

  // 2. Multi-Frequency Micro-Felt & Weave Bump Map
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 1024;
  bumpCanvas.height = 1024;
  const bCtx = bumpCanvas.getContext('2d');
  if (bCtx) {
    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, 1024, 1024);

    bCtx.strokeStyle = 'rgba(160, 160, 160, 0.35)';
    bCtx.lineWidth = 1;
    for (let y = 0; y < 1024; y += 4) {
      bCtx.beginPath();
      bCtx.moveTo(0, y);
      bCtx.lineTo(1024, y);
      bCtx.stroke();
    }
    for (let x = 0; x < 1024; x += 4) {
      bCtx.beginPath();
      bCtx.moveTo(x, 0);
      bCtx.lineTo(x, 1024);
      bCtx.stroke();
    }

    const bData = bCtx.getImageData(0, 0, 1024, 1024);
    for (let i = 0; i < bData.data.length; i += 4) {
      const v = bData.data[i] + (Math.random() - 0.5) * 45;
      bData.data[i] = v;
      bData.data[i + 1] = v;
      bData.data[i + 2] = v;
    }
    bCtx.putImageData(bData, 0, 0);
  }

  const plushBumpMap = new THREE.CanvasTexture(bumpCanvas);
  plushBumpMap.wrapS = THREE.RepeatWrapping;
  plushBumpMap.wrapT = THREE.RepeatWrapping;
  plushBumpMap.repeat.set(20, 20);

  // 3. Torso Overalls Texture (White upper bib + Baby Blue romper + embroidered stitch seams)
  const bodyCanvas = document.createElement('canvas');
  bodyCanvas.width = 1024;
  bodyCanvas.height = 1024;
  const bodyCtx = bodyCanvas.getContext('2d');
  if (bodyCtx) {
    bodyCtx.fillStyle = '#f7f9fd';
    bodyCtx.fillRect(0, 0, 1024, 275);

    bodyCtx.fillStyle = '#8bc8ea';
    bodyCtx.fillRect(0, 275, 1024, 749);

    const seamGrad = bodyCtx.createLinearGradient(0, 270, 0, 315);
    seamGrad.addColorStop(0, 'rgba(85, 150, 190, 0.65)');
    seamGrad.addColorStop(1, 'rgba(139, 200, 234, 0)');
    bodyCtx.fillStyle = seamGrad;
    bodyCtx.fillRect(0, 270, 1024, 45);

    bodyCtx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    bodyCtx.lineWidth = 2.5;
    bodyCtx.setLineDash([6, 6]);
    bodyCtx.beginPath();
    bodyCtx.moveTo(0, 268);
    bodyCtx.lineTo(1024, 268);
    bodyCtx.stroke();

    bodyCtx.strokeStyle = 'rgba(85, 150, 190, 0.8)';
    bodyCtx.lineWidth = 3.5;
    bodyCtx.setLineDash([]);
    bodyCtx.beginPath();
    bodyCtx.moveTo(340, 275);
    bodyCtx.quadraticCurveTo(315, 600, 360, 1024);
    bodyCtx.stroke();

    bodyCtx.beginPath();
    bodyCtx.moveTo(684, 275);
    bodyCtx.quadraticCurveTo(709, 600, 664, 1024);
    bodyCtx.stroke();

    bodyCtx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    bodyCtx.lineWidth = 2;
    bodyCtx.setLineDash([4, 6]);
    bodyCtx.beginPath();
    bodyCtx.moveTo(335, 275);
    bodyCtx.quadraticCurveTo(310, 600, 355, 1024);
    bodyCtx.stroke();

    bodyCtx.beginPath();
    bodyCtx.moveTo(689, 275);
    bodyCtx.quadraticCurveTo(714, 600, 669, 1024);
    bodyCtx.stroke();
    bodyCtx.setLineDash([]);

    const bodyImg = bodyCtx.getImageData(0, 0, 1024, 1024);
    for (let i = 0; i < bodyImg.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 10;
      bodyImg.data[i] = Math.min(255, Math.max(0, bodyImg.data[i] + n));
      bodyImg.data[i + 1] = Math.min(255, Math.max(0, bodyImg.data[i + 1] + n));
      bodyImg.data[i + 2] = Math.min(255, Math.max(0, bodyImg.data[i + 2] + n));
    }
    bodyCtx.putImageData(bodyImg, 0, 0);
  }

  const bodyTexture = new THREE.CanvasTexture(bodyCanvas);

  // 4. Studio Environment Reflection Map
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 1024;
  envCanvas.height = 512;
  const envCtx = envCanvas.getContext('2d');
  if (envCtx) {
    envCtx.fillStyle = '#020306';
    envCtx.fillRect(0, 0, 1024, 512);

    const softboxGrad = envCtx.createLinearGradient(380, 30, 700, 190);
    softboxGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    softboxGrad.addColorStop(0.5, 'rgba(210, 235, 255, 0.6)');
    softboxGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    envCtx.fillStyle = softboxGrad;
    envCtx.beginPath();
    envCtx.ellipse(550, 105, 230, 65, -0.18, 0, Math.PI * 2);
    envCtx.fill();

    const fillReflect = envCtx.createRadialGradient(180, 220, 0, 180, 220, 140);
    fillReflect.addColorStop(0, 'rgba(160, 210, 255, 0.5)');
    fillReflect.addColorStop(1, 'rgba(0, 0, 0, 0)');
    envCtx.fillStyle = fillReflect;
    envCtx.fillRect(50, 100, 260, 240);

    const cyanReflect = envCtx.createRadialGradient(860, 200, 0, 860, 200, 160);
    cyanReflect.addColorStop(0, 'rgba(0, 235, 255, 0.75)');
    cyanReflect.addColorStop(1, 'rgba(0, 0, 0, 0)');
    envCtx.fillStyle = cyanReflect;
    envCtx.fillRect(700, 40, 320, 320);
  }

  const envTexture = new THREE.CanvasTexture(envCanvas);
  envTexture.mapping = THREE.EquirectangularReflectionMapping;

  return {
    headTexture,
    plushBumpMap,
    bodyTexture,
    envTexture,
  };
}

/**
 * Creates the seamless edge-to-edge curved black display glass screen.
 */
export function createSeamlessVisorGeometry(
  width = 2.16,
  height = 1.48,
  depthRadius = 1.20,
  numRings = 32,
  numSlices = 72
) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const uvs = [];
  const indices = [];

  const a = width / 2;
  const b = height / 2;
  const p = 3.2;

  const Rx = 1.48;
  const Ry = 1.15;
  const Rz = depthRadius;

  function getCapsuleZ(x, y, sinT) {
    const cheekPuff = sinT < 0.15 ? Math.exp(-Math.pow((sinT + 0.25) / 0.55, 2)) * 0.10 : 0;
    const effRx = Rx * (1 + cheekPuff);
    const normX = x / effRx;
    const normY = y / Ry;
    const rSq = Math.min(0.999, normX * normX + normY * normY);
    return Rz * Math.sqrt(Math.max(0, 1 - rSq));
  }

  vertices.push(0, 0, Rz);
  uvs.push(0.5, 0.5);

  for (let ring = 1; ring <= numRings; ring++) {
    const u = ring / numRings;

    for (let slice = 0; slice < numSlices; slice++) {
      const theta = (slice / numSlices) * Math.PI * 2;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);

      const denom = Math.pow(Math.abs(cosT / a), p) + Math.pow(Math.abs(sinT / b), p);
      const safeDenom = Math.max(1e-10, denom);
      const R_boundary = 1.0 / Math.pow(safeDenom, 1 / p);

      const r = u * R_boundary;
      const x = r * cosT;
      const y = r * sinT;
      const z = getCapsuleZ(x, y, sinT);

      vertices.push(x, y, z);
      uvs.push(x / width + 0.5, y / height + 0.5);
    }
  }

  for (let slice = 0; slice < numSlices; slice++) {
    const nextSlice = (slice + 1) % numSlices;
    const vCenter = 0;
    const v1 = 1 + slice;
    const v2 = 1 + nextSlice;
    indices.push(vCenter, v1, v2);
  }

  for (let ring = 1; ring < numRings; ring++) {
    const ringStart = 1 + (ring - 1) * numSlices;
    const nextRingStart = 1 + ring * numSlices;

    for (let slice = 0; slice < numSlices; slice++) {
      const nextSlice = (slice + 1) % numSlices;

      const aIdx = ringStart + slice;
      const bIdx = ringStart + nextSlice;
      const cIdx = nextRingStart + slice;
      const dIdx = nextRingStart + nextSlice;

      indices.push(aIdx, cIdx, bIdx);
      indices.push(bIdx, cIdx, dIdx);
    }
  }

  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();

  return geometry;
}

export const createCurvedVisorGeometry = createSeamlessVisorGeometry;

/**
 * Creates the plush head shell geometry.
 */
export function createSeamlessPlushHeadGeometry(
  visorWidth = 2.16,
  visorHeight = 1.48,
  depthRadius = 1.20,
  numSlices = 72,
  numRings = 36
) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const uvs = [];
  const indices = [];

  const a = visorWidth / 2;
  const b = visorHeight / 2;
  const p = 3.2;

  const Rx = 1.48;
  const Ry = 1.15;
  const Rz = depthRadius;

  function getCapsuleZ(x, y, sinT) {
    const cheekPuff = sinT < 0.15 ? Math.exp(-Math.pow((sinT + 0.25) / 0.55, 2)) * 0.10 : 0;
    const effRx = Rx * (1 + cheekPuff);
    const normX = x / effRx;
    const normY = y / Ry;
    const rSq = Math.min(0.999, normX * normX + normY * normY);
    return Rz * Math.sqrt(Math.max(0, 1 - rSq));
  }

  function getBoundaryPoint(theta) {
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const denom = Math.pow(Math.abs(cosT / a), p) + Math.pow(Math.abs(sinT / b), p);
    const safeDenom = Math.max(1e-10, denom);
    const R_boundary = 1.0 / Math.pow(safeDenom, 1 / p);
    const x = R_boundary * cosT;
    const y = R_boundary * sinT;
    const z = getCapsuleZ(x, y, sinT);
    return { x, y, z, sinT, cosT };
  }

  for (let ring = 0; ring < numRings; ring++) {
    const t = ring / Math.max(1, numRings - 1);

    for (let slice = 0; slice < numSlices; slice++) {
      const theta = (slice / numSlices) * Math.PI * 2;
      const pt = getBoundaryPoint(theta);

      let x, y, z;

      if (ring === 0) {
        x = pt.x;
        y = pt.y;
        z = pt.z;
      } else {
        const zStart = pt.z;
        const zEnd = -Rz * 1.15;
        z = zStart + (zEnd - zStart) * (0.5 - 0.5 * Math.cos(t * Math.PI));

        const zRatio = Math.max(-1, Math.min(1, z / (Rz * 1.15)));
        const radFactor = Math.sqrt(Math.max(0.01, 1 - zRatio * zRatio));

        let cheekPuff = 0;
        if (pt.sinT < 0.15) {
          cheekPuff = Math.exp(-Math.pow((pt.sinT + 0.25) / 0.55, 2)) * 0.12 * radFactor;
        }

        const skullX = Rx * (1 + cheekPuff) * radFactor * pt.cosT;
        const skullY = Ry * radFactor * pt.sinT;

        const blend = Math.min(1, t * 2.2);
        x = (1 - blend) * pt.x + blend * skullX;
        y = (1 - blend) * pt.y + blend * skullY;
      }

      vertices.push(x, y, z);

      if (z > -0.3) {
        const u = x / 2.8 + 0.5;
        const v = y / 2.2 + 0.5;
        uvs.push(Math.max(0, Math.min(1, u)), Math.max(0, Math.min(1, v)));
      } else {
        const u = slice / numSlices;
        const v = Math.max(0, Math.min(1, (z - -Rz * 1.15) / (Rz * 1.15 * 2)));
        uvs.push(u, v);
      }
    }
  }

  const backPoleIndex = vertices.length / 3;
  vertices.push(0, 0, -Rz * 1.15);
  uvs.push(0.5, 0.5);

  for (let ring = 0; ring < numRings - 1; ring++) {
    const ringStart = ring * numSlices;
    const nextRingStart = (ring + 1) * numSlices;

    for (let slice = 0; slice < numSlices; slice++) {
      const nextSlice = (slice + 1) % numSlices;

      const aIdx = ringStart + slice;
      const bIdx = ringStart + nextSlice;
      const cIdx = nextRingStart + slice;
      const dIdx = nextRingStart + nextSlice;

      indices.push(aIdx, cIdx, bIdx);
      indices.push(bIdx, cIdx, dIdx);
    }
  }

  const lastRingStart = (numRings - 1) * numSlices;
  for (let slice = 0; slice < numSlices; slice++) {
    const nextSlice = (slice + 1) % numSlices;
    const aIdx = lastRingStart + slice;
    const bIdx = lastRingStart + nextSlice;
    indices.push(aIdx, backPoleIndex, bIdx);
  }

  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();

  return geometry;
}

export const createUnifiedPlushHeadGeometry = createSeamlessPlushHeadGeometry;
