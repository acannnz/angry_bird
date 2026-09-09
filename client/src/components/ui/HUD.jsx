import React, { useState, useEffect } from 'react'
import { useGameStore } from '../../store/useGameStore'
import { sfx } from '../../utils/soundEffects'
import { enterLandscapeFullscreen, exitFullscreen } from '../../utils/screenHelper'
import { LEVELS_DATA } from '../../data/levels'
import { RotateCcw, Volume2, VolumeX, Eye, Crosshair, Maximize, Minimize } from 'lucide-react'

export function HUD() {
  const currentLevelIdx = useGameStore((state) => state.currentLevelIdx)
  const levelData = useGameStore((state) => state.levelData)
  const score = useGameStore((state) => state.score)
  const highScore = useGameStore((state) => state.highScore)
  const birdQueue = useGameStore((state) => state.birdQueue)
  const currentBird = useGameStore((state) => state.currentBird)
  const targets = useGameStore((state) => state.targets)
  const cameraMode = useGameStore((state) => state.cameraMode)
  const setCameraMode = useGameStore((state) => state.setCameraMode)
  const resetLevel = useGameStore((state) => state.resetLevel)
  const initLevel = useGameStore((state) => state.initLevel)
  const gameStatus = useGameStore((state) => state.gameStatus)

  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    document.addEventListener('webkitfullscreenchange', handleFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('webkitfullscreenchange', handleFsChange)
    }
  }, [])

  const handleToggleFullscreen = async () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      await enterLandscapeFullscreen()
    } else {
      exitFullscreen()
    }
  }

  const handleToggleMute = () => {
    const muted = sfx.toggleMute()
    setIsMuted(muted)
  }

  const handleToggleCamera = () => {
    if (cameraMode === 'AIM') {
      setCameraMode('OVERVIEW')
    } else {
      setCameraMode('AIM')
    }
  }

  const remainingPigs = targets.filter((t) => !t.destroyed).length

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-2 sm:p-4 md:p-6 z-40 select-none">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        {/* Left: Level Selector (20 Level Scrollable) */}
        <div className="pointer-events-auto flex flex-col gap-1 bg-slate-950/80 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl border border-slate-800/80 shadow-lg max-w-[180px] sm:max-w-xs md:max-w-md">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400 truncate">
            {levelData.name}
          </span>
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none touch-pan-x overscroll-contain">
            {LEVELS_DATA.map((lvl, idx) => (
              <button
                key={lvl.levelId}
                onClick={() => initLevel(idx)}
                className={`text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                  currentLevelIdx === idx
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-105'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {lvl.levelId}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Live Score Display */}
        <div className="pointer-events-auto flex flex-col items-center bg-slate-950/80 backdrop-blur-md px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-2xl border border-amber-500/30 shadow-lg shadow-amber-500/5">
          <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-slate-400 uppercase">
            SKOR
          </span>
          <span className="text-base sm:text-xl md:text-3xl font-black text-amber-400 tracking-tight drop-shadow">
            {score.toLocaleString()}
          </span>
          {highScore > 0 && (
            <span className="text-[8px] sm:text-[9px] font-medium text-slate-400">
              Rekor: {highScore.toLocaleString()}
            </span>
          )}
        </div>

        {/* Right: Actions Controls */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 bg-slate-950/80 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border border-slate-800/80 shadow-lg">
          {/* Ganti Sudut Kamera */}
          <button
            onClick={handleToggleCamera}
            title="Ganti Sudut Kamera"
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            {cameraMode === 'AIM' ? (
              <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Crosshair className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            )}
          </button>

          {/* Mute SFX */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
            ) : (
              <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>

          {/* Fullscreen / Kunci Landscape */}
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh & Landscape'}
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
            ) : (
              <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>

          {/* Reset / Restart */}
          <button
            onClick={resetLevel}
            title="Ulangi Level"
            className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>

      {/* Center Cinematic Banner saat fase observasi kemenangan */}
      {gameStatus === 'VICTORY_WATCH' && (
        <div className="self-center animate-pulse flex items-center gap-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 font-black text-sm md:text-base px-6 py-2.5 rounded-2xl shadow-2xl shadow-amber-500/50 border-2 border-white">
          <span>SEMUA BABI HANCUR! Mengamati keruntuhan benteng...</span>
        </div>
      )}

      {/* Bottom HUD */}
      <div className="flex items-end justify-between gap-3">
        {/* Sisa Burung & Skill Info */}
        <div className="pointer-events-auto flex flex-col gap-1 bg-slate-950/75 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Amunisi:
            </span>
            <div className="flex items-center gap-1.5">
              {birdQueue.map((bird, idx) => (
                <div
                  key={bird.id || idx}
                  style={{ backgroundColor: bird.color }}
                  className={`h-7 w-7 rounded-full flex items-center justify-center border-2 border-white/80 shadow-md ${
                    idx === 0 ? 'scale-110 ring-2 ring-amber-400' : 'opacity-60'
                  }`}
                  title={`${bird.name} (${bird.skill})`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                </div>
              ))}
              {birdQueue.length === 0 && (
                <span className="text-xs font-bold text-red-400">Habis</span>
              )}
            </div>
          </div>

          {currentBird && (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-amber-300 font-semibold mt-0.5">
              <span>{currentBird.name}: <span className="text-white">{currentBird.skill}</span></span>
            </div>
          )}
        </div>

        {/* Petunjuk Gameplay Khusus Skill */}
        {gameStatus === 'FLYING' ? (
          <div className="animate-pulse flex items-center gap-2 bg-amber-500/90 text-slate-950 px-4 py-2 rounded-xl font-black text-xs md:text-sm shadow-xl shadow-amber-500/30 border border-white">
            <span>⚡ KLIK DI MANA SAJA UNTUK AKTIFKAN SKILL!</span>
          </div>
        ) : gameStatus === 'READY' ? (
          <div className="hidden md:flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800/60 text-xs font-medium text-slate-300 shadow">
            <span>Tarik burung ke belakang pada ketapel lalu lepaskan</span>
          </div>
        ) : null}

        {/* Target Babi Tersisa */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/75 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="h-6 w-6 rounded-full bg-green-500 border-2 border-white/80 flex items-center justify-center">
            <div className="h-1 w-2 rounded-full bg-emerald-900"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
              Sisa Babi
            </span>
            <span className="text-base font-black text-green-400 leading-tight">
              {remainingPigs}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
