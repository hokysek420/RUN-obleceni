'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  Eye,
  Sliders,
  Palette,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Box,
  Sparkles,
} from 'lucide-react';

interface Product3DViewerProps {
  modelUrl?: string | null;
  productName: string;
  category?: string;
}

type MaterialMode = 'matte' | 'fleece' | 'chrome' | 'wireframe';
type LightingMode = 'studio' | 'neon' | 'noir';
type CameraView = 'front' | 'side' | 'back' | 'iso';

// --- Procedural Canvas Texture Generators for Realistic Materials ---
function createFleeceBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Organic fibrous noise for 550 GSM teddy fleece
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const radius = Math.random() * 2.2 + 0.5;
    const shade = Math.floor(Math.random() * 120 + 70);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

function createDenimBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Diagonal twill weave lines for 14.5 oz raw selvedge denim
  ctx.strokeStyle = '#a0a0a0';
  ctx.lineWidth = 1.5;
  for (let i = -256; i < 512; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 256, 256);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

function createTeeBackGraphicTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark background matching garment
  ctx.fillStyle = '#0f0f12';
  ctx.fillRect(0, 0, 512, 512);

  // White graphic print
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';

  // RUN logo block
  ctx.fillRect(196, 60, 120, 36);
  ctx.fillStyle = '#000000';
  ctx.font = '900 24px monospace';
  ctx.fillText('RUN', 256, 86);

  // Signature Statement
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px sans-serif';
  ctx.fillText("YOU'LL NEVER", 256, 170);
  ctx.fillText('DO IT.', 256, 210);

  ctx.font = '900 36px sans-serif';
  ctx.fillText('YOU HAVE NOTHING.', 256, 280);

  // Subtext / Metadata
  ctx.fillStyle = '#9ca3af';
  ctx.font = '700 13px monospace';
  ctx.fillText('COLLECTION ONE / ARCHIVE DROP 01', 256, 340);
  ctx.fillText('550 GSM HEAVY FAUX-FUR & 14.5 OZ DENIM', 256, 365);

  // Barcode decoration
  ctx.fillStyle = '#ffffff';
  for (let x = 156; x < 356; x += 4) {
    if (Math.random() > 0.3) {
      ctx.fillRect(x, 420, Math.random() > 0.5 ? 2 : 3, 30);
    }
  }
  ctx.font = '10px monospace';
  ctx.fillText('* 0 1 0 9 2 0 2 6 *', 256, 465);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function Product3DViewer({ modelUrl, productName, category = 'Outerwear' }: Product3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // 3D Options States
  const [materialMode, setMaterialMode] = useState<MaterialMode>('matte');
  const [activeColor, setActiveColor] = useState<string>('#141418'); // Default dark
  const [lightingMode, setLightingMode] = useState<LightingMode>('studio');
  const [autoRotate, setAutoRotate] = useState(true);
  const [exploded, setExploded] = useState(false);
  const [cameraView, setCameraView] = useState<CameraView>('iso');
  const [showOptionsPanel, setShowOptionsPanel] = useState(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const explodedPartsRef = useRef<{ mesh: THREE.Object3D; originalPos: THREE.Vector3; explodedPos: THREE.Vector3 }[]>([]);
  const garmentMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const lightsRef = useRef<{ ambient: THREE.AmbientLight; key: THREE.DirectionalLight; rim1: THREE.DirectionalLight; rim2: THREE.DirectionalLight } | null>(null);

  // Color presets available in 3D options
  const colorOptions = [
    { label: 'Onyx Black', hex: '#141418', name: 'Black' },
    { label: 'Bone Cream', hex: '#ded9cf', name: 'Cream' },
    { label: 'Heather Grey', hex: '#63666f', name: 'Grey' },
    { label: 'Clean White', hex: '#f4f4f6', name: 'White' },
    { label: 'Cyber Chrome', hex: '#d4d8e2', name: 'Chrome' },
  ];

  // Setup Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09090c);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 1.1, 4.4);
    cameraRef.current = camera;

    // 3. Renderer with high dynamic range tone mapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    mountRef.current.replaceChildren(renderer.domElement);

    // 4. Studio Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight1 = new THREE.DirectionalLight(0xa5b4fc, 2.4);
    rimLight1.position.set(-5, 4, -4);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0xffffff, 1.6);
    rimLight2.position.set(4, -2, -3);
    scene.add(rimLight2);

    lightsRef.current = { ambient: ambientLight, key: keyLight, rim1: rimLight1, rim2: rimLight2 };

    // 5. Product Mesh Group
    const group = new THREE.Group();
    meshGroupRef.current = group;
    scene.add(group);

    garmentMaterialsRef.current = [];
    explodedPartsRef.current = [];

    // Pedestal Stand
    const pedestalGeo = new THREE.CylinderGeometry(1.65, 1.8, 0.18, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x121216,
      roughness: 0.6,
      metalness: 0.35,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.18;
    pedestal.receiveShadow = true;
    group.add(pedestal);

    // Glowing Neon Edge Ring
    const ringGeo = new THREE.RingGeometry(1.63, 1.68, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = -1.08;
    group.add(ring);

    // Determine Product Shape
    const isFootwear = category.toLowerCase().includes('footwear') || productName.toLowerCase().includes('sneaker');
    const isPants = category.toLowerCase().includes('pants') || productName.toLowerCase().includes('jeans') || productName.toLowerCase().includes('sweatpants');
    const isTee = category.toLowerCase().includes('t-shirt') || productName.toLowerCase().includes('t-shirt');

    // Textures
    const fleeceBump = createFleeceBumpTexture();
    const denimBump = createDenimBumpTexture();

    // ==========================================
    // 1. FOOTWEAR: CYBER-CHUNKY AIR SNEAKER
    // ==========================================
    if (isFootwear) {
      const shoeMat = new THREE.MeshStandardMaterial({
        color: 0xf0f0f4,
        roughness: 0.45,
        metalness: 0.15,
      });
      garmentMaterialsRef.current.push(shoeMat);

      // Multi-layer Outsole with aggressive tread lugs
      const soleGeo = new THREE.BoxGeometry(2.35, 0.36, 1.05);
      const soleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.1 });
      const sole = new THREE.Mesh(soleGeo, soleMat);
      sole.position.set(0, -0.65, 0);
      sole.castShadow = true;
      group.add(sole);
      explodedPartsRef.current.push({ mesh: sole, originalPos: sole.position.clone(), explodedPos: new THREE.Vector3(0, -1.05, 0) });

      // Outsole Tread ridges
      for (let i = -1.0; i <= 1.0; i += 0.22) {
        const lugGeo = new THREE.BoxGeometry(0.12, 0.08, 0.98);
        const lugMat = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.9 });
        const lug = new THREE.Mesh(lugGeo, lugMat);
        lug.position.set(i, -0.85, 0);
        group.add(lug);
      }

      // Translucent Air Unit Chamber in Heel
      const airGeo = new THREE.BoxGeometry(0.75, 0.28, 0.85);
      const airMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.9,
        opacity: 0.95,
        transparent: true,
        roughness: 0.08,
        metalness: 0.1,
      });
      const airChamber = new THREE.Mesh(airGeo, airMat);
      airChamber.position.set(-0.65, -0.62, 0);
      group.add(airChamber);

      // 4 Internal Neon Support Columns
      for (let x = -0.85; x <= -0.45; x += 0.26) {
        for (let z = -0.22; z <= 0.22; z += 0.44) {
          const colGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.24, 12);
          const colMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.85, roughness: 0.1 });
          const col = new THREE.Mesh(colGeo, colMat);
          col.position.set(x, -0.62, z);
          group.add(col);
        }
      }

      // Sculpted Upper Body (Shoe Last)
      const upperGeo = new THREE.CylinderGeometry(0.48, 0.72, 1.7, 32);
      upperGeo.rotateZ(Math.PI / 2);
      const upper = new THREE.Mesh(upperGeo, shoeMat);
      upper.position.set(-0.15, -0.22, 0);
      upper.castShadow = true;
      group.add(upper);
      explodedPartsRef.current.push({ mesh: upper, originalPos: upper.position.clone(), explodedPos: new THREE.Vector3(0, 0.15, 0) });

      // Curved Mudguard Overlay
      const mudGeo = new THREE.TorusGeometry(0.68, 0.08, 16, 32, Math.PI);
      mudGeo.rotateZ(Math.PI / 2);
      mudGeo.rotateX(Math.PI / 2);
      const mudMat = new THREE.MeshStandardMaterial({ color: 0x222228, roughness: 0.6, metalness: 0.2 });
      const mudguard = new THREE.Mesh(mudGeo, mudMat);
      mudguard.position.set(0.6, -0.42, 0);
      group.add(mudguard);

      // Chrome Heel Counter Spoiler Wing
      const chromeGeo = new THREE.TorusGeometry(0.55, 0.12, 16, 32, Math.PI);
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.98 });
      const chromeSpoiler = new THREE.Mesh(chromeGeo, chromeMat);
      chromeSpoiler.position.set(-0.95, -0.25, 0);
      chromeSpoiler.rotation.y = Math.PI / 2;
      group.add(chromeSpoiler);
      explodedPartsRef.current.push({ mesh: chromeSpoiler, originalPos: chromeSpoiler.position.clone(), explodedPos: new THREE.Vector3(-0.65, -0.15, 0) });

      // Dimensional Criss-Cross Laces
      const laceMat = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.7 });
      for (let i = 0; i < 4; i++) {
        const laceBar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.44, 8), laceMat);
        laceBar.rotateZ(Math.PI / 2);
        laceBar.position.set(0.05 + i * 0.18, 0.12 + i * 0.06, 0);
        group.add(laceBar);
      }

      // RUN Chrome Dubrae Lace Tag
      const dubraeGeo = new THREE.BoxGeometry(0.08, 0.1, 0.32);
      const dubraeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.98, roughness: 0.05 });
      const dubrae = new THREE.Mesh(dubraeGeo, dubraeMat);
      dubrae.position.set(0.65, 0.02, 0);
      group.add(dubrae);

    // ==========================================
    // 2. PANTS: HEAVY SELVEDGE BAGGY JEANS
    // ==========================================
    } else if (isPants) {
      const denimMat = new THREE.MeshStandardMaterial({
        color: 0x18181d,
        roughness: 0.88,
        metalness: 0.08,
        bumpMap: denimBump,
        bumpScale: 0.02,
      });
      garmentMaterialsRef.current.push(denimMat);

      // Structured Waistband
      const waistGeo = new THREE.CylinderGeometry(0.75, 0.78, 0.35, 32);
      const waist = new THREE.Mesh(waistGeo, denimMat);
      waist.position.set(0, 0.52, 0);
      group.add(waist);
      explodedPartsRef.current.push({ mesh: waist, originalPos: waist.position.clone(), explodedPos: new THREE.Vector3(0, 0.85, 0) });

      // 5 3D Belt Loops
      for (let a = 0; a < 5; a++) {
        const angle = (a * (Math.PI * 2)) / 5;
        const loopGeo = new THREE.BoxGeometry(0.05, 0.38, 0.04);
        const loop = new THREE.Mesh(loopGeo, denimMat);
        loop.position.set(Math.sin(angle) * 0.78, 0.52, Math.cos(angle) * 0.78);
        loop.rotation.y = angle;
        group.add(loop);
      }

      // Front Silver Button Rivet
      const buttonGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 16);
      buttonGeo.rotateX(Math.PI / 2);
      const buttonMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 });
      const button = new THREE.Mesh(buttonGeo, buttonMat);
      button.position.set(0, 0.58, 0.78);
      group.add(button);

      // Left Wide Leg (Streetwear Baggy drape)
      const legGeo = new THREE.CylinderGeometry(0.38, 0.49, 1.48, 32);
      const leftLeg = new THREE.Mesh(legGeo, denimMat);
      leftLeg.position.set(-0.36, -0.34, 0);
      leftLeg.rotation.z = -0.04;
      leftLeg.castShadow = true;
      group.add(leftLeg);
      explodedPartsRef.current.push({ mesh: leftLeg, originalPos: leftLeg.position.clone(), explodedPos: new THREE.Vector3(-0.45, -0.34, 0) });

      // Right Wide Leg
      const rightLeg = new THREE.Mesh(legGeo, denimMat);
      rightLeg.position.set(0.36, -0.34, 0);
      rightLeg.rotation.z = 0.04;
      rightLeg.castShadow = true;
      group.add(rightLeg);
      explodedPartsRef.current.push({ mesh: rightLeg, originalPos: rightLeg.position.clone(), explodedPos: new THREE.Vector3(0.45, -0.34, 0) });

      // Stacked Crease Rings at Ankle (Accordion Folds)
      for (let i = 0; i < 3; i++) {
        const foldGeo = new THREE.TorusGeometry(0.48 + i * 0.02, 0.06, 16, 32);
        foldGeo.rotateX(Math.PI / 2);

        const leftFold = new THREE.Mesh(foldGeo, denimMat);
        leftFold.position.set(-0.38, -0.85 - i * 0.12, 0);
        group.add(leftFold);

        const rightFold = new THREE.Mesh(foldGeo, denimMat);
        rightFold.position.set(0.38, -0.85 - i * 0.12, 0);
        group.add(rightFold);
      }

      // Dangling Drawstrings with Metal Aglets
      const stringGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.65, 8);
      const stringMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      const str1 = new THREE.Mesh(stringGeo, stringMat);
      str1.position.set(-0.12, 0.28, 0.77);
      group.add(str1);

      const agletMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.98, roughness: 0.08 });
      const ag1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.09, 8), agletMat);
      ag1.position.set(-0.12, -0.06, 0.77);
      group.add(ag1);

      const str2 = new THREE.Mesh(stringGeo, stringMat);
      str2.position.set(0.12, 0.24, 0.77);
      group.add(str2);

      const ag2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.09, 8), agletMat);
      ag2.position.set(0.12, -0.1, 0.77);
      group.add(ag2);

    // ==========================================
    // 3. T-SHIRT: 280 GSM BOXY DROP-SHOULDER
    // ==========================================
    } else if (isTee) {
      const teeMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5f7,
        roughness: 0.82,
        metalness: 0.04,
      });
      garmentMaterialsRef.current.push(teeMat);

      // Boxy Heavy Torso
      const torsoGeo = new THREE.CylinderGeometry(0.86, 0.88, 1.55, 32);
      const torso = new THREE.Mesh(torsoGeo, teeMat);
      torso.position.set(0, 0, 0);
      torso.castShadow = true;
      group.add(torso);
      explodedPartsRef.current.push({ mesh: torso, originalPos: torso.position.clone(), explodedPos: new THREE.Vector3(0, 0, 0) });

      // Thick Ribbed Collar
      const collarGeo = new THREE.TorusGeometry(0.44, 0.065, 16, 32);
      collarGeo.rotateX(Math.PI / 2);
      const collar = new THREE.Mesh(collarGeo, teeMat);
      collar.position.set(0, 0.78, 0);
      group.add(collar);
      explodedPartsRef.current.push({ mesh: collar, originalPos: collar.position.clone(), explodedPos: new THREE.Vector3(0, 0.55, 0) });

      // Dropped Shoulder Sleeves
      const sleeveGeo = new THREE.CylinderGeometry(0.38, 0.4, 0.75, 24);
      sleeveGeo.rotateZ(Math.PI / 3);

      const leftSleeve = new THREE.Mesh(sleeveGeo, teeMat);
      leftSleeve.position.set(-0.88, 0.44, 0);
      group.add(leftSleeve);
      explodedPartsRef.current.push({ mesh: leftSleeve, originalPos: leftSleeve.position.clone(), explodedPos: new THREE.Vector3(-0.55, 0.2, 0) });

      const rightSleeveGeo = sleeveGeo.clone();
      rightSleeveGeo.rotateZ(-2 * Math.PI / 3);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, teeMat);
      rightSleeve.position.set(0.88, 0.44, 0);
      group.add(rightSleeve);
      explodedPartsRef.current.push({ mesh: rightSleeve, originalPos: rightSleeve.position.clone(), explodedPos: new THREE.Vector3(0.55, 0.2, 0) });

      // High-Fidelity Signature Back Graphic Plate
      const backTexture = createTeeBackGraphicTexture();
      const backGeo = new THREE.PlaneGeometry(0.95, 0.95);
      const backMat = new THREE.MeshBasicMaterial({ map: backTexture, side: THREE.DoubleSide });
      const backMesh = new THREE.Mesh(backGeo, backMat);
      backMesh.position.set(0, 0.1, -0.89);
      backMesh.rotation.y = Math.PI;
      group.add(backMesh);
      explodedPartsRef.current.push({ mesh: backMesh, originalPos: backMesh.position.clone(), explodedPos: new THREE.Vector3(0, 0.1, -1.35) });

      // Front Chest Micro-Branding
      const frontGeo = new THREE.PlaneGeometry(0.28, 0.14);
      const frontMat = new THREE.MeshBasicMaterial({ color: 0x111114, side: THREE.DoubleSide });
      const frontMesh = new THREE.Mesh(frontGeo, frontMat);
      frontMesh.position.set(-0.32, 0.42, 0.88);
      group.add(frontMesh);

    // ==========================================
    // 4. OUTERWEAR: 550 GSM REVERSIBLE TEDDY HOODIE
    // ==========================================
    } else {
      const hoodieMat = new THREE.MeshStandardMaterial({
        color: 0x141418,
        roughness: 0.96,
        metalness: 0.04,
        bumpMap: fleeceBump,
        bumpScale: 0.035,
      });
      garmentMaterialsRef.current.push(hoodieMat);

      // 1. Boxy Heavy Torso
      const torsoGeo = new THREE.CylinderGeometry(0.94, 0.98, 1.62, 32);
      const torso = new THREE.Mesh(torsoGeo, hoodieMat);
      torso.position.set(0, 0, 0);
      torso.castShadow = true;
      group.add(torso);
      explodedPartsRef.current.push({ mesh: torso, originalPos: torso.position.clone(), explodedPos: new THREE.Vector3(0, 0, 0) });

      // Bottom Ribbed Hem Waistband
      const hemGeo = new THREE.TorusGeometry(0.96, 0.07, 16, 32);
      hemGeo.rotateX(Math.PI / 2);
      const hem = new THREE.Mesh(hemGeo, hoodieMat);
      hem.position.set(0, -0.78, 0);
      group.add(hem);

      // 2. 3D Split Kangaroo Pocket
      const pocketGeo = new THREE.BoxGeometry(0.92, 0.48, 0.22);
      const pocket = new THREE.Mesh(pocketGeo, hoodieMat);
      pocket.position.set(0, -0.42, 0.95);
      group.add(pocket);
      explodedPartsRef.current.push({ mesh: pocket, originalPos: pocket.position.clone(), explodedPos: new THREE.Vector3(0, -0.42, 1.45) });

      // 3. Volumetric Drape Hood with Inner Depth
      const hoodGeo = new THREE.SphereGeometry(0.74, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.72);
      const hood = new THREE.Mesh(hoodGeo, hoodieMat);
      hood.position.set(0, 0.82, -0.14);
      group.add(hood);
      explodedPartsRef.current.push({ mesh: hood, originalPos: hood.position.clone(), explodedPos: new THREE.Vector3(0, 0.52, -0.25) });

      // Hood Neck Ring
      const neckGeo = new THREE.TorusGeometry(0.55, 0.08, 16, 32);
      neckGeo.rotateX(Math.PI / 2);
      const neck = new THREE.Mesh(neckGeo, hoodieMat);
      neck.position.set(0, 0.78, 0);
      group.add(neck);

      // Dropped Shoulder Sleeves
      const sleeveGeo = new THREE.CylinderGeometry(0.4, 0.34, 1.15, 24);
      sleeveGeo.rotateZ(Math.PI / 4);

      const leftSleeve = new THREE.Mesh(sleeveGeo, hoodieMat);
      leftSleeve.position.set(-0.98, 0.26, 0);
      group.add(leftSleeve);
      explodedPartsRef.current.push({ mesh: leftSleeve, originalPos: leftSleeve.position.clone(), explodedPos: new THREE.Vector3(-0.6, 0.12, 0) });

      const rightSleeveGeo = sleeveGeo.clone();
      rightSleeveGeo.rotateZ(-Math.PI / 2);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, hoodieMat);
      rightSleeve.position.set(0.98, 0.26, 0);
      group.add(rightSleeve);
      explodedPartsRef.current.push({ mesh: rightSleeve, originalPos: rightSleeve.position.clone(), explodedPos: new THREE.Vector3(0.6, 0.12, 0) });

      // Ribbed Cuffs on Sleeves
      const cuffGeo = new THREE.TorusGeometry(0.34, 0.06, 16, 32);
      const leftCuff = new THREE.Mesh(cuffGeo, hoodieMat);
      leftCuff.position.set(-1.42, -0.18, 0);
      leftCuff.rotation.y = Math.PI / 4;
      group.add(leftCuff);

      const rightCuff = new THREE.Mesh(cuffGeo, hoodieMat);
      rightCuff.position.set(1.42, -0.18, 0);
      rightCuff.rotation.y = -Math.PI / 4;
      group.add(rightCuff);

      // 4. Heavy Metal Front Zipper & Custom Chrome Puller
      const zipperGeo = new THREE.BoxGeometry(0.045, 1.62, 0.08);
      const zipperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.08, metalness: 0.98 });
      const zipper = new THREE.Mesh(zipperGeo, zipperMat);
      zipper.position.set(0, 0, 0.98);
      group.add(zipper);
      explodedPartsRef.current.push({ mesh: zipper, originalPos: zipper.position.clone(), explodedPos: new THREE.Vector3(0, 0, 1.55) });

      // Custom Rectangular RUN Zipper Puller
      const pullerGeo = new THREE.BoxGeometry(0.08, 0.28, 0.03);
      const puller = new THREE.Mesh(pullerGeo, zipperMat);
      puller.position.set(0, 0.18, 1.05);
      group.add(puller);

      // 5. Signature Upper Back Label Patch
      const patchGeo = new THREE.BoxGeometry(0.72, 0.28, 0.03);
      const patchMat = new THREE.MeshStandardMaterial({ color: 0x1c1c22, roughness: 0.4, metalness: 0.2 });
      const patch = new THREE.Mesh(patchGeo, patchMat);
      patch.position.set(0, 0.35, -0.96);
      group.add(patch);
      explodedPartsRef.current.push({ mesh: patch, originalPos: patch.position.clone(), explodedPos: new THREE.Vector3(0, 0.35, -1.45) });
    }

    // Interactive Drag Orbit Controls with Inertia
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !meshGroupRef.current) return;
      const deltaX = e.clientX - previousMouseX;
      const deltaY = e.clientY - previousMouseY;

      meshGroupRef.current.rotation.y += deltaX * 0.009;
      meshGroupRef.current.rotation.x += deltaY * 0.005;

      // Limit pitch to prevent flipping upside down
      meshGroupRef.current.rotation.x = Math.max(-0.45, Math.min(0.45, meshGroupRef.current.rotation.x));

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Wheel Zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomDelta = e.deltaY * 0.002;
      cameraRef.current.position.z = Math.max(2.8, Math.min(6.5, cameraRef.current.position.z + zoomDelta));
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Touch support for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && meshGroupRef.current) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        meshGroupRef.current.rotation.y += deltaX * 0.008;
        meshGroupRef.current.rotation.x += deltaY * 0.004;
        meshGroupRef.current.rotation.x = Math.max(-0.45, Math.min(0.45, meshGroupRef.current.rotation.x));
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    domElement.addEventListener('touchstart', onTouchStart);
    domElement.addEventListener('touchmove', onTouchMove);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging && meshGroupRef.current) {
        meshGroupRef.current.rotation.y += 0.006;
      }

      // Smooth Exploded View transition
      explodedPartsRef.current.forEach((part) => {
        const target = exploded ? part.explodedPos : part.originalPos;
        part.mesh.position.lerp(target, 0.08);
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 480;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('touchstart', onTouchStart);
      domElement.removeEventListener('touchmove', onTouchMove);
      if (mountRef.current && domElement) {
        mountRef.current.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [category, productName]);

  // Update Color & Material Modes
  useEffect(() => {
    garmentMaterialsRef.current.forEach((mat) => {
      if (materialMode === 'wireframe') {
        mat.wireframe = true;
        mat.color.set(0xa855f7); // Neon Purple wireframe
      } else if (materialMode === 'chrome') {
        mat.wireframe = false;
        mat.metalness = 0.98;
        mat.roughness = 0.04;
        mat.color.set(0xffffff);
      } else if (materialMode === 'fleece') {
        mat.wireframe = false;
        mat.metalness = 0.02;
        mat.roughness = 0.98;
        mat.color.set(activeColor);
      } else {
        // Matte standard
        mat.wireframe = false;
        mat.metalness = 0.15;
        mat.roughness = 0.65;
        mat.color.set(activeColor);
      }
    });
  }, [materialMode, activeColor]);

  // Update Lighting Presets
  useEffect(() => {
    if (!lightsRef.current) return;
    const { ambient, key, rim1, rim2 } = lightsRef.current;

    if (lightingMode === 'neon') {
      ambient.color.set(0x18182b);
      ambient.intensity = 0.8;
      key.color.set(0x06b6d4); // Vibrant Cyan
      key.intensity = 3.5;
      rim1.color.set(0xec4899); // Vibrant Magenta
      rim1.intensity = 4.0;
      rim2.color.set(0x8b5cf6); // Purple
      rim2.intensity = 2.0;
    } else if (lightingMode === 'noir') {
      ambient.color.set(0x000000);
      ambient.intensity = 0.2;
      key.color.set(0xffffff);
      key.intensity = 4.0;
      rim1.color.set(0x52525b);
      rim1.intensity = 1.0;
      rim2.color.set(0x000000);
      rim2.intensity = 0.0;
    } else {
      // Studio Daylight
      ambient.color.set(0xffffff);
      ambient.intensity = 1.2;
      key.color.set(0xffffff);
      key.intensity = 2.8;
      rim1.color.set(0xa5b4fc);
      rim1.intensity = 2.2;
      rim2.color.set(0xffffff);
      rim2.intensity = 1.5;
    }
  }, [lightingMode]);

  // Set Camera Presets
  const setCameraAngle = (view: CameraView) => {
    if (!meshGroupRef.current || !cameraRef.current) return;
    setCameraView(view);
    setAutoRotate(false);

    if (view === 'front') {
      meshGroupRef.current.rotation.set(0, 0, 0);
      cameraRef.current.position.set(0, 0.3, 4.4);
    } else if (view === 'side') {
      meshGroupRef.current.rotation.set(0, Math.PI / 2, 0);
      cameraRef.current.position.set(0, 0.3, 4.4);
    } else if (view === 'back') {
      meshGroupRef.current.rotation.set(0, Math.PI, 0);
      cameraRef.current.position.set(0, 0.3, 4.4);
    } else {
      // Iso
      meshGroupRef.current.rotation.set(0.15, Math.PI / 4, 0);
      cameraRef.current.position.set(0, 1.1, 4.4);
    }
  };

  // Zoom helpers
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const step = direction === 'in' ? -0.5 : 0.5;
    cameraRef.current.position.z = Math.max(2.8, Math.min(6.5, cameraRef.current.position.z + step));
  };

  return (
    <div className="relative w-full h-[480px] bg-gradient-to-b from-[#0c0c10] to-[#08080a] border border-[#222228] rounded-xl overflow-hidden select-none shadow-2xl">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Badge & Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 pointer-events-auto">
          <span className="bg-black/70 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>3D INTERAKTIVNÍ STUDIO</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-mono hidden md:inline bg-black/40 px-2 py-0.5 rounded">
            360° Drag & Scroll Zoom
          </span>
        </div>

        {/* Options Panel Toggle Button */}
        <button
          onClick={() => setShowOptionsPanel(!showOptionsPanel)}
          className={`pointer-events-auto text-xs font-mono px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all flex items-center gap-1.5 ${
            showOptionsPanel
              ? 'bg-white text-black border-white shadow-xl'
              : 'bg-black/60 text-zinc-300 border-zinc-700 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>3D MOŽNOSTI</span>
        </button>
      </div>

      {/* Floating 3D Options Menu Panel */}
      {showOptionsPanel && (
        <div className="absolute top-14 right-4 z-30 bg-[#0e0e14]/95 border border-[#2b2b36] rounded-xl p-4 shadow-2xl backdrop-blur-xl w-72 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
          {/* 1. Colorway Switcher */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-2">
              <span className="flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                <span>ODSTÍN MODELU:</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setActiveColor(c.hex);
                    if (materialMode === 'chrome') setMaterialMode('matte');
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    activeColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-zinc-700 hover:border-zinc-400'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* 2. Material Finish Mode */}
          <div>
            <span className="text-[11px] font-mono text-zinc-400 block mb-2">
              TEXTURA & FINISH:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                onClick={() => setMaterialMode('matte')}
                className={`px-2.5 py-1.5 rounded text-left transition-colors border ${
                  materialMode === 'matte'
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-[#181820] text-zinc-300 border-[#2b2b36] hover:bg-[#20202c]'
                }`}
              >
                Matte Fabric
              </button>
              <button
                onClick={() => setMaterialMode('fleece')}
                className={`px-2.5 py-1.5 rounded text-left transition-colors border ${
                  materialMode === 'fleece'
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-[#181820] text-zinc-300 border-[#2b2b36] hover:bg-[#20202c]'
                }`}
              >
                Teddy Fleece
              </button>
              <button
                onClick={() => setMaterialMode('chrome')}
                className={`px-2.5 py-1.5 rounded text-left transition-colors border ${
                  materialMode === 'chrome'
                    ? 'bg-cyan-400 text-black border-cyan-400 font-bold'
                    : 'bg-[#181820] text-zinc-300 border-[#2b2b36] hover:bg-[#20202c]'
                }`}
              >
                Liquid Chrome
              </button>
              <button
                onClick={() => setMaterialMode('wireframe')}
                className={`px-2.5 py-1.5 rounded text-left transition-colors border ${
                  materialMode === 'wireframe'
                    ? 'bg-purple-500 text-white border-purple-400 font-bold'
                    : 'bg-[#181820] text-zinc-300 border-[#2b2b36] hover:bg-[#20202c]'
                }`}
              >
                3D Blueprint
              </button>
            </div>
          </div>

          {/* 3. Studio Lighting Preset */}
          <div>
            <span className="text-[11px] font-mono text-zinc-400 block mb-2">
              OSVĚTLENÍ STUDIA:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
              <button
                onClick={() => setLightingMode('studio')}
                className={`py-1.5 px-2 rounded border text-center transition-colors ${
                  lightingMode === 'studio'
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-[#181820] text-zinc-400 border-[#2b2b36]'
                }`}
              >
                Studio
              </button>
              <button
                onClick={() => setLightingMode('neon')}
                className={`py-1.5 px-2 rounded border text-center transition-colors ${
                  lightingMode === 'neon'
                    ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                    : 'bg-[#181820] text-zinc-400 border-[#2b2b36]'
                }`}
              >
                Cyber Neon
              </button>
              <button
                onClick={() => setLightingMode('noir')}
                className={`py-1.5 px-2 rounded border text-center transition-colors ${
                  lightingMode === 'noir'
                    ? 'bg-zinc-200 text-black border-white font-bold'
                    : 'bg-[#181820] text-zinc-400 border-[#2b2b36]'
                }`}
              >
                Noir
              </button>
            </div>
          </div>

          {/* 4. Exploded Architecture Layers */}
          <div className="pt-2 border-t border-[#22222e]">
            <button
              onClick={() => setExploded(!exploded)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 border transition-all ${
                exploded
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg'
                  : 'bg-[#1a1a24] text-zinc-300 border-[#30303e] hover:bg-[#222230]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{exploded ? 'SLOUČIT VRSTVY (ANATOMIE)' : 'ROZLOŽIT MODEL (EXPLODED VIEW)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Control Tools Bottom Bar */}
      <div className="absolute bottom-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Interactive Quick Actions */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border backdrop-blur-md shadow-lg ${
              autoRotate
                ? 'bg-white text-black border-white font-bold'
                : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Auto rotace 360°"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">360° Rotace</span>
          </button>

          <button
            onClick={() => setExploded(!exploded)}
            className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border backdrop-blur-md shadow-lg ${
              exploded
                ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Rozložit komponenty v prostoru"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Anatomie</span>
          </button>

          <button
            onClick={() => setMaterialMode(materialMode === 'wireframe' ? 'matte' : 'wireframe')}
            className={`p-2 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors border backdrop-blur-md shadow-lg ${
              materialMode === 'wireframe'
                ? 'bg-purple-600 text-white border-purple-500 font-bold'
                : 'bg-black/60 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Drátěná topologie (Blueprint)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wireframe</span>
          </button>
        </div>

        {/* Center: Camera Angle Presets */}
        <div className="hidden lg:flex items-center space-x-1 pointer-events-auto bg-black/60 border border-zinc-800 p-1 rounded-lg backdrop-blur-md">
          <button
            onClick={() => setCameraAngle('front')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
              cameraView === 'front' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            PŘEDEK
          </button>
          <button
            onClick={() => setCameraAngle('side')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
              cameraView === 'side' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            PROFIL
          </button>
          <button
            onClick={() => setCameraAngle('back')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
              cameraView === 'back' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ZÁDA
          </button>
          <button
            onClick={() => setCameraAngle('iso')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
              cameraView === 'iso' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            3D ÚHEL
          </button>
        </div>

        {/* Right: Zoom buttons */}
        <div className="flex items-center space-x-1.5 pointer-events-auto">
          <button
            onClick={() => handleZoom('in')}
            className="p-2 rounded-lg bg-black/60 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Přiblížit"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="p-2 rounded-lg bg-black/60 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Oddálit"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
