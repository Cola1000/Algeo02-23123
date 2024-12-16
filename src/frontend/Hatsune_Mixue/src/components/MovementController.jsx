// src/components/MovementController.jsx
import { useFrame } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// This controller is mostly unchanged, but we will keep it as is.
// It handles movement and mouse look. Pressing keys 1,2,3 is handled in Home3D.
const MovementController = ({ cameraRef }) => {
  const direction = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    yaw: 0,
    pitch: 0,
  });

  const rotationSpeed = 0.002;
  const movementSpeed = 10;

  const [ref, api] = useSphere(() => ({
    mass: 1,
    position: [0, 1.6, 0],
    args: [0.5],
    fixedRotation: true,
    material: { friction: 0.1, restitution: 0 },
  }));

  const currentVelocity = useRef([0, 0, 0]);

  useEffect(() => {
    const unsubscribe = api.velocity.subscribe((v) => {
      currentVelocity.current = v;
    });
    return unsubscribe;
  }, [api.velocity]);

  useEffect(() => {
    if (!cameraRef.current) return;

    const onKeyDown = (e) => {
      switch (e.code) {
        case "KeyW":
          direction.current.forward = true;
          break;
        case "KeyS":
          direction.current.backward = true;
          break;
        case "KeyA":
          direction.current.left = true;
          break;
        case "KeyD":
          direction.current.right = true;
          break;
        default:
          break;
      }
    };

    const onKeyUp = (e) => {
      switch (e.code) {
        case "KeyW":
          direction.current.forward = false;
          break;
        case "KeyS":
          direction.current.backward = false;
          break;
        case "KeyA":
          direction.current.left = false;
          break;
        case "KeyD":
          direction.current.right = false;
          break;
        default:
          break;
      }
    };

    const onMouseMove = (e) => {
      if (!document.pointerLockElement) return;

      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      direction.current.yaw -= movementX * rotationSpeed;
      direction.current.pitch -= movementY * rotationSpeed;
      direction.current.pitch = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, direction.current.pitch)
      );

      const euler = new THREE.Euler(
        direction.current.pitch,
        direction.current.yaw,
        0,
        "YXZ"
      );
      cameraRef.current.quaternion.setFromEuler(euler);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [cameraRef]);

  useFrame((state, delta) => {
    if (!cameraRef.current || !ref.current) return;

    const cameraDirection = new THREE.Vector3();
    cameraRef.current.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();

    const moveX = direction.current.right - direction.current.left;
    const moveZ = direction.current.forward - direction.current.backward;

    const moveVector = new THREE.Vector3(moveX, 0, moveZ);

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      const desiredDirection = new THREE.Vector3()
        .copy(cameraDirection)
        .multiplyScalar(moveVector.z * movementSpeed)
        .addScaledVector(cameraRight, moveVector.x * movementSpeed);

      api.velocity.set(desiredDirection.x, currentVelocity.current[1], desiredDirection.z);
    } else {
      api.velocity.set(0, currentVelocity.current[1], 0);
    }

    const position = new THREE.Vector3();
    ref.current.getWorldPosition(position);
    cameraRef.current.position.lerp(
      new THREE.Vector3(position.x, position.y + 1.5, position.z),
      0.1
    );
  });

  return (
    <mesh ref={ref} visible={false}>
      <sphereGeometry args={[0.5]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
};

export default MovementController;
