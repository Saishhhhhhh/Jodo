import * as THREE from 'three';

export type FinishType = 'teak' | 'terracotta' | 'sand' | 'charcoal';

interface FinishColors {
  base: string;
  grain1: string;
  grain2: string;
  highlight: string;
  roughness: number;
}

const FINISH_CONFIGS: Record<FinishType, FinishColors> = {
  teak: {
    base: '#65381E',
    grain1: '#43210F',
    grain2: '#2B1307',
    highlight: '#8A4E2B',
    roughness: 0.28,
  },
  terracotta: {
    base: '#C65F45',
    grain1: '#9F4635',
    grain2: '#732F22',
    highlight: '#D87A63',
    roughness: 0.45,
  },
  sand: {
    base: '#D6C4AA',
    grain1: '#B59E7E',
    grain2: '#977F62',
    highlight: '#E5D6BF',
    roughness: 0.48,
  },
  charcoal: {
    base: '#2B2824',
    grain1: '#1C1A17',
    grain2: '#12110F',
    highlight: '#3D3833',
    roughness: 0.38,
  },
};

// Generates an authentic wood grain diffuse texture on a 2D canvas
export function createWoodTexture(finish: FinishType = 'teak'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const cfg = FINISH_CONFIGS[finish];

  // Base coat
  ctx.fillStyle = cfg.base;
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle directional longitudinal wood fibers
  for (let y = 0; y < 1024; y += 2) {
    const alpha = (Math.sin(y * 0.05) * 0.5 + 0.5) * 0.12 + Math.random() * 0.08;
    ctx.fillStyle = cfg.grain1;
    ctx.globalAlpha = alpha;
    ctx.fillRect(0, y, 1024, 1.5);
  }

  // Wavy growth rings / annual grain variation
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 40; i++) {
    const startY = (i * 28 + Math.sin(i) * 15) % 1024;
    const thickness = 2 + Math.random() * 6;
    ctx.beginPath();
    ctx.moveTo(0, startY);
    ctx.bezierCurveTo(
      340, startY + Math.sin(i * 1.5) * 35,
      680, startY - Math.cos(i * 1.2) * 35,
      1024, startY + Math.sin(i) * 20
    );
    ctx.strokeStyle = i % 2 === 0 ? cfg.grain2 : cfg.highlight;
    ctx.lineWidth = thickness;
    ctx.stroke();
  }

  // Micro-pores and subtle natural speckles
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#000000';
  for (let j = 0; j < 3000; j++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    const len = 4 + Math.random() * 12;
    ctx.fillRect(px, py, len, 1);
  }

  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;
  return texture;
}

// Generates a normal / bump map for tactile grain relief
export function createWoodBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += 3) {
      const v = Math.floor(128 + (Math.sin(y * 0.1) * 30) + (Math.random() * 25 - 12));
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(0, y, 512, 2);
    }
  }

  const bump = new THREE.CanvasTexture(canvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(2, 2);
  bump.needsUpdate = true;
  return bump;
}

// Material generator for wood components
export function getWoodMaterial(finish: FinishType = 'teak'): THREE.MeshStandardMaterial {
  const map = createWoodTexture(finish);
  const bumpMap = createWoodBumpTexture();
  const cfg = FINISH_CONFIGS[finish];

  return new THREE.MeshStandardMaterial({
    map,
    bumpMap,
    bumpScale: 0.008,
    roughness: cfg.roughness,
    metalness: 0.04,
  });
}

// Brushed brass material for joinery dowels and hardware
export function getBrassMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#C8A165'),
    metalness: 0.88,
    roughness: 0.28,
  });
}
