import { create } from 'zustand'
import { LEVELS_DATA } from '../data/levels'
import { sfx } from '../utils/soundEffects'
import confetti from 'canvas-confetti'

export const useGameStore = create((set, get) => ({
  // Level & status
  currentLevelIdx: 0,
  levelData: LEVELS_DATA[0],
  resetKey: 1,
  gameStatus: 'READY', // 'READY' | 'AIMING' | 'FLYING' | 'SETTLING' | 'VICTORY_WATCH' | 'WON' | 'LOST'
  cameraMode: 'AIM', // 'AIM' | 'FOLLOW' | 'OVERVIEW'

  // Skor & Bonus
  score: 0,
  baseScore: 0,
  birdBonus: 0,
  remainingBirdsCount: 0,
  highScore: parseInt(localStorage.getItem('angry_birds_highscore') || '0', 10),
  stars: 0,

  // Burung
  birdQueue: [...LEVELS_DATA[0].availableBirds],
  currentBird: LEVELS_DATA[0].availableBirds[0] || null,
  activeBirdPosition: null,

  // Ketapel
  isDragging: false,
  pullOffset: [0, 0, 0],
  pullStrength: 0,

  // Struktur & Musuh dinamis
  structures: LEVELS_DATA[0].structures.map((s) => ({ ...s, currentHp: s.hp, destroyed: false })),
  targets: LEVELS_DATA[0].targets.map((t) => ({ ...t, currentHp: t.hp, destroyed: false })),

  // Inisialisasi / Reset Level Total
  initLevel: (idx = 0) => {
    const safeIdx = Math.max(0, Math.min(idx, LEVELS_DATA.length - 1))
    const lvl = LEVELS_DATA[safeIdx]
    set({
      currentLevelIdx: safeIdx,
      levelData: lvl,
      resetKey: Date.now(),
      gameStatus: 'READY',
      cameraMode: 'AIM',
      score: 0,
      baseScore: 0,
      birdBonus: 0,
      remainingBirdsCount: 0,
      stars: 0,
      birdQueue: [...lvl.availableBirds],
      currentBird: lvl.availableBirds[0] || null,
      activeBirdPosition: null,
      isDragging: false,
      pullOffset: [0, 0, 0],
      pullStrength: 0,
      structures: lvl.structures.map((s) => ({ ...s, currentHp: s.hp, destroyed: false })),
      targets: lvl.targets.map((t) => ({ ...t, currentHp: t.hp, destroyed: false }))
    })
  },

  resetLevel: () => {
    get().initLevel(get().currentLevelIdx)
  },

  nextLevel: () => {
    const nextIdx = (get().currentLevelIdx + 1) % LEVELS_DATA.length
    get().initLevel(nextIdx)
  },

  startPull: () => {
    if (get().gameStatus !== 'READY') return
    set({ isDragging: true, gameStatus: 'AIMING' })
  },

  updatePull: (offset, strength) => {
    if (!get().isDragging) return
    set({ pullOffset: offset, pullStrength: strength })
  },

  launchBird: (impulseVector) => {
    if (get().gameStatus !== 'AIMING' && get().gameStatus !== 'READY') return

    sfx.playLaunch()
    set({
      isDragging: false,
      pullOffset: [0, 0, 0],
      pullStrength: 0,
      gameStatus: 'FLYING',
      cameraMode: 'FOLLOW'
    })

    setTimeout(() => {
      const state = get()
      if (state.gameStatus === 'FLYING') {
        set({ cameraMode: 'OVERVIEW', gameStatus: 'SETTLING' })
        setTimeout(() => {
          get().evaluateTurn()
        }, 2500)
      }
    }, 4500)
  },

  setActiveBirdPosition: (pos) => {
    set({ activeBirdPosition: pos })
  },

  birdSettled: () => {
    if (get().gameStatus === 'FLYING') {
      set({ gameStatus: 'SETTLING', cameraMode: 'OVERVIEW' })
      setTimeout(() => {
        get().evaluateTurn()
      }, 2500)
    }
  },

  // Mulai fase pengamatan kehancuran sinematik saat semua babi musnah
  startVictoryObservation: () => {
    const state = get()
    if (state.gameStatus === 'VICTORY_WATCH' || state.gameStatus === 'WON') return

    // Kamera otomatis mundur dan mengamati runtuhnya struktur selama 3.5 detik
    set({
      gameStatus: 'VICTORY_WATCH',
      cameraMode: 'OVERVIEW'
    })

    setTimeout(() => {
      get().finalizeVictory()
    }, 3800)
  },

  // Finalisasi skor, bonus sisa burung, dan modal kemenangan setelah pengamatan selesai
  finalizeVictory: () => {
    const state = get()
    if (state.gameStatus === 'WON') return

    // Sisa burung di cadangan (tidak termasuk burung yang sedang digunakan)
    const remainingBirds = Math.max(0, state.birdQueue.length - 1)
    const birdBonus = remainingBirds * 10000
    const finalScore = state.score + birdBonus

    const thresholds = state.levelData.starThresholds
    let stars = 1
    if (finalScore >= thresholds.star3) stars = 3
    else if (finalScore >= thresholds.star2) stars = 2

    if (finalScore > state.highScore) {
      localStorage.setItem('angry_birds_highscore', finalScore.toString())
    }

    sfx.playVictory()
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      })
    } catch (e) {}

    set({
      baseScore: state.score,
      birdBonus,
      remainingBirdsCount: remainingBirds,
      score: finalScore,
      stars,
      highScore: Math.max(finalScore, state.highScore),
      gameStatus: 'WON'
    })
  },

  // Evaluasi putaran
  evaluateTurn: () => {
    const state = get()
    if (state.gameStatus === 'WON' || state.gameStatus === 'LOST' || state.gameStatus === 'VICTORY_WATCH') return

    const remainingTargets = state.targets.filter((t) => !t.destroyed)

    // Jika babi sudah habis, masuki fase pengamatan sinematik
    if (remainingTargets.length === 0) {
      get().startVictoryObservation()
      return
    }

    // Konsumsi burung saat ini dari antrean
    const nextQueue = state.birdQueue.slice(1)
    if (nextQueue.length > 0) {
      set({
        birdQueue: nextQueue,
        currentBird: nextQueue[0],
        gameStatus: 'READY',
        cameraMode: 'AIM',
        activeBirdPosition: null
      })
    } else {
      sfx.playGameOver()
      set({
        gameStatus: 'LOST',
        cameraMode: 'OVERVIEW'
      })
    }
  },

  damageBlock: (id, amount) => {
    const state = get()
    const targetBlock = state.structures.find((s) => s.id === id)
    if (!targetBlock || targetBlock.destroyed) return

    const newHp = targetBlock.currentHp - amount
    const destroyed = newHp <= 0

    let addedScore = Math.floor(amount * 5)
    if (destroyed) {
      addedScore += targetBlock.type === 'stone' ? 2000 : targetBlock.type === 'ice' ? 600 : 1000
    }

    sfx.playHit(targetBlock.type, Math.min(3, amount / 20))

    set((state) => ({
      score: state.score + addedScore,
      structures: state.structures.map((s) => {
        if (s.id === id) {
          return { ...s, currentHp: newHp, destroyed }
        }
        return s
      })
    }))
  },

  damageTarget: (id, amount) => {
    const state = get()
    const target = state.targets.find((t) => t.id === id)
    if (!target || target.destroyed) return

    const newHp = Math.max(0, target.currentHp - amount)
    const destroyed = newHp <= 0

    if (destroyed) {
      sfx.playPigDestroy()
    }

    set((state) => ({
      score: state.score + (destroyed ? 5000 : Math.floor(amount * 10)),
      targets: state.targets.map((t) => {
        if (t.id === id) {
          return { ...t, currentHp: newHp, destroyed }
        }
        return t
      })
    }))

    // Cek apakah seluruh babi telah tereliminasi
    setTimeout(() => {
      const activeTargets = get().targets.filter((t) => !t.destroyed)
      if (activeTargets.length === 0 && get().gameStatus !== 'WON' && get().gameStatus !== 'VICTORY_WATCH') {
        get().startVictoryObservation()
      }
    }, 120)
  },

  setCameraMode: (mode) => set({ cameraMode: mode })
}))
