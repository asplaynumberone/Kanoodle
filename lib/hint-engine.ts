import type { GameState, Piece, Position } from "@/types/game"
import { PieceTransformer } from "./piece-transformer"
import { ColorMixer } from "./color-mixer"

export interface Hint {
  type: "next_piece" | "position" | "reveal_target"
  data: any
  message: string
}

export class HintEngine {
  static generateHint(state: GameState): Hint | null {
    const hintTypes = ["next_piece", "position", "reveal_target"]
    const hintType = hintTypes[state.hintsUsed % 3]

    switch (hintType) {
      case "next_piece":
        return this.generateNextPieceHint(state)
      case "position":
        return this.generatePositionHint(state)
      case "reveal_target":
        return this.generateRevealHint(state)
      default:
        return null
    }
  }

  private static generateNextPieceHint(state: GameState): Hint | null {
    if (state.pieces.length === 0) return null

    // Find the piece that fits in the most positions
    let bestPiece: Piece | null = null
    let maxPositions = 0

    state.pieces.forEach((piece) => {
      let validPositions = 0

      for (let y = 0; y < 6; y++) {
        for (let x = 0; x < 6; x++) {
          if (this.canPlacePieceAt(piece, { x, y }, state)) {
            validPositions++
          }
        }
      }

      if (validPositions > maxPositions) {
        maxPositions = validPositions
        bestPiece = piece
      }
    })

    if (bestPiece) {
      return {
        type: "next_piece",
        data: { pieceId: bestPiece.id },
        message: `Intenta colocar la pieza ${bestPiece.id.split("_")[1]} primero`,
      }
    }

    return null
  }

  private static generatePositionHint(state: GameState): Hint | null {
    if (!state.selectedPiece) {
      // Select the first available piece
      const firstPiece = state.pieces[0]
      if (!firstPiece) return null

      return {
        type: "position",
        data: { pieceId: firstPiece.id, position: this.findBestPosition(firstPiece, state) },
        message: "Selecciona una pieza y te mostraré dónde colocarla",
      }
    }

    const piece = state.pieces.find((p) => p.id === state.selectedPiece)
    if (!piece) return null

    const bestPosition = this.findBestPosition(piece, state)
    if (bestPosition) {
      return {
        type: "position",
        data: { pieceId: piece.id, position: bestPosition },
        message: `Coloca la pieza en la posición (${bestPosition.x + 1}, ${bestPosition.y + 1})`,
      }
    }

    return null
  }

  private static generateRevealHint(state: GameState): Hint {
    // Reveal 3 random cells from the target board
    const emptyCells: Position[] = []

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        if (!state.targetBoard[y][x].isEmpty && state.board[y][x].isEmpty) {
          emptyCells.push({ x, y })
        }
      }
    }

    const revealCells = emptyCells.sort(() => Math.random() - 0.5).slice(0, 3)

    return {
      type: "reveal_target",
      data: { positions: revealCells },
      message: "Te muestro algunas celdas del objetivo",
    }
  }

  private static findBestPosition(piece: Piece, state: GameState): Position | null {
    const validPositions: Position[] = []

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        if (this.canPlacePieceAt(piece, { x, y }, state)) {
          validPositions.push({ x, y })
        }
      }
    }

    if (validPositions.length === 0) return null

    // Score positions based on how well they match the target
    let bestPosition: Position | null = null
    let bestScore = -1

    validPositions.forEach((pos) => {
      const score = this.scorePosition(piece, pos, state)
      if (score > bestScore) {
        bestScore = score
        bestPosition = pos
      }
    })

    return bestPosition
  }

  private static scorePosition(piece: Piece, position: Position, state: GameState): number {
    const transformed = PieceTransformer.transformPiece(piece)
    let score = 0

    transformed.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.color !== "empty") {
          const boardX = position.x + x
          const boardY = position.y + y

          if (boardX >= 0 && boardX < 6 && boardY >= 0 && boardY < 6) {
            const currentCell = state.board[boardY][boardX]
            const targetCell = state.targetBoard[boardY][boardX]

            if (!targetCell.isEmpty) {
              try {
                const newColors = ColorMixer.mixColors([...currentCell.colors, cell.color])
                const resultColor = ColorMixer.getFinalColor(newColors)
                const targetColor = ColorMixer.getFinalColor(targetCell.colors)

                if (resultColor === targetColor) {
                  score += 10 // Perfect match
                } else if (newColors.length === targetCell.colors.length) {
                  score += 5 // Correct layer count
                } else {
                  score += 1 // At least contributes
                }
              } catch {
                score -= 5 // Invalid placement
              }
            }
          }
        }
      })
    })

    return score
  }

  private static canPlacePieceAt(piece: Piece, position: Position, state: GameState): boolean {
    const transformed = PieceTransformer.transformPiece(piece)

    for (let y = 0; y < transformed.length; y++) {
      for (let x = 0; x < transformed[y].length; x++) {
        const cell = transformed[y][x]
        if (cell.color !== "empty") {
          const boardX = position.x + x
          const boardY = position.y + y

          if (boardX < 0 || boardX >= 6 || boardY < 0 || boardY >= 6) {
            return false
          }

          const currentCell = state.board[boardY][boardX]
          if (currentCell.colors.length >= 2) {
            return false
          }

          try {
            const newColors = ColorMixer.mixColors([...currentCell.colors, cell.color])
            if (ColorMixer.getFinalColor(newColors) === "white") {
              return false
            }
          } catch {
            return false
          }
        }
      }
    }

    return true
  }
}
