import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

import konbini_backup from '../assets/3d/tubes_algeo_backup.glb'

export function Konbini (props) {
  const { nodes, materials } = useGLTF(konbini_backup)
  return (
    <group {...props} dispose={null}>
      <group name="Scene">
        <group name="SevenEleven" userData={{ name: 'SevenEleven' }}>
          <mesh
            name="Cube002"
            castShadow
            receiveShadow
            geometry={nodes.Cube002.geometry}
            material={materials.Colors}
          />
          <mesh
            name="Cube002_1"
            castShadow
            receiveShadow
            geometry={nodes.Cube002_1.geometry}
            material={materials.Windows}
          />
          <mesh
            name="Cube002_2"
            castShadow
            receiveShadow
            geometry={nodes.Cube002_2.geometry}
            material={materials.ColorDark}
          />
          <mesh
            name="Cube002_3"
            castShadow
            receiveShadow
            geometry={nodes.Cube002_3.geometry}
            material={materials['7/11 Green']}
          />
          <mesh
            name="Cube002_4"
            castShadow
            receiveShadow
            geometry={nodes.Cube002_4.geometry}
            material={materials['7Eleven Red']}
          />
          <mesh
            name="Cube002_5"
            castShadow
            receiveShadow
            geometry={nodes.Cube002_5.geometry}
            material={materials['7Eleven Orange']}
          />
          <mesh
            name="Cube002_6"
            castShadow
            receiveShadow
            geometry={nodes.Cube002_6.geometry}
            material={materials.sign_light}
          />
          <mesh
            name="Cube002_7"
            castShadow
            receiveShadow
            geometry={nodes.Cube002_7.geometry}
            material={materials.light}
          />
        </group>
        <group name="Familymart" userData={{ name: 'Familymart' }}>
          <mesh
            name="Cube015"
            castShadow
            receiveShadow
            geometry={nodes.Cube015.geometry}
            material={materials.Colors}
          />
          <mesh
            name="Cube015_1"
            castShadow
            receiveShadow
            geometry={nodes.Cube015_1.geometry}
            material={materials.Windows}
          />
          <mesh
            name="Cube015_2"
            castShadow
            receiveShadow
            geometry={nodes.Cube015_2.geometry}
            material={materials.ColorDark}
          />
          <mesh
            name="Cube015_3"
            castShadow
            receiveShadow
            geometry={nodes.Cube015_3.geometry}
            material={materials.Alarm}
          />
          <mesh
            name="Cube015_4"
            castShadow
            receiveShadow
            geometry={nodes.Cube015_4.geometry}
            material={materials.sign_light}
          />
          <mesh
            name="Cube015_5"
            castShadow
            receiveShadow
            geometry={nodes.Cube015_5.geometry}
            material={materials['Famima Green']}
          />
          <mesh
            name="Cube015_6"
            castShadow
            receiveShadow
            geometry={nodes.Cube015_6.geometry}
            material={materials['Famima Blue']}
          />
          <mesh
            name="Cube015_7"
            castShadow
            receiveShadow
            geometry={nodes.Cube015_7.geometry}
            material={materials.light}
          />
        </group>
        <group name="Lawson" position={[0, 11.931, 0]} userData={{ name: 'Lawson' }}>
          <mesh
            name="L_Outside"
            castShadow
            receiveShadow
            geometry={nodes.L_Outside.geometry}
            material={materials.Colors}
          />
          <mesh
            name="L_Outside_1"
            castShadow
            receiveShadow
            geometry={nodes.L_Outside_1.geometry}
            material={materials.Windows}
          />
          <mesh
            name="L_Outside_2"
            castShadow
            receiveShadow
            geometry={nodes.L_Outside_2.geometry}
            material={materials.ColorDark}
          />
          <mesh
            name="L_Outside_3"
            castShadow
            receiveShadow
            geometry={nodes.L_Outside_3.geometry}
            material={materials.Alarm}
          />
          <mesh
            name="L_Outside_4"
            castShadow
            receiveShadow
            geometry={nodes.L_Outside_4.geometry}
            material={materials.sign_light}
          />
          <mesh
            name="L_Outside_5"
            castShadow
            receiveShadow
            geometry={nodes.L_Outside_5.geometry}
            material={materials['Lawson Red']}
          />
          <mesh
            name="L_Outside_6"
            castShadow
            receiveShadow
            geometry={nodes.L_Outside_6.geometry}
            material={materials.light}
          />
        </group>
        <group name="7_Outside002" userData={{ name: '7_Outside.002' }}>
          <mesh
            name="Cube052"
            castShadow
            receiveShadow
            geometry={nodes.Cube052.geometry}
            material={materials.Colors}
          />
          <mesh
            name="Cube052_1"
            castShadow
            receiveShadow
            geometry={nodes.Cube052_1.geometry}
            material={materials.Windows}
          />
          <mesh
            name="Cube052_2"
            castShadow
            receiveShadow
            geometry={nodes.Cube052_2.geometry}
            material={materials.ColorDark}
          />
        </group>
        <group
          name="Sign"
          position={[4.872, 0.541, 2.294]}
          scale={[0.042, 0.519, 0.042]}
          userData={{ name: 'Sign' }}>
          <mesh
            name="Cylinder001"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder001.geometry}
            material={materials.Sign_Post}
          />
          <mesh
            name="Cylinder001_1"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder001_1.geometry}
            material={materials.Sign}
          />
          <mesh
            name="Text"
            castShadow
            receiveShadow
            geometry={nodes.Text.geometry}
            material={materials.Text}
            position={[1.726, 0.815, -0.037]}
            rotation={[Math.PI / 2, 0, -2.007]}
            scale={[10.377, 10.377, 0.84]}
            userData={{ name: 'Text' }}
          />
        </group>
        <group
          name="Sign001"
          position={[4.774, 6.524, -1.494]}
          rotation={[0, -1.134, 0]}
          scale={[0.042, 0.519, 0.042]}
          userData={{ name: 'Sign.001' }}>
          <mesh
            name="Cylinder002"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder002.geometry}
            material={materials.Sign_Post}
          />
          <mesh
            name="Cylinder002_1"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder002_1.geometry}
            material={materials.Sign}
          />
        </group>
        <mesh
          name="Text001"
          castShadow
          receiveShadow
          geometry={nodes.Text001.geometry}
          material={materials.Text}
          position={[4.814, 6.949, -1.439]}
          rotation={[Math.PI / 2, 0, -0.873]}
          scale={0.436}
          userData={{ name: 'Text.001' }}
        />
        <group
          name="Sign002"
          position={[-4.453, 12.614, 3.467]}
          rotation={[0, 0.445, 0]}
          scale={[0.042, 0.519, 0.042]}
          userData={{ name: 'Sign.002' }}>
          <mesh
            name="Cylinder003"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder003.geometry}
            material={materials.Sign_Post}
          />
          <mesh
            name="Cylinder003_1"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder003_1.geometry}
            material={materials.Sign}
          />
        </group>
        <mesh
          name="Text002"
          castShadow
          receiveShadow
          geometry={nodes.Text002.geometry}
          material={materials.Text}
          position={[-4.398, 13.012, 3.428]}
          rotation={[Math.PI / 2, 0, -2.452]}
          scale={0.354}
          userData={{ name: 'Text.002' }}
        />
        <group
          name="Sign003"
          position={[6.383, 12.614, -6.153]}
          rotation={[Math.PI, -0.643, Math.PI]}
          scale={[0.042, 0.519, 0.042]}
          userData={{ name: 'Sign.003' }}>
          <mesh
            name="Cylinder004"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder004.geometry}
            material={materials.Sign_Post}
          />
          <mesh
            name="Cylinder004_1"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder004_1.geometry}
            material={materials.Sign}
          />
        </group>
        <mesh
          name="Text003"
          castShadow
          receiveShadow
          geometry={nodes.Text003.geometry}
          material={materials.Text}
          position={[6.337, 13.012, -6.103]}
          rotation={[Math.PI / 2, 0, 0.491]}
          scale={0.354}
          userData={{ name: 'Text.003' }}
        />
      </group>
    </group>
  )
}

export default Konbini