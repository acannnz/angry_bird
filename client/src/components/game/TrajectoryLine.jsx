import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useGameStore } from '../../store/useGameStore'

export function TrajectoryLine() {
  const isDragging = useGameStore((state) => state.isDragging)
  const pullOffset = useGameStore((state) => state.pullOffset)
  const levelData = useGameStore((state) => state.levelData)
  const currentBird = useGameStore((state) => state.currentBird)

  const points = useMemo(() => {
    if (!isDragging || !currentBird) return []

    const [ox, oy, oz] = pullOffset
    const pullDist = Math.hypot(ox, oy, oz)
    if (pullDist < 0.1) return []

    const startPos = new THREE.Vector3(
      levelData.slingshot.position[0] + ox,
      levelData.slingshot.position[1] + oy + 0.8,
      levelData.slingshot.position[2] + oz
    )

    // Arah berlawanan dengan tarikan
    const force = levelData.slingshot.forceFactor
    const mass = currentBird.mass || 3.0
    // Kecepatan awal v0 = impulse / mass = (-offset * force) / mass
    const v0 = new THREE.Vector3(-ox, -oy, -oz).multiplyScalar(force / mass)

    const gravity = -9.81
    const pts = []
    const stepTime = 0.05
    const maxSteps = 30

    for (let i = 0; i < maxSteps; i++) {
      const t = i * stepTime
      const x = startPos.x + v0.x * t
      const y = startPos.y + v0.y * t + 0.5 * gravity * t * t
      const z = startPos.z + v0.z * t

      if (y < 0) {
        pts.push(new THREE.Vector3(x, 0.05, z))
        break
      }
      pts.push(new THREE.Vector3(x, y, z))
    }

    return pts
  }, [isDragging, pullOffset, levelData, currentBird])

  if (!isDragging || points.length === 0) return null

  return (
    <group>
      {points.map((pt, idx) => (
        <mesh key={idx} position={[pt.x, pt.y, pt.z]}>
          <sphereGeometry args={[0.08 * (1 - (idx / points.length) * 0.5), 8, 8]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={Math.max(0.2, 0.85 - (idx / points.length) * 0.7)}
          />
        </mesh>
      ))}
    </group>
  )
}
