import type { LevelData, Piece, Cell, ColorType, PieceCell } from "@/types/game"
import { LevelSolver } from "./level-solver"
import { CampaignLevels } from "./campaign-levels"

export class LevelGenerator {
  private static pieceTemplates: PieceCell[][][] = [
    // L-shapes
    [
      [{ color: "red" }, { color: "empty" }],
      [{ color: "red" }, { color: "empty" }],
      [{ color: "red" }, { color: "red" }],
    ],
    [
      [{ color: "blue" }, { color: "blue" }, { color: "blue" }],
      [{ color: "blue" }, { color: "empty" }, { color: "empty" }],
    ],
    // I-shapes
    [[{ color: "yellow" }], [{ color: "yellow" }], [{ color: "yellow" }], [{ color: "yellow" }]],
    [[{ color: "green" }, { color: "green" }, { color: "green" }]],
    // T-shapes
    [
      [{ color: "empty" }, { color: "orange" }, { color: "empty" }],
      [{ color: "orange" }, { color: "orange" }, { color: "orange" }],
    ],
    // Z-shapes
    [
      [{ color: "magenta" }, { color: "magenta" }, { color: "empty" }],
      [{ color: "empty" }, { color: "magenta" }, { color: "magenta" }],
    ],
    // O-shapes
    [
      [{ color: "red" }, { color: "red" }],
      [{ color: "red" }, { color: "red" }],
    ],
    // Simple shapes
    [[{ color: "blue" }]],
    [[{ color: "red" }, { color: "red" }]],
    [[{ color: "yellow" }], [{ color: "yellow" }]],
  ]

  static generateLevel(difficulty: number, seed?: string): LevelData {
    try {
      // Si es un nivel de campaña, usar nivel predefinido
      if (seed && seed.startsWith("level_")) {
        const levelNumber = Number.parseInt(seed.split("_")[2] || seed.split("_")[1])
        const campaignLevel = CampaignLevels.getLevel(levelNumber)
        if (campaignLevel) {
          console.log(`Loading campaign level ${levelNumber}`)
          return campaignLevel
        }
      }

      if (seed) {
        this.setSeed(seed)
      }

      const maxAttempts = 20
      let attempts = 0

      while (attempts < maxAttempts) {
        try {
          console.log(`Generating level attempt ${attempts + 1}/${maxAttempts}`)
          const levelData = this.generateSolvableLevel(difficulty)

          if (levelData && this.validateLevel(levelData)) {
            console.log("Level generated and validated successfully")
            return levelData
          }
        } catch (error) {
          console.warn(`Level generation attempt ${attempts + 1} failed:`, error)
        }
        attempts++
      }

      console.warn("All level generation attempts failed, using simple level")
      return this.generateSimpleLevel()
    } catch (error) {
      console.error("Critical error in level generation:", error)
      return this.generateSimpleLevel()
    }
  }

  private static generateSolvableLevel(difficulty: number): LevelData | null {
    // Generar piezas para el nivel
    const pieces = this.generatePieces(difficulty)
    if (pieces.length === 0) return null

    // Generar una solución válida
    const solutionResult = LevelSolver.generateRandomSolution(pieces)
    if (!solutionResult) return null

    // Verificar que la solución es correcta
    const verification = LevelSolver.isLevelSolvable(solutionResult.board, pieces, 3000)
    if (!verification.solvable) return null

    // Crear piezas puzzle (con rotaciones/reflejos aleatorios)
    const puzzlePieces = this.createPuzzlePieces(pieces, difficulty)

    return {
      board: Array(6)
        .fill(null)
        .map(() =>
          Array(6)
            .fill(null)
            .map(() => ({ colors: [], isEmpty: true })),
        ),
      targetBoard: solutionResult.board,
      pieces: puzzlePieces,
      difficulty,
      seed: Date.now().toString(),
    }
  }

  private static generatePieces(difficulty: number): Piece[] {
    const numPieces = Math.min(2 + difficulty, 6) // Menos piezas para mayor probabilidad de solución
    const pieces: Piece[] = []

    // Seleccionar templates apropiados para la dificultad
    const availableTemplates = this.pieceTemplates.slice(0, Math.min(this.pieceTemplates.length, 4 + difficulty))

    for (let i = 0; i < numPieces; i++) {
      const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)]
      const piece: Piece = {
        id: `piece_${i}`,
        shape: template.map((row) => [...row]),
        rotation: 0,
        flipped: false,
      }

      // Simplificar colores para dificultades bajas
      if (difficulty <= 2) {
        piece.shape = this.simplifyColors(piece.shape)
      }

      pieces.push(piece)
    }

    return pieces
  }

  private static simplifyColors(shape: PieceCell[][]): PieceCell[][] {
    const simpleColors: ColorType[] = ["red", "blue", "yellow"]
    return shape.map((row) =>
      row.map((cell) =>
        cell.color !== "empty" && Math.random() < 0.7
          ? { color: simpleColors[Math.floor(Math.random() * simpleColors.length)] }
          : cell,
      ),
    )
  }

  private static createPuzzlePieces(solutionPieces: Piece[], difficulty: number): Piece[] {
    return solutionPieces.map((piece, index) => ({
      id: `puzzle_${index}`,
      shape: piece.shape.map((row) => [...row]),
      rotation: difficulty > 1 && Math.random() < 0.3 ? Math.floor(Math.random() * 4) * 90 : 0,
      flipped: difficulty > 2 && Math.random() < 0.2,
      position: undefined,
    }))
  }

  private static validateLevel(levelData: LevelData): boolean {
    try {
      // Verificar que hay piezas
      if (levelData.pieces.length === 0) {
        console.log("Validation failed: No pieces")
        return false
      }

      // Verificar que el tablero objetivo tiene celdas llenas
      let hasTargetCells = false
      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          if (!levelData.targetBoard[y][x].isEmpty) {
            hasTargetCells = true
            break
          }
        }
        if (hasTargetCells) break
      }

      if (!hasTargetCells) {
        console.log("Validation failed: No target cells")
        return false
      }

      // Verificar que el nivel es solucionable
      const verification = LevelSolver.isLevelSolvable(levelData.targetBoard, levelData.pieces, 5000)
      if (!verification.solvable) {
        console.log("Validation failed: Level not solvable")
        return false
      }

      console.log("Level validation passed")
      return true
    } catch (error) {
      console.error("Validation error:", error)
      return false
    }
  }

  static generateSimpleLevel(): LevelData {
    console.log("Generating simple fallback level")

    const board: Cell[][] = Array(6)
      .fill(null)
      .map(() =>
        Array(6)
          .fill(null)
          .map(() => ({ colors: [], isEmpty: true })),
      )

    // Crear un objetivo muy simple
    const targetBoard: Cell[][] = Array(6)
      .fill(null)
      .map(() =>
        Array(6)
          .fill(null)
          .map(() => ({ colors: [], isEmpty: true })),
      )

    // Objetivo simple: una línea de 3 celdas rojas
    targetBoard[2][1] = { colors: ["red"], isEmpty: false }
    targetBoard[2][2] = { colors: ["red"], isEmpty: false }
    targetBoard[2][3] = { colors: ["red"], isEmpty: false }

    // Pieza simple que encaja perfectamente
    const pieces: Piece[] = [
      {
        id: "simple_line",
        shape: [[{ color: "red" }, { color: "red" }, { color: "red" }]],
        rotation: 0,
        flipped: false,
      },
    ]

    return {
      board,
      targetBoard,
      pieces,
      difficulty: 1,
      seed: "simple_fallback",
    }
  }

  private static setSeed(seed: string) {
    // Simple seeded random number generator
    let hash = 0
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }

    // Override Math.random with seeded version
    let seedValue = Math.abs(hash)
    const originalRandom = Math.random
    Math.random = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280
      return seedValue / 233280
    }

    // Restore original after some time to avoid affecting other parts
    setTimeout(() => {
      Math.random = originalRandom
    }, 100)
  }
}
