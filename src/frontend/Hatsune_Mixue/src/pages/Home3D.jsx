import React, { useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Loader } from '@react-three/drei';
import Konbini from '../models/konbini(backup)';
import MovementController from '../components/MovementController';
import { useNavigate } from 'react-router-dom';

const Home3D = () => {
  const cameraRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    // Lock cursor on click
    const handlePointerLock = () => {
      document.body.requestPointerLock();
    };

    const handlePointerLockChange = () => {
      if (document.pointerLockElement !== document.body) {
        navigate('/');
      }
    };

    window.addEventListener('click', handlePointerLock);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('click', handlePointerLock);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [navigate]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 2, 5]} />
          <hemisphereLight />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Konbini position={[0, 0, -4]} scale={[1, 1, 1]} rotation={[0, 0, 0]} />
          <MovementController cameraRef={cameraRef} />
        </Suspense>
      </Canvas>

      <Loader containerStyles={{ position: 'absolute', top: '0', left: '0' }} />
    </div>
  );
};

export default Home3D;
