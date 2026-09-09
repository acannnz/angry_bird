import React, { useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { Html } from '@react-three/drei'
import { useGameStore } from '../../store/useGameStore'
import { sfx } from '../../utils/soundEffects'

// Algoritma Liang-Barsky untuk mendeteksi perpotongan garis ledakan dengan kotak balok 2D
function lineIntersectsBox(p1, p2, boxPos, boxSize) {
  const minX = boxPos[0] - boxSize[0] / 2
  const maxX = boxPos[0] + boxSize[0] / 2
  const minY = boxPos[1] - boxSize[1] / 2
  const maxY = boxPos[1] + boxSize[1] / 2

  const dx = p2.x - p1.x
  const dy = p2.y - p1.y

  let t0 = 0.0
  let t1 = 1.0

  const p = [-dx, dx, -dy, dy]
  const q = [p1.x - minX, maxX - p1.x, p1.y - minY, maxY - p1.y]

  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false
    } else {
      const t = q[i] / p[i]
      if (p[i] < 0) {
        if (t > t1) return false
        if (t > t0) t0 = t
      } else {
        if (t < t0) return false
        if (t < t1) t1 = t
      }
    }
  }
  return t0 <= t1 && t0 < 0.95 && t1 > 0.05
}

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
  const pierceCount = useRef(0)

  // Visual states
  const [skillText, setSkillText] = useState(null)
  const [isBoosting, setIsBoosting] = useState(false)
  const [shockwaveRadius, setShockwaveRadius] = useState(null)
  const [isExploded, setIsExploded] = useState(false)
  const [explosionPos, setExplosionPos] = useState(null)

  // Sub-proyektil untuk The Blues (split) dan Matilda (egg bomb)
  const [subProjectiles, setSubProjectiles] = useState([])

  const radius = birdData?.radius || 0.45
  const mass = birdData?.mass || 3.5
  const birdType = birdData?.type || 'standard'

  // Kecepatan awal terkalibrasi santai & natural di bidang Z = 0
  const vx = initialVelocity?.x ?? (initialImpulse ? initialImpulse.x / mass : 12)
  const vy = initialVelocity?.y ?? (initialImpulse ? initialImpulse.y / mass : 6.5)

  // SKILL: Bomb Ledakan AOE dengan Kalkulasi Redaman Rintangan (Blast Occlusion)
  const triggerBombExplosion = useCallback(() => {
    if (hasTriggeredSkill.current || !rigidBodyRef.current) return
    hasTriggeredSkill.current = true

    try {
      const pos = rigidBodyRef.current.translation()
      const blastCenter = { x: pos.x, y: pos.y, z: 0 }
      setExplosionPos([blastCenter.x, blastCenter.y, 0])
      setIsExploded(true)
      setSkillText('💥 BOOM!')
      setShockwaveRadius(0.5)
      sfx.playExplosion()

      const explosionRadius = 4.6

      // Animasi gelombang kejut shockwave
      let currentRadius = 0.5
      const interval = setInterval(() => {
        currentRadius += 0.8
        if (currentRadius > explosionRadius) {
          clearInterval(interval)
          setShockwaveRadius(null)
        } else {
          setShockwaveRadius(currentRadius)
        }
      }, 30)

      // Fungsi menghitung rasio transmisi daya ledak setelah melewati rintangan
      const calculateTransmission = (targetCenter) => {
        let transmission = 1.0
        structures.forEach((block) => {
          if (block.destroyed) return
          if (lineIntersectsBox(blastCenter, targetCenter, block.position, block.size)) {
            // Batu menyerap 75% ledakan, kayu 45%, es 15%
            const absorption = block.type === 'stone' ? 0.75 : block.type === 'wood' ? 0.45 : 0.15
            transmission *= (1 - absorption)
          }
        })
        return transmission
      }

      // Hitung kerusakan balok rintangan berdasarkan jarak & redaman
      structures.forEach((block) => {
        if (block.destroyed) return
        const [bx, by, bz] = block.position
        const dist = Math.hypot(bx - blastCenter.x, by - blastCenter.y, bz - blastCenter.z)
        if (dist < explosionRadius) {
          const transmission = calculateTransmission({ x: bx, y: by })
          const baseBlockDamage = 220
          const falloff = 1 - dist / explosionRadius
          const damage = Math.floor(baseBlockDamage * falloff * transmission)
          if (damage > 10) {
            damageBlock(block.id, damage)
          }
        }
      })

      // Hitung kerusakan musuh babi (tidak tembus bebas membabi buta)
      targets.forEach((target) => {
        if (target.destroyed) return
        const [tx, ty, tz] = target.position
        const dist = Math.hypot(tx - blastCenter.x, ty - blastCenter.y, tz - blastCenter.z)
        if (dist < explosionRadius) {
          const transmission = calculateTransmission({ x: tx, y: ty })
          const baseTargetDamage = 135
          const falloff = 1 - dist / explosionRadius
          const damage = Math.floor(baseTargetDamage * falloff * transmission)

          if (damage > 12) {
            damageTarget(target.id, damage)
          }
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
    pierceCount.current = 0

    try {
      sfx.playSpeedBoost()
      setIsBoosting(true)
      setSkillText('🚀 SPEED BOOST!')
      setTimeout(() => setSkillText(null), 1500)

      const vel = rigidBodyRef.current.linvel()
      const dir = new THREE.Vector3(vel.x, vel.y, 0).normalize()
      if (dir.length() < 0.1 || dir.x <= 0) {
        dir.set(1, 0.1, 0).normalize()
      }

      // Kecepatan boost seimbang & terarah dengan daya tebas tajam
      const boostedSpeed = 26.0
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

      rigidBodyRef.current.applyImpulse({ x: 14, y: 5, z: 0 }, true)
    } catch (e) {}
  }, [])

  // SKILL: The Blues Tri-Split
  const triggerBluesSplit = useCallback(() => {
    if (hasTriggeredSkill.current || !rigidBodyRef.current) return
    hasTriggeredSkill.current = true

    try {
      sfx.playTriSplit()
      setSkillText('🔹 TRI-SPLIT!')
      setTimeout(() => setSkillText(null), 1200)

      const pos = rigidBodyRef.current.translation()
      const vel = rigidBodyRef.current.linvel()

      // Burung utama sedikit diarahkan lurus
      rigidBodyRef.current.setLinvel({ x: vel.x * 1.05, y: vel.y, z: 0 }, true)

      // Tambahkan 2 sub-burung ke atas dan ke bawah
      setSubProjectiles([
        {
          id: 'blue_top',
          type: 'split_child',
          pos: [pos.x, pos.y + 0.35, 0],
          vel: [vel.x * 1.05, vel.y + 3.4, 0],
          radius: radius * 0.9,
          color: '#38bdf8'
        },
        {
          id: 'blue_bottom',
          type: 'split_child',
          pos: [pos.x, pos.y - 0.35, 0],
          vel: [vel.x * 1.05, vel.y - 3.4, 0],
          radius: radius * 0.9,
          color: '#38bdf8'
        }
      ])
    } catch (e) {}
  }, [radius])

  // SKILL: Matilda Egg Drop
  const triggerMatildaEggDrop = useCallback(() => {
    if (hasTriggeredSkill.current || !rigidBodyRef.current) return
    hasTriggeredSkill.current = true

    try {
      sfx.playEggDrop()
      setSkillText('🥚 EGG BOMB!')
      setTimeout(() => setSkillText(null), 1200)

      const pos = rigidBodyRef.current.translation()
      const vel = rigidBodyRef.current.linvel()

      // Matilda melambung ke kanan atas
      rigidBodyRef.current.setLinvel({ x: Math.max(vel.x + 3.0, 8.0), y: Math.max(vel.y + 9.0, 9.0), z: 0 }, true)

      // Telur dijatuhkan tegak lurus dengan kecepatan jatuh tinggi
      setSubProjectiles([
        {
          id: 'matilda_egg',
          type: 'egg_bomb',
          pos: [pos.x, pos.y - 0.55, 0],
          vel: [vel.x * 0.25, -15.0, 0],
          radius: 0.32,
          color: '#ffffff'
        }
      ])
    } catch (e) {}
  }, [])

  // SKILL: Hal Boomerang
  const triggerHalBoomerang = useCallback(() => {
    if (hasTriggeredSkill.current || !rigidBodyRef.current) return
    hasTriggeredSkill.current = true

    try {
      sfx.playBoomerang()
      setSkillText('🪃 BOOMERANG!')
      setTimeout(() => setSkillText(null), 1500)

      const vel = rigidBodyRef.current.linvel()
      // Hal berbalik arah melesat ke belakang (kiri)
      rigidBodyRef.current.setLinvel({ x: -Math.abs(vel.x) * 1.35, y: vel.y + 3.8, z: 0 }, true)
    } catch (e) {}
  }, [])

  // Handler benturan untuk sub-proyektil (The Blues split & Egg Bomb)
  const handleSubProjectileCollision = useCallback((subId, subType, event) => {
    if (subType === 'egg_bomb') {
      sfx.playExplosion()
      // Ledakan telur Matilda
      let impactPos = null
      try {
        if (event.target) {
          impactPos = event.target.translation()
        }
      } catch (e) {}

      const blastX = impactPos?.x ?? 0
      const blastY = impactPos?.y ?? 0

      // AOE ledakan telur radius 3.2
      structures.forEach((b) => {
        if (b.destroyed) return
        const dist = Math.hypot(b.position[0] - blastX, b.position[1] - blastY)
        if (dist < 3.2) {
          damageBlock(b.id, Math.floor(180 * (1 - dist / 3.2)))
        }
      })
      targets.forEach((t) => {
        if (t.destroyed) return
        const dist = Math.hypot(t.position[0] - blastX, t.position[1] - blastY)
        if (dist < 3.2) {
          damageTarget(t.id, Math.floor(120 * (1 - dist / 3.2)))
        }
      })

      // Hapus telur setelah meledak
      setSubProjectiles((prev) => prev.filter((p) => p.id !== subId))
    } else {
      // Sub-burung The Blues menabrak balok es/kayu atau babi
      const otherData = event.other?.rigidBodyObject?.userData || event.other?.rigidBody?.userData
      if (otherData?.id && !otherData?.isPig) {
        // Menghantam balok
        if (otherData.blockType === 'ice') {
          damageBlock(otherData.id, 65)
          try { sfx.playHit('ice', 2.0) } catch (e) {}
        } else if (otherData.blockType === 'wood') {
          damageBlock(otherData.id, 35)
          try { sfx.playHit('wood', 1.0) } catch (e) {}
        } else if (otherData.blockType === 'stone') {
          damageBlock(otherData.id, 15)
          try { sfx.playHit('stone', 1.0) } catch (e) {}
        }
      } else if (otherData?.isPig && otherData?.targetId) {
        // Menghantam babi secara langsung
        damageTarget(otherData.targetId, 45)
        try { sfx.playPigSqueal() } catch (e) {}
      } else {
        // Fallback radius jika userData tidak langsung terdeteksi
        let impactPos = null
        try {
          if (event.target) impactPos = event.target.translation()
        } catch (e) {}
        if (impactPos) {
          structures.forEach((b) => {
            if (!b.destroyed && Math.hypot(b.position[0] - impactPos.x, b.position[1] - impactPos.y) < 1.4) {
              const dmg = b.type === 'ice' ? 65 : b.type === 'wood' ? 35 : 15
              damageBlock(b.id, dmg)
            }
          })
          targets.forEach((t) => {
            if (!t.destroyed && Math.hypot(t.position[0] - impactPos.x, t.position[1] - impactPos.y) < 1.2) {
              damageTarget(t.id, 45)
            }
          })
        }
      }

      setSubProjectiles((prev) => prev.filter((p) => p.id !== subId))
    }
  }, [structures, targets, damageBlock, damageTarget])

  // Handler benturan proyektil utama burung dengan balok / lingkungan (khusus Chuck piercing & material handling)
  const handleBirdCollision = useCallback((event) => {
    if (birdType !== 'speedy' || !rigidBodyRef.current) return
    const blockData = event.other?.rigidBodyObject?.userData || event.other?.rigidBody?.userData

    if (isBoosting) {
      if (blockData?.blockType === 'wood' || blockData?.blockType === 'ice') {
        if (pierceCount.current < 3) {
          pierceCount.current += 1
          try {
            const vel = rigidBodyRef.current.linvel()
            // Menembus balok kayu/es: dorong terus maju dengan momentum potong tajam
            const remainingSpeed = Math.max(13.0, 25.0 - pierceCount.current * 4.0)
            const dirX = vel.x >= 0 ? 1 : -1
            rigidBodyRef.current.setLinvel(
              { x: dirX * Math.max(Math.abs(vel.x), remainingSpeed), y: vel.y * 0.75, z: 0 },
              true
            )
            sfx.playHit(blockData.blockType, 2.5)
          } catch (e) {}
        } else {
          // Batasan tercapai: setelah menembus hingga 3 balok, dorongan habis dan kembali ke fisika normal
          setIsBoosting(false)
        }
      } else if (blockData?.blockType === 'stone') {
        // Balok batu kokoh: langsung menghentikan dorongan Chuck dan memantulkannya
        setIsBoosting(false)
      }
    }
  }, [birdType, isBoosting])

  const activateBirdSkill = useCallback(() => {
    if (hasTriggeredSkill.current || hasSettled.current || isExploded) return

    if (birdType === 'speedy') {
      triggerChuckSpeedBoost()
    } else if (birdType === 'heavy') {
      triggerBombExplosion()
    } else if (birdType === 'split') {
      triggerBluesSplit()
    } else if (birdType === 'egg_drop') {
      triggerMatildaEggDrop()
    } else if (birdType === 'boomerang') {
      triggerHalBoomerang()
    } else if (birdType === 'crusher') {
      // Terence tidak perlu skill manual, memiliki momentum penghancur pasif
      setSkillText('💥 TITAN CRUSHER!')
      setTimeout(() => setSkillText(null), 1000)
    } else {
      triggerRedBattleCry()
    }
  }, [birdType, isExploded, triggerChuckSpeedBoost, triggerBombExplosion, triggerBluesSplit, triggerMatildaEggDrop, triggerHalBoomerang, triggerRedBattleCry])

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
      if (elapsed > 1800 && speed < 0.35) {
        hasSettled.current = true
        birdSettled()
      } else if (pos.y < -2.5 || pos.x > 38 || elapsed > 9000) {
        hasSettled.current = true
        birdSettled()
      }
    } catch (e) {}
  })

  return (
    <group>
      {/* Shockwave Ledakan Bomb */}
      {shockwaveRadius && explosionPos && (
        <mesh position={explosionPos}>
          <sphereGeometry args={[shockwaveRadius, 24, 24]} />
          <meshBasicMaterial
            color="#f97316"
            transparent
            opacity={Math.max(0, 0.7 - shockwaveRadius / 5.0)}
            wireframe={true}
          />
        </mesh>
      )}

      {/* Sub-proyektil aktif (The Blues split atau Matilda Egg Bomb) */}
      {subProjectiles.map((sub) => (
        <RigidBody
          key={sub.id}
          position={sub.pos}
          linearVelocity={sub.vel}
          enabledTranslations={[true, true, false]}
          enabledRotations={[false, false, true]}
          colliders="ball"
          mass={sub.type === 'egg_bomb' ? 3.0 : 1.8}
          restitution={0.3}
          userData={{ isBird: true, birdType: sub.type === 'egg_bomb' ? 'egg' : 'split', isSubBird: true }}
          onCollisionEnter={(e) => handleSubProjectileCollision(sub.id, sub.type, e)}
        >
          <mesh castShadow>
            {sub.type === 'egg_bomb' ? (
              <sphereGeometry args={[sub.radius, 16, 16]} />
            ) : (
              <sphereGeometry args={[sub.radius, 16, 16]} />
            )}
            <meshStandardMaterial
              color={sub.color}
              roughness={0.3}
              metalness={sub.type === 'egg_bomb' ? 0.2 : 0.05}
            />
          </mesh>
        </RigidBody>
      ))}

      {/* Proyektil Utama Burung */}
      <RigidBody
        ref={rigidBodyRef}
        position={[initialPosition.x, initialPosition.y, 0]}
        enabledTranslations={[true, true, false]} // Kunci Z = 0
        enabledRotations={[false, false, true]}
        linearVelocity={[vx, vy, 0]}
        colliders="ball"
        mass={mass}
        restitution={birdType === 'speedy' && isBoosting ? 0.05 : 0.35}
        friction={0.7}
        ccd={true}
        userData={{
          isBird: true,
          birdType: birdType,
          isBoosting: isBoosting
        }}
        onCollisionEnter={handleBirdCollision}
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
            {/* Badan Burung berdasarkan Tipe */}
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

            {/* Paruh Burung (Khusus Hal / Boomerang paruh lebih panjang & melengkung) */}
            <mesh
              position={[radius * (birdType === 'boomerang' ? 1.3 : 0.9), 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
              castShadow
            >
              {birdType === 'boomerang' ? (
                <coneGeometry args={[radius * 0.45, radius * 1.5, 12]} />
              ) : (
                <coneGeometry args={[radius * 0.35, radius * 0.7, 12]} />
              )}
              <meshStandardMaterial color="#f97316" roughness={0.3} />
            </mesh>

            {/* Mata Kiri & Kanan */}
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

            {/* Alis Marah */}
            <mesh position={[radius * 0.75, radius * 0.5, 0]} rotation={[0, 0, -0.2]}>
              <boxGeometry args={[0.08, 0.08, radius * (birdType === 'crusher' ? 1.2 : 0.9)]} />
              <meshStandardMaterial color="#111827" />
            </mesh>

            {/* Sumbu Bom jika tipe Heavy */}
            {birdType === 'heavy' && (
              <mesh position={[0, radius * 0.95, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.3, 8]} />
                <meshStandardMaterial color="#f59e0b" />
              </mesh>
            )}

            {/* Jambul Matilda */}
            {birdType === 'egg_drop' && (
              <mesh position={[-radius * 0.4, radius * 0.85, 0]} rotation={[0, 0, 0.3]}>
                <coneGeometry args={[0.12, 0.4, 8]} />
                <meshStandardMaterial color="#1f2937" />
              </mesh>
            )}
          </group>
        </group>
      </RigidBody>
    </group>
  )
}
