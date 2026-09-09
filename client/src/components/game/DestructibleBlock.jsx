import React, { useRef, useMemo, useState } from 'react'
import * as THREE from 'three'
import { RigidBody } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import { useGameStore } from '../../store/useGameStore'

const MATERIAL_PROPERTIES = {
  wood: {
    color: '#b45309',
    hitColor: '#fef08a',
    badgeBg: 'bg-amber-600',
    roughness: 0.6,
    metalness: 0.05,
    mass: 2.2,
    restitution: 0.2,
    friction: 0.6,
    minImpact: 1.8,
    damageMultiplier: 18,
    opacity: 1.0,
    transparent: false,
    shatterText: '🪵 CRACK!'
  },
  stone: {
    color: '#64748b',
    hitColor: '#f1f5f9',
    badgeBg: 'bg-slate-600',
    roughness: 0.9,
    metalness: 0.1,
    mass: 6.5,
    restitution: 0.1,
    friction: 0.85,
    minImpact: 2.8,
    damageMultiplier: 12,
    opacity: 1.0,
    transparent: false,
    shatterText: '🪨 SMASH!'
  },
  ice: {
    color: '#67e8f9',
    hitColor: '#ffffff',
    badgeBg: 'bg-cyan-500',
    roughness: 0.15,
    metalness: 0.05,
    mass: 0.8,
    restitution: 0.3,
    friction: 0.15,
    minImpact: 1.2,
    damageMultiplier: 26,
    opacity: 0.75,
    transparent: true,
    shatterText: '❄️ SHATTER!'
  }
}

export function DestructibleBlock({ id, type = 'wood', size = [1, 1, 1], position = [0, 0, 0], hp = 100 }) {
  const rigidBodyRef = useRef()
  const damageBlock = useGameStore((state) => state.damageBlock)
  const gameStatus = useGameStore((state) => state.gameStatus)
  const mountTime = useRef(performance.now())

  const isDestroyed = useGameStore((state) => {
    const b = state.structures.find((s) => s.id === id)
    return b ? b.destroyed : false
  })
  const currentHp = useGameStore((state) => {
    const b = state.structures.find((s) => s.id === id)
    return b ? b.currentHp : hp
  })

  // State efek visual
  const [hitFlash, setHitFlash] = useState(false)
  const [floatingDamage, setFloatingDamage] = useState(null)

  const matProps = MATERIAL_PROPERTIES[type] || MATERIAL_PROPERTIES.wood

  // Edges geometry untuk visual batas sudut balok
  const edgesGeom = useMemo(() => {
    const box = new THREE.BoxGeometry(size[0], size[1], size[2])
    return new THREE.EdgesGeometry(box)
  }, [size])

  const lastCollisionTime = useRef(0)

  // Event tabrakan dengan deteksi kecepatan impak
  const handleCollision = (event) => {
    if (isDestroyed) return
    const now = performance.now()
    if (now - mountTime.current < 1800) return
    // Kunci stabilisasi awal: jangan kurangi HP balok saat burung belum diluncurkan
    if (gameStatus === 'READY') return
    // Cegah getaran mikro beruntun tiap frame yang melipatgandakan damage/skor
    if (now - lastCollisionTime.current < 180) return

    let impactSpeed = 0

    if (event.other?.rigidBody) {
      try {
        const vel = event.other.rigidBody.linvel()
        impactSpeed = Math.hypot(vel.x, vel.y, vel.z)
      } catch (e) {}
    }

    if (rigidBodyRef.current) {
      try {
        const myVel = rigidBodyRef.current.linvel()
        impactSpeed = Math.max(impactSpeed, Math.hypot(myVel.x, myVel.y, myVel.z))
      } catch (e) {}
    }

    // Cek apakah balok ditabrak oleh burung tertentu (seperti Chuck si kuning)
    const birdUserData = event.other?.rigidBodyObject?.userData || event.other?.rigidBody?.userData
    let damageMultiplier = matProps.damageMultiplier
    let effectiveMinImpact = matProps.minImpact

    if (birdUserData?.isBird && birdUserData.birdType === 'speedy') {
      if (type === 'wood') {
        // Chuck sangat kuat memotong dan meremukkan kayu
        damageMultiplier = birdUserData.isBoosting ? 52 : 28
        effectiveMinImpact = 1.0
      } else if (type === 'ice') {
        // Chuck dengan mudah memecahkan es/kaca
        damageMultiplier = birdUserData.isBoosting ? 44 : 32
        effectiveMinImpact = 0.8
      } else if (type === 'stone') {
        // Chuck lemah saat berbenturan dengan batu
        damageMultiplier = 6
        effectiveMinImpact = 2.4
      }
    }

    if (impactSpeed > effectiveMinImpact) {
      lastCollisionTime.current = now
      const damage = Math.max(15, Math.floor(impactSpeed * damageMultiplier))

      setHitFlash(true)
      setTimeout(() => setHitFlash(false), 180)

      const isCritical = impactSpeed > 4.5 || currentHp - damage <= 0
      setFloatingDamage({
        text: isCritical ? matProps.shatterText : `-${damage}`,
        id: Date.now()
      })
      setTimeout(() => setFloatingDamage(null), 1000)

      damageBlock(id, damage)
    }
  }

  if (isDestroyed) {
    return null
  }

  const hpRatio = Math.max(0.2, currentHp / hp)

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[position[0], position[1], 0]} // Selalu di Z = 0
      enabledTranslations={[true, true, false]} // KUNCI SUMBU Z: Balok runtuh di bidang layar tanpa terlempar ke latar belakang
      enabledRotations={[false, false, true]}
      colliders="cuboid"
      mass={matProps.mass}
      restitution={matProps.restitution}
      friction={matProps.friction}
      userData={{ id, blockType: type, currentHp }}
      onCollisionEnter={handleCollision}
    >
      {/* Floating Damage & Durability Indicator */}
      <Html
        position={[0, size[1] / 2 + 0.35, 0]}
        center
        distanceFactor={18}
        className="pointer-events-none select-none"
      >
        <div className="flex flex-col items-center gap-0.5">
          {floatingDamage && (
            <div
              className={`animate-bounce font-black text-[11px] px-2 py-0.5 rounded-full text-white shadow-lg border border-white/80 whitespace-nowrap scale-110 ${matProps.badgeBg}`}
            >
              {floatingDamage.text}
            </div>
          )}

          {currentHp < hp && (
            <div className="w-10 h-1.5 rounded-full bg-slate-950/90 border border-slate-700/80 p-0.5 overflow-hidden shadow">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  hpRatio > 0.5 ? 'bg-amber-400' : 'bg-red-500'
                }`}
                style={{ width: `${hpRatio * 100}%` }}
              />
            </div>
          )}
        </div>
      </Html>

      {/* Mesh Balok */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={hitFlash ? matProps.hitColor : matProps.color}
          roughness={hitFlash ? 0.1 : matProps.roughness}
          metalness={hitFlash ? 0.3 : matProps.metalness}
          transparent={matProps.transparent || hpRatio < 0.9}
          opacity={matProps.transparent ? 0.75 : hpRatio < 0.5 ? 0.8 : 1.0}
        />
      </mesh>

      {/* Rangka tepi balok */}
      <lineSegments geometry={edgesGeom}>
        <lineBasicMaterial
          color={hitFlash ? '#ffffff' : '#0f172a'}
          transparent
          opacity={hitFlash ? 0.8 : 0.35}
        />
      </lineSegments>
    </RigidBody>
  )
}
