import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function ImageCylinder({ images }) {
  const ref = useRef();
  const textures = useLoader(THREE.TextureLoader, images.map(img => img.imageSrc));

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001; // Adjust speed
    }
  });

  const maxImages = 50;
  const imagesToShow = Math.min(images.length, maxImages);
  const angleStep = (2 * Math.PI) / imagesToShow;
  const radius = 10; //Radius of Encirclement

  return (
    <group ref={ref}>
      {textures.slice(0, imagesToShow).map((texture, i) => {
        const angle = angleStep * i;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh
            key={i}
            position={[x, 3, z]}
            rotation={[0, angle - Math.PI / 2, 0]}
          >
            <planeGeometry args={[2, 2]} />
            <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

// Example of a standalone scene (if needed)
function Scene({ images }) {
  return (
    <Canvas>
      <React.Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ImageCylinder images={images} />
        <OrbitControls />
      </React.Suspense>
    </Canvas>
  );
}

export default ImageCylinder;