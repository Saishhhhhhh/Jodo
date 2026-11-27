import * as THREE from 'three';

/**
 * Generates a deep, rich burnt-terracotta velvet diffuse texture with
 * subtle micro-fiber grain and natural tonal depth (never washed out).
 */
export function createVelvetDiffuseTexture(
  baseHex = '#9E3110',
  darkHex = '#6E1E07',
  lightHex = '#BD4119'
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Deep saturated terracotta base
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, size, size);

  // Subtle organic cloudy nap variation (simulates velvet brush direction)
  for (let i = 0; i < 70; i++) {
    const x = (Math.sin(i * 12.9898) * 0.5 + 0.5) * size;
    const y = (Math.cos(i * 78.233) * 0.5 + 0.5) * size;
    const r = 42 + (i % 5) * 24;
    const grad = ctx.createRadialGradient(x, y, 2, x, y, r);
    grad.addColorStop(0, i % 2 === 0 ? lightHex : darkHex);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.065;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine woven micro-fiber stippling
  for (let i = 0; i < 20000; i++) {
    const px = ((i * 73) % size) + Math.sin(i) * 1.5;
    const py = ((i * 137) % size) + Math.cos(i) * 1.5;
    ctx.globalAlpha = 0.035;
    ctx.fillStyle = i % 3 === 0 ? lightHex : darkHex;
    ctx.fillRect(px, py, 1.5, 1.5);
  }

  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a fine micro-weave bump/roughness map for velvet tactile detail.
 */
export function createVelvetMicroTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#d8d8d8';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        const n = Math.sin(x * 1.3 + y * 0.7) * 12 + Math.cos(y * 1.7 - x * 0.5) * 10;
        const v = Math.max(165, Math.min(245, Math.floor(212 + n)));
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  tex.needsUpdate = true;
  return tex;
}

export interface VelvetMaterialSet {
  main: THREE.MeshPhysicalMaterial;
  piping: THREE.MeshPhysicalMaterial;
  crease: THREE.MeshPhysicalMaterial;
}

/**
 * Creates a deep, rich burnt-terracotta velvet PBR material set.
 * Low envMapIntensity keeps studio environment reflections from washing out the color.
 */
export function createTerracottaVelvetMaterials(): VelvetMaterialSet {
  const diffuse = createVelvetDiffuseTexture('#9E3110', '#6E1E07', '#BD4119');
  const micro = createVelvetMicroTexture();

  const main = new THREE.MeshPhysicalMaterial({
    map: diffuse,
    bumpMap: micro,
    bumpScale: 0.004,
    roughnessMap: micro,
    roughness: 0.88,
    metalness: 0.0,
    sheen: 0.55,
    sheenRoughness: 0.48,
    sheenColor: new THREE.Color('#D95A2B'),
    envMapIntensity: 0.26,
    vertexColors: true,
  });

  // Slightly deeper velvet for tailored seams
  const piping = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#7C2309'),
    bumpMap: micro,
    bumpScale: 0.003,
    roughness: 0.84,
    metalness: 0.0,
    sheen: 0.45,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color('#C44A20'),
    envMapIntensity: 0.24,
  });

  // Deep shaded terracotta for inner seat deck / under-cushion shadow areas
  const crease = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#5A1805'),
    roughness: 0.95,
    metalness: 0.0,
    sheen: 0.2,
    sheenRoughness: 0.75,
    sheenColor: new THREE.Color('#963112'),
    envMapIntensity: 0.15,
  });

  return { main, piping, crease };
}

/**
 * Brushed champagne-gold / warm bronze material for the luxury sofa plinth trim & leg ferrules.
 */
export function createChampagneBronzeMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#C4985E'),
    metalness: 0.86,
    roughness: 0.24,
    envMapIntensity: 1.25,
  });
}

/**
 * Generates a soft radial contact shadow texture for grounding the sofa on the cream studio floor.
 */
export function createSoftShadowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.clearRect(0, 0, size, size);

    const outer = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.06,
      size / 2,
      size / 2,
      size * 0.48
    );
    outer.addColorStop(0, 'rgba(38, 20, 10, 0.38)');
    outer.addColorStop(0.42, 'rgba(38, 20, 10, 0.17)');
    outer.addColorStop(0.76, 'rgba(38, 20, 10, 0.04)');
    outer.addColorStop(1, 'rgba(38, 20, 10, 0)');

    ctx.fillStyle = outer;
    ctx.fillRect(0, 0, size, size);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
