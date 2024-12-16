import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useSphere } from "@react-three/cannon";

const MovementController = ({ cameraRef }) => {
  // Store input states
  const direction = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    yaw: 0,
    pitch: 0,
  });

  const rotationSpeed = 0.002;
  const movementSpeed = 10; // Increased units per second

  // Initialize physics body
  const [ref, api] = useSphere(() => ({
    mass: 1, // Ensure the mass is non-zero
    position: [0, 1.6, 0],
    args: [0.5],
    fixedRotation: true,
    material: { friction: 0.1, restitution: 0 }, // Adjusted friction and restitution
  }));

  // Store current velocity
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

    // Calculate camera direction vectors
    const cameraDirection = new THREE.Vector3();
    cameraRef.current.getWorldDirection(cameraDirection);
    cameraDirection.y = 0; // Prevent movement in the Y-axis
    cameraDirection.normalize();

    const cameraRight = new THREE.Vector3();
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();

    // Determine movement input
    const moveX = direction.current.right - direction.current.left;
    const moveZ = direction.current.forward - direction.current.backward;

    const moveVector = new THREE.Vector3(moveX, 0, moveZ);

    if (moveVector.lengthSq() > 0) {
      // Normalize to prevent faster diagonal movement
      moveVector.normalize();

      // Calculate desired movement direction based on camera orientation
      const desiredDirection = new THREE.Vector3()
        .copy(cameraDirection)
        .multiplyScalar(moveVector.z * movementSpeed)
        .addScaledVector(cameraRight, moveVector.x * movementSpeed);

      // Set velocity directly
      api.velocity.set(desiredDirection.x, currentVelocity.current[1], desiredDirection.z);

      // Debugging
      console.log("Set Velocity:", [desiredDirection.x, currentVelocity.current[1], desiredDirection.z]);
    } else {
      // Stop horizontal movement
      api.velocity.set(0, currentVelocity.current[1], 0);
    }

    // Smoothly interpolate camera position
    const position = new THREE.Vector3();
    ref.current.getWorldPosition(position);
    cameraRef.current.position.lerp(
      new THREE.Vector3(position.x, position.y + 1.5, position.z),
      0.1
    );
  });

  // Return a visible mesh for debugging
  return (
    <mesh ref={ref} visible={true}> {/* Set visible to true for debugging */}
      <sphereGeometry args={[0.5]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
};

export default MovementController;