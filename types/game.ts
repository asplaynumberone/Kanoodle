export type ColorType = "red" | "blue" | "yellow" | "orange" | "green" | "magenta" | "white" | "empty"

export interface Cell {
  colors: ColorType[]
  isEmpty: boolean
}

export interface Position {
  x: number
  y: number
}

export interface PieceCell {
  color: ColorType | "empty"
}

export interface Piece {
  id: string
  shape: PieceCell[][]
  rotation: number
  flipped: boolean
  position?: Position
}

export interface PlacedPiece extends Piece {
  position: Position
}

export interface GameState {
  board: Cell[][]
  targetBoard: Cell[][]
  pieces: Piece[]
  placedPieces: PlacedPiece[]
  selectedPiece: string | null
  hintsUsed: number
  maxHints: number
  score: number
  level: number
  difficulty: number
  gameStatus: "playing" | "won" | "paused"
  startTime: number
  currentHint: any | null
}

export interface LevelData {
  board: Cell[][]
  targetBoard: Cell[][]
  pieces: Piece[]
  difficulty: number
  seed: string
}

export interface GameStats {
  gamesPlayed: number
  gamesWon: number
  averageTime: number
  bestTime: number
  hintsUsed: number
  currentStreak: number
  bestStreak: number
}
