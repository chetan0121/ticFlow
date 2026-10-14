export type PlayerMark = 'O' | 'X'

export type Move = [number, number]

export type CellValue = PlayerMark | null

export type BoardState = CellValue[][]

export type WinState = PlayerMark | 'draw' | null

export type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished'

export interface BaseGameState {
  board: BoardState
  currentTurn: PlayerMark
  moveCount: number
}

export interface Player {
  userId: string
  remainingTime: number | null
  moves: Move[]
}

export interface GameState {
  baseGame: BaseGameState
  playerO: Player
  playerX: Player
  status: GameStatus
  winner: WinState
}

export interface GameConfig {
  timeLimit: number | null
  moveLimit: number | null
}
