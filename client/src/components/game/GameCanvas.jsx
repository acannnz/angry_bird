import React, { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useGameStore } from '../../store/useGameStore'
import { LevelEnvironment } from './LevelEnvironment'
import { Slingshot } from './Slingshot'
import { TrajectoryLine } from './TrajectoryLine'
import { Projectile } from './Projectile'
import { DestructibleBlock } from './DestructibleBlock'
import { Enemy } from './Enemy'
import { GameCamera } from './GameCamera'

export function GameCanvas() {
  const currentLevelIdx = useGameStore((state) => state.currentLevelIdx)
  const resetKey = useGameStore((state) => state.resetKey)
  const structures = useGameStore((state) => state.structures)
  const targets = useGameStore((state) => state.targets)
  const birdQueue = useGameStore((state) => state.birdQueue)
  const gameStatus = useGameStore((state) => state.gameStatus)
  const levelData = useGameStore((state) => state.levelData)

  // State untuk proyektil aktif yang sedang meluncur
  const [activeProjectile, setActiveProjectile] = useState(null)

  const handleLaunch = useCallback((launchPos, impulse, velocity) => {
    setActiveProjectile({
      id: Date.now(),
      pos: launchPos,
      impulse: impulse,
      velocity: velocity,
      birdData: birdQueue[0]
    })
  }, [birdQueue])

  // Bersihkan proyektil aktif saat ganti giliran atau level di-reset
  useEffect(() => {
    if (gameStatus === 'READY') {
      setActiveProjectile(null)
    }
  }, [gameStatus, resetKey])

  const [slingX, slingY, slingZ] = levelData.slingshot.position

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [-4, 3.5, 14], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <GameCamera />

        {/* Gunakan resetKey agar seluruh dunia fisika dan posisi balok/babi di-reset total tanpa sisa */}
        <Physics key={resetKey} gravity={[0, -9.81, 0]}>
          <LevelEnvironment />

          {/* Ketapel & Burung Siap */}
          <Slingshot onLaunch={handleLaunch} />
          <TrajectoryLine />

          {/* Burung Aktif yang Dilontarkan */}
          {activeProjectile && (
            <Projectile
              key={activeProjectile.id}
              initialPosition={activeProjectile.pos}
              initialImpulse={activeProjectile.impulse}
              initialVelocity={activeProjectile.velocity}
              birdData={activeProjectile.birdData}
            />
          )}

          {/* Balok Rintangan Berdasarkan Data Level */}
          {structures.map((block) => (
            <DestructibleBlock
              key={`${resetKey}-${block.id}`}
              id={block.id}
              type={block.type}
              size={block.size}
              position={block.position}
              hp={block.hp}
            />
          ))}

          {/* Target Musuh (Babi) dengan Indikator Hit & Damage */}
          {targets.map((target) => (
            <Enemy
              key={`${resetKey}-${target.id}`}
              id={target.id}
              type={target.type}
              position={target.position}
              radius={target.radius}
              hp={target.hp}
            />
          ))}

          {/* Barisan Burung Cadangan di Belakang Ketapel */}
          {birdQueue.slice(1).map((bird, idx) => (
            <group
              key={bird.id || idx}
              position={[slingX - 1.5 - idx * 1.0, slingY, slingZ + (idx % 2 === 0 ? 0.3 : -0.3)]}
            >
              <mesh castShadow>
                <sphereGeometry args={[bird.radius, 16, 16]} />
                <meshStandardMaterial color={bird.color} roughness={0.4} />
              </mesh>
            </group>
          ))}
        </Physics>
      </Canvas>
    </div>
  )
}
