import React from 'react';
import * as THREE from 'three';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import albumPictures from './albumPictures';

function ImageCylinder({ images }) {
    const ref = useRef();
    const textures = useLoader(THREE.TextureLoader, images.map(img => img.imageSrc));

    useFrame(() => {
        ref.current.rotation.y += 0.001; // Adjust speed as needed
    });

    const maxImages = 50;
    const imagesToShow = Math.min(images.length, maxImages);
    const angleStep = (2 * Math.PI) / imagesToShow;
    const radius = 5;

    return (
        <group ref={ref}>
        {textures.slice(0, imagesToShow).map((texture, i) => {
            const angle = angleStep * i;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            return (
            <mesh
                key={i}
                position={[x, 0, z]}
                rotation={[0, -angle + Math.PI / 2, 0]}
            >
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
            </mesh>
            );
        })}
        </group>
    );
}

import { Suspense } from 'react';

function Scene() {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ImageCylinder images={albumPictures} />
        <OrbitControls />
      </Suspense>
    </Canvas>
  );
}


export default function App() {
  return (
    <div style={{ height: '100vh' }}>
      <Scene />
    </div>
  );
}
