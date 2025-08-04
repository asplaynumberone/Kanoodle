import type { Piece, Cell, Position, ColorType } from "@/types/game"
import { ColorMixer } from "./color-mixer"
import { PieceTransformer } from "./piece-transformer"

export interface SolutionStep {
  pieceId: string
  position: Position
  rotation: number
  flipped: boolean
}

export class LevelSolver {
  private static MAX_ATTEMPTS = 1000
  private static MAX_DEPTH = 20

  /**
   * Verifica si un nivel es solucionable
   */
  static isLevelSolvable(
    targetBoard: Cell[][],
    pieces: Piece[],
    timeoutMs = 5000,
  ): { solvable: boolean; solution?: SolutionStep[] } {
    const startTime = Date.now()

    // Crear estado inicial
    const initialBoard: Cell[][] = Array(6)
      .fill(null)
      .map(() =>
        Array(6)
          .fill(null)
          .map(() => ({ colors: [], isEmpty: true })),
      )

    const solution = this.solveBruteForce(initialBoard, targetBoard, pieces, [], startTime, timeoutMs)

    return {
      solvable: solution !== null,
      solution: solution || undefined,
    }
  }

  /**
   * Resuelve un nivel usando fuerza bruta con poda
   */
  private static solveBruteForce(
    currentBoard: Cell[][],
    targetBoard: Cell[][],
    remainingPieces: Piece[],
    currentSolution: SolutionStep[],
    startTime: number,
    timeoutMs: number,
  ): SolutionStep[] | null {
    // Timeout check
    if (Date.now() - startTime > timeoutMs) {
      return null
    }

    // Depth limit
    if (currentSolution.length > this.MAX_DEPTH) {
      return null
    }

    // Si no quedan piezas, verificar si es solución
    if (remainingPieces.length === 0) {
      return this.boardsMatch(currentBoard, targetBoard) ? currentSolution : null
    }

    // Poda temprana: verificar si es posible completar
    if (!this.canPossiblyComplete(currentBoard, targetBoard, remainingPieces)) {
      return null
    }

    // Intentar colocar cada pieza restante
    for (let pieceIndex = 0; pieceIndex < remainingPieces.length; pieceIndex++) {
      const piece = remainingPieces[pieceIndex]
      const otherPieces = remainingPieces.filter((_, i) => i !== pieceIndex)

      // Probar todas las transformaciones
      for (const rotation of [0, 90, 180, 270]) {
        for (const flipped of [false, true]) {
          const transformedPiece = { ...piece, rotation, flipped }

          // Probar todas las posiciones
          for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
              const position = { x, y }

              if (this.canPlacePiece(transformedPiece, position, currentBoard)) {
                // Colocar pieza
                const newBoard = this.placePieceOnBoard(transformedPiece, position, currentBoard)
                const newSolution = [...currentSolution, { pieceId: piece.id, position, rotation, flipped }]

                // Recursión
                const result = this.solveBruteForce(
                  newBoard,
                  targetBoard,
                  otherPieces,
                  newSolution,
                  startTime,
                  timeoutMs,
                )

                if (result) {
                  return result
                }
              }
            }
          }
        }
      }
    }

    return null
  }

  /**
   * Verifica si dos tableros coinciden
   */
  private static boardsMatch(board1: Cell[][], board2: Cell[][]): boolean {
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const cell1 = board1[y][x]
        const cell2 = board2[y][x]

        if (cell1.isEmpty !== cell2.isEmpty) return false

        if (!cell1.isEmpty && !cell2.isEmpty) {
          const color1 = ColorMixer.getFinalColor(cell1.colors)
          const color2 = ColorMixer.getFinalColor(cell2.colors)
          if (color1 !== color2) return false
        }
      }
    }
    return true
  }

  /**
   * Poda: verifica si es posible completar el tablero
   */
  private static canPossiblyComplete(currentBoard: Cell[][], targetBoard: Cell[][], remainingPieces: Piece[]): boolean {
    // Contar celdas que necesitan ser llenadas
    let cellsToFill = 0
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        if (!targetBoard[y][x].isEmpty && currentBoard[y][x].isEmpty) {
          cellsToFill++
        }
      }
    }

    // Contar celdas disponibles en piezas restantes
    let availableCells = 0
    remainingPieces.forEach((piece) => {
      availableCells += PieceTransformer.getPieceSize(piece)
    })

    // Si no hay suficientes celdas, no es posible
    return availableCells >= cellsToFill
  }

  /**
   * Verifica si se puede colocar una pieza en una posición
   */
  private static canPlacePiece(piece: Piece, position: Position, board: Cell[][]): boolean {
    const transformedShape = PieceTransformer.transformPiece(piece)

    for (let y = 0; y < transformedShape.length; y++) {
      for (let x = 0; x < transformedShape[y].length; x++) {
        const cell = transformedShape[y][x]
        if (cell.color !== "empty") {
          const boardX = position.x + x
          const boardY = position.y + y

          // Verificar límites
          if (boardX < 0 || boardX >= 6 || boardY < 0 || boardY >= 6) {
            return false
          }

          // Verificar límite de capas
          const currentCell = board[boardY][boardX]
          if (currentCell.colors.length >= 2) {
            return false
          }

          // Verificar mezcla de colores
          try {
            const newColors = ColorMixer.mixColors([...currentCell.colors, cell.color as ColorType])
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

  /**
   * Coloca una pieza en el tablero y retorna el nuevo tablero
   */
  private static placePieceOnBoard(piece: Piece, position: Position, board: Cell[][]): Cell[][] {
    const newBoard = board.map((row) => row.map((cell) => ({ ...cell, colors: [...cell.colors] })))
    const transformedShape = PieceTransformer.transformPiece(piece)

    transformedShape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.color !== "empty") {
          const boardX = position.x + x
          const boardY = position.y + y

          if (boardX >= 0 && boardX < 6 && boardY >= 0 && boardY < 6) {
            const currentCell = newBoard[boardY][boardX]
            const newColors = ColorMixer.mixColors([...currentCell.colors, cell.color as ColorType])
            newBoard[boardY][boardX] = {
              colors: newColors,
              isEmpty: false,
            }
          }
        }
      })
    })

    return newBoard
  }

  /**
   * Genera una solución aleatoria válida
   */
  static generateRandomSolution(pieces: Piece[]): { board: Cell[][]; solution: SolutionStep[] } | null {
    const board: Cell[][] = Array(6)
      .fill(null)
      .map(() =>
        Array(6)
          .fill(null)
          .map(() => ({ colors: [], isEmpty: true })),
      )

    const solution: SolutionStep[] = []
    const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5)

    for (const piece of shuffledPieces) {
      let placed = false
      let attempts = 0

      while (!placed && attempts < 100) {
        const rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)]
        const flipped = Math.random() < 0.5
        const x = Math.floor(Math.random() * 6)
        const y = Math.floor(Math.random() * 6)

        const transformedPiece = { ...piece, rotation, flipped }

        if (this.canPlacePiece(transformedPiece, { x, y }, board)) {
          const newBoard = this.placePieceOnBoard(transformedPiece, { x, y }, board)

          // Copiar el nuevo tablero
          for (let by = 0; by < 6; by++) {
            for (let bx = 0; bx < 6; bx++) {
              board[by][bx] = newBoard[by][bx]
            }
          }

          solution.push({ pieceId: piece.id, position: { x, y }, rotation, flipped })
          placed = true
        }

        attempts++
      }

      if (!placed) {
        return null // No se pudo colocar esta pieza
      }
    }

    return { board, solution }
  }
}
