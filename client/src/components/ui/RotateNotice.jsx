import React, { useState, useEffect } from 'react'
import { enterLandscapeFullscreen } from '../../utils/screenHelper'
import { Smartphone, Maximize } from 'lucide-react'

export function RotateNotice() {
  const [isPortrait, setIsPortrait] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      // Deteksi jika tinggi layar lebih besar dari lebar (portrait) dan layar berukuran HP/Tablet (lebar <= 1024px)
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth <= 1024
      setIsPortrait(portrait)
      if (!portrait) {
        setDismissed(false) // Reset saat pengguna memutar ke landscape
      }
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  if (!isPortrait || dismissed) return null

  const handleFullscreenLock = async () => {
    await enterLandscapeFullscreen()
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-xl p-6 text-center select-none animate-in fade-in duration-300">
      <div className="relative mb-6">
        {/* Animasi Ikon Ponsel Berputar */}
        <div className="h-24 w-24 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center animate-bounce">
          <Smartphone className="h-14 w-14 text-amber-400 rotate-90 transition-transform duration-700" />
        </div>
      </div>

      <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
        Putar Layar Anda 🔄
      </h2>
      <p className="text-sm text-slate-300 max-w-xs mb-8 leading-relaxed">
        Game ini optimal dimainkan dalam mode <span className="text-amber-400 font-bold">Landscape</span> (posisi mendatar) agar arena 3D dan ketapel terlihat luas.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={handleFullscreenLock}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
        >
          <Maximize className="h-5 w-5" />
          <span>Kunci Landscape & Layar Penuh</span>
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="text-xs text-slate-400 hover:text-slate-200 py-2 transition-colors cursor-pointer"
        >
          Tetap mainkan dalam mode ini
        </button>
      </div>
    </div>
  )
}
