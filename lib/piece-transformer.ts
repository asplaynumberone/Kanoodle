import type { Piece, PieceCell } from "@/types/game"

export class PieceTransformer {
  static transformPiece(piece: Piece): PieceCell[][] {
    let shape = piece.shape.map((row) => [...row])

    // Apply rotation
    for (let i = 0; i < piece.rotation / 90; i++) {
      shape = this.rotateMatrix(shape)
    }

    // Apply flip
    if (piece.flipped) {
      shape = shape.map((row) => [...row].reverse())
    }

    return shape
  }

  static rotateMatrix(matrix: PieceCell[][]): PieceCell[][] {
    const rows = matrix.length
    const cols = matrix[0].length
    const rotated: PieceCell[][] = Array(cols)
      .fill(null)
      .map(() => Array(rows).fill({ color: "empty" }))

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        rotated[j][rows - 1 - i] = matrix[i][j]
      }
    }

    return rotated
  }

  static getPieceBounds(piece: Piece): { width: number; height: number } {
    const transformed = this.transformPiece(piece)
    return {
      width: transformed[0]?.length || 0,
      height: transformed.length,
    }
  }

  static getPieceSize(piece: Piece): number {
    const transformed = this.transformPiece(piece)
    let size = 0

    transformed.forEach((row) => {
      row.forEach((cell) => {
        if (cell.color !== "empty") {
          size++
        }
      })
    })

    return size
  }
}
