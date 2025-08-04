"use client"

import type React from "react"
import { useGame } from "@/contexts/game-context"
import { ColorMixer } from "@/lib/color-mixer"
import { PieceTransformer } from "@/lib/piece-transformer"
import type { Piece } from "@/types/game"
import { RotateCw, FlipHorizontal, Sparkles, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PieceSelector() {
  const { state, dispatch, rotatePiece, flipPiece } = useGame()

  const handlePieceSelect = (pieceId: string) => {
    const newSelection = state.selectedPiece === pieceId ? null : pieceId
    dispatch({ type: "SET_SELECTED_PIECE", payload: { pieceId: newSelection } })
  }

  const handleDragStart = (e: React.DragEvent, piece: Piece) => {
    e.dataTransfer.setData("text/plain", piece.id)
    e.dataTransfer.effectAllowed = "move"
    // Auto-select piece when dragging
    dispatch({ type: "SET_SELECTED_PIECE", payload: { pieceId: piece.id } })
  }

  const isHintedPiece = (pieceId: string) => {
    return state.currentHint?.type === "next_piece" && state.currentHint.data.pieceId === pieceId
  }

  const renderPiece = (piece: Piece) => {
    const transformedShape = PieceTransformer.transformPiece(piece)
    const maxDim = Math.max(transformedShape.length, transformedShape[0]?.length || 0)
    const cellSize = Math.min(24, 120 / maxDim)
    const isSelected = state.selectedPiece === piece.id
    const isHinted = isHintedPiece(piece.id)

    return (
      <div className="flex flex-col items-center space-y-1">
        <div
          className={`relative border-2 rounded-lg p-1 cursor-pointer transition-all duration-300 touch-manipulation ${
            isSelected
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900 shadow-lg scale-105"
              : isHinted
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900 animate-pulse shadow-md"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:shadow-md active:scale-95"
          }`}
          onClick={() => handlePieceSelect(piece.id)}
          draggable
          onDragStart={(e) => handleDragStart(e, piece)}
        >
          {isHinted && (
            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
              <Sparkles className="h-2 w-2 text-yellow-800" />
            </div>
          )}

          {isSelected && (
            <div className="absolute -top-1 -left-1 bg-blue-500 rounded-full p-0.5">
              <Eye className="h-2 w-2 text-white" />
            </div>
          )}

          <div
            className="grid gap-0.5 transition-transform duration-200"
            style={{
              gridTemplateColumns: `repeat(${transformedShape[0]?.length || 1}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${transformedShape.length}, ${cellSize}px)`,
            }}
          >
            {transformedShape.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${piece.id}-${x}-${y}`}
                  className={`border border-gray-200 dark:border-gray-700 rounded-sm transition-all duration-200 ${
                    cell.color === "empty" ? "opacity-20" : "shadow-sm"
                  }`}
                  style={{
                    backgroundColor: cell.color === "empty" ? "transparent" : ColorMixer.getColorHex(cell.color),
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                  }}
                />
              )),
            )}
          </div>
        </div>

        <div className="flex space-x-0.5">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              rotatePiece(piece.id)
            }}
            className="p-0.5 h-6 w-6 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors touch-manipulation"
            title="Rotar"
          >
            <RotateCw className="h-2.5 w-2.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              flipPiece(piece.id)
            }}
            className="p-0.5 h-6 w-6 hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors touch-manipulation"
            title="Reflejar"
          >
            <FlipHorizontal className="h-2.5 w-2.5" />
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <div>#{piece.id.split("_")[1]}</div>
          <div className="text-xs">{PieceTransformer.getPieceSize(piece)} celdas</div>
        </div>
      </div>
    )
  }

  if (state.pieces.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg flex-shrink-0">
        <div className="text-center py-4">
          <div className="text-2xl mb-1">🎉</div>
          <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">¡Todas colocadas!</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Comprueba la solución</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Piezas Disponibles</h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">{state.pieces.length} restantes</div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-1">
        {state.pieces.map((piece) => (
          <div key={piece.id} className="flex-shrink-0">
            {renderPiece(piece)}
          </div>
        ))}
      </div>

      {state.selectedPiece ? (
        <div className="mt-2 p-1.5 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
            ✨ Pieza #{state.selectedPiece.split("_")[1]} seleccionada
            <br />
            Toca el tablero para colocar o reemplazar
          </p>
        </div>
      ) : (
        <div className="mt-2 p-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            👆 Toca una pieza para seleccionarla
            <br />🎯 Arrastra para colocar directamente
          </p>
        </div>
      )}
    </div>
  )
}
