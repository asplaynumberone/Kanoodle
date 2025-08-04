"use client"

import { useState } from "react"
import { GameBoard } from "@/components/game-board"
import { PieceSelector } from "@/components/piece-selector"
import { GameHeader } from "@/components/game-header"
import { GameControls } from "@/components/game-controls"
import { LevelSelector } from "@/components/level-selector"
import { Settings } from "@/components/settings"
import { Statistics } from "@/components/statistics"
import { Tutorial } from "@/components/tutorial"
import { GameProvider } from "@/contexts/game-context"
import { SettingsProvider } from "@/contexts/settings-context"

export default function KanoodleFusion() {
  const [currentView, setCurrentView] = useState<"game" | "levels" | "settings" | "stats" | "tutorial">("game")

  return (
    <SettingsProvider>
      <GameProvider>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          {currentView === "game" && (
            <div className="flex flex-col h-screen max-w-sm mx-auto overflow-hidden">
              <GameHeader onNavigate={setCurrentView} />
              <div className="flex-1 flex flex-col p-2 space-y-2 overflow-hidden">
                <GameBoard />
                <GameControls />
                <PieceSelector />
              </div>
            </div>
          )}

          {currentView === "levels" && <LevelSelector onBack={() => setCurrentView("game")} />}
          {currentView === "settings" && <Settings onBack={() => setCurrentView("game")} />}
          {currentView === "stats" && <Statistics onBack={() => setCurrentView("game")} />}
          {currentView === "tutorial" && <Tutorial onComplete={() => setCurrentView("game")} />}
        </div>
      </GameProvider>
    </SettingsProvider>
  )
}
