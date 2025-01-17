// Home3D.jsx
import React, { useRef, Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, Environment } from "@react-three/drei";
import Konbini from "../models/konbini(backup)";
import MovementController from "../components/MovementController";
import { useNavigate } from "react-router-dom";
import hdri from "../assets/moonless_golf_8k.exr";
import { Physics, usePlane } from "@react-three/cannon";
import albumPictures from "../components/albumPictures";
import ImageCylinder from "../components/ImageCylinder";
import Loader from "../components/Loader";

function Ground() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#888888" opacity={0} />
    </mesh>
  );
}

const Home3D = () => {
  const cameraRef = useRef();
  const canvasRef = useRef();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePointerLock = () => {
      if (!document.pointerLockElement && canvasRef.current) {
        canvasRef.current.requestPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      if (!document.pointerLockElement && !loading) {
        navigate('/');
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'x' || e.key === 'X') {
        setShowPopup(false);
      } else if (e.key === 'h' || e.key === 'H') {
        setShowPopup(true);
      } else if (e.key === '1') {
        document.exitPointerLock();
        navigate('/');
      } else if (e.key === '2') {
        document.exitPointerLock();
        navigate('/audio-recorder');
      } else if (e.key === '3') {
        document.exitPointerLock();
        navigate('/about');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.exitPointerLock();
    };
  }, [navigate, loading]);

  const handleLoadingComplete = () => {
    setLoading(false);
    setShowPopup(true);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas 
        ref={canvasRef}
        onClick={(e) => {
          if (!document.pointerLockElement) {
            e.currentTarget.requestPointerLock();
          }
        }}
        shadows
        camera={{ position: [-3, 1.5, 3], fov: 45 }}
      >
        <Suspense fallback={<Loader onLoaded={handleLoadingComplete} />}>
          <Environment files={hdri} background={true} />
          <PerspectiveCamera ref={cameraRef} makeDefault position={[-3, 1.5, 3]} />
          <hemisphereLight intensity={0.5} />
          <ambientLight intensity={0.2} />
          <directionalLight
            position={[5, 10, 5]}
            intensity={1.5}
            castShadow
            shadow-bias={-0.0015}
            shadow-mapSize={[1024, 1024]}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <Physics gravity={[0, -9.81, 0]} defaultContactMaterial={{ restitution: 0.3 }}>
            <Ground />
            <ImageCylinder images={albumPictures} />
            <Konbini position={[0, 0, 0]} scale={[1, 1, 1]} rotation={[0, 0, 0]} />
            <MovementController cameraRef={cameraRef} />
          </Physics>
        </Suspense>
      </Canvas>
      {!loading && showPopup && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            right: "10%",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Info:</h2>
          <ul style={{ listStyleType: "none", padding: 0, lineHeight: "1.8" }}>
            <li>
              <strong>W</strong>: Move Forward
            </li>
            <li>
              <strong>A</strong>: Move Left
            </li>
            <li>
              <strong>S</strong>: Move Backward
            </li>
            <li>
              <strong>D</strong>: Move Right
            </li>
            <li>
              <strong>1</strong>: Go to Picture Recognizer
            </li>
            <li>
              <strong>2</strong>: Go to Audio Recognizer
            </li>
            <li>
              <strong>3</strong>: Go to About & Credit
            </li>
            <li>
              <strong>H</strong>: Show this popup
            </li>
            <li>
              <strong>X</strong>: Close this popup
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home3D;
