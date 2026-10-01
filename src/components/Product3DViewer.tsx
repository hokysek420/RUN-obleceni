'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  Eye,
  Sparkles,
  Layers,
  Sun,
  Camera,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Sliders,
  Palette
} from 'lucide-react';

interface Product3DViewerProps {
  modelUrl?: string | null;
  productName: string;
  category?: string;
}

type MaterialMode = 'matte' | 'fleece' | 'chrome' | 'wireframe';
type LightingMode = 'studio' | 'neon' | 'noir';
type CameraView = 'front' | 'side' | 'back' | 'iso';

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
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
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
    const height = mountRef.current.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0d);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 4.2);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    mountRef.current.replaceChildren(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight1 = new THREE.DirectionalLight(0xa5b4fc, 2.5);
    rimLight1.position.set(-5, 4, -4);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight2.position.set(5, -2, -3);
    scene.add(rimLight2);

    lightsRef.current = { ambient: ambientLight, key: keyLight, rim1: rimLight1, rim2: rimLight2 };

    // 5. Product Mesh Group
    const group = new THREE.Group();
    meshGroupRef.current = group;
    scene.add(group);

    materialsRef.current = [];
    explodedPartsRef.current = [];

    // Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.75, 0.18, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x141418,
      roughness: 0.7,
      metalness: 0.3,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.15;
    pedestal.receiveShadow = true;
    group.add(pedestal);

    // Pedestal Glow Ring
    const ringGeo = new THREE.RingGeometry(1.58, 1.63, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = -1.05;
    group.add(ring);

    // Determine Product Shape
    const isFootwear = category.toLowerCase().includes('footwear') || productName.toLowerCase().includes('sneaker');
    const isPants = category.toLowerCase().includes('pants') || productName.toLowerCase().includes('jeans') || productName.toLowerCase().includes('sweatpants');
    const isTee = category.toLowerCase().includes('t-shirt') || productName.toLowerCase().includes('t-shirt');

    if (isFootwear) {
      // 1. OUTSOLE
      const soleGeo = new THREE.BoxGeometry(2.3, 0.32, 0.95);
      const soleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
      materialsRef.current.push(soleMat);
      const sole = new THREE.Mesh(soleGeo, soleMat);
      sole.position.set(0, -0.65, 0);
      sole.castShadow = true;
      group.add(sole);
      explodedPartsRef.current.push({ mesh: sole, originalPos: sole.position.clone(), explodedPos: new THREE.Vector3(0, -1.0, 0) });

      // Outsole Tread detail
      const treadGeo = new THREE.BoxGeometry(2.2, 0.08, 0.88);
      const treadMat = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.9 });
      const tread = new THREE.Mesh(treadGeo, treadMat);
      tread.position.set(0, -0.82, 0);
      group.add(tread);

      // 2. MIDSOLE AIR UNIT (Translucent Cushioning)
      const airGeo = new THREE.CapsuleGeometry(0.12, 0.55, 16, 16);
      airGeo.rotateZ(Math.PI / 2);
      const airMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.85,
        opacity: 0.9,
        transparent: true,
        roughness: 0.1,
        metalness: 0.1,
      });
      const airUnit = new THREE.Mesh(airGeo, airMat);
      airUnit.position.set(-0.45, -0.65, 0.38);
      group.add(airUnit);

      // Inner air pillars
      for (let i = -2; i <= 2; i++) {
        const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 8);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.8 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(-0.45 + i * 0.1, -0.65, 0.38);
        group.add(pillar);
      }

      // 3. SNEAKER UPPER BODY
      const upperGeo = new THREE.CylinderGeometry(0.48, 0.72, 1.65, 32);
      upperGeo.rotateZ(Math.PI / 2);
      const upperMat = new THREE.MeshStandardMaterial({ color: 0xdedede, roughness: 0.5, metalness: 0.15 });
      materialsRef.current.push(upperMat);
      const upper = new THREE.Mesh(upperGeo, upperMat);
      upper.position.set(-0.2, -0.22, 0);
      upper.castShadow = true;
      group.add(upper);
      explodedPartsRef.current.push({ mesh: upper, originalPos: upper.position.clone(), explodedPos: new THREE.Vector3(0, 0.1, 0) });

      // 4. CHROME HEEL STABILIZER CLIP
      const chromeGeo = new THREE.TorusGeometry(0.52, 0.1, 16, 32, Math.PI);
      const chromeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.98 });
      materialsRef.current.push(chromeMat);
      const chromeHeel = new THREE.Mesh(chromeGeo, chromeMat);
      chromeHeel.position.set(-0.95, -0.32, 0);
      chromeHeel.rotation.y = Math.PI / 2;
      group.add(chromeHeel);
      explodedPartsRef.current.push({ mesh: chromeHeel, originalPos: chromeHeel.position.clone(), explodedPos: new THREE.Vector3(-0.6, -0.2, 0) });

      // 5. RUN ENGRAVED METAL LACE DUBRAE
      const dubraeGeo = new THREE.BoxGeometry(0.06, 0.08, 0.35);
      const dubraeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 });
      const dubrae = new THREE.Mesh(dubraeGeo, dubraeMat);
      dubrae.position.set(0.2, 0.05, 0);
      group.add(dubrae);

    } else if (isPants) {
      // BAGGY PANTS / DENIM ARCHITECTURE
      const waistGeo = new THREE.CylinderGeometry(0.72, 0.75, 0.35, 32);
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x18181d, roughness: 0.85, metalness: 0.05 });
      materialsRef.current.push(pantsMat);
      const waist = new THREE.Mesh(waistGeo, pantsMat);
      waist.position.set(0, 0.5, 0);
      group.add(waist);

      // Left Leg (Baggy flared cylinder)
      const legGeo = new THREE.CylinderGeometry(0.38, 0.48, 1.45, 32);
      const leftLeg = new THREE.Mesh(legGeo, pantsMat);
      leftLeg.position.set(-0.35, -0.35, 0);
      leftLeg.rotation.z = -0.05;
      group.add(leftLeg);

      // Right Leg
      const rightLeg = new THREE.Mesh(legGeo, pantsMat);
      rightLeg.position.set(0.35, -0.35, 0);
      rightLeg.rotation.z = 0.05;
      group.add(rightLeg);

      // Stacking Ankle Cuffs
      const cuffGeo = new THREE.TorusGeometry(0.46, 0.08, 16, 32);
      cuffGeo.rotateX(Math.PI / 2);
      const cuffLeft = new THREE.Mesh(cuffGeo, pantsMat);
      cuffLeft.position.set(-0.38, -1.02, 0);
      group.add(cuffLeft);

      const cuffRight = new THREE.Mesh(cuffGeo, pantsMat);
      cuffRight.position.set(0.38, -1.02, 0);
      group.add(cuffRight);

      // Dangling Drawstrings with Metal Aglets
      const stringGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
      const stringMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
      const agletMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.1 });

      const str1 = new THREE.Mesh(stringGeo, stringMat);
      str1.position.set(-0.1, 0.25, 0.72);
      group.add(str1);

      const ag1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.08, 8), agletMat);
      ag1.position.set(-0.1, -0.05, 0.72);
      group.add(ag1);

      const str2 = new THREE.Mesh(stringGeo, stringMat);
      str2.position.set(0.1, 0.22, 0.72);
      group.add(str2);

      const ag2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.08, 8), agletMat);
      ag2.position.set(0.1, -0.08, 0.72);
      group.add(ag2);

    } else if (isTee) {
      // BOXY DROP-SHOULDER T-SHIRT ARCHITECTURE
      const teeMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f7, roughness: 0.9, metalness: 0.02 });
      materialsRef.current.push(teeMat);

      // Boxy Torso
      const torsoGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.5, 32);
      const torso = new THREE.Mesh(torsoGeo, teeMat);
      torso.position.set(0, 0, 0);
      torso.castShadow = true;
      group.add(torso);

      // Ribbed Collar Ring
      const collarGeo = new THREE.TorusGeometry(0.42, 0.06, 16, 32);
      collarGeo.rotateX(Math.PI / 2);
      const collar = new THREE.Mesh(collarGeo, teeMat);
      collar.position.set(0, 0.75, 0);
      group.add(collar);

      // Drop Shoulder Sleeves
      const sleeveGeo = new THREE.CylinderGeometry(0.36, 0.38, 0.7, 16);
      sleeveGeo.rotateZ(Math.PI / 3);

      const leftSleeve = new THREE.Mesh(sleeveGeo, teeMat);
      leftSleeve.position.set(-0.85, 0.45, 0);
      group.add(leftSleeve);

      const rightSleeveGeo = sleeveGeo.clone();
      rightSleeveGeo.rotateZ(-2 * Math.PI / 3);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, teeMat);
      rightSleeve.position.set(0.85, 0.45, 0);
      group.add(rightSleeve);

      // Chest Scribble Graphic Plate
      const printGeo = new THREE.PlaneGeometry(0.4, 0.25);
      const printMat = new THREE.MeshBasicMaterial({ color: 0x111114, side: THREE.DoubleSide });
      const printMesh = new THREE.Mesh(printGeo, printMat);
      printMesh.position.set(-0.3, 0.35, 0.86);
      group.add(printMesh);

    } else {
      // HEAVY FAUX-FUR TEDDY ZIP HOODIE ARCHITECTURE
      const hoodieMat = new THREE.MeshStandardMaterial({ color: 0x141418, roughness: 0.95, metalness: 0.05 });
      materialsRef.current.push(hoodieMat);

      // 1. Boxy Heavy Torso
      const torsoGeo = new THREE.CylinderGeometry(0.92, 0.96, 1.6, 32);
      const torso = new THREE.Mesh(torsoGeo, hoodieMat);
      torso.position.set(0, 0, 0);
      torso.castShadow = true;
      group.add(torso);
      explodedPartsRef.current.push({ mesh: torso, originalPos: torso.position.clone(), explodedPos: new THREE.Vector3(0, 0, 0) });

      // 2. Volumetric 3D Hood
      const hoodGeo = new THREE.SphereGeometry(0.72, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.7);
      const hood = new THREE.Mesh(hoodGeo, hoodieMat);
      hood.position.set(0, 0.78, -0.12);
      group.add(hood);
      explodedPartsRef.current.push({ mesh: hood, originalPos: hood.position.clone(), explodedPos: new THREE.Vector3(0, 0.45, -0.2) });

      // 3. Drop Shoulder Sleeves
      const sleeveGeo = new THREE.CylinderGeometry(0.38, 0.32, 1.1, 16);
      sleeveGeo.rotateZ(Math.PI / 4);

      const leftSleeve = new THREE.Mesh(sleeveGeo, hoodieMat);
      leftSleeve.position.set(-0.95, 0.25, 0);
      group.add(leftSleeve);
      explodedPartsRef.current.push({ mesh: leftSleeve, originalPos: leftSleeve.position.clone(), explodedPos: new THREE.Vector3(-0.55, 0.1, 0) });

      const rightSleeveGeo = sleeveGeo.clone();
      rightSleeveGeo.rotateZ(-Math.PI / 2);
      const rightSleeve = new THREE.Mesh(rightSleeveGeo, hoodieMat);
      rightSleeve.position.set(0.95, 0.25, 0);
      group.add(rightSleeve);
      explodedPartsRef.current.push({ mesh: rightSleeve, originalPos: rightSleeve.position.clone(), explodedPos: new THREE.Vector3(0.55, 0.1, 0) });

      // 4. Heavy Metal Front Zipper & Puller
      const zipperGeo = new THREE.BoxGeometry(0.045, 1.55, 0.06);
      const zipperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.08, metalness: 0.98 });
      materialsRef.current.push(zipperMat);
      const zipper = new THREE.Mesh(zipperGeo, zipperMat);
      zipper.position.set(0, 0, 0.95);
      group.add(zipper);
      explodedPartsRef.current.push({ mesh: zipper, originalPos: zipper.position.clone(), explodedPos: new THREE.Vector3(0, 0, 1.35) });

      // Metal Zipper Puller
      const pullerGeo = new THREE.BoxGeometry(0.06, 0.18, 0.03);
      const puller = new THREE.Mesh(pullerGeo, zipperMat);
      puller.position.set(0, 0.35, 1.0);
      group.add(puller);

      // 5. Heavy Cotton Drawstrings with Metal Aglets
      const cordGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8);
      const cordMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
      const agletMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.95, roughness: 0.05 });

      const cordL = new THREE.Mesh(cordGeo, cordMat);
      cordL.position.set(-0.2, 0.45, 0.9);
      group.add(cordL);

      const agletL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 8), agletMat);
      agletL.position.set(-0.2, 0.1, 0.9);
      group.add(agletL);

      const cordR = new THREE.Mesh(cordGeo, cordMat);
      cordR.position.set(0.2, 0.42, 0.9);
      group.add(cordR);

      const agletR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 8), agletMat);
      agletR.position.set(0.2, 0.07, 0.9);
      group.add(agletR);

      // 6. Back Statement Manifesto Plate (RUN Cross Plate)
      const plateGeo = new THREE.PlaneGeometry(0.75, 0.95);
      const plateMat = new THREE.MeshStandardMaterial({ color: 0xdedede, roughness: 0.4, side: THREE.DoubleSide });
      materialsRef.current.push(plateMat);
      const backPlate = new THREE.Mesh(plateGeo, plateMat);
      backPlate.position.set(0, 0.15, -0.95);
      backPlate.rotation.y = Math.PI;
      group.add(backPlate);
      explodedPartsRef.current.push({ mesh: backPlate, originalPos: backPlate.position.clone(), explodedPos: new THREE.Vector3(0, 0.15, -1.35) });
    }

    // Interactive Drag Orbit Controls
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
      const h = mountRef.current.clientHeight || 450;
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
    materialsRef.current.forEach((mat) => {
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
      cameraRef.current.position.set(0, 0.3, 4.2);
    } else if (view === 'side') {
      meshGroupRef.current.rotation.set(0, Math.PI / 2, 0);
      cameraRef.current.position.set(0, 0.3, 4.2);
    } else if (view === 'back') {
      meshGroupRef.current.rotation.set(0, Math.PI, 0);
      cameraRef.current.position.set(0, 0.3, 4.2);
    } else {
      // Iso
      meshGroupRef.current.rotation.set(0.15, Math.PI / 4, 0);
      cameraRef.current.position.set(0, 1.2, 4.2);
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
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
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

        {/* Center: Camera Angle Presets (Hidden on mobile) */}
        <div className="hidden lg:flex items-center space-x-1 pointer-events-auto bg-black/60 border border-zinc-800 p-1 rounded-lg backdrop-blur-md">
          <button
            onClick={() => setCameraAngle('front')}
            className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
              cameraView === 'front' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            PŘEDEK
          </button>
          <button
            onClick={() => setCameraAngle('side')}
            className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
              cameraView === 'side' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            PROFIL
          </button>
          <button
            onClick={() => setCameraAngle('back')}
            className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
              cameraView === 'back' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            ZÁDA
          </button>
          <button
            onClick={() => setCameraAngle('iso')}
            className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
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
