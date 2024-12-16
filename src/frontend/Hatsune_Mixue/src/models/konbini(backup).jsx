import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useTrimesh } from '@react-three/cannon';

import konbini_backup from '../assets/konbini.glb'

export function Konbini (props) {
  const { nodes, materials } = useGLTF(konbini_backup)

  return (
    <group {...props}>
      <group position={[0.001, -0.004, 0.004]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube002.geometry}
          material={materials.Colors}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube002_1.geometry}
          material={materials.Windows}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube002_2.geometry}
          material={materials.ColorDark}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube002_3.geometry}
          material={materials['7/11 Green']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube002_4.geometry}
          material={materials['7Eleven Red']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube002_5.geometry}
          material={materials['7Eleven Orange']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube002_6.geometry}
          material={materials.sign_light}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cube002_7.geometry}
          material={materials.light}
        />
      </group>
      <group position={[0, 11.931, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.L_Outside.geometry}
          material={materials.Colors}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.L_Outside_1.geometry}
          material={materials.Windows}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.L_Outside_2.geometry}
          material={materials.ColorDark}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.L_Outside_3.geometry}
          material={materials.Alarm}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.L_Outside_4.geometry}
          material={materials.sign_light}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.L_Outside_5.geometry}
          material={materials['Lawson Red']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.L_Outside_6.geometry}
          material={materials.light}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.L_Outside_7.geometry}
          material={materials['Rhio Algeo']}
        />
      </group>
      <group position={[4.872, 0.541, 2.294]} scale={[0.042, 0.519, 0.042]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder001.geometry}
          material={materials.Sign_Post}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder001_1.geometry}
          material={materials.Sign}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text.geometry}
          material={materials.Text}
          position={[1.726, 0.815, -0.037]}
          rotation={[Math.PI / 2, 0, -2.007]}
          scale={[10.377, 10.377, 0.84]}
        />
      </group>
      <group
        position={[4.774, 6.524, -1.494]}
        rotation={[0, -1.134, 0]}
        scale={[0.042, 0.519, 0.042]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder002.geometry}
          material={materials.Sign_Post}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder002_1.geometry}
          material={materials.Sign}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text001.geometry}
          material={materials.Text}
          position={[1.584, 0.819, -0.29]}
          rotation={[Math.PI / 2, 0, -2.007]}
          scale={[10.377, 10.377, 0.84]}
        />
      </group>
      <group
        position={[-4.453, 12.614, 3.467]}
        rotation={[0, 0.445, 0]}
        scale={[0.042, 0.519, 0.042]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder003.geometry}
          material={materials.Sign_Post}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder003_1.geometry}
          material={materials.Sign}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text002.geometry}
          material={materials.Text}
          position={[1.584, 0.768, -0.29]}
          rotation={[Math.PI / 2, 0, -2.007]}
          scale={[8.427, 8.427, 0.682]}
        />
      </group>
      <group
        position={[6.383, 12.614, -6.153]}
        rotation={[Math.PI, -0.643, Math.PI]}
        scale={[0.042, 0.519, 0.042]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder004.geometry}
          material={materials.Sign_Post}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Cylinder004_1.geometry}
          material={materials.Sign}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Text003.geometry}
          material={materials.Text}
          position={[1.584, 0.768, -0.29]}
          rotation={[Math.PI / 2, 0, -2.007]}
          scale={[8.427, 8.427, 0.682]}
        />
      </group>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Rafael_Lanjar.geometry}
        material={materials['Rafael Lanjar']}
        position={[1.384, 1.779, 4.433]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={1.872}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube015.geometry}
        material={materials.Colors}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube015_1.geometry}
        material={materials.Windows}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube015_2.geometry}
        material={materials.ColorDark}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube015_3.geometry}
        material={materials.Alarm}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube015_4.geometry}
        material={materials.sign_light}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube015_5.geometry}
        material={materials['Famima Green']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube015_6.geometry}
        material={materials['Famima Blue']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube015_7.geometry}
        material={materials.light}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube015_8.geometry}
        material={materials['Weka Image']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube052.geometry}
        material={materials.Colors}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube052_1.geometry}
        material={materials.Windows}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube052_2.geometry}
        material={materials.ColorDark}
      />
    </group>
  )
}

export default Konbini