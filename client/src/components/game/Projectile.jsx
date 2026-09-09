import React, { useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import { useGameStore } from '../../store/useGameStore'
import { sfx } from '../../utils/soundEffects'

export function Projectile({ initialPosition, initialImpulse, initialVelocity, birdData }) {
  const rigidBodyRef = useRef()
  const setActiveBirdPosition = useGameStore((state) => state.setActiveBirdPosition)
  const birdSettled = useGameStore((state) => state.birdSettled)
  const damageBlock = useGameStore((state) => state.damageBlock)
  const damageTarget = useGameStore((state) => state.damageTarget)
  const structures = useGameStore((state) => state.structures)
  const targets = useGameStore((state) => state.targets)

  const launchTime = useRef(performance.now())
  const hasSettled = useRef(false)
  const initializedVel = useRef(false)
  const hasTriggeredSkill = useRef(false)

  // Visual states
  const [skillText, setSkillText] = useState(null)
  const [isBoosting, setIsBoosting] = useState(false)
  const [shockwaveRadius, setShockwaveRadius] = useState(null)
  const [isExploded, setIsExploded] = useState(false)
  const [explosionPos, setExplosionPos] = useState(null)

  const radius = birdData?.radius || 0.45
  const mass = birdData?.mass || 3.0
  const birdType = birdData?.type || 'standard'

  // Kecepatan awal pelontaran di bidang Z = 0
  const vx = initialVelocity?.x ?? (initialImpulse ? initialImpulse.x / mass : 14)
  const vy = initialVelocity?.y ?? (initialImpulse ? initialImpulse.y / mass : 7)
  const vz = 0

  // SKILL: Bomb Ledakan AOE (Hanya aktif saat pemain klik/tap manual)
  const triggerBombExplosion = useCallback(() => {
    if (hasTriggeredSkill.current || !rigidBodyRef.current) return
    hasTriggeredSkill.current = true

    try {
      const pos = rigidBodyRef.current.translation()
      const fixedPos = [pos.x, pos.y, 0]
      setExplosionPos(fixedPos)
      setIsExploded(true)
      setSkillText('💥 BOOM!')
      setShockwaveRadius(0.5)
      sfx.playExplosion()

      let currentRadius = 0.5
      const interval = setInterval(() => {
        currentRadius += 0.9
        if (currentRadius > 7.0) {
          clearInterval(interval)
          setShockwaveRadius(null)
        } else {
          setShockwaveRadius(currentRadius)
        }
      }, 30)

      const explosionRadius = 7.0
      structures.forEach((block) => {
        if (block.destroyed) return
        const [bx, by, bz] = block.position
        const dist = Math.hypot(bx - pos.x, by - pos.y, bz - pos.z)
        if (dist < explosionRadius) {
          const damage = Math.floor(260 * (1 - dist / explosionRadius))
          damageBlock(block.id, damage)
        }
      })

      targets.forEach((target) => {
        if (target.destroyed) return
        const [tx, ty, tz] = target.position
        const dist = Math.hypot(tx - pos.x, ty - pos.y, tz - pos.z)
        if (dist < explosionRadius) {
          damageTarget(target.id, 999)
        }
      })

      setTimeout(() => {
        if (!hasSettled.current) {
          hasSettled.current = true
          birdSettled()
        }
      }, 700)
    } catch (e) {
      console.warn('Explosion error handled:', e)
    }
  }, [structures, targets, damageBlock, damageTarget, birdSettled])

  // SKILL: Chuck Speed Boost
  const triggerChuckSpeedBoost = useCallback(() => {
    if (hasTriggeredSkill.current || !rigidBodyRef.current) return
    hasTriggeredSkill.current = true

    try {
      sfx.playSpeedBoost()
      setIsBoosting(true)
      setSkillText('🚀 SPEED BOOST!')
      setTimeout(() => setSkillText(null), 1500)

      const vel = rigidBodyRef.current.linvel()
      const dir = new THREE.Vector3(vel.x, vel.y, 0).normalize()
      if (dir.length() < 0.1 || dir.x <= 0) {
        dir.set(1, 0.15, 0).normalize()
      }

      const boostedSpeed = 38.0
      rigidBodyRef.current.setLinvel(
        { x: dir.x * boostedSpeed, y: dir.y * boostedSpeed, z: 0 },
        true
      )
    } catch (e) {}
  }, [])

  // SKILL: Red Battle Cry
  const triggerRedBattleCry = useCallback(() => {
    if (hasTriggeredSkill.current || !rigidBodyRef.current) return
    hasTriggeredSkill.current = true

    try {
      sfx.playBattleCry()
      setSkillText('💢 BATTLE CRY!')
      setTimeout(() => setSkillText(null), 1200)

      rigidBodyRef.current.applyImpulse({ x: 22, y: 8, z: 0 }, true)
    } catch (e) {}
  }, [])

  const activateBirdSkill = useCallback(() => {
    if (hasTriggeredSkill.current || hasSettled.current || isExploded) return

    if (birdType === 'speedy') {
      triggerChuckSpeedBoost()
    } else if (birdType === 'heavy') {
      triggerBombExplosion()
    } else {
      triggerRedBattleCry()
    }
  }, [birdType, isExploded, triggerChuckSpeedBoost, triggerBombExplosion, triggerRedBattleCry])

  useEffect(() => {
    const handleGlobalClick = () => {
      activateBirdSkill()
    }

    window.addEventListener('pointerdown', handleGlobalClick)
    return () => {
      window.removeEventListener('pointerdown', handleGlobalClick)
    }
  }, [activateBirdSkill])

  useFrame(() => {
    if (isExploded || !rigidBodyRef.current || hasSettled.current) return

    try {
      if (!initializedVel.current) {
        rigidBodyRef.current.wakeUp()
        rigidBodyRef.current.setLinvel({ x: vx, y: vy, z: 0 }, true)
        initializedVel.current = true
      }

      const pos = rigidBodyRef.current.translation()
      const linvel = rigidBodyRef.current.linvel()
      const speed = Math.hypot(linvel.x, linvel.y, linvel.z)

      setActiveBirdPosition(new THREE.Vector3(pos.x, pos.y, 0))

      const elapsed = performance.now() - launchTime.current
      if (elapsed > 2000 && speed < 0.4) {
        hasSettled.current = true
        birdSettled()
      } else if (pos.y < -2 || pos.x > 35 || elapsed > 8500) {
        hasSettled.current = true
        birdSettled()
      }
    } catch (e) {}
  })

  return (
    <group>
      {shockwaveRadius && explosionPos && (
        <mesh position={explosionPos}>
          <sphereGeometry args={[shockwaveRadius, 24, 24]} />
          <meshBasicMaterial
            color="#f97316"
            transparent
            opacity={Math.max(0, 0.75 - shockwaveRadius / 8)}
            wireframe={true}
          />
        </mesh>
      )}

      <RigidBody
        ref={rigidBodyRef}
        position={[initialPosition.x, initialPosition.y, 0]}
        enabledTranslations={[true, true, false]} // Kunci Z = 0
        enabledRotations={[false, false, true]}
        linearVelocity={[vx, vy, 0]}
        colliders="ball"
        mass={mass}
        restitution={0.35}
        friction={0.7}
        ccd={true}
      >
        <group visible={!isExploded}>
          {skillText && (
            <Html position={[0, radius + 0.8, 0]} center distanceFactor={18} className="pointer-events-none select-none">
              <div className="animate-bounce font-black text-xs md:text-sm px-3 py-1 rounded-full bg-amber-500 text-slate-950 border-2 border-white shadow-xl shadow-amber-500/50 whitespace-nowrap scale-125">
                {skillText}
              </div>
            </Html>
          )}

          <group>
            <mesh castShadow>
              {birdType === 'speedy' ? (
                <coneGeometry args={[radius * 1.1, radius * 1.6, 16]} rotation={[0, 0, -Math.PI / 2]} />
              ) : (
                <sphereGeometry args={[radius, 24, 24]} />
              )}
              <meshStandardMaterial
                color={isBoosting ? '#fef08a' : birdData?.color || '#dc2626'}
                roughness={0.4}
                metalness={0.1}
                emissive={isBoosting ? '#facc15' : '#000000'}
                emissiveIntensity={isBoosting ? 0.6 : 0}
              />
            </mesh>

            <mesh position={[radius * 0.9, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
              <coneGeometry args={[radius * 0.35, radius * 0.7, 12]} />
              <meshStandardMaterial color="#f97316" roughness={0.3} />
            </mesh>

            <mesh position={[radius * 0.7, radius * 0.3, -radius * 0.35]}>
              <sphereGeometry args={[radius * 0.22, 10, 10]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[radius * 0.85, radius * 0.3, -radius * 0.35]}>
              <sphereGeometry args={[radius * 0.1, 8, 8]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh position={[radius * 0.7, radius * 0.3, radius * 0.35]}>
              <sphereGeometry args={[radius * 0.22, 10, 10]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[radius * 0.85, radius * 0.3, radius * 0.35]}>
              <sphereGeometry args={[radius * 0.1, 8, 8]} />
              <meshStandardMaterial color="#000000" />
            </mesh>

            <mesh position={[radius * 0.75, radius * 0.5, 0]} rotation={[0, 0, -0.2]}>
              <boxGeometry args={[0.08, 0.08, radius * 0.9]} />
              <meshStandardMaterial color="#111827" />
            </mesh>

            {birdType === 'heavy' && (
              <mesh position={[0, radius * 0.95, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
            )}
          </group>
        </group>
      </RigidBody>
    </group>
  )
}
