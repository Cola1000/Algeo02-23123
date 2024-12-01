// MovementController.jsx
import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

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

export default MovementController;