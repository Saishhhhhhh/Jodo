'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { soundEngine } from '@/audio/woodSound';
import { getWoodMaterial, getBrassMaterial, type FinishType } from '@/textures/woodTexture';
import { Rotate3d } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}


interface ComponentPart {
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

export const ChairScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isFullyAssembled, setIsFullyAssembled] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const finish: FinishType = 'teak';

  const soundTriggersRef = useRef<{ [key: string]: boolean }>({
    legs: false,
    stretchers: false,
    seat: false,
    backrest: false,
    pins: false,
    complete: false,
  });

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const partsRef = useRef<ComponentPart[]>([]);
  const shadowPlaneRef = useRef<THREE.Mesh | null>(null);
  const chairGroupRef = useRef<THREE.Group | null>(null);

  // Turntable drag state
  const dragRotation = useRef<{ x: number; y: number; vx: number; vy: number }>({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
  });
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPointerDown = useRef<boolean>(false);


  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2('#F4EBDD', 0.035);

    // Responsive Camera Setup
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(34, aspect, 0.1, 50);

    const updateCameraDistance = () => {
      const currentAspect = canvas.clientWidth / canvas.clientHeight;
      camera.aspect = currentAspect;
      if (currentAspect < 1) {
        // Mobile portrait: pull back comfortably so chair is 100% visible
        camera.position.set(0, 0.2, (8.2 / currentAspect) * 0.72);
      } else {
        // Desktop landscape: framed heroically in center-lower for bigger presence
        camera.position.set(0, 0.25, 5.9);
      }
      camera.lookAt(0, -0.38, 0);
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
    const ambientLight = new THREE.AmbientLight('#FAF3E8', 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#FFF5E8', 2.2);
    keyLight.position.set(4.5, 6.0, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#D8E5F0', 0.7);
    fillLight.position.set(-4.5, 3.0, -2.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#FFD6BA', 1.35);
    rimLight.position.set(0, 4.0, -4.5);
    scene.add(rimLight);

    // 3. Ground Studio Floor Shadow
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(256, 256, 20, 256, 256, 220);
      grad.addColorStop(0, 'rgba(36, 33, 30, 0.42)');
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
    shadowPlane.position.y = -1.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
    shadowPlaneRef.current = shadowPlane;

    // 4. Build Parametric Chair Group (Lower-centered)
    const chairGroup = new THREE.Group();
    scene.add(chairGroup);
    chairGroupRef.current = chairGroup;

    // Position chair in lower section so top area has zero overlap
    chairGroup.position.set(0, -0.45, 0);

    const woodMat = getWoodMaterial(finish);
    const brassMat = getBrassMaterial();
    const parts: ComponentPart[] = [];

    // Helper: Contoured Seat Platter
    const createContouredSeat = (): THREE.Mesh => {
      const shape = new THREE.Shape();
      const w = 1.1;
      const d = 1.05;
      const r = 0.16;
      shape.moveTo(-w / 2 + r, -d / 2);
      shape.lineTo(w / 2 - r, -d / 2);
      shape.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
      shape.lineTo(w / 2, d / 2 - r);
      shape.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
      shape.lineTo(-w / 2 + r, d / 2);
      shape.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
      shape.lineTo(-w / 2, -d / 2 + r);
      shape.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);

      const extrudeSettings = {
        depth: 0.09,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.03,
        bevelThickness: 0.03,
      };
      const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.center();
      const mesh = new THREE.Mesh(geo, woodMat);
      mesh.rotation.x = Math.PI / 2;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // Helper: Sculptural bentwood backrest arch
    const createBentwoodBackrest = (): THREE.Mesh => {
      const curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.8, 0, 0.22),
        new THREE.Vector3(-0.38, 0, -0.2),
        new THREE.Vector3(0.38, 0, -0.2),
        new THREE.Vector3(0.8, 0, 0.22)
      );
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.085, 16, false);
      const mesh = new THREE.Mesh(tubeGeo, woodMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // Helper: Turned Legs
    const createLeg = (length = 0.98, topRadius = 0.048, bottomRadius = 0.03): THREE.Mesh => {
      const legGeo = new THREE.CylinderGeometry(topRadius, bottomRadius, length, 24);
      const mesh = new THREE.Mesh(legGeo, woodMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // Helper: Stretchers
    const createStretcher = (length = 0.82, width = 0.042, height = 0.06): THREE.Mesh => {
      const geo = new THREE.BoxGeometry(width, height, length);
      const mesh = new THREE.Mesh(geo, woodMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // Helper: Brass pin
    const createBrassPin = (): THREE.Mesh => {
      const geo = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 16);
      const mesh = new THREE.Mesh(geo, brassMat);
      mesh.castShadow = true;
      return mesh;
    };

    // --- INSTANTIATE COMPONENTS ---

    // 1. Front Left Leg
    const flLeg = createLeg(0.98);
    chairGroup.add(flLeg);
    parts.push({
      mesh: flLeg,
      name: 'Front Left Leg',
      startPos: new THREE.Vector3(-1.25, -0.85, 0.45),
      endPos: new THREE.Vector3(-0.46, -0.62, 0.4),
      startRot: new THREE.Euler(0.6, -0.4, 0.5),
      endRot: new THREE.Euler(0.05, 0, -0.06),
      startProgress: 0.0,
      endProgress: 0.26,
      noiseOffset: 0.1,
    });

    // 2. Front Right Leg
    const frLeg = createLeg(0.98);
    chairGroup.add(frLeg);
    parts.push({
      mesh: frLeg,
      name: 'Front Right Leg',
      startPos: new THREE.Vector3(1.25, -0.85, 0.45),
      endPos: new THREE.Vector3(0.46, -0.62, 0.4),
      startRot: new THREE.Euler(-0.5, 0.3, -0.5),
      endRot: new THREE.Euler(0.05, 0, 0.06),
      startProgress: 0.04,
      endProgress: 0.3,
      noiseOffset: 0.4,
    });

    // 3. Rear Left Cantilever Leg
    const rlLeg = createLeg(1.28, 0.052, 0.035);
    chairGroup.add(rlLeg);
    parts.push({
      mesh: rlLeg,
      name: 'Rear Left Cantilever Leg',
      startPos: new THREE.Vector3(-1.2, 0.35, -0.75),
      endPos: new THREE.Vector3(-0.44, -0.38, -0.42),
      startRot: new THREE.Euler(-0.5, 0.6, -0.5),
      endRot: new THREE.Euler(-0.18, 0, -0.05),
      startProgress: 0.08,
      endProgress: 0.34,
      noiseOffset: 0.8,
    });

    // 4. Rear Right Cantilever Leg
    const rrLeg = createLeg(1.28, 0.052, 0.035);
    chairGroup.add(rrLeg);
    parts.push({
      mesh: rrLeg,
      name: 'Rear Right Cantilever Leg',
      startPos: new THREE.Vector3(1.2, 0.35, -0.75),
      endPos: new THREE.Vector3(0.44, -0.38, -0.42),
      startRot: new THREE.Euler(0.5, -0.5, 0.5),
      endRot: new THREE.Euler(-0.18, 0, 0.05),
      startProgress: 0.1,
      endProgress: 0.36,
      noiseOffset: 1.2,
    });

    // 5. Left Side Stretcher
    const lStretcher = createStretcher(0.82);
    chairGroup.add(lStretcher);
    parts.push({
      mesh: lStretcher,
      name: 'Left Underframe Stretcher',
      startPos: new THREE.Vector3(-1.05, -0.4, 0),
      endPos: new THREE.Vector3(-0.45, -0.19, -0.01),
      startRot: new THREE.Euler(0.3, 0.8, -0.3),
      endRot: new THREE.Euler(0, 0, 0),
      startProgress: 0.22,
      endProgress: 0.44,
      noiseOffset: 1.6,
    });

    // 6. Right Side Stretcher
    const rStretcher = createStretcher(0.82);
    chairGroup.add(rStretcher);
    parts.push({
      mesh: rStretcher,
      name: 'Right Underframe Stretcher',
      startPos: new THREE.Vector3(1.05, -0.4, 0),
      endPos: new THREE.Vector3(0.45, -0.19, -0.01),
      startRot: new THREE.Euler(-0.3, -0.8, 0.3),
      endRot: new THREE.Euler(0, 0, 0),
      startProgress: 0.24,
      endProgress: 0.46,
      noiseOffset: 2.0,
    });

    // 7. Cross Stretcher
    const cStretcher = createStretcher(0.84, 0.042, 0.048);
    cStretcher.rotation.y = Math.PI / 2;
    chairGroup.add(cStretcher);
    parts.push({
      mesh: cStretcher,
      name: 'Cross Stabilizer',
      startPos: new THREE.Vector3(0, -0.85, -0.45),
      endPos: new THREE.Vector3(0, -0.21, 0.1),
      startRot: new THREE.Euler(0.8, 0.3, 0.5),
      endRot: new THREE.Euler(0, Math.PI / 2, 0),
      startProgress: 0.28,
      endProgress: 0.5,
      noiseOffset: 2.4,
    });

    // 8. Contoured Solid Timber Seat
    const seatMesh = createContouredSeat();
    chairGroup.add(seatMesh);
    parts.push({
      mesh: seatMesh,
      name: 'Contoured Solid Timber Seat',
      startPos: new THREE.Vector3(-0.85, 0.7, 0.55),
      endPos: new THREE.Vector3(0, -0.11, -0.02),
      startRot: new THREE.Euler(Math.PI / 2 - 0.25, 0.2, -0.3),
      endRot: new THREE.Euler(Math.PI / 2, 0, 0),
      startProgress: 0.42,
      endProgress: 0.68,
      noiseOffset: 2.8,
    });

    // 9. Sculptural Bentwood Backrest
    const backrestMesh = createBentwoodBackrest();
    chairGroup.add(backrestMesh);
    parts.push({
      mesh: backrestMesh,
      name: 'Sculptural Bentwood Arch',
      startPos: new THREE.Vector3(0, 1.35, -0.65),
      endPos: new THREE.Vector3(0, 0.44, -0.38),
      startRot: new THREE.Euler(-0.45, 0.2, -0.15),
      endRot: new THREE.Euler(0.12, 0, 0),
      startProgress: 0.58,
      endProgress: 0.78,
      noiseOffset: 3.2,
    });

    // 10. Brass Pins (4)
    const pin1 = createBrassPin();
    chairGroup.add(pin1);
    parts.push({
      mesh: pin1,
      name: 'Brass Joint Pin A',
      startPos: new THREE.Vector3(-0.75, 0.75, -0.25),
      endPos: new THREE.Vector3(-0.45, 0.32, -0.38),
      startRot: new THREE.Euler(0, 0, 0.5),
      endRot: new THREE.Euler(Math.PI / 2, 0, 0),
      startProgress: 0.72,
      endProgress: 0.84,
      noiseOffset: 3.6,
    });

    const pin2 = createBrassPin();
    chairGroup.add(pin2);
    parts.push({
      mesh: pin2,
      name: 'Brass Joint Pin B',
      startPos: new THREE.Vector3(0.75, 0.75, -0.25),
      endPos: new THREE.Vector3(0.45, 0.32, -0.38),
      startRot: new THREE.Euler(0, 0, -0.5),
      endRot: new THREE.Euler(Math.PI / 2, 0, 0),
      startProgress: 0.74,
      endProgress: 0.86,
      noiseOffset: 4.0,
    });

    const pin3 = createBrassPin();
    chairGroup.add(pin3);
    parts.push({
      mesh: pin3,
      name: 'Brass Joint Pin C',
      startPos: new THREE.Vector3(-0.75, -0.35, 0.55),
      endPos: new THREE.Vector3(-0.46, -0.14, 0.35),
      startRot: new THREE.Euler(0.2, 0.3, 0),
      endRot: new THREE.Euler(0, 0, Math.PI / 2),
      startProgress: 0.76,
      endProgress: 0.88,
      noiseOffset: 4.4,
    });

    const pin4 = createBrassPin();
    chairGroup.add(pin4);
    parts.push({
      mesh: pin4,
      name: 'Brass Joint Pin D',
      startPos: new THREE.Vector3(0.75, -0.35, 0.55),
      endPos: new THREE.Vector3(0.46, -0.14, 0.35),
      startRot: new THREE.Euler(-0.2, -0.3, 0),
      endRot: new THREE.Euler(0, 0, Math.PI / 2),
      startProgress: 0.78,
      endProgress: 0.9,
      noiseOffset: 4.8,
    });

    partsRef.current = parts;

    updatePartsTransformation(0, 0);

    // Lenis Smooth Scroll Integration directly synced with GSAP
    let lenis: Lenis | null = null;
    let updateLenis: ((time: number) => void) | null = null;
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: 1.8,
      });

      lenis.on('scroll', ScrollTrigger.update);

      updateLenis = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(updateLenis);
      gsap.ticker.lagSmoothing(0);
    } catch {
      // Fallback gracefully to native scrolling
    }

    const handleScrollProgress = (p: number) => {
      setProgress(p);

      // Sound triggers
      if (p >= 0.25 && !soundTriggersRef.current.legs) {
        soundTriggersRef.current.legs = true;
        soundEngine.playWoodTap(0.9, 0.16);
      } else if (p < 0.25) {
        soundTriggersRef.current.legs = false;
      }

      if (p >= 0.45 && !soundTriggersRef.current.stretchers) {
        soundTriggersRef.current.stretchers = true;
        soundEngine.playWoodTap(1.1, 0.18);
      } else if (p < 0.45) {
        soundTriggersRef.current.stretchers = false;
      }

      if (p >= 0.65 && !soundTriggersRef.current.seat) {
        soundTriggersRef.current.seat = true;
        soundEngine.playWoodTap(0.75, 0.22);
      } else if (p < 0.65) {
        soundTriggersRef.current.seat = false;
      }

      if (p >= 0.76 && !soundTriggersRef.current.backrest) {
        soundTriggersRef.current.backrest = true;
        soundEngine.playWoodTap(1.2, 0.18);
      } else if (p < 0.76) {
        soundTriggersRef.current.backrest = false;
      }

      if (p >= 0.82 && !soundTriggersRef.current.pins) {
        soundTriggersRef.current.pins = true;
        soundEngine.playBrassLock(0.14);
      } else if (p < 0.82) {
        soundTriggersRef.current.pins = false;
      }

      if (p >= 0.86 && !soundTriggersRef.current.complete) {
        soundTriggersRef.current.complete = true;
        soundEngine.playAssemblyComplete();
        setIsFullyAssembled(true);
      } else if (p < 0.86) {
        soundTriggersRef.current.complete = false;
        setIsFullyAssembled(false);
      }

      if (shadowPlaneRef.current) {
        const shadowMat = shadowPlaneRef.current.material as THREE.MeshBasicMaterial;
        shadowMat.opacity = 0.12 + p * 0.45;
        shadowPlaneRef.current.scale.set(0.7 + p * 0.35, 0.7 + p * 0.35, 1);
      }
    };

    // 5. GSAP ScrollTrigger Integration
    const scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      onUpdate: (self) => {
        handleScrollProgress(self.progress);
      },
    });

    // Native scroll calculation fallback (100% immune to trigger calculation delays)
    const onNativeScroll = () => {
      if (!container) return;
      const maxScroll = Math.max(1, container.scrollHeight - window.innerHeight);
      const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const directP = Math.max(0, Math.min(1, currentScroll / maxScroll));
      handleScrollProgress(directP);
    };

    window.addEventListener('scroll', onNativeScroll, { passive: true });

    // Ensure ScrollTrigger & Lenis measure full container height accurately
    requestAnimationFrame(() => {
      lenis?.resize();
      ScrollTrigger.refresh();
      onNativeScroll();
    });
    const resizeTimer = setTimeout(() => {
      lenis?.resize();
      ScrollTrigger.refresh();
      onNativeScroll();
    }, 250);

    // 6. Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const render = () => {
      const time = clock.getElapsedTime();
      
      // Calculate active progress from scrollTrigger, with direct scroll fallback
      let currentProgress = scrollTrigger && scrollTrigger.progress !== undefined ? scrollTrigger.progress : 0;
      if (container) {
        const maxScroll = Math.max(1, container.scrollHeight - window.innerHeight);
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        const directP = Math.max(0, Math.min(1, currentScroll / maxScroll));
        if (Math.abs(directP - currentProgress) > 0.02) {
          currentProgress = directP;
        }
      }

      updatePartsTransformation(currentProgress, time);

      if (currentProgress > 0.88 && !isPointerDown.current) {
        chairGroup.rotation.y += 0.003;
      } else if (currentProgress <= 0.88) {
        const targetRotY = THREE.MathUtils.lerp(0.45, 0.38, currentProgress);
        const targetRotX = THREE.MathUtils.lerp(0.12, 0.05, currentProgress);
        chairGroup.rotation.y = THREE.MathUtils.lerp(chairGroup.rotation.y, targetRotY, 0.08);
        chairGroup.rotation.x = THREE.MathUtils.lerp(chairGroup.rotation.x, targetRotX, 0.08);
      }

      if (dragRotation.current.vx !== 0 || dragRotation.current.vy !== 0) {
        chairGroup.rotation.y += dragRotation.current.vx;
        chairGroup.rotation.x += dragRotation.current.vy;
        dragRotation.current.vx *= 0.92;
        dragRotation.current.vy *= 0.92;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // 7. Window Resize Handler
    const handleResize = () => {
      if (!canvas || !renderer || !camera) return;
      updateCameraDistance();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      lenis?.resize();
      ScrollTrigger.refresh();
      onNativeScroll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', onNativeScroll);
      cancelAnimationFrame(animationFrameId);
      if (updateLenis) gsap.ticker.remove(updateLenis);
      lenis?.destroy();
      scrollTrigger.kill();
      renderer.dispose();
      parts.forEach((p) => {
        p.mesh.traverse((c) => {
          if (c instanceof THREE.Mesh) c.geometry.dispose();
        });
      });
    };
  }, []);

  const updatePartsTransformation = (prog: number, time: number) => {
    // Normal assembly happens from progress 0.0 to 0.82
    const assemblyP = Math.min(1, prog / 0.82);

    partsRef.current.forEach((part) => {
      const localP = THREE.MathUtils.clamp(
        (assemblyP - part.startProgress) / (part.endProgress - part.startProgress),
        0,
        1
      );
      const eased = gsap.parseEase('power2.out')(localP);

      const hoverIntensity = (1 - localP) * 0.08;
      const hoverY = Math.sin(time * 1.8 + part.noiseOffset) * hoverIntensity;
      const hoverX = Math.cos(time * 1.4 + part.noiseOffset) * (hoverIntensity * 0.5);
      const hoverRot = Math.sin(time * 1.5 + part.noiseOffset) * (hoverIntensity * 0.6);

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
        THREE.MathUtils.lerp(part.startRot.z, part.endRot.z, eased) + hoverRot * 0.7;
    });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isFullyAssembled || e.button !== 0) return;
    isPointerDown.current = true;
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (e.pointerType === 'touch') {
      // On mobile: only rotate horizontally if horizontal swipe dominates
      // Never interfere with vertical swipe scrolling
      if (Math.abs(dx) > Math.abs(dy) * 1.2) {
        dragRotation.current.vx = dx * 0.008;
      }
    } else {
      dragRotation.current.vx = dx * 0.008;
      dragRotation.current.vy = dy * 0.006;
    }
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
    setIsDragging(false);
  };

  // Coming Soon text calculation: comes AFTER the chair completes (progress >= 0.8)
  const comingSoonOpacity = Math.max(0, Math.min(1, (progress - 0.8) / 0.15));
  const comingSoonY = (1 - comingSoonOpacity) * 30;

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '320vh', touchAction: 'pan-y' }}
    >
      {/* Pinned Fullscreen Studio Viewport */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#F4EBDD',
          userSelect: 'none',
          touchAction: 'pan-y',
        }}
      >
        {/* 
          1. TOP-LEFT CORNER: SMALL JODO LOGO
          Guaranteed visible with explicit inline styling and multiply blending!
        */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '28px',
            zIndex: 100,
            pointerEvents: 'auto',
          }}
        >
          <img
            src="/logo-cropped.png"
            alt="JODO"
            style={{
              width: '115px',
              maxWidth: '28vw',
              height: 'auto',
              display: 'block',
              mixBlendMode: 'multiply',
              userSelect: 'none',
            }}
          />
        </div>

        {/* 
          2. COMING SOON TEXT
          - Appears ONLY AFTER the chair completes (progress >= 0.8)
          - Positioned in the UPPER AREA (top: 15%), leaving plenty of room above the chair
          - True TERRACOTTA color (#C65F45)
          - Syne font, Extra-Bold
          - ZERO overlap with the chair!
        */}
        <div
          style={{
            position: 'absolute',
            top: '14%',
            left: '50%',
            transform: `translate(-50%, ${comingSoonY}px)`,
            width: '100%',
            textAlign: 'center',
            padding: '0 20px',
            pointerEvents: 'none',
            zIndex: 40,
            opacity: comingSoonOpacity,
            display: comingSoonOpacity > 0.01 ? 'block' : 'none',
            transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
          }}
        >
          <h1
            style={{
              color: '#C65F45',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2.4rem, 8.5vw, 6.5rem)',
              letterSpacing: '0.08em',
              lineHeight: 1.0,
              textTransform: 'uppercase',
              textShadow: '0 4px 24px rgba(198, 95, 69, 0.15)',
              margin: 0,
            }}
          >
            COMING SOON
          </h1>
        </div>

        {/* 
          3. THE 3D CANVAS: CHAIR ASSEMBLES ON SCROLL
          - touchAction: 'pan-y' allows vertical touch swipe scrolling over the chair on mobile!
          - pointerEvents: 'none' during assembly so touch passes completely through to document scroll!
        */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            touchAction: 'pan-y',
            zIndex: 10,
            cursor: isDragging ? 'grabbing' : isFullyAssembled ? 'grab' : 'default',
            pointerEvents: isFullyAssembled ? 'auto' : 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />

        {/* 
          4. CENTER BELOW: TAGLINE + COLOR CONFIG SWATCHES + 360 CUE
          Strictly positioned at bottom center below the chair!
        */}
        {/* 
          4. CENTER BELOW: CREATIVE BRAND TAGLINE & INTERACTION CUE
          Strictly solid teakwood, no color buttons, creative brand tagline
        */}
        {/* 
          4. CENTER BELOW: CREATIVE BRAND TAGLINE & INTERACTION CUE
          - Grand scale on desktop view (clamp up to 3.6rem / ~58px)
          - Fixes period gap: "Together." seamlessly joined
          - Bespoke architectural kicker and organic joinery stroke
        */}
        <div
          style={{
            position: 'absolute',
            bottom: 'clamp(20px, 3.8vh, 38px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(10px, 1.6vh, 16px)',
            pointerEvents: 'auto',
            width: '92%',
            maxWidth: '860px',
            textAlign: 'center',
            padding: '0 16px',
          }}
        >
          {/* Creative Brand Tagline Block */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Main Creative Headline */}
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 'clamp(1.75rem, 4.4vw, 3.5rem)',
                fontWeight: 800,
                letterSpacing: '-0.025em',
                lineHeight: 1.1,
                color: '#24211E',
                margin: 0,
                display: 'inline-flex',
                alignItems: 'baseline',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '0.25em',
              }}
            >
              <span>The Joy of</span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: '#C65F45',
                  position: 'relative',
                  display: 'inline-block',
                  padding: '0 2px',
                }}
              >
                Together
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontStyle: 'normal',
                    fontWeight: 800,
                    color: '#C65F45',
                    marginLeft: '1px',
                  }}
                >
                  .
                </span>
                {/* Organic joinery terracotta swoosh underline */}
                <svg
                  viewBox="0 0 160 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '2px',
                    width: 'calc(100% - 4px)',
                    height: '9px',
                    overflow: 'visible',
                    pointerEvents: 'none',
                  }}
                >
                  <path
                    d="M 2 9 C 45 2.5, 115 2.5, 158 7"
                    stroke="#C65F45"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                </svg>
              </span>
            </h2>
          </div>

          {/* 360 drag cue or scroll indicator */}
          {isFullyAssembled ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#24211E',
                color: '#F4EBDD',
                padding: '7px 20px',
                borderRadius: '999px',
                fontSize: 'clamp(11px, 0.95vw, 12px)',
                fontFamily: "'Space Grotesk', monospace",
                letterSpacing: '0.14em',
                fontWeight: 500,
                boxShadow: '0 4px 16px rgba(36, 33, 30, 0.2)',
                border: '1px solid rgba(198, 95, 69, 0.3)',
                cursor: 'grab',
                marginTop: '4px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <Rotate3d style={{ width: '15px', height: '15px', color: '#C65F45' }} />
              <span>DRAG 360° TO INSPECT</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pointerEvents: 'none',
                marginTop: '4px',
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: 'clamp(10px, 0.9vw, 11px)',
                  letterSpacing: '0.26em',
                  textTransform: 'uppercase',
                  color: '#8E867E',
                  fontWeight: 500,
                  marginBottom: '4px',
                }}
              >
                SCROLL TO ASSEMBLE
              </span>
              <div
                style={{
                  width: '1.5px',
                  height: '18px',
                  background: 'linear-gradient(to bottom, #C65F45, transparent)',
                  borderRadius: '2px',
                }}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
