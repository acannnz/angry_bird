import React, { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useGameStore } from '../../store/useGameStore'

export function GameCamera() {
  const { camera, size } = useThree()
  const cameraMode = useGameStore((state) => state.cameraMode)
  const activeBirdPosition = useGameStore((state) => state.activeBirdPosition)
  const levelData = useGameStore((state) => state.levelData)

  const currentLookAt = useRef(new THREE.Vector3(0, 2.0, 0))
  const targetCamPos = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const lerpSpeed = Math.min(1, delta * 3.5)
    const isMobile = size.width < 960 || (size.width / Math.max(1, size.height)) < 1.75

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
      // Mode AIM (Membidik ketapel dengan jarak statis aman di tepi kiri layar)
      const aspect = Math.max(0.6, size.width / Math.max(1, size.height))
      const fovRad = ((camera.fov || 45) * Math.PI) / 180

      const slingX = levelData.slingshot?.position?.[0] ?? -9.0
      const baseZ = isMobile ? 18.0 : 16.2
      const halfHeight = baseZ * Math.tan(fovRad / 2)
      const halfWidth = halfHeight * aspect

      // Jarak statis minimal 3.8 unit di sebelah kiri ketapel agar tidak terpotong di tepi layar
      const safeLeftMargin = isMobile ? 4.2 : 3.8
      let lookAtX = (slingX - safeLeftMargin) + halfWidth

      // Batasi agar bidikan tetap proporsional menghadap struktur target
      lookAtX = Math.max(-2.5, Math.min(1.5, lookAtX))

      const camX = lookAtX - (isMobile ? 3.6 : 3.0)
      const camY = isMobile ? 3.8 : 3.5
      const lookAtY = 2.4

      targetCamPos.current.set(camX, camY, baseZ)
      targetLookAt.current.set(lookAtX, lookAtY, 0)
    }

    // Interpolasi posisi kamera
    camera.position.lerp(targetCamPos.current, lerpSpeed)

    // Interpolasi fokus lookAt
    currentLookAt.current.lerp(targetLookAt.current, lerpSpeed)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
