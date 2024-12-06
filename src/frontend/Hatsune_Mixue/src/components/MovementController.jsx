import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import * as THREE from 'three';

const MovementController = ({ cameraRef }) => {
  const velocity = useRef({ x: 0, z: 0 });
  const direction = useRef({ yaw: 0, pitch: 0 });
  const speed = 0.02;
  const rotationSpeed = 0.0025;

  // const [ref, api] = useSphere(() => ({
  //   mass: 1,
  //   position: [0, 1, 5],
  //   args: 1,
  //   type: "Dynamic",
  // }));

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

  useFrame(() => {
    if (cameraRef.current) {

      {/* 
        Bro ini sumpah jadi Algeo quaternion, udh beda materi bjir wkwkwk
        Aku pusing mikirin quaternion, yaw, pitch, dll. Gak susah sih, cuman ya... :v
      */}

      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      euler.setFromQuaternion(cameraRef.current.quaternion);

      euler.y -= direction.current.yaw;

      euler.x -= direction.current.pitch;
      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));

      cameraRef.current.quaternion.setFromEuler(euler);

      direction.current.yaw = 0;
      direction.current.pitch = 0;

      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
        cameraRef.current.quaternion
      );
      const rightMovement = new THREE.Vector3(1, 0, 0).applyQuaternion(
        cameraRef.current.quaternion
      );

      // //Gravity
      // const force = new THREE.Vector3();
      // force.addScaledVector(forward, velocity.current.z);
      // force.addScaledVector(rightMovement, velocity.current.x);
      // api.velocity.set(force.x, api.velocity.current[1], force.z);

      cameraRef.current.position.addScaledVector(forward, velocity.current.z);
      cameraRef.current.position.addScaledVector(rightMovement, velocity.current.x);
    }
  });

  return ( null
    // <mesh ref={ref}>
    //   <sphereBufferGeometry args={[1, 32, 32]} />
    //   <meshStandardMaterial transparent opacity={0} />
    // </mesh>
  );
};

export default MovementController;
