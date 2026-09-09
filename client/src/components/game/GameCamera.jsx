import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../../store/useGameStore'

export function GameCamera() {
  const { camera } = useThree()
  const cameraMode = useGameStore((state) => state.cameraMode)
  const activeBirdPosition = useGameStore((state) => state.activeBirdPosition)
  const levelData = useGameStore((state) => state.levelData)

  const currentLookAt = useRef(new THREE.Vector3(0, 2.0, 0))
  const targetCamPos = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const lerpSpeed = Math.min(1, delta * 3.5)

    if (cameraMode === 'FOLLOW' && activeBirdPosition) {
      // Mengikuti burung melayang
      targetCamPos.current.set(
        activeBirdPosition.x - 4,
        Math.max(2.5, activeBirdPosition.y + 2.0),
        11
      )
      targetLookAt.current.set(
        activeBirdPosition.x + 3,
        Math.max(1, activeBirdPosition.y),
        activeBirdPosition.z
      )
    } else if (cameraMode === 'OVERVIEW') {
      // Mengamati runtuhnya struktur target
      targetCamPos.current.set(5.5, 5.0, 16)
      targetLookAt.current.set(5.5, 2.5, 0)
    } else {
      // Mode AIM (Membidik ketapel)
      const aimPos = levelData.cameraAimPos || [-4, 3.5, 14]
      const aimTarget = levelData.cameraTargetPos || [0, 2.5, 0]
      targetCamPos.current.set(aimPos[0], aimPos[1], aimPos[2])
      targetLookAt.current.set(aimTarget[0], aimTarget[1], aimTarget[2])
    }

    // Interpolasi posisi kamera
    camera.position.lerp(targetCamPos.current, lerpSpeed)

    // Interpolasi fokus lookAt
    currentLookAt.current.lerp(targetLookAt.current, lerpSpeed)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
