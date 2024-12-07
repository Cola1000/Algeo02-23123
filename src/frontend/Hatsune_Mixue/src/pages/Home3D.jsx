import React, { useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import Konbini from '../models/konbini(backup)';
import MovementController from '../components/MovementController';
import { useNavigate } from 'react-router-dom';
import hdri from '../assets/moonless_golf_8k.exr';
import { Physics, usePlane } from '@react-three/cannon';
import albumPictures from '../components/albumPictures';
import ImageCylinder from '../components/ImageCylinder';
import Loader from '../components/Loader';


{/* Ground to know where to fall */}
function Ground() {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI/2, 0, 0], position:[0,0,0]}));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[200,200]} />
      <meshStandardMaterial color="#888888" opacity={0} /> {/* Nanti tolong buat invisible yogs */}
    </mesh>
  );
}

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
        <Suspense fallback={<Loader />}>
          <Environment files={hdri} background={true} />
          <PerspectiveCamera ref={cameraRef} makeDefault position={[-3, 1.5, 3]} rotation={[0, Math.PI, 0]} />
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
          
          {/* Added the physics :D */}
          <Physics gravity={[0, -9.81, 0]}>
            <Ground />
            <ImageCylinder images={albumPictures} />
            <Konbini position={[0, 0, 0]} scale={[1, 1, 1]} rotation={[0, 0, 0]} />
            <MovementController cameraRef={cameraRef} />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Home3D;
