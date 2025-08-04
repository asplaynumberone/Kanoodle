"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react"
import type { GameState, Piece, Cell, Position, ColorType } from "@/types/game"
import { LevelGenerator } from "@/lib/level-generator"
import { ColorMixer } from "@/lib/color-mixer"
import { GameStorage } from "@/lib/game-storage"
import { PieceTransformer } from "@/lib/piece-transformer"
import { HintEngine } from "@/lib/hint-engine"

interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<GameAction>
  placePiece: (piece: Piece, position: Position) => boolean
  removePiece: (pieceId: string) => void
  rotatePiece: (pieceId: string) => void
  flipPiece: (pieceId: string) => void
  checkSolution: () => boolean
  useHint: () => void
  resetLevel: () => void
  nextLevel: () => void
  generateLevel: (difficulty: number, seed?: string) => void
  canPlacePieceAt: (piece: Piece, position: Position) => boolean
  replacePieceAt: (newPiece: Piece, position: Position) => boolean
  findPieceAtPosition: (position: Position) => { piece: any; piecePosition: Position } | null
}

type GameAction =
  | { type: "SET_LEVEL"; payload: { board: Cell[][]; targetBoard: Cell[][]; pieces: Piece[]; levelNumber: number } }
  | { type: "PLACE_PIECE"; payload: { piece: Piece; position: Position } }
  | { type: "REMOVE_PIECE"; payload: { pieceId: string } }
  | { type: "REPLACE_PIECE"; payload: { removePieceId: string; newPiece: Piece; position: Position } }
  | { type: "ROTATE_PIECE"; payload: { pieceId: string } }
  | { type: "FLIP_PIECE"; payload: { pieceId: string } }
  | { type: "USE_HINT"; payload: { hintType: string; data: any } }
  | { type: "SET_SELECTED_PIECE"; payload: { pieceId: string | null } }
  | { type: "UPDATE_SCORE"; payload: { score: number } }
  | { type: "SET_GAME_STATUS"; payload: { status: "playing" | "won" | "paused" } }
  | { type: "SHOW_HINT"; payload: { hint: any } }
  | { type: "CLEAR_HINT" }

const initialState: GameState = {
  board: Array(6)
    .fill(null)
    .map(() =>
      Array(6)
        .fill(null)
        .map(() => ({ colors: [], isEmpty: true })),
    ),
  targetBoard: Array(6)
    .fill(null)
    .map(() =>
      Array(6)
        .fill(null)
        .map(() => ({ colors: [], isEmpty: true })),
    ),
  pieces: [],
  placedPieces: [],
  selectedPiece: null,
  hintsUsed: 0,
  maxHints: 3,
  score: 1000,
  level: 1,
  difficulty: 1,
  gameStatus: "playing",
  startTime: Date.now(),
  currentHint: null,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_LEVEL":
      return {
        ...state,
        board: action.payload.board,
        targetBoard: action.payload.targetBoard,
        pieces: action.payload.pieces,
        placedPieces: [],
        level: action.payload.levelNumber,
        hintsUsed: 0,
        gameStatus: "playing",
        startTime: Date.now(),
        score: 1000,
        currentHint: null,
        selectedPiece: null,
      }

    case "PLACE_PIECE":
      const newBoard = recalculateBoard(state.placedPieces, action.payload.piece, action.payload.position)

      return {
        ...state,
        board: newBoard,
        placedPieces: [...state.placedPieces, { ...action.payload.piece, position: action.payload.position }],
        pieces: state.pieces.filter((p) => p.id !== action.payload.piece.id),
        selectedPiece: null,
        score: Math.max(0, state.score - 10),
        currentHint: null,
      }

    case "REMOVE_PIECE":
      const pieceToRemove = state.placedPieces.find((p) => p.id === action.payload.pieceId)
      if (!pieceToRemove) return state

      const remainingPieces = state.placedPieces.filter((p) => p.id !== action.payload.pieceId)
      const boardWithoutPiece = recalculateBoardFromPieces(remainingPieces)

      return {
        ...state,
        board: boardWithoutPiece,
        placedPieces: remainingPieces,
        pieces: [...state.pieces, { ...pieceToRemove, position: undefined }],
        currentHint: null,
      }

    case "REPLACE_PIECE":
      // Remover la pieza existente y colocar la nueva en una sola operación
      const pieceToReplace = state.placedPieces.find((p) => p.id === action.payload.removePieceId)
      if (!pieceToReplace) return state

      const piecesWithoutReplaced = state.placedPieces.filter((p) => p.id !== action.payload.removePieceId)
      const boardWithReplacement = recalculateBoard(
        piecesWithoutReplaced,
        action.payload.newPiece,
        action.payload.position,
      )

      return {
        ...state,
        board: boardWithReplacement,
        placedPieces: [...piecesWithoutReplaced, { ...action.payload.newPiece, position: action.payload.position }],
        pieces: [
          ...state.pieces.filter((p) => p.id !== action.payload.newPiece.id),
          { ...pieceToReplace, position: undefined },
        ],
        selectedPiece: null,
        score: Math.max(0, state.score - 5), // Menor penalización por reemplazo
        currentHint: null,
      }

    case "ROTATE_PIECE":
      return {
        ...state,
        pieces: state.pieces.map((piece) =>
          piece.id === action.payload.pieceId ? { ...piece, rotation: (piece.rotation + 90) % 360 } : piece,
        ),
      }

    case "FLIP_PIECE":
      return {
        ...state,
        pieces: state.pieces.map((piece) =>
          piece.id === action.payload.pieceId ? { ...piece, flipped: !piece.flipped } : piece,
        ),
      }

    case "SET_SELECTED_PIECE":
      return {
        ...state,
        selectedPiece: action.payload.pieceId,
      }

    case "USE_HINT":
      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
        score: Math.max(0, state.score - 100),
      }

    case "SHOW_HINT":
      return {
        ...state,
        currentHint: action.payload.hint,
      }

    case "CLEAR_HINT":
      return {
        ...state,
        currentHint: null,
      }

    case "UPDATE_SCORE":
      return {
        ...state,
        score: action.payload.score,
      }

    case "SET_GAME_STATUS":
      return {
        ...state,
        gameStatus: action.payload.status,
      }

    default:
      return state
  }
}

// Utility functions moved outside component
function recalculateBoard(placedPieces: any[], newPiece?: Piece, newPosition?: Position): Cell[][] {
  const board: Cell[][] = Array(6)
    .fill(null)
    .map(() =>
      Array(6)
        .fill(null)
        .map(() => ({ colors: [], isEmpty: true })),
    )

  const allPieces = newPiece && newPosition ? [...placedPieces, { ...newPiece, position: newPosition }] : placedPieces

  allPieces.forEach((piece) => {
    if (!piece.position) return

    const transformedShape = PieceTransformer.transformPiece(piece)

    transformedShape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell.color !== "empty") {
          const boardX = piece.position!.x + x
          const boardY = piece.position!.y + y

          if (boardX >= 0 && boardX < 6 && boardY >= 0 && boardY < 6) {
            const currentCell = board[boardY][boardX]
            try {
              const newColors = ColorMixer.mixColors([...currentCell.colors, cell.color as ColorType])
              board[boardY][boardX] = {
                colors: newColors,
                isEmpty: false,
              }
            } catch (error) {
              // Invalid color combination
              board[boardY][boardX] = {
                colors: ["white"],
                isEmpty: false,
              }
            }
          }
        }
      })
    })
  })

  return board
}

function recalculateBoardFromPieces(placedPieces: any[]): Cell[][] {
  return recalculateBoard(placedPieces)
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  useEffect(() => {
    const savedState = GameStorage.loadGame()
    if (savedState) {
      dispatch({
        type: "SET_LEVEL",
        payload: {
          board: savedState.board,
          targetBoard: savedState.targetBoard,
          pieces: savedState.pieces,
          levelNumber: savedState.level,
        },
      })
    } else {
      generateLevel(1, "level_1")
    }
  }, [])

  useEffect(() => {
    GameStorage.saveGame(state)
  }, [state])

  const findPieceAtPosition = useCallback(
    (position: Position) => {
      for (const piece of state.placedPieces) {
        if (!piece.position) continue

        const transformedShape = PieceTransformer.transformPiece(piece)

        for (let py = 0; py < transformedShape.length; py++) {
          for (let px = 0; px < transformedShape[py].length; px++) {
            if (transformedShape[py][px].color !== "empty") {
              const pieceX = piece.position.x + px
              const pieceY = piece.position.y + py
              if (pieceX === position.x && pieceY === position.y) {
                return { piece, piecePosition: piece.position }
              }
            }
          }
        }
      }
      return null
    },
    [state.placedPieces],
  )

  const canPlacePieceAt = useCallback(
    (piece: Piece, position: Position): boolean => {
      const transformedShape = PieceTransformer.transformPiece(piece)

      for (let y = 0; y < transformedShape.length; y++) {
        for (let x = 0; x < transformedShape[y].length; x++) {
          const cell = transformedShape[y][x]
          if (cell.color !== "empty") {
            const boardX = position.x + x
            const boardY = position.y + y

            // Check bounds
            if (boardX < 0 || boardX >= 6 || boardY < 0 || boardY >= 6) {
              return false
            }

            // Check layer limit
            const currentCell = state.board[boardY][boardX]
            if (currentCell.colors.length >= 2) {
              return false
            }

            // Check for forbidden color combinations
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
    },
    [state.board],
  )

  const placePiece = useCallback(
    (piece: Piece, position: Position): boolean => {
      if (!canPlacePieceAt(piece, position)) {
        return false
      }

      dispatch({ type: "PLACE_PIECE", payload: { piece, position } })
      return true
    },
    [canPlacePieceAt],
  )

  const replacePieceAt = useCallback(
    (newPiece: Piece, position: Position): boolean => {
      const existingPieceInfo = findPieceAtPosition(position)
      if (!existingPieceInfo) {
        return placePiece(newPiece, position)
      }

      // Verificar si la nueva pieza se puede colocar (simulando que la existente no está)
      const tempBoard = recalculateBoardFromPieces(
        state.placedPieces.filter((p) => p.id !== existingPieceInfo.piece.id),
      )

      const transformedShape = PieceTransformer.transformPiece(newPiece)

      // Verificar si se puede colocar en el tablero temporal
      for (let y = 0; y < transformedShape.length; y++) {
        for (let x = 0; x < transformedShape[y].length; x++) {
          const cell = transformedShape[y][x]
          if (cell.color !== "empty") {
            const boardX = position.x + x
            const boardY = position.y + y

            if (boardX < 0 || boardX >= 6 || boardY < 0 || boardY >= 6) {
              return false
            }

            const currentCell = tempBoard[boardY][boardX]
            if (currentCell.colors.length >= 2) {
              return false
            }

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

      dispatch({
        type: "REPLACE_PIECE",
        payload: {
          removePieceId: existingPieceInfo.piece.id,
          newPiece,
          position,
        },
      })
      return true
    },
    [findPieceAtPosition, placePiece, state.placedPieces],
  )

  const removePiece = useCallback((pieceId: string) => {
    dispatch({ type: "REMOVE_PIECE", payload: { pieceId } })
  }, [])

  const rotatePiece = useCallback((pieceId: string) => {
    dispatch({ type: "ROTATE_PIECE", payload: { pieceId } })
  }, [])

  const flipPiece = useCallback((pieceId: string) => {
    dispatch({ type: "FLIP_PIECE", payload: { pieceId } })
  }, [])

  const checkSolution = useCallback((): boolean => {
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const current = state.board[y][x]
        const target = state.targetBoard[y][x]

        if (target.isEmpty && !current.isEmpty) return false
        if (!target.isEmpty && current.isEmpty) return false
        if (!target.isEmpty && !current.isEmpty) {
          const currentColor = ColorMixer.getFinalColor(current.colors)
          const targetColor = ColorMixer.getFinalColor(target.colors)
          if (currentColor !== targetColor) return false
        }
      }
    }

    const timeBonus = Math.max(0, 500 - Math.floor((Date.now() - state.startTime) / 1000))
    const hintPenalty = state.hintsUsed * 100
    const finalScore = state.score + timeBonus - hintPenalty

    dispatch({ type: "UPDATE_SCORE", payload: { score: finalScore } })
    dispatch({ type: "SET_GAME_STATUS", payload: { status: "won" } })

    const stats = GameStorage.loadStats()
    const newStats = {
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
      gamesWon: stats.gamesWon + 1,
      averageTime: Math.floor(
        (stats.averageTime * stats.gamesWon + (Date.now() - state.startTime) / 1000) / (stats.gamesWon + 1),
      ),
      bestTime:
        stats.bestTime === 0
          ? Math.floor((Date.now() - state.startTime) / 1000)
          : Math.min(stats.bestTime, Math.floor((Date.now() - state.startTime) / 1000)),
      hintsUsed: stats.hintsUsed + state.hintsUsed,
      currentStreak: stats.currentStreak + 1,
      bestStreak: Math.max(stats.bestStreak, stats.currentStreak + 1),
    }
    GameStorage.saveStats(newStats)

    return true
  }, [state])

  const useHint = useCallback(() => {
    if (state.hintsUsed >= state.maxHints) return

    const hint = HintEngine.generateHint(state)
    if (hint) {
      dispatch({ type: "USE_HINT", payload: { hintType: hint.type, data: hint.data } })
      dispatch({ type: "SHOW_HINT", payload: { hint } })

      setTimeout(() => {
        dispatch({ type: "CLEAR_HINT" })
      }, 5000)
    }
  }, [state])

  const resetLevel = useCallback(() => {
    generateLevel(state.difficulty, `level_${state.level}`)
  }, [state.difficulty, state.level])

  const nextLevel = useCallback(() => {
    generateLevel(state.difficulty, `level_${state.level + 1}`)
  }, [state.difficulty, state.level])

  const generateLevel = useCallback(
    (difficulty: number, seed?: string) => {
      try {
        console.log(`Generating level with difficulty ${difficulty}, seed: ${seed}`)
        const levelData = LevelGenerator.generateLevel(difficulty, seed)
        dispatch({
          type: "SET_LEVEL",
          payload: {
            board: levelData.board,
            targetBoard: levelData.targetBoard,
            pieces: levelData.pieces,
            levelNumber: seed && seed.startsWith("level_") ? state.level + 1 : state.level,
          },
        })
      } catch (error) {
        console.error("Error generating level:", error)
        const fallbackLevel = LevelGenerator.generateSimpleLevel()
        dispatch({
          type: "SET_LEVEL",
          payload: {
            board: fallbackLevel.board,
            targetBoard: fallbackLevel.targetBoard,
            pieces: fallbackLevel.pieces,
            levelNumber: state.level,
          },
        })
      }
    },
    [state.level],
  )

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        placePiece,
        removePiece,
        rotatePiece,
        flipPiece,
        checkSolution,
        useHint,
        resetLevel,
        nextLevel,
        generateLevel,
        canPlacePieceAt,
        replacePieceAt,
        findPieceAtPosition,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider")
  }
  return context
}
