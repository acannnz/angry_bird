import React from 'react'
import { useGameStore } from '../../store/useGameStore'
import { RotateCcw, ArrowRight, Star, Trophy, Frown } from 'lucide-react'

export function WinLoseModal() {
  const gameStatus = useGameStore((state) => state.gameStatus)
  const score = useGameStore((state) => state.score)
  const baseScore = useGameStore((state) => state.baseScore)
  const birdBonus = useGameStore((state) => state.birdBonus)
  const remainingBirdsCount = useGameStore((state) => state.remainingBirdsCount)
  const stars = useGameStore((state) => state.stars)
  const highScore = useGameStore((state) => state.highScore)
  const resetLevel = useGameStore((state) => state.resetLevel)
  const nextLevel = useGameStore((state) => state.nextLevel)
  const levelData = useGameStore((state) => state.levelData)

  if (gameStatus !== 'WON' && gameStatus !== 'LOST') return null

  const isWon = gameStatus === 'WON'

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm sm:max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/40 p-4 sm:p-6 shadow-2xl shadow-amber-500/10 text-center text-white my-auto scrollbar-none overscroll-contain">
        
        {/* Header Icon */}
        <div className="mx-auto -mt-9 sm:-mt-14 mb-2 sm:mb-3 flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 shadow-xl shadow-amber-500/30 border-4 border-slate-900">
          {isWon ? (
            <Trophy className="h-7 w-7 sm:h-10 sm:w-10 text-slate-950 stroke-[2.5]" />
          ) : (
            <Frown className="h-7 w-7 sm:h-10 sm:w-10 text-slate-950 stroke-[2.5]" />
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-3xl font-black tracking-wider uppercase drop-shadow-md">
          {isWon ? 'Kemenangan Gemilang!' : 'Level Gagal!'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5 sm:mt-1 font-medium">
          {isWon ? levelData.name : 'Burung habis dan masih ada musuh yang bertahan.'}
        </p>

        {/* Bintang (Jika Menang) */}
        {isWon && (
          <div className="my-2.5 sm:my-4 flex items-center justify-center gap-2 sm:gap-3">
            {[1, 2, 3].map((starIdx) => (
              <div
                key={starIdx}
                className={`transition-all duration-500 ${
                  starIdx <= stars
                    ? 'scale-110 text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]'
                    : 'scale-90 text-slate-700'
                }`}
              >
                <Star
                  className={`h-8 w-8 sm:h-12 sm:w-12 ${
                    starIdx <= stars ? 'fill-yellow-400 stroke-yellow-500' : 'fill-slate-800 stroke-slate-600'
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Breakdown Rincian Skor */}
        <div className="my-2.5 sm:my-4 rounded-2xl bg-slate-950/75 p-3 sm:p-4 border border-slate-800/80 text-left">
          {isWon && (
            <div className="space-y-1 pb-2 mb-2 border-b border-slate-800 text-[11px] sm:text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Skor Kehancuran:</span>
                <span className="font-bold text-slate-200">{baseScore.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-amber-300">
                <span>Bonus Sisa Burung ({remainingBirdsCount} × 10.000):</span>
                <span className="font-bold text-amber-400">+{birdBonus.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-end">
            <div>
              <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Total Skor
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                {score.toLocaleString()}
              </div>
            </div>
            {highScore > 0 && (
              <div className="text-right text-[11px] sm:text-xs text-slate-400">
                <div>Rekor Terbaik:</div>
                <div className="font-bold text-slate-200">{highScore.toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 sm:mt-6 flex items-center justify-center gap-2.5 sm:gap-3">
          <button
            onClick={resetLevel}
            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-95 border border-slate-700 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Ulangi</span>
          </button>

          {isWon && (
            <button
              onClick={nextLevel}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <span>Lanjut</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
