'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { soundEngine } from '@/audio/woodSound';
import { getWoodMaterial, getBrassMaterial, type FinishType } from '@/textures/woodTexture';
import { Rotate3d } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}


interface TableSceneProps {
  finish: FinishType;
  onAssemblyProgress?: (progress: number) => void;
}

interface TablePart {
  mesh: THREE.Object3D;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  startRot: THREE.Euler;
  endRot: THREE.Euler;
  startProgress: number;
  endProgress: number;
  noiseOffset: number;
  name: string;
}

export const TableScene: React.FC<TableSceneProps> = ({ finish, onAssemblyProgress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isFullyAssembled, setIsFullyAssembled] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const soundTriggersRef = useRef<{ [key: string]: boolean }>({
    legs: false,
    hub: false,
    top: false,
    complete: false,
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const partsRef = useRef<TablePart[]>([]);
  const shadowPlaneRef = useRef<THREE.Mesh | null>(null);
  const tableGroupRef = useRef<THREE.Group | null>(null);

  const dragRotation = useRef<{ x: number; y: number; vx: number; vy: number }>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  });
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPointerDown = useRef<boolean>(false);

  // Update material on finish change
  useEffect(() => {
    if (sceneRef.current) {
      const newMat = getWoodMaterial(finish);
      partsRef.current.forEach((part) => {
        if (!part.name.includes('Brass')) {
          part.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh && child !== shadowPlaneRef.current) {
              child.material = newMat;
            }
          });
        }
      });
    }
  }, [finish]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2('#F4EBDD', 0.035);

    // Responsive Camera Setup - Ensure table is 100% fully visible in viewport
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(34, aspect, 0.1, 50);

    const updateCameraDistance = () => {
      const currentAspect = canvas.clientWidth / canvas.clientHeight;
      camera.aspect = currentAspect;
      if (currentAspect < 1) {
        camera.position.set(0, 0.25, 8.2 / currentAspect * 0.78);
      } else {
        camera.position.set(0, 0.35, 6.6);
      }
      camera.lookAt(0, 0.05, 0);
      camera.updateProjectionMatrix();
    };

    updateCameraDistance();
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // 2. Studio Lighting
    const ambientLight = new THREE.AmbientLight('#FAF3E8', 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#FFF3E3', 2.1);
    keyLight.position.set(-4.0, 6.5, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#E0EBF5', 0.75);
    fillLight.position.set(4.5, 3.0, -2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#FFDFC7', 1.3);
    rimLight.position.set(0, 5.0, -4.5);
    scene.add(rimLight);

    // 3. Ground Studio Floor Shadow
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(256, 256, 25, 256, 256, 230);
      grad.addColorStop(0, 'rgba(36, 33, 30, 0.44)');
      grad.addColorStop(0.4, 'rgba(36, 33, 30, 0.18)');
      grad.addColorStop(0.7, 'rgba(36, 33, 30, 0.05)');
      grad.addColorStop(1, 'rgba(36, 33, 30, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 512, 512);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(floorGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.15;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
    shadowPlaneRef.current = shadowPlane;

    // 4. Build Table Components (Contained in safe viewport boundaries)
    const tableGroup = new THREE.Group();
    scene.add(tableGroup);
    tableGroupRef.current = tableGroup;

    const woodMat = getWoodMaterial(finish);
    const brassMat = getBrassMaterial();
    const parts: TablePart[] = [];

    // Helper: Circular Tabletop
    const createTabletop = (radius = 1.25, thickness = 0.11): THREE.Mesh => {
      const geo = new THREE.CylinderGeometry(radius, radius * 0.95, thickness, 48);
      const mesh = new THREE.Mesh(geo, woodMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // Helper: Sculpted Fin Leg
    const createPedestalLeg = (): THREE.Mesh => {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(0.35, 0);
      shape.quadraticCurveTo(0.3, 0.45, 0.2, 1.1);
      shape.lineTo(0.04, 1.1);
      shape.lineTo(0, 0);

      const extrudeSettings = {
        depth: 0.09,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      };
      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.center();
      const mesh = new THREE.Mesh(geo, woodMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // Helper: Brass Central Core
    const createBrassHub = (): THREE.Group => {
      const grp = new THREE.Group();
      const ringGeo = new THREE.TorusGeometry(0.22, 0.032, 16, 32);
      const ringMesh = new THREE.Mesh(ringGeo, brassMat);
      ringMesh.rotation.x = Math.PI / 2;
      grp.add(ringMesh);

      for (let i = 0; i < 3; i++) {
        const armGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.38, 16);
        const armMesh = new THREE.Mesh(armGeo, brassMat);
        armMesh.rotation.z = Math.PI / 2;
        armMesh.rotation.y = (i * Math.PI * 2) / 3;
        armMesh.position.x = Math.cos((i * Math.PI * 2) / 3) * 0.2;
        armMesh.position.z = Math.sin((i * Math.PI * 2) / 3) * 0.2;
        grp.add(armMesh);
      }
      return grp;
    };

    // --- INSTANTIATE TABLE PARTS (Safe exploded bounds) ---

    // 1. Tabletop
    const topMesh = createTabletop();
    tableGroup.add(topMesh);
    parts.push({
      mesh: topMesh,
      name: 'Solid Chamfered Tabletop',
      startPos: new THREE.Vector3(0, 1.55, 0.2),
      endPos: new THREE.Vector3(0, 0.54, 0),
      startRot: new THREE.Euler(0.18, 0.3, -0.1),
      endRot: new THREE.Euler(0, 0, 0),
      startProgress: 0.55,
      endProgress: 0.82,
      noiseOffset: 1.0,
    });

    // 2. Tripod Leg 1 (0 deg)
    const leg1 = createPedestalLeg();
    tableGroup.add(leg1);
    parts.push({
      mesh: leg1,
      name: 'Sculptural Fin Leg A',
      startPos: new THREE.Vector3(0, -0.6, 1.4),
      endPos: new THREE.Vector3(0, -0.06, 0.36),
      startRot: new THREE.Euler(0.4, 0, 0.25),
      endRot: new THREE.Euler(0, 0, 0),
      startProgress: 0.05,
      endProgress: 0.36,
      noiseOffset: 2.0,
    });

    // 3. Tripod Leg 2 (120 deg)
    const leg2 = createPedestalLeg();
    tableGroup.add(leg2);
    const angle2 = (2 * Math.PI) / 3;
    parts.push({
      mesh: leg2,
      name: 'Sculptural Fin Leg B',
      startPos: new THREE.Vector3(
        Math.sin(angle2) * 1.4,
        -0.5,
        Math.cos(angle2) * 1.4
      ),
      endPos: new THREE.Vector3(
        Math.sin(angle2) * 0.36,
        -0.06,
        Math.cos(angle2) * 0.36
      ),
      startRot: new THREE.Euler(-0.3, angle2 + 0.3, -0.3),
      endRot: new THREE.Euler(0, angle2, 0),
      startProgress: 0.08,
      endProgress: 0.38,
      noiseOffset: 3.0,
    });

    // 4. Tripod Leg 3 (240 deg)
    const leg3 = createPedestalLeg();
    tableGroup.add(leg3);
    const angle3 = (4 * Math.PI) / 3;
    parts.push({
      mesh: leg3,
      name: 'Sculptural Fin Leg C',
      startPos: new THREE.Vector3(
        Math.sin(angle3) * 1.4,
        -0.55,
        Math.cos(angle3) * 1.4
      ),
      endPos: new THREE.Vector3(
        Math.sin(angle3) * 0.36,
        -0.06,
        Math.cos(angle3) * 0.36
      ),
      startRot: new THREE.Euler(0.3, angle3 - 0.3, 0.2),
      endRot: new THREE.Euler(0, angle3, 0),
      startProgress: 0.1,
      endProgress: 0.4,
      noiseOffset: 4.0,
    });

    // 5. Central Brass Hub
    const hubGrp = createBrassHub();
    tableGroup.add(hubGrp);
    parts.push({
      mesh: hubGrp,
      name: 'Brass Central Tension Hub',
      startPos: new THREE.Vector3(0, -0.85, 0),
      endPos: new THREE.Vector3(0, 0.4, 0),
      startRot: new THREE.Euler(0.4, 0.8, 0),
      endRot: new THREE.Euler(0, 0, 0),
      startProgress: 0.38,
      endProgress: 0.62,
      noiseOffset: 5.0,
    });

    partsRef.current = parts;
    tableGroup.position.set(0, -0.05, 0);

    updatePartsTransformation(0, 0);

    // 5. GSAP ScrollTrigger
    const scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        setProgressPercent(Math.round(p * 100));
        if (onAssemblyProgress) onAssemblyProgress(p);

        if (p >= 0.35 && !soundTriggersRef.current.legs) {
          soundTriggersRef.current.legs = true;
          soundEngine.playWoodTap(0.95, 0.16);
        } else if (p < 0.35) {
          soundTriggersRef.current.legs = false;
        }

        if (p >= 0.6 && !soundTriggersRef.current.hub) {
          soundTriggersRef.current.hub = true;
          soundEngine.playBrassLock(0.18);
        } else if (p < 0.6) {
          soundTriggersRef.current.hub = false;
        }

        if (p >= 0.82 && !soundTriggersRef.current.top) {
          soundTriggersRef.current.top = true;
          soundEngine.playWoodTap(0.65, 0.24);
        } else if (p < 0.82) {
          soundTriggersRef.current.top = false;
        }

        if (p >= 0.98 && !soundTriggersRef.current.complete) {
          soundTriggersRef.current.complete = true;
          soundEngine.playAssemblyComplete();
          setIsFullyAssembled(true);
        } else if (p < 0.98) {
          soundTriggersRef.current.complete = false;
          setIsFullyAssembled(false);
        }

        if (shadowPlaneRef.current) {
          const shadowMat = shadowPlaneRef.current.material as THREE.MeshBasicMaterial;
          shadowMat.opacity = 0.12 + p * 0.48;
          shadowPlaneRef.current.scale.set(0.7 + p * 0.4, 0.7 + p * 0.4, 1);
        }
      },
    });

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const render = () => {
      const time = clock.getElapsedTime();
      const currentProgress = scrollTrigger ? scrollTrigger.progress : 0;

      updatePartsTransformation(currentProgress, time);

      if (currentProgress > 0.95 && !isPointerDown.current) {
        tableGroup.rotation.y += 0.0025;
      } else if (currentProgress <= 0.95) {
        const targetRotY = THREE.MathUtils.lerp(0.7, 0.45, currentProgress);
        const targetRotX = THREE.MathUtils.lerp(0.18, 0.08, currentProgress);
        tableGroup.rotation.y = THREE.MathUtils.lerp(tableGroup.rotation.y, targetRotY, 0.08);
        tableGroup.rotation.x = THREE.MathUtils.lerp(tableGroup.rotation.x, targetRotX, 0.08);
      }

      if (dragRotation.current.vx !== 0 || dragRotation.current.vy !== 0) {
        tableGroup.rotation.y += dragRotation.current.vx;
        tableGroup.rotation.x += dragRotation.current.vy;
        dragRotation.current.vx *= 0.92;
        dragRotation.current.vy *= 0.92;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const handleResize = () => {
      if (!canvas || !renderer || !camera) return;
      updateCameraDistance();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      scrollTrigger.kill();
      renderer.dispose();
      parts.forEach((p) => {
        p.mesh.traverse((c) => {
          if (c instanceof THREE.Mesh) c.geometry.dispose();
        });
      });
    };
  }, []);

  const updatePartsTransformation = (progress: number, time: number) => {
    partsRef.current.forEach((part) => {
      const localP = THREE.MathUtils.clamp(
        (progress - part.startProgress) / (part.endProgress - part.startProgress),
        0,
        1
      );
      const eased = gsap.parseEase('power2.out')(localP);

      const hoverIntensity = (1 - localP) * 0.08;
      const hoverY = Math.sin(time * 1.6 + part.noiseOffset) * hoverIntensity;
      const hoverX = Math.cos(time * 1.2 + part.noiseOffset) * (hoverIntensity * 0.4);
      const hoverRot = Math.sin(time * 1.4 + part.noiseOffset) * (hoverIntensity * 0.5);

      part.mesh.position.x =
        THREE.MathUtils.lerp(part.startPos.x, part.endPos.x, eased) + hoverX;
      part.mesh.position.y =
        THREE.MathUtils.lerp(part.startPos.y, part.endPos.y, eased) + hoverY;
      part.mesh.position.z = THREE.MathUtils.lerp(part.startPos.z, part.endPos.z, eased);

      part.mesh.rotation.x =
        THREE.MathUtils.lerp(part.startRot.x, part.endRot.x, eased) + hoverRot;
      part.mesh.rotation.y =
        THREE.MathUtils.lerp(part.startRot.y, part.endRot.y, eased) + hoverRot * 0.5;
      part.mesh.rotation.z =
        THREE.MathUtils.lerp(part.startRot.z, part.endRot.z, eased) + hoverRot * 0.6;
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDown.current = true;
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    dragRotation.current.vx = dx * 0.008;
    dragRotation.current.vy = dy * 0.006;
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: '280vh' }}
      id="object-table-section"
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#F4EBDD]">
        <canvas
          ref={canvasRef}
          className={`w-full h-full block touch-none ${
            isDragging ? 'cursor-grabbing' : isFullyAssembled ? 'cursor-grab' : 'cursor-default'
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />

        {/* Minimal Central Title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 text-center w-full px-4 select-none">
          <div className="font-serif text-base md:text-xl tracking-[0.3em] text-[#24211E] uppercase mb-1 opacity-80">
            JODO · OBJECT 02
          </div>
          <h2
            className="font-serif font-light uppercase tracking-[0.14em] leading-[0.92] text-[#C65F45]"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 6.5rem)' }}
          >
            THE MESA
          </h2>
          <p className="font-mono text-xs md:text-sm tracking-[0.26em] text-[#57524C] uppercase mt-3">
            {isFullyAssembled
              ? 'TABLE ASSEMBLED · DRAG 360° TO INSPECT'
              : progressPercent > 0
              ? `ASSEMBLING · ${progressPercent}% COMPLETE`
              : 'SCROLL TO CONVERGE ↓'}
          </p>
        </div>

        {/* 360° Drag Cue when assembled */}
        {isFullyAssembled && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center animate-bounce">
            <div className="flex items-center gap-2 bg-[#24211E] text-[#F4EBDD] px-4 py-1.5 rounded-full shadow-lg text-xs font-mono tracking-wider">
              <Rotate3d className="w-3.5 h-3.5 text-[#C65F45]" />
              <span>DRAG 360° TO INSPECT</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
