import * as THREE from 'three';

/**
 * Creates a tailored, plush seat cushion using an extruded rounded-rectangle
 * silhouette with multi-segment bevels, organic pillow crown, and baked crease AO.
 */
export function createSculptedSeatCushion(
  width: number,
  height: number,
  depth: number,
  side: 'left' | 'right'
): THREE.BufferGeometry {
  const bevel = Math.min(height * 0.34, 0.082);
  const hw = width * 0.5 - bevel;
  const hd = depth * 0.5 - bevel;
  const r = 0.095;

  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
  shape.lineTo(hw, hd - r);
  shape.quadraticCurveTo(hw, hd, hw - r, hd);
  shape.lineTo(-hw + r, hd);
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
  shape.lineTo(-hw, -hd + r);
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.02, height - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.92,
    bevelSegments: 14,
    curveSegments: 24,
  });

  geo.rotateX(Math.PI / 2);
  geo.center();

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const fullHw = width * 0.5;
  const fullHh = height * 0.5;
  const fullHd = depth * 0.5;
  const innerSign = side === 'left' ? 1 : -1;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const nx = THREE.MathUtils.clamp(x / fullHw, -1, 1);
    const ny = THREE.MathUtils.clamp(y / fullHh, -1, 1);
    const nz = THREE.MathUtils.clamp(z / fullHd, -1, 1);

    // Organic plush top pillow crown (flat-ish underside so it sits flush on plinth)
    const crown = Math.cos(nx * Math.PI * 0.48) * Math.cos(nz * Math.PI * 0.48);
    if (ny > 0) {
      y += crown * 0.042 * Math.pow(ny, 0.75);
    } else {
      y *= 0.92;
    }

    // Subtle mid-height plumpness & waterfall front softness
    const midBand = Math.cos(ny * Math.PI * 0.5);
    z += nz * 0.014 * midBand;
    if (nz > 0.35 && ny > 0.1) {
      z += 0.012 * Math.sin(nz * Math.PI * 0.5) * Math.sin(ny * Math.PI * 0.5);
    }

    pos.setXYZ(i, x, y, z);

    // Analytical Ambient Occlusion
    let ao = 1.0;
    if (ny < -0.15) {
      ao *= THREE.MathUtils.lerp(1.0, 0.42, Math.pow((-ny - 0.15) / 0.85, 1.2));
    }
    if (nz < -0.3) {
      ao *= THREE.MathUtils.lerp(1.0, 0.55, (-nz - 0.3) / 0.7);
    }
    if (nx * innerSign > 0.55) {
      ao *= THREE.MathUtils.lerp(1.0, 0.65, (nx * innerSign - 0.55) / 0.45);
    }

    colors[i * 3] = ao;
    colors[i * 3 + 1] = ao;
    colors[i * 3 + 2] = ao;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates an arched, tailored backrest cushion using a custom 2D designer silhouette
 * extruded with multi-segment bevels, lumbar fullness, and baked crease AO.
 */
export function createSculptedBackrestCushion(
  width: number,
  height: number,
  depth: number,
  side: 'left' | 'right'
): THREE.BufferGeometry {
  const bevel = Math.min(depth * 0.35, 0.085);
  const hw = width * 0.5 - bevel;
  const hh = height * 0.5 - bevel;
  const archLift = 0.032;

  // Front-facing silhouette: flat-ish bottom, softly tapered sides, arched rounded top
  const shape = new THREE.Shape();
  shape.moveTo(-hw * 0.96, -hh + 0.04);
  shape.quadraticCurveTo(-hw, -hh, -hw * 0.86, -hh);
  shape.lineTo(hw * 0.86, -hh);
  shape.quadraticCurveTo(hw, -hh, hw * 0.96, -hh + 0.04);
  shape.bezierCurveTo(hw * 1.02, hh * 0.15, hw * 0.96, hh * 0.82, hw * 0.65, hh);
  shape.quadraticCurveTo(0, hh + archLift, -hw * 0.65, hh);
  shape.bezierCurveTo(-hw * 0.96, hh * 0.82, -hw * 1.02, hh * 0.15, -hw * 0.96, -hh + 0.04);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.02, depth - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.88,
    bevelSegments: 14,
    curveSegments: 26,
  });

  geo.center();

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const fullHw = width * 0.5;
  const fullHh = height * 0.5;
  const fullHd = depth * 0.5;
  const innerSign = side === 'left' ? 1 : -1;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const nx = THREE.MathUtils.clamp(x / fullHw, -1, 1);
    const ny = THREE.MathUtils.clamp(y / fullHh, -1, 1);
    const nz = THREE.MathUtils.clamp(z / fullHd, -1, 1);

    // Lush lumbar swell on front face (+z)
    const swell =
      Math.cos(nx * Math.PI * 0.46) * Math.cos((ny + 0.1) * Math.PI * 0.44);
    if (nz > 0) {
      z += Math.max(0, swell) * 0.055 * Math.pow(nz, 0.8);
    }

    // Subtle organic taper at very top
    if (ny > 0.2) {
      z *= 1 - (ny - 0.2) * 0.14;
    }

    pos.setXYZ(i, x, y, z);

    // Analytical AO
    let ao = 1.0;
    if (ny < -0.25) {
      ao *= THREE.MathUtils.lerp(1.0, 0.4, (-ny - 0.25) / 0.75);
    }
    if (nz < -0.1) {
      ao *= THREE.MathUtils.lerp(1.0, 0.65, (-nz - 0.1) / 0.9);
    }
    if (nx * innerSign > 0.55) {
      ao *= THREE.MathUtils.lerp(1.0, 0.68, (nx * innerSign - 0.55) / 0.45);
    }

    colors[i * 3] = ao;
    colors[i * 3 + 1] = ao;
    colors[i * 3 + 2] = ao;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a sleek, luxury rolled-top sofa armrest from a custom cross-section
 * profile extruded front-to-back with deep multi-segment bevels and baked AO.
 */
export function createSculptedBolsterArmrest(
  width: number,
  height: number,
  depth: number,
  side: 'left' | 'right'
): THREE.BufferGeometry {
  const bevel = Math.min(width * 0.28, 0.1);
  const hw = width * 0.5 - bevel;
  const hh = height * 0.5 - bevel;

  // Cross-section in XY plane: flat-ish tucked base, generous rounded outer & top curve
  const shape = new THREE.Shape();
  shape.moveTo(-hw * 0.78, -hh);
  shape.lineTo(hw * 0.78, -hh);
  shape.bezierCurveTo(hw * 1.05, -hh * 0.4, hw * 1.06, hh * 0.6, hw * 0.58, hh);
  shape.quadraticCurveTo(0, hh + 0.03, -hw * 0.58, hh);
  shape.bezierCurveTo(-hw * 1.06, hh * 0.6, -hw * 1.05, -hh * 0.4, -hw * 0.78, -hh);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.05, depth - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.85,
    bevelSegments: 16,
    curveSegments: 28,
  });

  geo.center();

  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const fullHw = width * 0.5;
  const fullHh = height * 0.5;
  const fullHd = depth * 0.5;
  const innerSign = side === 'left' ? 1 : -1;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const nx = THREE.MathUtils.clamp(x / fullHw, -1, 1);
    const ny = THREE.MathUtils.clamp(y / fullHh, -1, 1);
    const nz = THREE.MathUtils.clamp(z / fullHd, -1, 1);

    // Subtle organic crown on top & front bolster fullness
    if (ny > 0) {
      y += Math.cos(nx * Math.PI * 0.45) * Math.cos(nz * Math.PI * 0.42) * 0.022 * ny;
    }

    // Flatten inner face slightly so armrest hugs seat cushion cleanly
    if (nx * innerSign > 0.35) {
      const t = (nx * innerSign - 0.35) / 0.65;
      x -= innerSign * t * 0.018;
    }

    pos.setXYZ(i, x, y, z);

    // Analytical AO: darken bottom plinth contact & inner cushion contact wall
    let ao = 1.0;
    if (ny < -0.28) {
      ao *= THREE.MathUtils.lerp(1.0, 0.42, (-ny - 0.28) / 0.72);
    }
    if (nx * innerSign > 0.38) {
      ao *= THREE.MathUtils.lerp(1.0, 0.52, (nx * innerSign - 0.38) / 0.62);
    }

    colors[i * 3] = ao;
    colors[i * 3 + 1] = ao;
    colors[i * 3 + 2] = ao;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates a continuous stadium/rounded-rectangle plinth rail using ExtrudeGeometry
 * with smooth multi-segment bevels (for the warm bronze/walnut base tray).
 */
export function createStadiumPlinthGeometry(
  width: number,
  depth: number,
  thickness: number,
  cornerRadius: number,
  bevelSize = 0.018
): THREE.BufferGeometry {
  const hw = width * 0.5 - bevelSize;
  const hd = depth * 0.5 - bevelSize;
  const r = Math.min(cornerRadius, hw * 0.9, hd * 0.9);

  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r);
  shape.lineTo(hw, hd - r);
  shape.quadraticCurveTo(hw, hd, hw - r, hd);
  shape.lineTo(-hw + r, hd);
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r);
  shape.lineTo(-hw, -hd + r);
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.005, thickness - bevelSize * 2),
    bevelEnabled: true,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 8,
    curveSegments: 24,
  });

  geo.rotateX(Math.PI / 2);
  geo.center();
  geo.computeVertexNormals();
  return geo;
}
