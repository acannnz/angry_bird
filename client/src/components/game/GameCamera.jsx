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
      // Mengikuti burung melayang dengan batas pandang aman agar tidak melihat void/sky kosong
      const clampedX = Math.max(-12.0, Math.min(36.0, activeBirdPosition.x))
      const clampedY = Math.max(1.0, Math.min(15.0, activeBirdPosition.y))
      targetCamPos.current.set(
        clampedX - 4,
        Math.max(2.8, clampedY + 2.0),
        isMobile ? 13.5 : 12.0
      )
      targetLookAt.current.set(
        clampedX + 3,
        Math.max(1.8, clampedY),
        0
      )
    } else if (cameraMode === 'OVERVIEW') {
      // Mengamati runtuhnya struktur target dengan posisi proporsional dan lantai terlihat jelas
      const overviewX = isMobile ? 5.5 : 5.0
      const overviewY = isMobile ? 4.2 : 3.8
      const overviewZ = isMobile ? 18.0 : 15.5
      targetCamPos.current.set(overviewX, overviewY, overviewZ)
      targetLookAt.current.set(5.0, 2.2, 0)
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
