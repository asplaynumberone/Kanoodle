import type { GameState, GameStats } from "@/types/game"

export class GameStorage {
  private static GAME_KEY = "kanoodle-game-state"
  private static STATS_KEY = "kanoodle-stats"
  private static LEVELS_KEY = "kanoodle-levels"

  static saveGame(state: GameState) {
    try {
      localStorage.setItem(this.GAME_KEY, JSON.stringify(state))
    } catch (error) {
      console.error("Failed to save game state:", error)
    }
  }

  static loadGame(): GameState | null {
    try {
      const saved = localStorage.getItem(this.GAME_KEY)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error("Failed to load game state:", error)
      return null
    }
  }

  static saveStats(stats: GameStats) {
    try {
      localStorage.setItem(this.STATS_KEY, JSON.stringify(stats))
    } catch (error) {
      console.error("Failed to save stats:", error)
    }
  }

  static loadStats(): GameStats {
    try {
      const saved = localStorage.getItem(this.STATS_KEY)
      return saved
        ? JSON.parse(saved)
        : {
            gamesPlayed: 0,
            gamesWon: 0,
            averageTime: 0,
            bestTime: 0,
            hintsUsed: 0,
            currentStreak: 0,
            bestStreak: 0,
          }
    } catch (error) {
      console.error("Failed to load stats:", error)
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        averageTime: 0,
        bestTime: 0,
        hintsUsed: 0,
        currentStreak: 0,
        bestStreak: 0,
      }
    }
  }

  static exportGameData() {
    const gameState = this.loadGame()
    const stats = this.loadStats()

    return {
      gameState,
      stats,
      exportDate: new Date().toISOString(),
    }
  }

  static importGameData(data: any) {
    try {
      if (data.gameState) {
        this.saveGame(data.gameState)
      }
      if (data.stats) {
        this.saveStats(data.stats)
      }
      return true
    } catch (error) {
      console.error("Failed to import game data:", error)
      return false
    }
  }

  static clearAllData() {
    localStorage.removeItem(this.GAME_KEY)
    localStorage.removeItem(this.STATS_KEY)
    localStorage.removeItem(this.LEVELS_KEY)
  }
}
