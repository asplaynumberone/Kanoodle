"use client"

import { useGame } from "@/contexts/game-context"
import { useSettings } from "@/contexts/settings-context"
import { Button } from "@/components/ui/button"
import { SkipForward, RotateCcw, Trophy, CheckCircle, Zap } from "lucide-react"
import { SoundManager } from "@/lib/sound-manager"
import { HapticManager } from "@/lib/haptic-manager"
import { useEffect } from "react"

export function GameControls() {
  const { state, checkSolution, resetLevel, nextLevel } = useGame()
  const { soundEnabled, vibrationEnabled } = useSettings()

  useEffect(() => {
    SoundManager.init()
    SoundManager.setEnabled(soundEnabled)
    HapticManager.setEnabled(vibrationEnabled)
  }, [soundEnabled, vibrationEnabled])

  const handleCheckSolution = () => {
    const isCorrect = checkSolution()
    if (isCorrect) {
      SoundManager.playLevelComplete()
      HapticManager.levelComplete()

      setTimeout(() => {
        if (confirm("🎉 ¡Nivel completado!\n\n¿Continuar al siguiente nivel?")) {
          nextLevel()
        }
      }, 1000)
    } else {
      SoundManager.playInvalidMove()
      HapticManager.invalidMove()

      // Mostrar mensaje de ayuda
      setTimeout(() => {
        alert("❌ La solución no es correcta.\n\nVerifica que todos los colores coincidan con el objetivo.")
      }, 100)
    }
  }

  const handleResetLevel = () => {
    if (confirm("🔄 ¿Reiniciar el nivel?\n\nSe perderá el progreso actual.")) {
      resetLevel()
    }
  }

  if (state.gameStatus === "won") {
    const stars = Math.min(3, Math.floor(state.score / 300))
    const timeElapsed = Math.floor((Date.now() - state.startTime) / 1000)

    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-lg p-3 text-center shadow-lg border border-green-200 dark:border-green-700 flex-shrink-0">
        <div className="text-3xl mb-2">🎉</div>
        <h3 className="text-sm font-bold text-green-800 dark:text-green-200 mb-1">¡Nivel Completado!</h3>

        <div className="flex justify-center mb-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Trophy
              key={i}
              className={`h-4 w-4 mx-0.5 transition-all duration-300 ${
                i < stars ? "text-yellow-500 fill-yellow-500 animate-bounce" : "text-gray-300 dark:text-gray-600"
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs mb-3">
          <div className="bg-white dark:bg-gray-800 rounded p-1">
            <div className="font-bold text-blue-600">{state.score}</div>
            <div className="text-gray-500">Puntos</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded p-1">
            <div className="font-bold text-green-600">{timeElapsed}s</div>
            <div className="text-gray-500">Tiempo</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded p-1">
            <div className="font-bold text-purple-600">{state.hintsUsed}</div>
            <div className="text-gray-500">Pistas</div>
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          <Button
            onClick={handleResetLevel}
            variant="outline"
            size="sm"
            className="text-xs px-3 py-1 h-7 bg-transparent"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Repetir
          </Button>
          <Button onClick={nextLevel} size="sm" className="text-xs px-3 py-1 h-7">
            <SkipForward className="h-3 w-3 mr-1" />
            Siguiente
          </Button>
        </div>
      </div>
    )
  }

  const canCheck = state.pieces.length === 0
  const progress = ((state.pieces.length === 0 ? 1 : 0) * 100).toFixed(0)

  return (
    <div className="flex flex-col space-y-2 flex-shrink-0">
      {/* Progress indicator */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleCheckSolution}
          disabled={!canCheck}
          className={`w-full max-w-xs font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform text-sm touch-manipulation ${
            canCheck
              ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white hover:scale-105 animate-pulse"
              : "bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed opacity-50"
          }`}
        >
          {canCheck ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2 inline" />
              Comprobar Solución
              <Zap className="h-4 w-4 ml-2 inline" />
            </>
          ) : (
            `Coloca ${state.pieces.length} pieza${state.pieces.length !== 1 ? "s" : ""} más`
          )}
        </Button>
      </div>

      {/* Quick actions */}
      <div className="flex justify-center">
        <Button
          onClick={handleResetLevel}
          variant="ghost"
          size="sm"
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reiniciar nivel
        </Button>
      </div>
    </div>
  )
}
