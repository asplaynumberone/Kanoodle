"use client"

import { useEffect, useState } from "react"
import { GameStorage } from "@/lib/game-storage"
import type { GameStats } from "@/types/game"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trophy, Clock, Target, Lightbulb } from "lucide-react"

interface StatisticsProps {
  onBack: () => void
}

export function Statistics({ onBack }: StatisticsProps) {
  const [stats, setStats] = useState<GameStats | null>(null)

  useEffect(() => {
    setStats(GameStorage.loadStats())
  }, [])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const winRate = stats ? ((stats.gamesWon / Math.max(stats.gamesPlayed, 1)) * 100).toFixed(1) : "0"

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Estadísticas</h1>
          </div>
          <p className="text-center text-gray-500">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Estadísticas</h1>
        </div>

        {/* Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Resumen General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.gamesPlayed}</div>
                <div className="text-sm text-gray-500">Partidas Jugadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.gamesWon}</div>
                <div className="text-sm text-gray-500">Partidas Ganadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{winRate}%</div>
                <div className="text-sm text-gray-500">Tasa de Victoria</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
                <div className="text-sm text-gray-500">Racha Actual</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Tiempos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{formatTime(stats.averageTime)}</div>
                <div className="text-sm text-gray-500">Tiempo Promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatTime(stats.bestTime)}</div>
                <div className="text-sm text-gray-500">Mejor Tiempo</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.hintsUsed}</div>
                <div className="text-sm text-gray-500">Pistas Usadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.bestStreak}</div>
                <div className="text-sm text-gray-500">Mejor Racha</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Logros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div
                className={`flex items-center p-3 rounded-lg ${stats.gamesWon >= 1 ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                <div className="text-2xl mr-3">🎯</div>
                <div>
                  <div className="font-semibold">Primera Victoria</div>
                  <div className="text-sm text-gray-500">Completa tu primer nivel</div>
                </div>
              </div>

              <div
                className={`flex items-center p-3 rounded-lg ${stats.gamesWon >= 10 ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                <div className="text-2xl mr-3">🏆</div>
                <div>
                  <div className="font-semibold">Veterano</div>
                  <div className="text-sm text-gray-500">Completa 10 niveles</div>
                </div>
              </div>

              <div
                className={`flex items-center p-3 rounded-lg ${stats.bestStreak >= 5 ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                <div className="text-2xl mr-3">🔥</div>
                <div>
                  <div className="font-semibold">En Racha</div>
                  <div className="text-sm text-gray-500">Gana 5 niveles seguidos</div>
                </div>
              </div>

              <div
                className={`flex items-center p-3 rounded-lg ${stats.hintsUsed === 0 && stats.gamesWon > 0 ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"}`}
              >
                <div className="text-2xl mr-3">🧠</div>
                <div>
                  <div className="font-semibold">Genio</div>
                  <div className="text-sm text-gray-500">Completa un nivel sin pistas</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
