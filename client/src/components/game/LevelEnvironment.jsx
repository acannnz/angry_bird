import React from 'react'
import { RigidBody } from '@react-three/rapier'
import { Sky } from '@react-three/drei'

export function LevelEnvironment() {
  return (
    <group>
      {/* Langit */}
      <Sky
        distance={450000}
        sunPosition={[50, 40, 30]}
        inclination={0.6}
        azimuth={0.25}
        turbidity={8}
        rayleigh={0.5}
      />

      {/* Pencahayaan Utama */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[25, 35, 20]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={20}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-bias={-0.0005}
      />
      <hemisphereLight skyColor="#bae6fd" groundColor="#3f6212" intensity={0.4} />

      {/* Lantai / Ground Statis Berfisika */}
      <RigidBody type="fixed" friction={0.8} restitution={0.2}>
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[140, 1, 80]} />
          <meshStandardMaterial color="#65a30d" roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* Lapisan Tanah Bawah */}
      <mesh position={[0, -4.5, 0]}>
        <boxGeometry args={[140, 7, 80]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>

      {/* Bukit Latar Belakang */}
      <mesh position={[-15, 3, -15]} rotation={[0, 0.4, 0]}>
        <coneGeometry args={[18, 12, 5]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.9} />
      </mesh>
      <mesh position={[10, 4, -18]} rotation={[0, -0.3, 0]}>
        <coneGeometry args={[22, 14, 6]} />
        <meshStandardMaterial color="#3f6212" roughness={0.9} />
      </mesh>
      <mesh position={[32, 2, -14]}>
        <coneGeometry args={[14, 10, 5]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.9} />
      </mesh>

      {/* Beberapa Pohon Kartun Estetik */}
      <CartoonTree position={[-13, 0, -2]} />
      <CartoonTree position={[-11, 0, -4]} />
      <CartoonTree position={[14, 0, -3]} />
      <CartoonTree position={[18, 0, 2]} />
    </group>
  )
}

function CartoonTree({ position }) {
  return (
    <group position={position}>
      {/* Batang */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* Daun Bertingkat */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[1.4, 1.6, 8]} />
        <meshStandardMaterial color="#22c55e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow>
        <coneGeometry args={[1.0, 1.4, 8]} />
        <meshStandardMaterial color="#4ade80" roughness={0.6} />
      </mesh>
    </group>
  )
}
