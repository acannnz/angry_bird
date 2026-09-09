import React, { useEffect, useState } from 'react'
import { GameCanvas } from './components/game/GameCanvas'
import { HUD } from './components/ui/HUD'
import { WinLoseModal } from './components/ui/WinLoseModal'
import { RotateNotice } from './components/ui/RotateNotice'
import { sfx } from './utils/soundEffects'
import { enterLandscapeFullscreen } from './utils/screenHelper'
import { Play } from 'lucide-react'

export default function App() {
  const [hasInteracted, setHasInteracted] = useState(false)

  const handleStartGame = async () => {
    sfx.init()
    await enterLandscapeFullscreen()
    setHasInteracted(true)
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Deteksi Otomatis & Instruksi Rotasi Layar Mobile */}
      <RotateNotice />

      {/* 3D WebGL Canvas Layer */}
      <GameCanvas />

      {/* 2D HUD Layer */}
      <HUD />

      {/* Modal Menang / Kalah */}
      <WinLoseModal />

      {/* Welcome Screen Overlay (Untuk Inisialisasi Audio Browser) */}
      {!hasInteracted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full text-center p-8 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl shadow-amber-500/10">
            <div className="inline-block p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 mb-4">
              <span className="text-4xl">🎯</span>
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-wider mb-2">
              Angry Birds 3D
            </h1>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Tarik ketapel 3D, arahkan trajektori, runtuhkan balok kayu, batu, dan es, lalu hancurkan seluruh musuh babi hijau!
            </p>
            <button
              onClick={handleStartGame}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="h-6 w-6 fill-current" />
              <span>Mulai Bermain</span>
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
