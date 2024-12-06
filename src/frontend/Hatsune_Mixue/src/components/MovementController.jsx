import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSphere, Physics } from "@react-three/cannon";
import * as THREE from 'three';

const MovementController = ({ cameraRef }) => {
  const velocity = useRef({ x: 0, z: 0 });
  const direction = useRef({ yaw: 0, pitch: 0 });
  const speed = 3;
  const rotationSpeed = 0.005;

  // Create a dynamic sphere
  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [-3, 1.5, 3],
    args: [0.5], // sphere size (radius)
    type: "Dynamic",
  }));


  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "w") velocity.current.z = speed;
      if (e.key === "s") velocity.current.z = -speed;
      if (e.key === "a") velocity.current.x = -speed;
      if (e.key === "d") velocity.current.x = speed;
    };

    const onKeyUp = (e) => {
      if (e.key === "w" || e.key === "s") velocity.current.z = 0;
      if (e.key === "a" || e.key === "d") velocity.current.x = 0;
    };

    const onMouseMove = (e) => {
      direction.current.yaw = e.movementX * rotationSpeed;
      direction.current.pitch = e.movementY * rotationSpeed;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

      {/* Aku hapus komen pusing tentang quaternion disini :v */}

      useFrame(() => {
        if (cameraRef.current && ref.current) {

          const euler = new THREE.Euler(0, 0, 0, 'YXZ');
          euler.setFromQuaternion(cameraRef.current.quaternion);
          euler.y -= direction.current.yaw;
          euler.x -= direction.current.pitch;
          euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
          cameraRef.current.quaternion.setFromEuler(euler);
    
          direction.current.yaw = 0;
          direction.current.pitch = 0;
    
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cameraRef.current.quaternion);
          const rightMovement = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRef.current.quaternion);
    
          const moveX = (rightMovement.x * velocity.current.x) + (forward.x * velocity.current.z);
          const moveZ = (rightMovement.z * velocity.current.x) + (forward.z * velocity.current.z);
    
          // Set sphere's velocity on the XZ plane (Y is gravity)
          api.velocity.set(moveX, 0, moveZ);
    
          const spherePosition = ref.current.position;
          cameraRef.current.position.set(spherePosition.x, spherePosition.y + 1.5, spherePosition.z);
        }
      });

  return null;
};

export default MovementController;
