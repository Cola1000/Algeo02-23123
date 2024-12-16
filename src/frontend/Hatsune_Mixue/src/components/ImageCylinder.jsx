// src/components/ImageCylinder.jsx
import React, { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function ImageCylinder({ images }) {
  const ref = useRef();
  const textures = useLoader(THREE.TextureLoader, images.map(img => img.imageSrc));

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.001; 
    }
  });

  const maxImages = 50;
  const imagesToShow = Math.min(images.length, maxImages);
  const angleStep = (2 * Math.PI) / imagesToShow;
  const radius = 10;

  return (
    <group ref={ref}>
      {textures.slice(0, imagesToShow).map((texture, i) => {
        const angle = angleStep * i;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        // Make sure the images face inward by rotating them towards the center
        return (
          <mesh
            key={i}
            position={[x, 3, z]}
            rotation={[0, angle + Math.PI / 2, 0]} // rotate so that they face inward the cylinder
          >
            <planeGeometry args={[2, 2]} />
            <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

export default ImageCylinder;
