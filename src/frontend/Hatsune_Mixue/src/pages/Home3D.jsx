import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, PerspectiveCamera } from "@react-three/drei";

// Component to handle WASD camera movement
const MovementController = ({ cameraRef }) => {
  const velocity = useRef({ x: 0, z: 0 });
  const speed = 0.1;

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "w") velocity.current.z = -speed;
      if (e.key === "s") velocity.current.z = speed;
      if (e.key === "a") velocity.current.x = -speed;
      if (e.key === "d") velocity.current.x = speed;
    };

    const onKeyUp = (e) => {
      if (e.key === "w" || e.key === "s") velocity.current.z = 0;
      if (e.key === "a" || e.key === "d") velocity.current.x = 0;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.position.x += velocity.current.x;
      cameraRef.current.position.z += velocity.current.z;
    }
  });

  return null;
};

// Main 3D Scene
const Scene = () => {
  const cameraRef = useRef();

  return (
    <>
      <PerspectiveCamera ref={cameraRef} position={[0, 2, 5]} makeDefault />
      <MovementController cameraRef={cameraRef} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Model />
    </>
  );
};

// Load the 3D model
const Model = () => {
  const { scene } = useGLTF("/assets/model.glb"); // Path to 3D model ()
  return <primitive object={scene} />;
};

// Main Home3D Component
const Home3D = () => {
  return (
    <Canvas>
      <Scene />
      <OrbitControls />
    </Canvas>
  );
};

export default Home3D;