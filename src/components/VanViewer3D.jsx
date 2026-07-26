// src/components/VanViewer3D.jsx

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const MODEL_PATH = '/models/van.glb';

const VanViewer3D = ({ isFrench = true }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer, scene, camera, controls, animationId;
    let mixer = null;
    const clock = new THREE.Clock();
    let disposed = false;

    // ----- Scene -----
    scene = new THREE.Scene();
    scene.background = null; // transparent, laisse voir le fond CSS

    // ----- Camera -----
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 240;
    camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(4.5, 2.2, 5.5);

    // ----- Renderer -----
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ----- Lights -----
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x10263b, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe29a5c, 0.5);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);

    // ----- Sol (ombre douce, discret) -----
    const groundGeo = new THREE.CircleGeometry(6, 48);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.22 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // ----- Controls -----
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.8, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.4;
    controls.update();

    // Stoppe la rotation auto pendant l'interaction utilisateur
    controls.addEventListener('start', () => { controls.autoRotate = false; });
    controls.addEventListener('end', () => {
      clearTimeout(controls._resumeTimeout);
      controls._resumeTimeout = setTimeout(() => { controls.autoRotate = true; }, 3000);
    });

    // ----- Chargement du modèle GLB -----
    const loader = new GLTFLoader();
    loader.load(
      MODEL_PATH,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Centre et met à l'échelle automatiquement le modèle
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 3.2 / maxDim;
        model.scale.setScalar(scale);

        model.position.x -= center.x * scale;
        model.position.y -= box.min.y * scale; // pose le van sur le "sol"
        model.position.z -= center.z * scale;

        scene.add(model);

        // Anime les animations éventuelles du glb (roues, portes...)
        if (gltf.animations && gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
        }

        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Erreur de chargement du modèle van.glb :', err);
        if (!disposed) {
          setError(true);
          setLoading(false);
        }
      }
    );

    // ----- Boucle de rendu -----
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ----- Redimensionnement -----
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // ----- Nettoyage -----
    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      clearTimeout(controls._resumeTimeout);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="van-3d-wrap">
      <div className="van-3d-canvas" ref={containerRef} />

      {loading && !error && (
        <div className="van-3d-loading">
          <div className="van-3d-spinner" />
          <span>{isFrench ? 'Chargement du modèle 3D…' : 'Loading 3D model…'}</span>
        </div>
      )}

      {error && (
        <div className="van-3d-loading">
          <span>
            {isFrench
              ? 'Impossible de charger le modèle 3D.'
              : 'Unable to load the 3D model.'}
          </span>
        </div>
      )}

      {!loading && !error && (
        <div className="van-3d-hint">
          <span>🖱️</span>
          <span>{isFrench ? 'Glissez pour faire pivoter' : 'Drag to rotate'}</span>
        </div>
      )}
    </div>
  );
};

export default VanViewer3D;