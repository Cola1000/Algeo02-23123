import React, { useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Loader, Environment } from '@react-three/drei';
import Konbini from '../models/konbini(backup)';
import MovementController from '../components/MovementController';
import { useNavigate } from 'react-router-dom';
import hdri from "../assets/moonless_golf_8k.exr"

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
    <div style={{ width: '100vw', height: '100vh', position: 'absolute' }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <Environment files={hdri} background={true} />
          
          <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 2, 5]} rotation={[0, 180, 0]} />
          <hemisphereLight intensity={0.5}/>
          <ambientLight intensity={0} />
          <directionalLight
              position={[5, 10, 5]}
              intensity={1.5}
              castShadow
              shadow-bias={-0.0015}
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
          <Konbini position={[3, 0, 2]} scale={[1, 1, 1]} rotation={[0, 0, 0]} />
          <MovementController cameraRef={cameraRef} />
        </Suspense>
      </Canvas>

      <Loader containerStyles={{ position: 'absolute', top: '0', left: '0' }} />
    </div>
  );
};

export default Home3D;
