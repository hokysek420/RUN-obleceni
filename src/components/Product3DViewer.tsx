'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Eye, Sparkles, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface Product3DViewerProps {
  modelUrl?: string | null;
  productName: string;
  category?: string;
}

export default function Product3DViewer({ modelUrl, productName, category }: Product3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [metallicMode, setMetallicMode] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 420;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0c0f);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 4.5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xa5b4fc, 3.0);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(0, -3, 3);
    scene.add(fillLight);

    // 5. 3D Architecture: Pedestal + Product Geometry Representation
    const group = new THREE.Group();
    meshGroupRef.current = group;
    scene.add(group);

    materialsRef.current = [];

    // Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.25, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x18181c,
      roughness: 0.8,
      metalness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.1;
    pedestal.receiveShadow = true;
    group.add(pedestal);

    // Streetwear Product Architecture:
    // If it's footwear: Sneaker 3D silhouette with chrome accents
    // If it's apparel: Sculptural streetwear hoodie silhouette
    if (category === 'Footwear' || productName.toLowerCase().includes('sneaker')) {
      // Sole
      const soleGeo = new THREE.BoxGeometry(2.4, 0.35, 1.0);
      const soleMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.1,
      });
      materialsRef.current.push(soleMat);
      const sole = new THREE.Mesh(soleGeo, soleMat);
      sole.position.set(0, -0.6, 0);
      sole.castShadow = true;
      group.add(sole);

      // Sneaker Upper Body
      const upperGeo = new THREE.CylinderGeometry(0.45, 0.7, 1.6, 32);
      upperGeo.rotateZ(Math.PI / 2);
      const upperMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5f7,
        roughness: 0.4,
        metalness: 0.2,
      });
      materialsRef.current.push(upperMat);
      const upper = new THREE.Mesh(upperGeo, upperMat);
      upper.position.set(-0.2, -0.2, 0);
      upper.castShadow = true;
      group.add(upper);

      // Chrome Heel Plate / Stabilizer
      const chromeGeo = new THREE.TorusGeometry(0.5, 0.12, 16, 32, Math.PI);
      const chromeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.05,
        metalness: 0.95,
      });
      materialsRef.current.push(chromeMat);
      const chromeHeel = new THREE.Mesh(chromeGeo, chromeMat);
      chromeHeel.position.set(-0.9, -0.3, 0);
      chromeHeel.rotation.y = Math.PI / 2;
      group.add(chromeHeel);

      // Visible Air Unit bubble
      const airGeo = new THREE.CapsuleGeometry(0.12, 0.5, 16, 16);
      airGeo.rotateZ(Math.PI / 2);
      const airMat = new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd,
        transmission: 0.85,
        opacity: 0.9,
        transparent: true,
        roughness: 0.1,
      });
      const airUnit = new THREE.Mesh(airGeo, airMat);
      airUnit.position.set(-0.5, -0.65, 0.4);
      group.add(airUnit);
    } else {
      // Sculptural Streetwear Torso / Hoodie Form
      const torsoGeo = new THREE.CylinderGeometry(0.85, 0.95, 1.6, 32);
      const hoodieMat = new THREE.MeshStandardMaterial({
        color: 0x1f1f24,
        roughness: 0.9, // Fleece texture
        metalness: 0.05,
      });
      materialsRef.current.push(hoodieMat);
      const torso = new THREE.Mesh(torsoGeo, hoodieMat);
      torso.position.set(0, 0, 0);
      torso.castShadow = true;
      group.add(torso);

      // Shoulders / Hood
      const hoodGeo = new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.7);
      const hood = new THREE.Mesh(hoodGeo, hoodieMat);
      hood.position.set(0, 0.75, -0.1);
      group.add(hood);

      // RUN Metal Zipper
      const zipperGeo = new THREE.BoxGeometry(0.04, 1.5, 0.05);
      const zipperMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.95,
      });
      materialsRef.current.push(zipperMat);
      const zipper = new THREE.Mesh(zipperGeo, zipperMat);
      zipper.position.set(0, 0, 0.9);
      group.add(zipper);
    }

    // Interactive Drag Controls
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

      meshGroupRef.current.rotation.y += deltaX * 0.01;
      meshGroupRef.current.rotation.x += deltaY * 0.005;

      // Limit pitch
      meshGroupRef.current.rotation.x = Math.max(-0.4, Math.min(0.4, meshGroupRef.current.rotation.x));

      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && !isDragging && meshGroupRef.current) {
        meshGroupRef.current.rotation.y += 0.008;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (mountRef.current && domElement) {
        mountRef.current.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [category, productName]);

  // Update wireframe state
  useEffect(() => {
    materialsRef.current.forEach((m) => {
      m.wireframe = wireframe;
    });
  }, [wireframe]);

  // Update metallic / chrome reflection mode
  useEffect(() => {
    materialsRef.current.forEach((m) => {
      if (metallicMode) {
        m.metalness = 0.9;
        m.roughness = 0.1;
      } else {
        m.metalness = 0.2;
        m.roughness = 0.6;
      }
    });
  }, [metallicMode]);

  return (
    <div className="relative w-full h-[440px] bg-[#0c0c0f] border border-[#222228] rounded-lg overflow-hidden select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono tracking-widest px-2.5 py-1 rounded">
          INTERAKTIVNÍ 3D VIEWER
        </span>
        <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
          Táhnout myší pro rotaci 360°
        </span>
      </div>

      {/* Control Tools Bottom Bar */}
      <div className="absolute bottom-4 inset-x-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2 rounded text-xs font-mono flex items-center gap-1.5 transition-colors border ${
              autoRotate
                ? 'bg-white text-black border-white'
                : 'bg-[#18181c] text-zinc-400 border-[#27272a] hover:text-white'
            }`}
            title="Auto rotace"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Rotace</span>
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-2 rounded text-xs font-mono flex items-center gap-1.5 transition-colors border ${
              wireframe
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-[#18181c] text-zinc-400 border-[#27272a] hover:text-white'
            }`}
            title="Drátěný model"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wireframe</span>
          </button>

          <button
            onClick={() => setMetallicMode(!metallicMode)}
            className={`p-2 rounded text-xs font-mono flex items-center gap-1.5 transition-colors border ${
              metallicMode
                ? 'bg-cyan-500 text-black border-cyan-400'
                : 'bg-[#18181c] text-zinc-400 border-[#27272a] hover:text-white'
            }`}
            title="Chromový odlesk"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chrome</span>
          </button>
        </div>

        <div className="text-[10px] font-mono text-zinc-500 uppercase">
          Architecture v1.0 • WebGL
        </div>
      </div>
    </div>
  );
}
