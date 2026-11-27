'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Rotate3d } from 'lucide-react';
import { getWoodMaterial } from '@/textures/woodTexture';
import {
  createTerracottaVelvetMaterials,
  createChampagneBronzeMaterial,
  createSoftShadowTexture,
} from '@/textures/velvetTexture';
import {
  createSculptedSeatCushion,
  createSculptedBackrestCushion,
  createSculptedBolsterArmrest,
  createStadiumPlinthGeometry,
} from './sofaGeometry';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface SofaComponentPart {
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

export const SofaScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [progress, setProgress] = useState<number>(0);
  const [isFullyAssembled, setIsFullyAssembled] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const partsRef = useRef<SofaComponentPart[]>([]);
  const sofaGroupRef = useRef<THREE.Group | null>(null);
  const contactShadowRef = useRef<THREE.Mesh | null>(null);
  const reducedMotionRef = useRef<boolean>(false);

  // Turntable drag state
  const dragRotation = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPointerDown = useRef<boolean>(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    // 1. Scene & Renderer Setup
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;

    // Studio PMREM Environment for natural bronze reflections & velvet sheen
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    // Responsive three-quarter studio camera
    const aspect = Math.max(0.4, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    const camera = new THREE.PerspectiveCamera(32, aspect, 0.1, 60);

    const getBaseCameraPos = (prog: number) => {
      const currentAspect = Math.max(0.4, canvas.clientWidth / Math.max(1, canvas.clientHeight));
      const zoomT = THREE.MathUtils.smoothstep(prog, 0, 1);
      if (currentAspect < 1) {
        // Mobile portrait: keep entire exploded/assembled sofa cleanly below COMING SOON
        const zDist = THREE.MathUtils.lerp((7.8 / currentAspect) * 0.72, (6.6 / currentAspect) * 0.72, zoomT);
        const lookY = THREE.MathUtils.lerp(0.32, 0.22, zoomT);
        return { x: 0.25, y: 0.64, z: zDist, lookY };
      }
      // Desktop three-quarter studio framing: push sofa comfortably below single-line COMING SOON
      const zDist = THREE.MathUtils.lerp(5.75, 4.65, zoomT);
      const yPos = THREE.MathUtils.lerp(0.84, 0.66, zoomT);
      const lookY = THREE.MathUtils.lerp(0.32, 0.22, zoomT);
      return { x: 0.36, y: yPos, z: zDist, lookY };
    };

    const updateCamera = (prog: number) => {
      const currentAspect = Math.max(0.4, canvas.clientWidth / Math.max(1, canvas.clientHeight));
      camera.aspect = currentAspect;
      const pos = getBaseCameraPos(prog);
      camera.position.set(pos.x, pos.y, pos.z);
      camera.lookAt(0, pos.lookY, 0);
      camera.updateProjectionMatrix();
    };

    updateCamera(0);

    // 2. Studio Lighting Setup (Balanced key, gentle fill, warm rim)
    const hemiLight = new THREE.HemisphereLight('#FFF5E8', '#C8B098', 0.42);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF5E6', 2.05);
    keyLight.position.set(3.8, 5.6, 4.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 18;
    keyLight.shadow.camera.left = -2.6;
    keyLight.shadow.camera.right = 2.6;
    keyLight.shadow.camera.top = 2.4;
    keyLight.shadow.camera.bottom = -2.0;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.015;
    keyLight.shadow.radius = 4;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#EAE3DA', 0.56);
    fillLight.position.set(-4.5, 2.8, 2.6);
    scene.add(fillLight);

    // Warm rim light behind-right to sculpt the rounded velvet armrest & bronze rail
    const rimLight = new THREE.DirectionalLight('#FFD9B3', 1.4);
    rimLight.position.set(4.0, 2.0, -3.8);
    scene.add(rimLight);

    // 3. Materials
    const velvet = createTerracottaVelvetMaterials();
    const woodMat = getWoodMaterial('teak');
    woodMat.roughness = 0.34;
    woodMat.envMapIntensity = 0.85;
    const bronzeMat = createChampagneBronzeMaterial();

    // 4. Grounding Shadows (Studio Floor + Contact Shadow)
    const floorY = -0.55;

    const shadowReceiver = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.ShadowMaterial({ opacity: 0.16, color: new THREE.Color('#2A1A10') })
    );
    shadowReceiver.rotation.x = -Math.PI / 2;
    shadowReceiver.position.y = floorY;
    shadowReceiver.receiveShadow = true;
    scene.add(shadowReceiver);

    const softShadowTex = createSoftShadowTexture();
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 1.75),
      new THREE.MeshBasicMaterial({
        map: softShadowTex,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = floorY + 0.002;
    scene.add(contactShadow);
    contactShadowRef.current = contactShadow;

    // 5. Build Luxury Procedural 3D Sofa
    const sofaGroup = new THREE.Group();
    // Initial gentle three-quarter product angle
    sofaGroup.rotation.y = -0.34;
    sofaGroup.rotation.x = 0.04;
    scene.add(sofaGroup);
    sofaGroupRef.current = sofaGroup;

    const parts: SofaComponentPart[] = [];

    const addPart = (
      mesh: THREE.Object3D,
      startPos: [number, number, number],
      endPos: [number, number, number],
      startRot: [number, number, number],
      endRot: [number, number, number],
      startProgress: number,
      endProgress: number,
      noiseOffset: number,
      name: string
    ) => {
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      mesh.position.set(...startPos);
      mesh.rotation.set(...startRot);
      sofaGroup.add(mesh);
      parts.push({
        mesh,
        startPos: new THREE.Vector3(...startPos),
        endPos: new THREE.Vector3(...endPos),
        startRot: new THREE.Euler(...startRot),
        endRot: new THREE.Euler(...endRot),
        startProgress,
        endProgress,
        noiseOffset,
        name,
      });
    };

    // --- A. 4 Sleek Champagne-Bronze Tapered Spindle Legs ---
    const createLeg = () => {
      const legGroup = new THREE.Group();
      // Champagne-bronze tapered spindle shaft (height 0.175)
      const shaftGeo = new THREE.CylinderGeometry(0.036, 0.02, 0.16, 28);
      const shaft = new THREE.Mesh(shaftGeo, bronzeMat);
      shaft.position.y = 0;
      legGroup.add(shaft);

      // Top bronze mounting collar
      const collarGeo = new THREE.CylinderGeometry(0.04, 0.036, 0.02, 28);
      const collar = new THREE.Mesh(collarGeo, bronzeMat);
      collar.position.y = 0.085;
      legGroup.add(collar);

      // Bottom bronze tip ferrule
      const tipGeo = new THREE.CylinderGeometry(0.0205, 0.017, 0.022, 28);
      const tip = new THREE.Mesh(tipGeo, bronzeMat);
      tip.position.y = -0.082;
      legGroup.add(tip);

      return legGroup;
    };

    const legSpecs: Array<{
      name: string;
      end: [number, number, number];
      endRot: [number, number, number];
      start: [number, number, number];
      startRot: [number, number, number];
      delay: number;
    }> = [
      {
        name: 'leg-fl',
        end: [-0.9, -0.458, 0.35],
        endRot: [0.09, 0, -0.1],
        start: [-1.18, -0.88, 0.56],
        startRot: [0.22, 0.1, -0.25],
        delay: 0.0,
      },
      {
        name: 'leg-fr',
        end: [0.9, -0.458, 0.35],
        endRot: [0.09, 0, 0.1],
        start: [1.18, -0.88, 0.56],
        startRot: [0.22, -0.1, 0.25],
        delay: 0.02,
      },
      {
        name: 'leg-bl',
        end: [-0.9, -0.458, -0.35],
        endRot: [-0.09, 0, -0.1],
        start: [-1.18, -0.88, -0.56],
        startRot: [-0.22, -0.1, -0.25],
        delay: 0.04,
      },
      {
        name: 'leg-br',
        end: [0.9, -0.458, -0.35],
        endRot: [-0.09, 0, 0.1],
        start: [1.18, -0.88, -0.56],
        startRot: [-0.22, 0.1, 0.25],
        delay: 0.06,
      },
    ];

    legSpecs.forEach((leg, idx) => {
      addPart(
        createLeg(),
        leg.start,
        leg.end,
        leg.startRot,
        leg.endRot,
        leg.delay,
        0.28 + leg.delay,
        idx * 1.3,
        leg.name
      );
    });

    // --- B. Wooden Plinth & Champagne-Bronze Trim Base Frame ---
    const baseGroup = new THREE.Group();

    // Main rounded wooden plinth deck (smooth stadium extrusion)
    const plinthGeo = createStadiumPlinthGeometry(2.22, 0.9, 0.056, 0.16, 0.016);
    const plinthMesh = new THREE.Mesh(plinthGeo, woodMat);
    plinthMesh.position.y = -0.014;
    baseGroup.add(plinthMesh);

    // Signature gleaming champagne-gold / bronze trim rail wrapping the base
    const trimGeo = createStadiumPlinthGeometry(2.28, 0.96, 0.042, 0.18, 0.018);
    const trimMesh = new THREE.Mesh(trimGeo, bronzeMat);
    trimMesh.position.y = 0.016;
    baseGroup.add(trimMesh);

    // Recessed upholstered seat deck platform (supports cushions cleanly)
    const deckGeo = createStadiumPlinthGeometry(1.72, 0.8, 0.042, 0.1, 0.012);
    const deckMesh = new THREE.Mesh(deckGeo, velvet.crease);
    deckMesh.position.set(0, 0.04, 0.01);
    baseGroup.add(deckMesh);

    addPart(
      baseGroup,
      [0, -0.62, 0.1],
      [0, -0.325, 0],
      [0.06, -0.04, 0.02],
      [0, 0, 0],
      0.06,
      0.34,
      2.1,
      'base-frame'
    );

    // --- C. Rear Upholstered Back Support Panel (360° finished back) ---
    const rearGroup = new THREE.Group();
    const rearGeo = createSculptedBackrestCushion(1.64, 0.42, 0.14, 'left');
    const rearMesh = new THREE.Mesh(rearGeo, velvet.main);
    rearGroup.add(rearMesh);

    addPart(
      rearGroup,
      [0, 0.22, -0.92],
      [0, -0.01, -0.395],
      [-0.22, 0, 0],
      [-0.08, 0, 0],
      0.2,
      0.52,
      3.4,
      'rear-frame'
    );

    // --- D. Left & Right Plush Seat Cushions ---
    const createSeatCushion = (side: 'left' | 'right') => {
      const g = new THREE.Group();
      const bodyGeo = createSculptedSeatCushion(0.81, 0.27, 0.86, side);
      const body = new THREE.Mesh(bodyGeo, velvet.main);
      g.add(body);
      return g;
    };

    addPart(
      createSeatCushion('left'),
      [-0.56, 0.24, 0.34],
      [-0.395, -0.145, 0.055],
      [0.14, 0.08, -0.06],
      [0.02, 0, 0],
      0.28,
      0.6,
      4.2,
      'seat-left'
    );

    addPart(
      createSeatCushion('right'),
      [0.56, 0.28, 0.36],
      [0.395, -0.145, 0.055],
      [0.12, -0.08, 0.06],
      [0.02, 0, 0],
      0.32,
      0.64,
      4.9,
      'seat-right'
    );

    // --- E. Left & Right Curved Organic Backrest Cushions ---
    const createBackrestCushion = (side: 'left' | 'right') => {
      const g = new THREE.Group();
      const backGeo = createSculptedBackrestCushion(0.79, 0.5, 0.29, side);
      const backMesh = new THREE.Mesh(backGeo, velvet.main);
      g.add(backMesh);
      return g;
    };

    addPart(
      createBackrestCushion('left'),
      [-0.54, 0.52, -0.52],
      [-0.388, 0.165, -0.26],
      [-0.24, 0.1, -0.06],
      [-0.14, 0.015, 0],
      0.38,
      0.7,
      5.5,
      'backrest-left'
    );

    addPart(
      createBackrestCushion('right'),
      [0.54, 0.56, -0.5],
      [0.388, 0.165, -0.26],
      [-0.22, -0.1, 0.06],
      [-0.14, -0.015, 0],
      0.42,
      0.74,
      6.1,
      'backrest-right'
    );

    // --- F. Left & Right Generously Padded Rounded Armrests ---
    const createArmrest = (side: 'left' | 'right') => {
      const g = new THREE.Group();
      const armGeo = createSculptedBolsterArmrest(0.42, 0.46, 0.96, side);
      const armMesh = new THREE.Mesh(armGeo, velvet.main);
      g.add(armMesh);

      // Signature illuminated warm ambient accent along inner armrest curve (matching reference)
      const innerX = side === 'left' ? 0.17 : -0.17;
      const glowCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(innerX, -0.1, 0.22),
        new THREE.Vector3(innerX, 0.19, 0.08),
        new THREE.Vector3(innerX, 0.12, -0.28)
      );
      const tubeGeo = new THREE.TubeGeometry(glowCurve, 24, 0.008, 8, false);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#FFBE76'),
        transparent: true,
        opacity: 0.88,
      });
      const glowMesh = new THREE.Mesh(tubeGeo, glowMat);
      g.add(glowMesh);

      return g;
    };

    addPart(
      createArmrest('left'),
      [-1.58, 0.12, 0.14],
      [-0.94, -0.045, 0.0],
      [0.08, 0.14, -0.12],
      [0, 0, 0],
      0.54,
      0.86,
      7.2,
      'armrest-left'
    );

    addPart(
      createArmrest('right'),
      [1.58, 0.14, 0.14],
      [0.94, -0.045, 0.0],
      [0.08, -0.14, 0.12],
      [0, 0, 0],
      0.58,
      0.88,
      7.9,
      'armrest-right'
    );

    partsRef.current = parts;

    // 6. Lenis Smooth Scroll + GSAP ScrollTrigger
    let lenis: InstanceType<typeof Lenis> | null = null;
    let updateLenis: ((time: number) => void) | null = null;

    if (!reducedMotionRef.current) {
      lenis = new Lenis({
        duration: 1.25,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.4,
      });

      lenis.on('scroll', ScrollTrigger.update);
      updateLenis = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(updateLenis);
      gsap.ticker.lagSmoothing(0);
    }

    const handleScrollProgress = (prog: number) => {
      setProgress(prog);
      setIsFullyAssembled(prog >= 0.89);
    };

    const scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: reducedMotionRef.current ? 0.1 : 1.15,
      onUpdate: (self: { progress: number }) => {
        handleScrollProgress(self.progress);
      },
    });

    const onNativeScroll = () => {
      if (!container) return;
      const maxScroll = Math.max(1, container.scrollHeight - window.innerHeight);
      const currentScroll =
        window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const directP = Math.max(0, Math.min(1, currentScroll / maxScroll));
      handleScrollProgress(directP);
    };

    window.addEventListener('scroll', onNativeScroll, { passive: true });

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

    // 7. Render & Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    const smoothEase = gsap.parseEase('power3.inOut');

    const render = () => {
      const time = clock.getElapsedTime();

      let currentProgress =
        scrollTrigger && scrollTrigger.progress !== undefined
          ? scrollTrigger.progress
          : 0;

      if (container) {
        const maxScroll = Math.max(1, container.scrollHeight - window.innerHeight);
        const currentScroll =
          window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        const directP = Math.max(0, Math.min(1, currentScroll / maxScroll));
        if (Math.abs(directP - currentProgress) > 0.015) {
          currentProgress = directP;
        }
      }

      updateCamera(currentProgress);

      // Update each sofa component along its staggered assembly curve
      const assemblyP = Math.min(1, currentProgress / 0.88);
      partsRef.current.forEach((part) => {
        const localP = THREE.MathUtils.clamp(
          (assemblyP - part.startProgress) /
            Math.max(0.01, part.endProgress - part.startProgress),
          0,
          1
        );
        const eased = smoothEase(localP);

        const floatAmp = reducedMotionRef.current ? 0 : (1 - localP) * 0.045;
        const floatY = Math.sin(time * 1.45 + part.noiseOffset) * floatAmp;
        const floatX = Math.cos(time * 1.1 + part.noiseOffset) * (floatAmp * 0.45);
        const floatRot = Math.sin(time * 1.2 + part.noiseOffset) * (floatAmp * 0.4);

        part.mesh.position.x =
          THREE.MathUtils.lerp(part.startPos.x, part.endPos.x, eased) + floatX;
        part.mesh.position.y =
          THREE.MathUtils.lerp(part.startPos.y, part.endPos.y, eased) + floatY;
        part.mesh.position.z = THREE.MathUtils.lerp(
          part.startPos.z,
          part.endPos.z,
          eased
        );

        part.mesh.rotation.x =
          THREE.MathUtils.lerp(part.startRot.x, part.endRot.x, eased) + floatRot;
        part.mesh.rotation.y =
          THREE.MathUtils.lerp(part.startRot.y, part.endRot.y, eased) +
          floatRot * 0.5;
        part.mesh.rotation.z =
          THREE.MathUtils.lerp(part.startRot.z, part.endRot.z, eased) +
          floatRot * 0.6;
      });

      // Contact shadow grounds the sofa naturally as it assembles
      if (contactShadowRef.current) {
        const mat = contactShadowRef.current.material as THREE.MeshBasicMaterial;
        mat.opacity = THREE.MathUtils.lerp(0.18, 0.58, assemblyP);
        const s = THREE.MathUtils.lerp(1.18, 1.0, assemblyP);
        contactShadowRef.current.scale.set(s, s, 1);
      }

      // Hero studio presentation & 360° drag rotation
      if (sofaGroupRef.current) {
        if (currentProgress >= 0.89) {
          if (!isPointerDown.current && !reducedMotionRef.current) {
            // Gentle luxury turntable drift + subtle breathing float
            sofaGroupRef.current.rotation.y += 0.0022;
            sofaGroupRef.current.position.y = Math.sin(time * 1.2) * 0.008;
          }
        } else {
          // Smoothly guide toward classic three-quarter product showcase angle
          const targetRotY = THREE.MathUtils.lerp(-0.42, -0.34, currentProgress);
          const targetRotX = THREE.MathUtils.lerp(0.08, 0.04, currentProgress);
          sofaGroupRef.current.rotation.y = THREE.MathUtils.lerp(
            sofaGroupRef.current.rotation.y,
            targetRotY,
            0.08
          );
          sofaGroupRef.current.rotation.x = THREE.MathUtils.lerp(
            sofaGroupRef.current.rotation.x,
            targetRotX,
            0.08
          );
          sofaGroupRef.current.position.y = 0;
        }

        if (dragRotation.current.vx !== 0 || dragRotation.current.vy !== 0) {
          sofaGroupRef.current.rotation.y += dragRotation.current.vx;
          sofaGroupRef.current.rotation.x = THREE.MathUtils.clamp(
            sofaGroupRef.current.rotation.x + dragRotation.current.vy,
            -0.25,
            0.35
          );
          dragRotation.current.vx *= 0.92;
          dragRotation.current.vy *= 0.92;
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // 8. Resize Handler
    const handleResize = () => {
      if (!canvas || !renderer) return;
      updateCamera(progress);
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      lenis?.resize();
      ScrollTrigger.refresh();
      onNativeScroll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', onNativeScroll);
      cancelAnimationFrame(animationFrameId);
      if (updateLenis) gsap.ticker.remove(updateLenis);
      lenis?.destroy();
      scrollTrigger.kill();
      envTarget.dispose();
      renderer.dispose();
      parts.forEach((p) => {
        p.mesh.traverse((c) => {
          if (c instanceof THREE.Mesh) c.geometry.dispose();
        });
      });
    };
  }, []);

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
      if (Math.abs(dx) > Math.abs(dy) * 1.2) {
        dragRotation.current.vx = dx * 0.008;
      }
    } else {
      dragRotation.current.vx = dx * 0.008;
      dragRotation.current.vy = dy * 0.005;
    }
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
    setIsDragging(false);
  };

  const getAssemblyStatusText = () => {
    if (progress < 0.08) return 'SCROLL TO ASSEMBLE SOFA';
    if (progress < 0.35) return 'ALIGNING FRAME & TAPERED LEGS';
    if (progress < 0.65) return 'SETTLING CUSHIONS & BACKREST';
    return 'ATTACHING SCULPTED ARMRESTS';
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '360vh',
        touchAction: 'pan-y',
      }}
    >
      {/* Pinned Fullscreen Warm Cream Studio Viewport */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          background:
            'radial-gradient(ellipse at 50% 48%, #FAF5ED 0%, #F4ECE0 58%, #EDE2D2 100%)',
          userSelect: 'none',
          touchAction: 'pan-y',
        }}
      >
        {/* 1. UPPER-LEFT JODO LOGO (No links) */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(18px, 3vh, 30px)',
            left: 'clamp(20px, 3.2vw, 44px)',
            zIndex: 60,
            pointerEvents: 'none',
          }}
        >
          <img
            src="/logo.png"
            alt="JODO"
            style={{
              width: 'clamp(92px, 8.5vw, 132px)',
              height: 'auto',
              display: 'block',
              userSelect: 'none',
            }}
          />
        </div>

        {/* 2. LARGE TERRACOTTA-ORANGE COMING SOON HEADLINE (Single line) */}
        <div
          style={{
            position: 'absolute',
            top: 'clamp(94px, 14.5vh, 144px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '96%',
            maxWidth: '1440px',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 30,
          }}
        >
          <h1
            style={{
              color: '#DA4E26',
              fontFamily: "var(--font-syne), 'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2.1rem, 7.5vw, 6.2rem)',
              letterSpacing: 'clamp(0.08em, 1.4vw, 0.2em)',
              lineHeight: 1,
              margin: 0,
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              userSelect: 'none',
            }}
          >
            COMING SOON
          </h1>
        </div>

        {/* 3. CENTERED 3D SOFA CANVAS */}
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
            zIndex: 20,
            cursor: isDragging
              ? 'grabbing'
              : isFullyAssembled
              ? 'grab'
              : 'default',
            pointerEvents: isFullyAssembled ? 'auto' : 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />

        {/* 4. BOTTOM INTERACTION CUE & SLOGAN (No links) */}
        <div
          style={{
            position: 'absolute',
            bottom: 'clamp(20px, 3.6vh, 38px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(10px, 1.5vh, 16px)',
            pointerEvents: 'none',
            width: '92%',
            maxWidth: '860px',
            textAlign: 'center',
            padding: '0 16px',
          }}
        >
          {isFullyAssembled ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                color: '#24211E',
                padding: '7px 18px',
                borderRadius: '999px',
                fontSize: 'clamp(10px, 0.9vw, 11.5px)',
                fontFamily: "'Space Grotesk', monospace",
                letterSpacing: '0.16em',
                fontWeight: 600,
                boxShadow: '0 6px 20px rgba(36, 33, 30, 0.08)',
                border: '1px solid rgba(36, 33, 30, 0.08)',
              }}
            >
              <Rotate3d style={{ width: '14px', height: '14px', color: '#DA4E26' }} />
              <span>DRAG TO ROTATE 360°</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: 'clamp(10px, 0.9vw, 11.5px)',
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: '#6E655D',
                  fontWeight: 600,
                }}
              >
                {getAssemblyStatusText()}
              </span>
              {/* Subtle scroll progress bar */}
              <div
                style={{
                  width: '120px',
                  height: '2px',
                  backgroundColor: 'rgba(36, 33, 30, 0.12)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.round(Math.min(1, progress / 0.89) * 100)}%`,
                    height: '100%',
                    backgroundColor: '#DA4E26',
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
            </div>
          )}

          {/* Bottom Slogan: The Joy of Together. */}
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(1.6rem, 4.2vw, 3.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              color: '#24211E',
              margin: 0,
              display: 'inline-flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '0.24em',
            }}
          >
            <span>The Joy of</span>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#DA4E26',
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
                  color: '#DA4E26',
                  marginLeft: '1px',
                }}
              >
                .
              </span>
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
                  stroke="#DA4E26"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </svg>
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
};
