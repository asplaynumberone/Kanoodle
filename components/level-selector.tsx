"use client"

import { useState } from "react"
import { useGame } from "@/contexts/game-context"
import { CampaignLevels } from "@/lib/campaign-levels"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Star, Lock, Shuffle } from "lucide-react"

interface LevelSelectorProps {
  onBack: () => void
}

export function LevelSelector({ onBack }: LevelSelectorProps) {
  const { generateLevel } = useGame()
  const [selectedDifficulty, setSelectedDifficulty] = useState(1)

  const difficulties = [
    { level: 1, name: "Fácil", color: "bg-green-500", description: "Pocas piezas, colores básicos" },
    { level: 2, name: "Medio", color: "bg-yellow-500", description: "Más piezas, algunas rotaciones" },
    { level: 3, name: "Difícil", color: "bg-orange-500", description: "Muchas piezas, colores mezclados" },
    { level: 4, name: "Experto", color: "bg-red-500", description: "Máxima complejidad" },
  ]

  const handleStartCampaignLevel = (levelNumber: number) => {
    generateLevel(selectedDifficulty, `level_${levelNumber}`)
    onBack()
  }

  const handleStartRandomLevel = () => {
    generateLevel(selectedDifficulty)
    onBack()
  }

  const renderCampaignLevels = () => {
    const totalLevels = CampaignLevels.getTotalLevels()
    const levels = Array.from({ length: Math.max(totalLevels, 12) }, (_, i) => i + 1) // Mostrar al menos 12 niveles

    return (
      <div className="grid grid-cols-4 gap-2">
        {levels.map((level) => {
          const isAvailable = level <= totalLevels
          const isUnlocked = level <= Math.min(totalLevels, 10) // Simplified unlock logic
          const stars = isAvailable ? Math.floor(Math.random() * 4) : 0 // Mock star rating

          return (
            <Button
              key={level}
              variant={isAvailable && isUnlocked ? "outline" : "ghost"}
              disabled={!isAvailable || !isUnlocked}
              onClick={() => handleStartCampaignLevel(level)}
              className="aspect-square p-2 flex flex-col items-center justify-center text-xs touch-manipulation"
            >
              {isAvailable && isUnlocked ? (
                <>
                  <span className="font-bold">{level}</span>
                  <div className="flex">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-2 w-2 ${i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </>
              ) : isAvailable ? (
                <>
                  <Lock className="h-3 w-3 mb-1" />
                  <span className="text-xs">{level}</span>
                </>
              ) : (
                <>
                  <span className="text-gray-400">{level}</span>
                  <span className="text-xs text-gray-400">Próximamente</span>
                </>
              )}
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4 touch-manipulation">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Seleccionar Nivel</h1>
        </div>

        {/* Difficulty Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Dificultad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {difficulties.map((diff) => (
                <Button
                  key={diff.level}
                  variant={selectedDifficulty === diff.level ? "default" : "outline"}
                  onClick={() => setSelectedDifficulty(diff.level)}
                  className="flex flex-col items-center p-4 h-auto touch-manipulation"
                >
                  <div className={`w-4 h-4 rounded-full ${diff.color} mb-2`} />
                  <span className="font-semibold">{diff.name}</span>
                  <span className="text-xs text-gray-500 text-center mt-1">{diff.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Play */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Shuffle className="h-5 w-5 mr-2" />
              Juego Rápido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleStartRandomLevel}
              className="w-full touch-manipulation"
              size="lg"
              disabled={selectedDifficulty > 2}
            >
              {selectedDifficulty > 2 ? "Próximamente" : "Generar Nivel Aleatorio"}
            </Button>
            {selectedDifficulty > 2 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Los niveles aleatorios de alta dificultad están en desarrollo
              </p>
            )}
          </CardContent>
        </Card>

        {/* Campaign Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campaña ({CampaignLevels.getTotalLevels()} niveles disponibles)</CardTitle>
          </CardHeader>
          <CardContent>{renderCampaignLevels()}</CardContent>
        </Card>
      </div>
    </div>
  )
}
