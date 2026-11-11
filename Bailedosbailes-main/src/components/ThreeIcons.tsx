import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeIconProps {
  type: 'mansion' | 'ghost' | 'pumpkin' | 'cards' | 'grimoire';
  size?: number;
  isActive?: boolean;
  isHovered?: boolean;
}

export const ThreeAnimatedIcon: React.FC<ThreeIconProps> = ({
  type,
  size = 48,
  isActive = false,
  isHovered = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(isHovered);
  const activeRef = useRef(isActive);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    hoverRef.current = isHovered;
    activeRef.current = isActive;
  }, [isHovered, isActive]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;

    try {
      // 1. Scene setup
      scene = new THREE.Scene();

      // 2. Camera setup
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 4.2);

      // 3. Renderer setup
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
      });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);

      // 4. Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xfffbeb, 2.5);
      dirLight1.position.set(3, 4, 5);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2.0);
      dirLight2.position.set(-3, -2, 3);
      scene.add(dirLight2);

      // Group container for the 3D object
      const mainGroup = new THREE.Group();
      scene.add(mainGroup);

      // 5. Build 3D Models according to type
      if (type === 'mansion') {
        // ==========================================
        // 1. CASA GRANDE (HAUNTED RETRO MANSION)
        // ==========================================
        // Base Building
        const baseMat = new THREE.MeshStandardMaterial({
          color: 0x3b0764,
          emissive: 0x1e0b36,
          roughness: 0.4,
          metalness: 0.1,
        });
        const baseGeo = new THREE.BoxGeometry(1.4, 1.1, 1.1);
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = -0.3;
        mainGroup.add(baseMesh);

        // Main Roof (Pyramid Gable)
        const roofMat = new THREE.MeshStandardMaterial({
          color: 0x7e22ce,
          emissive: 0x4c1d95,
          roughness: 0.3,
        });
        const roofGeo = new THREE.ConeGeometry(1.25, 0.75, 4);
        const roofMesh = new THREE.Mesh(roofGeo, roofMat);
        roofMesh.rotation.y = Math.PI / 4;
        roofMesh.position.y = 0.6;
        mainGroup.add(roofMesh);

        // Central Spire / Haunted Tower
        const towerMat = new THREE.MeshStandardMaterial({
          color: 0x581c87,
          emissive: 0x2e1065,
        });
        const towerGeo = new THREE.BoxGeometry(0.55, 1.4, 0.55);
        const towerMesh = new THREE.Mesh(towerGeo, towerMat);
        towerMesh.position.set(0.35, 0.2, 0.1);
        mainGroup.add(towerMesh);

        // Spire Roof
        const spireRoofGeo = new THREE.ConeGeometry(0.45, 0.8, 4);
        const spireRoofMesh = new THREE.Mesh(
          spireRoofGeo,
          new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x6b21a8 })
        );
        spireRoofMesh.rotation.y = Math.PI / 4;
        spireRoofMesh.position.set(0.35, 1.25, 0.1);
        mainGroup.add(spireRoofMesh);

        // Glowing Yellow Windows
        const winMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
        const winGeo = new THREE.BoxGeometry(0.24, 0.32, 0.1);

        const win1 = new THREE.Mesh(winGeo, winMat);
        win1.position.set(-0.35, -0.15, 0.56);
        mainGroup.add(win1);

        const win2 = new THREE.Mesh(winGeo, winMat);
        win2.position.set(0.35, 0.3, 0.38);
        mainGroup.add(win2);

        // Front Red Door
        const doorMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0x991b1b,
        });
        const doorGeo = new THREE.BoxGeometry(0.35, 0.55, 0.1);
        const doorMesh = new THREE.Mesh(doorGeo, doorMat);
        doorMesh.position.set(-0.1, -0.58, 0.56);
        mainGroup.add(doorMesh);

        // Warm Window Light
        const winLight = new THREE.PointLight(0xfacc15, 3.5, 3);
        winLight.position.set(0, 0, 1);
        mainGroup.add(winLight);

        mainGroup.scale.set(1.15, 1.15, 1.15);
      } else if (type === 'ghost') {
        // ==========================================
        // 2. FANTASMA (SPECTRAL 3D GHOST)
        // ==========================================
        const ghostMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.45,
          roughness: 0.1,
          metalness: 0.1,
          transparent: true,
          opacity: 0.92,
        });

        // Head Dome
        const headGeo = new THREE.SphereGeometry(0.78, 16, 16);
        const headMesh = new THREE.Mesh(headGeo, ghostMat);
        headMesh.position.y = 0.35;
        mainGroup.add(headMesh);

        // Body skirt
        const skirtGeo = new THREE.CylinderGeometry(0.75, 0.98, 1.15, 16, 1, true);
        const skirtMesh = new THREE.Mesh(skirtGeo, ghostMat);
        skirtMesh.position.y = -0.3;
        mainGroup.add(skirtMesh);

        // Tail ripple spheres
        for (let i = 0; i < 6; i++) {
          const rippleGeo = new THREE.SphereGeometry(0.22, 8, 8);
          const rippleMesh = new THREE.Mesh(rippleGeo, ghostMat);
          const angle = (i / 6) * Math.PI * 2;
          rippleMesh.position.set(Math.cos(angle) * 0.82, -0.85, Math.sin(angle) * 0.82);
          mainGroup.add(rippleMesh);
        }

        // Spooky Black Eyes with Glowing Cyan Pupils
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x05030a });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

        const eyeGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const pupilGeo = new THREE.SphereGeometry(0.07, 6, 6);

        const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
        eyeL.position.set(-0.25, 0.38, 0.68);
        const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
        pupilL.position.set(-0.25, 0.38, 0.79);

        const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
        eyeR.position.set(0.25, 0.38, 0.68);
        const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
        pupilR.position.set(0.25, 0.38, 0.79);

        // Spooky round mouth
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x09040e });
        const mouthGeo = new THREE.SphereGeometry(0.14, 8, 8);
        const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
        mouthMesh.scale.set(1, 1.4, 0.6);
        mouthMesh.position.set(0, 0.1, 0.7);

        mainGroup.add(eyeL);
        mainGroup.add(pupilL);
        mainGroup.add(eyeR);
        mainGroup.add(pupilR);
        mainGroup.add(mouthMesh);

        // Ghost Inner Cyan Light
        const ghostLight = new THREE.PointLight(0x38bdf8, 4, 3);
        ghostLight.position.set(0, 0.2, 0.2);
        mainGroup.add(ghostLight);

        mainGroup.scale.set(1.15, 1.15, 1.15);
      } else if (type === 'pumpkin') {
        // ==========================================
        // 3. CABEÇA DE ABÓBORA (3D JACK-O'-LANTERN)
        // ==========================================
        const pumpkinMat = new THREE.MeshStandardMaterial({
          color: 0xf97316,
          emissive: 0x7c2d12,
          emissiveIntensity: 0.5,
          roughness: 0.3,
          metalness: 0.1,
        });

        // Ribbed Pumpkin segments
        const segmentsGroup = new THREE.Group();
        for (let i = 0; i < 7; i++) {
          const ribGeo = new THREE.SphereGeometry(0.85, 12, 12);
          ribGeo.scale(0.82, 0.95, 1.15);
          const ribMesh = new THREE.Mesh(ribGeo, pumpkinMat);
          ribMesh.rotation.y = (i / 7) * Math.PI;
          segmentsGroup.add(ribMesh);
        }
        mainGroup.add(segmentsGroup);

        // Green Stem
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x14532d });
        const stemGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.55, 8);
        const stemMesh = new THREE.Mesh(stemGeo, stemMat);
        stemMesh.position.set(0.05, 0.92, -0.05);
        stemMesh.rotation.z = -0.25;
        mainGroup.add(stemMesh);

        // Glowing Carved Face Elements (Yellow/Orange Neon)
        const glowFaceMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

        // Eyes (Triangles)
        const eyeTriGeo = new THREE.ConeGeometry(0.22, 0.1, 3);
        eyeTriGeo.rotateZ(Math.PI);

        const eyeL = new THREE.Mesh(eyeTriGeo, glowFaceMat);
        eyeL.position.set(-0.35, 0.18, 0.88);
        eyeL.rotation.x = Math.PI / 2;

        const eyeR = new THREE.Mesh(eyeTriGeo, glowFaceMat);
        eyeR.position.set(0.35, 0.18, 0.88);
        eyeR.rotation.x = Math.PI / 2;

        // Nose (Small Triangle)
        const nose = new THREE.Mesh(eyeTriGeo, glowFaceMat);
        nose.scale.set(0.65, 0.65, 0.65);
        nose.position.set(0, 0.02, 0.93);
        nose.rotation.x = Math.PI / 2;

        // Jagged Grin Mouth
        const mouthGeo = new THREE.BoxGeometry(0.68, 0.18, 0.1);
        const mouthMesh = new THREE.Mesh(mouthGeo, glowFaceMat);
        mouthMesh.position.set(0, -0.22, 0.88);

        // Teeth notches
        const toothGeo = new THREE.BoxGeometry(0.1, 0.1, 0.12);
        const toothTop = new THREE.Mesh(toothGeo, pumpkinMat);
        toothTop.position.set(-0.15, -0.16, 0.9);
        const toothBot = new THREE.Mesh(toothGeo, pumpkinMat);
        toothBot.position.set(0.15, -0.26, 0.9);

        mainGroup.add(eyeL);
        mainGroup.add(eyeR);
        mainGroup.add(nose);
        mainGroup.add(mouthMesh);
        mainGroup.add(toothTop);
        mainGroup.add(toothBot);

        // Internal Fire Light
        const fireLight = new THREE.PointLight(0xfde047, 4, 3);
        fireLight.position.set(0, 0, 0.3);
        mainGroup.add(fireLight);

        mainGroup.scale.set(1.15, 1.15, 1.15);
      } else if (type === 'cards') {
        // ==========================================
        // 4. BARALHO DE TAROT (3D CARD DECK)
        // ==========================================
        // Bottom Deck Stack
        const deckMat = new THREE.MeshStandardMaterial({
          color: 0x3b0764,
          emissive: 0x2e1065,
          roughness: 0.5,
        });
        const deckGeo = new THREE.BoxGeometry(1.2, 0.45, 1.7);
        const deckMesh = new THREE.Mesh(deckGeo, deckMat);
        deckMesh.position.y = -0.35;
        deckMesh.rotation.y = 0.2;
        mainGroup.add(deckMesh);

        // Gilded Gold Trim on Deck
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xb45309,
          metalness: 0.8,
          roughness: 0.2,
        });
        const goldTrimGeo = new THREE.BoxGeometry(1.24, 0.08, 1.74);
        const goldTrim = new THREE.Mesh(goldTrimGeo, goldMat);
        goldTrim.position.y = -0.14;
        goldTrim.rotation.y = 0.2;
        mainGroup.add(goldTrim);

        // Floating Top Tarot Card
        const topCardMat = new THREE.MeshStandardMaterial({
          color: 0x701a75,
          emissive: 0x4a044e,
          roughness: 0.2,
        });
        const topCardGeo = new THREE.BoxGeometry(1.18, 0.05, 1.68);
        const topCardMesh = new THREE.Mesh(topCardGeo, topCardMat);
        topCardMesh.position.set(0, 0.3, 0);
        topCardMesh.rotation.set(-0.35, 0.4, 0.2);
        mainGroup.add(topCardMesh);

        // Mystic Eye Emblem on Card
        const eyeEmblemMat = new THREE.MeshBasicMaterial({ color: 0xf0abfc });
        const eyeCircleGeo = new THREE.RingGeometry(0.14, 0.3, 16);
        const eyeCircle = new THREE.Mesh(eyeCircleGeo, eyeEmblemMat);
        eyeCircle.position.set(0, 0.34, 0);
        eyeCircle.rotation.set(-0.35 - Math.PI / 2, 0.4, 0);
        mainGroup.add(eyeCircle);

        const pupilSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xffe4e6 })
        );
        pupilSphere.position.set(0, 0.35, 0);
        mainGroup.add(pupilSphere);

        // Purple Arcane Light
        const cardLight = new THREE.PointLight(0xe879f9, 4, 3);
        cardLight.position.set(0, 0.5, 0.2);
        mainGroup.add(cardLight);

        mainGroup.scale.set(1.15, 1.15, 1.15);
      } else if (type === 'grimoire') {
        // ==========================================
        // 5. LIVRO DE BRUXA (3D WITCH'S GRIMOIRE)
        // ==========================================
        // Leather Cover (Dark Crimson/Emerald)
        const coverMat = new THREE.MeshStandardMaterial({
          color: 0x450a0a,
          emissive: 0x270707,
          roughness: 0.4,
          metalness: 0.1,
        });
        const coverGeo = new THREE.BoxGeometry(1.4, 0.28, 1.8);
        const coverMesh = new THREE.Mesh(coverGeo, coverMat);
        coverMesh.rotation.set(0.35, -0.4, -0.15);
        mainGroup.add(coverMesh);

        // Aged Parchment Pages
        const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });
        const pagesGeo = new THREE.BoxGeometry(1.25, 0.2, 1.65);
        const pagesMesh = new THREE.Mesh(pagesGeo, pagesMat);
        pagesMesh.position.set(0.04, 0, 0);
        pagesMesh.rotation.set(0.35, -0.4, -0.15);
        mainGroup.add(pagesMesh);

        // Golden Spine
        const goldMat = new THREE.MeshStandardMaterial({
          color: 0xd97706,
          metalness: 0.85,
          roughness: 0.2,
        });
        const spineGeo = new THREE.CylinderGeometry(0.16, 0.16, 1.82, 8);
        const spineMesh = new THREE.Mesh(spineGeo, goldMat);
        spineMesh.position.set(-0.65, 0, 0);
        spineMesh.rotation.set(0.35, -0.4, -0.15);
        mainGroup.add(spineMesh);

        // Glowing Witch Crystal / Gemstone on Cover
        const gemMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x10b981,
          emissiveIntensity: 0.9,
          roughness: 0.1,
          metalness: 0.2,
        });
        const gemGeo = new THREE.OctahedronGeometry(0.24);
        const gemMesh = new THREE.Mesh(gemGeo, gemMat);
        gemMesh.position.set(0.05, 0.24, 0.05);
        gemMesh.rotation.set(0.35, -0.4, -0.15);
        mainGroup.add(gemMesh);

        // Green Witch Magic Point Light
        const witchLight = new THREE.PointLight(0x34d399, 4, 3);
        witchLight.position.set(0.1, 0.35, 0.2);
        mainGroup.add(witchLight);

        mainGroup.scale.set(1.15, 1.15, 1.15);
      }

      // 6. Animation Loop
      let clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        const speed = hoverRef.current ? 2.5 : activeRef.current ? 1.6 : 1.0;

        // Smooth Bobbing & Rotation
        if (type === 'mansion') {
          mainGroup.rotation.y = Math.sin(elapsedTime * 0.9 * speed) * 0.45;
          mainGroup.position.y = Math.sin(elapsedTime * 1.6) * 0.08;
        } else if (type === 'ghost') {
          mainGroup.rotation.y = elapsedTime * 0.8 * speed;
          mainGroup.rotation.z = Math.sin(elapsedTime * 2.2) * 0.12;
          mainGroup.position.y = Math.sin(elapsedTime * 2.5) * 0.15;
        } else if (type === 'pumpkin') {
          mainGroup.rotation.y = elapsedTime * 1.1 * speed;
          mainGroup.rotation.x = Math.sin(elapsedTime * 1.5) * 0.15;
          mainGroup.position.y = Math.sin(elapsedTime * 2.0) * 0.1;
        } else if (type === 'cards') {
          mainGroup.rotation.y = Math.sin(elapsedTime * 1.2 * speed) * 0.6;
          mainGroup.rotation.x = Math.cos(elapsedTime * 1.0) * 0.2;
          mainGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.12;
        } else if (type === 'grimoire') {
          mainGroup.rotation.y = Math.sin(elapsedTime * 1.1 * speed) * 0.5 - 0.2;
          mainGroup.rotation.z = Math.cos(elapsedTime * 1.4) * 0.12;
          mainGroup.position.y = Math.sin(elapsedTime * 2.0) * 0.12;
        }

        if (hoverRef.current) {
          mainGroup.scale.setScalar(1.25 + Math.sin(elapsedTime * 6) * 0.04);
        } else if (activeRef.current) {
          mainGroup.scale.setScalar(1.2);
        } else {
          mainGroup.scale.setScalar(1.1);
        }

        renderer?.render(scene, camera);
      };

      animate();
    } catch (e) {
      console.warn('Three.js WebGL initialization fallback:', e);
      setWebglFailed(true);
    }

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container && renderer && renderer.domElement) {
        try {
          container.removeChild(renderer.domElement);
        } catch {
          // ignore
        }
      }
      if (renderer) {
        renderer.dispose();
      }
      if (scene) {
        scene.clear();
      }
    };
  }, [type, size]);

  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center pointer-events-none select-none"
    >
      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        style={{ width: size, height: size }}
        className="absolute inset-0 flex items-center justify-center"
      />

      {/* Guaranteed Animated Visual Overlay / Fallback (Always crisp and visible) */}
      {webglFailed && (
        <div className="absolute inset-0 flex items-center justify-center">
          {type === 'mansion' && (
            <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 24 24" fill="none" className="animate-pulse drop-shadow-[0_0_8px_#f59e0b]">
              <path d="M3 21h18M5 21V9l7-6 7 6v12M9 13h6v8H9zM9 9h2v2H9zM13 9h2v2h-2z" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#3b0764" />
            </svg>
          )}
          {type === 'ghost' && (
            <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 24 24" fill="none" className="animate-bounce drop-shadow-[0_0_8px_#38bdf8]">
              <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 3 2.5-3 2.5 3 2.5-3 3 3V10a8 8 0 0 0-8-8z" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#f8fafc" />
            </svg>
          )}
          {type === 'pumpkin' && (
            <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 24 24" fill="none" className="animate-pulse drop-shadow-[0_0_8px_#f97316]">
              <path d="M12 2v3M8 10l-2 3h4l-2-3M16 10l-2 3h4l-2-3M7 17l2-1 3 1 3-1 2 1" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx="12" cy="14" rx="9" ry="7" stroke="#f97316" strokeWidth="2" fill="#7c2d12" />
            </svg>
          )}
          {type === 'cards' && (
            <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 24 24" fill="none" className="animate-pulse drop-shadow-[0_0_8px_#e879f9]">
              <rect x="4" y="4" width="12" height="16" rx="2" stroke="#f0abfc" strokeWidth="2" fill="#4a044e" />
              <rect x="8" y="2" width="12" height="16" rx="2" stroke="#d946ef" strokeWidth="2" fill="#701a75" />
              <circle cx="14" cy="10" r="2" fill="#fde047" />
            </svg>
          )}
          {type === 'grimoire' && (
            <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 24 24" fill="none" className="animate-pulse drop-shadow-[0_0_8px_#34d399]">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" stroke="#34d399" strokeWidth="2" fill="#064e3b" />
              <path d="M12 7v6M9 10h6" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};
