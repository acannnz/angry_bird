import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import { useGameStore } from '../../store/useGameStore'

export function Enemy({ id, type = 'standard_pig', position = [0, 0, 0], radius = 0.45, hp = 50 }) {
  const rigidBodyRef = useRef()
  const damageTarget = useGameStore((state) => state.damageTarget)
  const mountTime = useRef(performance.now())

  const isDestroyed = useGameStore((state) => {
    const t = state.targets.find((item) => item.id === id)
    return t ? t.destroyed : false
  })
  const currentHp = useGameStore((state) => {
    const t = state.targets.find((item) => item.id === id)
    return t ? t.currentHp : hp
  })

  // State indikator visual hit & damage
  const [hitEffect, setHitEffect] = useState(false)
  const [floatingDamage, setFloatingDamage] = useState(null)
  const [isSquished, setIsSquished] = useState(false)

  const activeContactsRef = useRef(new Map())
  const lastCrushCheck = useRef(0)
  const lastHitTime = useRef(0)

  // Deteksi jika babi jatuh dari platform atau tertindih balok berat di atasnya
  useFrame(() => {
    if (isDestroyed || !rigidBodyRef.current) return
    const now = performance.now()
    if (now - mountTime.current < 700) return

    let pigPos = null
    try {
      pigPos = rigidBodyRef.current.translation()
      if (pigPos.y < -0.2 || Math.abs(pigPos.z) > 4 || pigPos.x > 35) {
        damageTarget(id, 999)
        return
      }
    } catch (e) {
      return
    }

    // Pemeriksaan babi tertindih balok berat (Crush Damage Check setiap 380ms)
    if (now - lastCrushCheck.current > 380) {
      lastCrushCheck.current = now

      let totalOverheadMass = 0
      const toDelete = []

      activeContactsRef.current.forEach((_, otherBody) => {
        try {
          const otherPos = otherBody.translation()
          const dx = Math.abs(otherPos.x - pigPos.x)
          const dy = otherPos.y - pigPos.y
          const dz = Math.abs(otherPos.z - pigPos.z)

          // Jika objek berada di atas tubuh babi dan menekan
          if (dy > radius * 0.4 && dy < 3.0 && dx < 1.4 && dz < 1.2) {
            const bodyMass = typeof otherBody.mass === 'function' ? otherBody.mass() : 2.5
            totalOverheadMass += bodyMass
          } else if (Math.hypot(dx, dy, dz) > 3.5) {
            toDelete.push(otherBody)
          }
        } catch (e) {
          toDelete.push(otherBody)
        }
      })

      toDelete.forEach((body) => activeContactsRef.current.delete(body))

      if (totalOverheadMass > 1.2) {
        // Beban berat menindih babi!
        const crushDamage = Math.max(15, Math.floor(totalOverheadMass * 6.5))
        setIsSquished(true)
        setHitEffect(true)
        setTimeout(() => setHitEffect(false), 200)

        sfx.playPigSqueal()

        setFloatingDamage({
          text: '💥 TERTINDIH!',
          time: Date.now()
        })
        setTimeout(() => setFloatingDamage(null), 1000)

        damageTarget(id, crushDamage)
      } else {
        setIsSquished(false)
      }
    }
  })

  // Deteksi tabrakan fisik dengan pembatas throttle
  const handleCollision = (event) => {
    if (isDestroyed) return
    const now = performance.now()
    if (now - mountTime.current < 700) return

    if (event.other?.rigidBody) {
      activeContactsRef.current.set(event.other.rigidBody, now)
    }

    if (now - lastHitTime.current < 180) return

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

    if (impactSpeed > 1.4) {
      lastHitTime.current = now
      const damageAmount = impactSpeed > 3.8 ? hp : Math.max(20, Math.floor(impactSpeed * 12))

      setHitEffect(true)
      setTimeout(() => setHitEffect(false), 200)

      setFloatingDamage({
        text: impactSpeed > 3.8 ? '💥 POP!' : `-${damageAmount}`,
        time: Date.now()
      })
      setTimeout(() => setFloatingDamage(null), 1200)

      damageTarget(id, damageAmount)
    }
  }

  const handleCollisionExit = (event) => {
    if (event.other?.rigidBody) {
      activeContactsRef.current.delete(event.other.rigidBody)
    }
  }

  if (isDestroyed) {
    return null
  }

  const isKing = type === 'king_pig'
  const hpPercentage = Math.max(0, Math.min(100, (currentHp / hp) * 100))

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[position[0], position[1], 0]} // Selalu di Z = 0
      enabledTranslations={[true, true, false]} // KUNCI SUMBU Z: Babi tidak bisa menggelinding ke belakang/depan keluar jalur!
      enabledRotations={[false, false, true]} // Hanya boleh berputar di bidang layar
      colliders="ball"
      mass={1.8}
      restitution={0.35}
      friction={0.6}
      onCollisionEnter={handleCollision}
      onCollisionExit={handleCollisionExit}
    >
      {/* Indikator Health Bar & Floating Damage Text */}
      <Html
        position={[0, radius + 0.6, 0]}
        center
        distanceFactor={18}
        className="pointer-events-none select-none transition-all duration-200"
      >
        <div className="flex flex-col items-center gap-1">
          {floatingDamage && (
            <div className="animate-bounce font-black text-xs md:text-sm px-2 py-0.5 rounded-full bg-red-600 text-white shadow-lg shadow-red-500/50 border border-white/80 whitespace-nowrap scale-110">
              {floatingDamage.text}
            </div>
          )}

          {currentHp < hp && (
            <div className="w-12 h-2 rounded-full bg-slate-900/90 border border-slate-700/80 p-0.5 overflow-hidden shadow-md">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  hpPercentage > 50 ? 'bg-green-500' : hpPercentage > 25 ? 'bg-amber-400' : 'bg-red-500'
                }`}
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
          )}
        </div>
      </Html>

      <group scale={isSquished ? [1.22, 0.72, 1.22] : [1, 1, 1]}>
        {/* Badan Babi Hijau */}
        <mesh castShadow>
          <sphereGeometry args={[radius, 24, 24]} />
          <meshStandardMaterial
            color={hitEffect ? '#ef4444' : '#22c55e'}
            roughness={hitEffect ? 0.1 : 0.3}
            metalness={hitEffect ? 0.3 : 0.1}
          />
        </mesh>

        {/* Hidung / Snout */}
        <mesh position={[radius * 0.85, 0, 0]} castShadow>
          <cylinderGeometry args={[radius * 0.35, radius * 0.35, radius * 0.3, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={hitEffect ? '#b91c1c' : '#16a34a'} roughness={0.4} />
        </mesh>
        {/* Lubang Hidung */}
        <mesh position={[radius * 1.0, 0, -radius * 0.12]}>
          <sphereGeometry args={[radius * 0.08, 8, 8]} />
          <meshStandardMaterial color="#064e3b" />
        </mesh>
        <mesh position={[radius * 1.0, 0, radius * 0.12]}>
          <sphereGeometry args={[radius * 0.08, 8, 8]} />
          <meshStandardMaterial color="#064e3b" />
        </mesh>

        {/* Mata Besar Babi */}
        <mesh position={[radius * 0.7, radius * 0.35, -radius * 0.3]}>
          <sphereGeometry args={[radius * 0.25, 12, 12]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[radius * 0.88, radius * 0.35, -radius * 0.3]}>
          <sphereGeometry args={[radius * 0.12, 8, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        <mesh position={[radius * 0.7, radius * 0.35, radius * 0.3]}>
          <sphereGeometry args={[radius * 0.25, 12, 12]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[radius * 0.88, radius * 0.35, radius * 0.3]}>
          <sphereGeometry args={[radius * 0.12, 8, 8]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Telinga Kiri & Kanan */}
        <mesh position={[0, radius * 0.9, -radius * 0.5]} rotation={[0.2, 0, 0]} castShadow>
          <coneGeometry args={[radius * 0.2, radius * 0.4, 8]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
        <mesh position={[0, radius * 0.9, radius * 0.5]} rotation={[-0.2, 0, 0]} castShadow>
          <coneGeometry args={[radius * 0.2, radius * 0.4, 8]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>

        {/* Mahkota jika Raja Babi */}
        {isKing && (
          <mesh position={[0, radius * 1.15, 0]} castShadow>
            <cylinderGeometry args={[radius * 0.35, radius * 0.25, radius * 0.35, 6]} />
            <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.2} />
          </mesh>
        )}
      </group>
    </RigidBody>
  )
}
