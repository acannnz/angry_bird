import React, { useState, useCallback, useEffect, Component } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { useGameStore } from '../../store/useGameStore'
import { LevelEnvironment, GroundCollider } from './LevelEnvironment'
import { Slingshot } from './Slingshot'
import { TrajectoryLine } from './TrajectoryLine'
import { Projectile } from './Projectile'
import { DestructibleBlock } from './DestructibleBlock'
import { Enemy } from './Enemy'
import { GameCamera } from './GameCamera'

// Error boundary: jika Rapier/Physics crash, otomatis reset level agar tidak stuck layar biru
class PhysicsErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error, info) {
    console.warn('Physics crash caught, auto-resetting:', error?.message)
  }
  componentDidUpdate(prevProps) {
    // Reset error state ketika resetKey berubah (level di-reset/ganti)
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }
  render() {
    if (this.state.hasError) {
      // Trigger auto-reset setelah crash terdeteksi
      if (this.props.onError) {
        setTimeout(() => this.props.onError(), 0)
      }
      return null
    }
    return this.props.children
  }
}

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

  // Bersihkan proyektil aktif saat ganti giliran, menang, atau level di-reset
  useEffect(() => {
    if (gameStatus === 'READY' || gameStatus === 'WON' || gameStatus === 'VICTORY_WATCH') {
      setActiveProjectile(null)
    }
  }, [gameStatus, resetKey])

  const [slingX, slingY, slingZ] = levelData.slingshot.position

  // Auto-reset level saat Physics crash agar tidak stuck layar biru
  const handlePhysicsError = useCallback(() => {
    useGameStore.getState().resetLevel()
  }, [])

  return (
    <div className="relative w-full h-full">
      <Canvas
        shadows
        camera={{ position: [-4, 3.5, 14], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <GameCamera />

        {/* Lingkungan visual (langit, lampu, bukit, pohon) di luar Physics agar tidak ter-remount saat reset */}
        <LevelEnvironment />

        {/* Gunakan resetKey agar seluruh dunia fisika dan posisi balok/babi di-reset total tanpa sisa */}
        <PhysicsErrorBoundary resetKey={resetKey} onError={handlePhysicsError}>
        <Physics key={resetKey} gravity={[0, -9.81, 0]}>
          {/* Lantai berfisika (collider statis) */}
          <GroundCollider />

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
        </PhysicsErrorBoundary>
      </Canvas>
    </div>
  )
}
