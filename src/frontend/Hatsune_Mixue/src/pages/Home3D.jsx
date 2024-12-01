import React, { useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Loader } from "@react-three/drei";
import Konbini from "../models/konbini(backup)"

const Home3D = () => {
  const cameraRef = useRef();

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            position={[0, 2, 5]}
          />
          <hemisphereLight/>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Konbini />
          <OrbitControls />
        </Suspense>
      </Canvas>

      <Loader containerStyles={{ position: "absolute", top: "0", left: "0" }} />
    </div>
  );
};

export default Home3D;