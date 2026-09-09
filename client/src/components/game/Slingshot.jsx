import React, { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useGameStore } from '../../store/useGameStore'
import { sfx } from '../../utils/soundEffects'

export function Slingshot({ onLaunch }) {
  const { camera, raycaster, gl } = useThree()
  const levelData = useGameStore((state) => state.levelData)
  const currentBird = useGameStore((state) => state.currentBird)
  const gameStatus = useGameStore((state) => state.gameStatus)
  const pullOffset = useGameStore((state) => state.pullOffset)
  const startPull = useGameStore((state) => state.startPull)
  const updatePull = useGameStore((state) => state.updatePull)
  const launchBird = useGameStore((state) => state.launchBird)

  const [slingX, slingY, slingZ] = levelData.slingshot.position
  const maxRadius = levelData.slingshot.maxPullRadius || 2.5
  const forceFactor = levelData.slingshot.forceFactor || 28.0

  // Titik ujung cabang ketapel (dilebarkan dan ditinggikan agar proporsional dan tidak menusuk burung)
  const leftProng = useMemo(() => new THREE.Vector3(slingX, slingY + 2.1, slingZ - 0.7), [slingX, slingY, slingZ])
  const rightProng = useMemo(() => new THREE.Vector3(slingX, slingY + 2.1, slingZ + 0.7), [slingX, slingY, slingZ])
  
  // Titik istirahat burung di tengah bantalan ketapel
  const restCenter = useMemo(() => new THREE.Vector3(slingX, slingY + 1.7, slingZ), [slingX, slingY, slingZ])

  // Bidang virtual untuk drag raycasting (sumbu Z terkunci di 0)
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -slingZ), [slingZ])
  const intersectionPoint = useRef(new THREE.Vector3())

  const isDraggingRef = useRef(false)
  const pullOffsetRef = useRef([0, 0, 0])

  // Posisi burung saat ditarik
  const birdPos = useMemo(() => {
    return new THREE.Vector3(
      restCenter.x + pullOffset[0],
      restCenter.y + pullOffset[1],
      restCenter.z + pullOffset[2]
    )
  }, [restCenter, pullOffset])

  // Posisi kantong kulit (pouch) di belakang burung
  const pouchPos = useMemo(() => {
    return new THREE.Vector3(
      birdPos.x - 0.15,
      birdPos.y,
      birdPos.z
    )
  }, [birdPos])

  // Garis tali karet elastis kiri dan kanan
  const leftBandCurve = useMemo(() => [leftProng, pouchPos], [leftProng, pouchPos])
  const rightBandCurve = useMemo(() => [rightProng, pouchPos], [rightProng, pouchPos])

  const handlePointerDown = (e) => {
    if (useGameStore.getState().gameStatus !== 'READY') return
    e.stopPropagation()
    isDraggingRef.current = true
    pullOffsetRef.current = [0, 0, 0]
    startPull()
    sfx.playPull(0.5)
  }

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return

      const rect = gl.domElement.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera({ x, y }, camera)

      if (raycaster.ray.intersectPlane(dragPlane, intersectionPoint.current)) {
        const hit = intersectionPoint.current
        let dx = hit.x - restCenter.x
        let dy = hit.y - restCenter.y
        let dz = 0

        // Batasi tarikan ke arah belakang
        if (dx > 0.2) dx = 0.2

        const distance = Math.hypot(dx, dy)
        if (distance > maxRadius) {
          const ratio = maxRadius / distance
          dx *= ratio
          dy *= ratio
        }

        pullOffsetRef.current = [dx, dy, dz]
        updatePull([dx, dy, dz], Math.hypot(dx, dy) / maxRadius)
        sfx.playPull(Math.hypot(dx, dy))
      }
    }

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false

      const [ox, oy, oz] = pullOffsetRef.current
      const dist = Math.hypot(ox, oy, oz)

      if (dist > 0.25) {
        const birdMass = currentBird?.mass || 3.0
        const impulse = new THREE.Vector3(
          -ox * forceFactor,
          -oy * forceFactor,
          0
        )

        const initialVelocity = new THREE.Vector3(
          impulse.x / birdMass,
          impulse.y / birdMass,
          0
        )

        const launchPos = new THREE.Vector3(
          restCenter.x + ox,
          restCenter.y + oy,
          0
        )

        launchBird(impulse)

        if (onLaunch) {
          onLaunch(launchPos, impulse, initialVelocity)
        }
      } else {
        pullOffsetRef.current = [0, 0, 0]
        updatePull([0, 0, 0], 0)
        useGameStore.setState({ isDragging: false, gameStatus: 'READY' })
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [restCenter, maxRadius, forceFactor, currentBird, camera, raycaster, gl, dragPlane, onLaunch, launchBird, updatePull])

  return (
    <group>
      {/* Pondasi Dudukan Kayu di Tanah */}
      <mesh position={[slingX, slingY - 0.2, slingZ]} receiveShadow>
        <cylinderGeometry args={[0.65, 0.8, 0.4, 16]} />
        <meshStandardMaterial color="#5c3817" roughness={0.9} />
      </mesh>

      {/* Batang Utama Tiang Ketapel */}
      <mesh position={[slingX, slingY + 0.6, slingZ]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.28, 1.4, 14]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>

      {/* Cabang Garpu Kiri (Melengkung ke kiri & atas secara estetik) */}
      <mesh position={[slingX, slingY + 1.6, slingZ - 0.38]} rotation={[0.42, 0, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 1.1, 12]} />
        <meshStandardMaterial color="#6b3410" roughness={0.7} />
      </mesh>

      {/* Cabang Garpu Kanan (Melengkung ke kanan & atas secara estetik) */}
      <mesh position={[slingX, slingY + 1.6, slingZ + 0.38]} rotation={[-0.42, 0, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.2, 1.1, 12]} />
        <meshStandardMaterial color="#6b3410" roughness={0.7} />
      </mesh>

      {/* Ujung Tiang Penjepit Karet Kiri & Kanan */}
      <mesh position={[leftProng.x, leftProng.y, leftProng.z]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#5c2d0c" roughness={0.8} />
      </mesh>
      <mesh position={[rightProng.x, rightProng.y, rightProng.z]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#5c2d0c" roughness={0.8} />
      </mesh>

      {/* Tali Karet Elastis Kiri */}
      <mesh>
        <tubeGeometry
          args={[new THREE.CatmullRomCurve3(leftBandCurve), 8, 0.045, 6, false]}
        />
        <meshStandardMaterial color="#991b1b" roughness={0.3} />
      </mesh>

      {/* Tali Karet Elastis Kanan */}
      <mesh>
        <tubeGeometry
          args={[new THREE.CatmullRomCurve3(rightBandCurve), 8, 0.045, 6, false]}
        />
        <meshStandardMaterial color="#991b1b" roughness={0.3} />
      </mesh>

      {/* Kantong Kulit (Leather Pouch) Penampung Burung */}
      <mesh
        position={[pouchPos.x, pouchPos.y, pouchPos.z]}
        castShadow
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[0.25, 0.7, 0.8]} />
        <meshStandardMaterial color="#451a03" roughness={0.8} />
      </mesh>

      {/* Karakter Burung di Bantalan Ketapel */}
      {(gameStatus === 'READY' || gameStatus === 'AIMING') && currentBird && (
        <group position={[birdPos.x, birdPos.y, birdPos.z]}>
          {/* Grab Area (Diperluas untuk kemudahan sentuhan mobile) */}
          <mesh visible={false} onPointerDown={handlePointerDown}>
            <sphereGeometry args={[currentBird.radius * 3.8, 12, 12]} />
            <meshBasicMaterial />
          </mesh>

          {/* Badan Burung */}
          <mesh castShadow onPointerDown={handlePointerDown}>
            {currentBird.type === 'speedy' ? (
              <coneGeometry args={[currentBird.radius * 1.1, currentBird.radius * 1.6, 16]} rotation={[0, 0, -Math.PI / 2]} />
            ) : (
              <sphereGeometry args={[currentBird.radius, 24, 24]} />
            )}
            <meshStandardMaterial
              color={currentBird.color}
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>

          {/* Paruh Burung */}
          <mesh position={[currentBird.radius * 0.9, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <coneGeometry args={[currentBird.radius * 0.35, currentBird.radius * 0.7, 12]} />
            <meshStandardMaterial color="#f97316" roughness={0.3} />
          </mesh>

          {/* Mata */}
          <mesh position={[currentBird.radius * 0.7, currentBird.radius * 0.3, -currentBird.radius * 0.35]}>
            <sphereGeometry args={[currentBird.radius * 0.22, 12, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[currentBird.radius * 0.85, currentBird.radius * 0.3, -currentBird.radius * 0.35]}>
            <sphereGeometry args={[currentBird.radius * 0.1, 10, 10]} />
            <meshStandardMaterial color="#000000" />
          </mesh>

          <mesh position={[currentBird.radius * 0.7, currentBird.radius * 0.3, currentBird.radius * 0.35]}>
            <sphereGeometry args={[currentBird.radius * 0.22, 12, 12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[currentBird.radius * 0.85, currentBird.radius * 0.3, currentBird.radius * 0.35]}>
            <sphereGeometry args={[currentBird.radius * 0.1, 10, 10]} />
            <meshStandardMaterial color="#000000" />
          </mesh>

          {/* Alis Marah */}
          <mesh position={[currentBird.radius * 0.75, currentBird.radius * 0.5, 0]} rotation={[0, 0, -0.2]}>
            <boxGeometry args={[0.08, 0.08, currentBird.radius * 0.9]} />
            <meshStandardMaterial color="#111827" />
          </mesh>

          {/* Sumbu Bom jika tipe Heavy */}
          {currentBird.type === 'heavy' && (
            <mesh position={[0, currentBird.radius * 0.95, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
          )}
        </group>
      )}
    </group>
  )
}
