// components/Map3D.jsx
import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';

const AlgeriaShape = () => {
  const meshRef = useRef();
  
  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.05;
  });
  
  return (
    <mesh ref={meshRef}>
      <extrudeGeometry args={[algeriaShape, { depth: 2, bevelEnabled: true }]} />
      <meshStandardMaterial color="#d4a373" metalness={0.4} roughness={0.3} />
    </mesh>
  );
};

const Map3D = () => {
  return (
    <div style={{ height: '400px', background: '#0a0a2a', borderRadius: '20px' }}>
      <Canvas camera={{ position: [5, 5, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={<Html>Chargement...</Html>}>
          <AlgeriaShape />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
};