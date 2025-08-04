"use client"

import type React from "react"
import { useGame } from "@/contexts/game-context"
import { ColorMixer } from "@/lib/color-mixer"
import { useState, useEffect } from "react"
import type { Position } from "@/types/game"
import { SoundManager } from "@/lib/sound-manager"
import { HapticManager } from "@/lib/haptic-manager"

export function GameBoard() {
  const { state, placePiece, removePiece, canPlacePieceAt, replacePieceAt, findPieceAtPosition } = useGame()
  const [dragOver, setDragOver] = useState<Position | null>(null)
  const [invalidPlacement, setInvalidPlacement] = useState<Position | null>(null)
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set())
  const [successPlacement, setSuccessPlacement] = useState<Position | null>(null)

  useEffect(() => {
    if (invalidPlacement) {
      const timer = setTimeout(() => {
        setInvalidPlacement(null)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [invalidPlacement])

  useEffect(() => {
    if (successPlacement) {
      const timer = setTimeout(() => {
        setSuccessPlacement(null)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [successPlacement])

  const handleCellClick = (x: number, y: number) => {
    const position = { x, y }
    const existingPieceInfo = findPieceAtPosition(position)

    if (state.selectedPiece) {
      // Hay una pieza seleccionada
      const selectedPiece = state.pieces.find((p) => p.id === state.selectedPiece)
      if (!selectedPiece) return

      if (existingPieceInfo) {
        // Intentar reemplazar la pieza existente
        const success = replacePieceAt(selectedPiece, position)
        if (success) {
          SoundManager.playPiecePlaced()
          HapticManager.piecePlaced()
          setSuccessPlacement(position)
          setAnimatingCells((prev) => new Set([...prev, `replace-${x}-${y}`]))
          setTimeout(() => {
            setAnimatingCells((prev) => {
              const newSet = new Set(prev)
              newSet.delete(`replace-${x}-${y}`)
              return newSet
            })
          }, 300)
        } else {
          // No se puede reemplazar
          setInvalidPlacement(position)
          SoundManager.playInvalidMove()
          HapticManager.invalidMove()
          setAnimatingCells((prev) => new Set([...prev, `invalid-${x}-${y}`]))
          setTimeout(() => {
            setAnimatingCells((prev) => {
              const newSet = new Set(prev)
              newSet.delete(`invalid-${x}-${y}`)
              return newSet
            })
          }, 500)
        }
      } else {
        // Colocar en celda vacía
        const success = placePiece(selectedPiece, position)
        if (success) {
          SoundManager.playPiecePlaced()
          HapticManager.piecePlaced()
          setSuccessPlacement(position)
          setAnimatingCells((prev) => new Set([...prev, `place-${x}-${y}`]))
          setTimeout(() => {
            setAnimatingCells((prev) => {
              const newSet = new Set(prev)
              newSet.delete(`place-${x}-${y}`)
              return newSet
            })
          }, 300)
        } else {
          setInvalidPlacement(position)
          SoundManager.playInvalidMove()
          HapticManager.invalidMove()
          setAnimatingCells((prev) => new Set([...prev, `invalid-${x}-${y}`]))
          setTimeout(() => {
            setAnimatingCells((prev) => {
              const newSet = new Set(prev)
              newSet.delete(`invalid-${x}-${y}`)
              return newSet
            })
          }, 500)
        }
      }
    } else if (existingPieceInfo) {
      // No hay pieza seleccionada, solo remover la existente
      removePiece(existingPieceInfo.piece.id)
      SoundManager.playPieceRemoved()
      HapticManager.pieceRemoved()
      setAnimatingCells((prev) => new Set([...prev, `remove-${x}-${y}`]))
      setTimeout(() => {
        setAnimatingCells((prev) => {
          const newSet = new Set(prev)
          newSet.delete(`remove-${x}-${y}`)
          return newSet
        })
      }, 300)
    }
  }

  const handleDragOver = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault()
    setDragOver({ x, y })
  }

  const handleDragLeave = () => {
    setDragOver(null)
  }

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault()
    setDragOver(null)

    const pieceId = e.dataTransfer.getData("text/plain")
    const piece = state.pieces.find((p) => p.id === pieceId)

    if (piece) {
      const position = { x, y }
      const existingPieceInfo = findPieceAtPosition(position)

      if (existingPieceInfo) {
        // Intentar reemplazar
        const success = replacePieceAt(piece, position)
        if (!success) {
          setInvalidPlacement(position)
          SoundManager.playInvalidMove()
          HapticManager.invalidMove()
        } else {
          SoundManager.playPiecePlaced()
          HapticManager.piecePlaced()
          setSuccessPlacement(position)
        }
      } else {
        // Colocar en celda vacía
        const success = placePiece(piece, position)
        if (!success) {
          setInvalidPlacement(position)
          SoundManager.playInvalidMove()
          HapticManager.invalidMove()
        } else {
          SoundManager.playPiecePlaced()
          HapticManager.piecePlaced()
          setSuccessPlacement(position)
        }
      }
    }
  }

  const getCellColor = (x: number, y: number) => {
    const cell = state.board[y][x]
    if (cell.isEmpty) return "transparent"

    const finalColor = ColorMixer.getFinalColor(cell.colors)
    return ColorMixer.getColorHex(finalColor)
  }

  const getTargetCellColor = (x: number, y: number) => {
    const cell = state.targetBoard[y][x]
    if (cell.isEmpty) return "transparent"

    const finalColor = ColorMixer.getFinalColor(cell.colors)
    return ColorMixer.getColorHex(finalColor)
  }

  const isHintPosition = (x: number, y: number) => {
    if (!state.currentHint) return false

    if (state.currentHint.type === "position" && state.currentHint.data.position) {
      const pos = state.currentHint.data.position
      return pos.x === x && pos.y === y
    }

    if (state.currentHint.type === "reveal_target" && state.currentHint.data.positions) {
      return state.currentHint.data.positions.some((pos: Position) => pos.x === x && pos.y === y)
    }

    return false
  }

  const isValidDropZone = (x: number, y: number) => {
    if (!state.selectedPiece) return false
    const piece = state.pieces.find((p) => p.id === state.selectedPiece)
    if (!piece) return false

    // Si hay una pieza existente, verificar si se puede reemplazar
    const existingPieceInfo = findPieceAtPosition({ x, y })
    if (existingPieceInfo) {
      // Simular el reemplazo para ver si es válido
      return true // Simplificado - la lógica completa está en replacePieceAt
    }

    return canPlacePieceAt(piece, { x, y })
  }

  const getCellClasses = (x: number, y: number) => {
    const baseClasses =
      "aspect-square border-2 rounded-sm cursor-pointer transition-all duration-200 touch-manipulation"
    const isDragOver = dragOver?.x === x && dragOver?.y === y
    const isInvalid = invalidPlacement?.x === x && invalidPlacement?.y === y
    const isSuccess = successPlacement?.x === x && successPlacement?.y === y
    const isAnimating = animatingCells.has(`place-${x}-${y}`) || animatingCells.has(`replace-${x}-${y}`)
    const isRemoveAnimating = animatingCells.has(`remove-${x}-${y}`)
    const isInvalidAnimating = animatingCells.has(`invalid-${x}-${y}`)
    const isHint = isHintPosition(x, y)
    const isValid = isValidDropZone(x, y)
    const hasExistingPiece = findPieceAtPosition({ x, y }) !== null

    let classes = baseClasses

    if (isDragOver) {
      classes += isValid
        ? " border-green-500 bg-green-100 dark:bg-green-900 scale-105"
        : " border-red-500 bg-red-100 dark:bg-red-900"
    } else if (isInvalid) {
      classes += " border-red-500 bg-red-200 dark:bg-red-800"
    } else if (isSuccess) {
      classes += " border-green-500 bg-green-200 dark:bg-green-800"
    } else if (isHint) {
      classes += " border-yellow-500 bg-yellow-100 dark:bg-yellow-900 animate-pulse"
    } else if (isValid && state.selectedPiece) {
      if (hasExistingPiece) {
        classes += " border-orange-300 bg-orange-50 dark:bg-orange-950" // Indicar reemplazo
      } else {
        classes += " border-green-300 bg-green-50 dark:bg-green-950" // Indicar colocación nueva
      }
    } else {
      classes += " border-gray-300 dark:border-gray-600 hover:border-gray-400"
    }

    if (isAnimating) {
      classes += " animate-bounce"
    }

    if (isRemoveAnimating) {
      classes += " animate-pulse"
    }

    if (isInvalidAnimating) {
      classes += " animate-pulse border-red-500"
    }

    return classes
  }

  return (
    <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
      {/* Hint Display */}
      {state.currentHint && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-2 flex-shrink-0">
          <div className="flex items-center">
            <span className="text-yellow-600 dark:text-yellow-400 mr-2 text-sm">💡</span>
            <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
              {state.currentHint.message}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col space-y-2 min-h-0">
        {/* Target Board */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg flex-shrink-0">
          <h3 className="text-xs font-semibold mb-1 text-center text-gray-700 dark:text-gray-300">Objetivo</h3>
          <div className="grid grid-cols-6 gap-0.5 w-full max-w-[200px] mx-auto">
            {Array.from({ length: 36 }, (_, i) => {
              const x = i % 6
              const y = Math.floor(i / 6)
              const shouldReveal =
                state.currentHint?.type === "reveal_target" &&
                state.currentHint.data.positions?.some((pos: Position) => pos.x === x && pos.y === y)

              return (
                <div
                  key={`target-${x}-${y}`}
                  className={`aspect-square border rounded-sm transition-all duration-300 ${
                    shouldReveal ? "border-yellow-400 shadow-lg animate-pulse" : "border-gray-300 dark:border-gray-600"
                  }`}
                  style={{ backgroundColor: getTargetCellColor(x, y) }}
                />
              )
            })}
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg flex-shrink-0">
          <h3 className="text-xs font-semibold mb-1 text-center text-gray-700 dark:text-gray-300">Tablero</h3>
          <div className="grid grid-cols-6 gap-0.5 w-full max-w-[200px] mx-auto">
            {Array.from({ length: 36 }, (_, i) => {
              const x = i % 6
              const y = Math.floor(i / 6)

              return (
                <div
                  key={`board-${x}-${y}`}
                  className={getCellClasses(x, y)}
                  style={{ backgroundColor: getCellColor(x, y) }}
                  onClick={() => handleCellClick(x, y)}
                  onDragOver={(e) => handleDragOver(e, x, y)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, x, y)}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      {state.selectedPiece && (
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-2 flex-shrink-0">
          <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
            🎯 Toca una celda para colocar la pieza
            <br />🔄 Toca una pieza colocada para reemplazarla
          </p>
        </div>
      )}
    </div>
  )
}
