"use client";

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface STLViewerProps {
  stlUrl: string;
  className?: string;
  onThumbnailReady?: (dataUrl: string) => void;
}

export function STLViewer({ stlUrl, className = "", onThumbnailReady }: STLViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasCapturedRef = useRef(false);

  useEffect(() => {
    if (!mountRef.current || !stlUrl) return;

    const mount = mountRef.current;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mount.appendChild(renderer.domElement);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // STL Loader
    const loader = new STLLoader();
    
    console.log("🎯 Loading STL from URL:", stlUrl);
    
    loader.load(
      stlUrl,
      (geometry) => {
        console.log("✅ STL loaded successfully");
        setLoading(false);
        
        // Create material
        const material = new THREE.MeshPhongMaterial({ 
          color: 0x466F80,
          shininess: 100,
          specular: 0x111111
        });
        
        // Create mesh
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Center the geometry
        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox!;
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);
        
        // Scale to fit view (2x zoom)
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 4 / maxDimension; // 2x zoom (was 2, now 4)
        mesh.scale.setScalar(scale);
        
        // Rotate 15 degrees to the right (around Y-axis)
        mesh.rotation.y = THREE.MathUtils.degToRad(15);
        
        scene.add(mesh);
        
        // Adjust camera position closer for 2x zoom
        camera.position.set(1.5, 1.5, 1.5);
        camera.lookAt(0, 0, 0);
        controls.update();

        // Capture thumbnail after first render
        if (!hasCapturedRef.current) {
          requestAnimationFrame(() => {
            try {
              const canvas = renderer.domElement;
              const dataUrl = canvas.toDataURL('image/png');
              if (dataUrl && onThumbnailReady) {
                onThumbnailReady(dataUrl);
                hasCapturedRef.current = true;
              }
            } catch (e) {
              console.error('❌ Error capturing STL thumbnail:', e);
            }
          });
        }
      },
      (progress) => {
        console.log("📊 STL loading progress:", (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error("❌ Error loading STL:", error);
        setError("Failed to load 3D model");
        setLoading(false);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mount || !camera || !renderer) return;
      
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [stlUrl]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-md ${className}`}>
        <div className="text-center p-4">
          <p className="text-red-600 font-medium">Error loading 3D model</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-100 rounded-md overflow-hidden ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#466F80] mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading 3D model...</p>
          </div>
        </div>
      )}
      
      {!loading && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Click and drag to rotate • Scroll to zoom
        </div>
      )}
    </div>
  );
}
