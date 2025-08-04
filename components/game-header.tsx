"use client"

import { useGame } from "@/contexts/game-context"
import { Button } from "@/components/ui/button"
import { Home, Settings, Lightbulb, RotateCcw } from "lucide-react"

interface GameHeaderProps {
  onNavigate: (view: "game" | "levels" | "settings" | "stats" | "tutorial") => void
}

export function GameHeader({ onNavigate }: GameHeaderProps) {
  const { state, useHint, resetLevel, checkSolution } = useGame()

  const formatTime = (ms: number) => {
    const seconds = Math.floor((Date.now() - ms) / 1000)
    const minutes = Math.floor(seconds / 60)
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="ghost" onClick={() => onNavigate("levels")} className="p-1.5 h-8 w-8">
            <Home className="h-3.5 w-3.5" />
          </Button>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Nivel {state.level}</div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">⭐</span>
            <span>{state.score}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">⏱️</span>
            <span>{formatTime(state.startTime)}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">💡</span>
            <span>{state.maxHints - state.hintsUsed}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={useHint}
            disabled={state.hintsUsed >= state.maxHints}
            className="p-1.5 h-8 w-8"
            title="Usar pista"
          >
            <Lightbulb className="h-3.5 w-3.5" />
          </Button>

          <Button size="sm" variant="ghost" onClick={resetLevel} className="p-1.5 h-8 w-8" title="Reiniciar">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate("settings")}
            className="p-1.5 h-8 w-8"
            title="Configuración"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
