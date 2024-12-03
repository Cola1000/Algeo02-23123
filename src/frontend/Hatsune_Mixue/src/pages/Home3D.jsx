import React, { useRef, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Loader } from '@react-three/drei';
import Konbini from '../models/konbini(backup)';
import { useNavigate } from 'react-router-dom';

const Home3D = () => {
  const cameraRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    
    const handleEsc = (event) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        navigate('/');
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    // Cleanup the event listener
    return () => {
      window.removeEventListener('keydown', handleEsc);
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
          <Konbini />
          <OrbitControls />
        </Suspense>
      </Canvas>

      <Loader containerStyles={{ position: 'absolute', top: '0', left: '0' }} />
    </div>
  );
};

export default Home3D;
