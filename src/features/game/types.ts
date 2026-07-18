import type { RangeValue } from '../menu/constants'
import type { SubModes } from '../menu/constants'

export type PlayerMark = 'O' | 'X'

export type Move = [number, number]

export type CellValue = PlayerMark | null

export type BoardState = CellValue[][]

export type GameCellClickHandler = (rowIndex: number, cellIndex: number) => void

export type WinState = PlayerMark | 'draw' | null

export type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished'

export interface BaseGameState {
  board: BoardState
  currentTurn: PlayerMark
  onCellClick: GameCellClickHandler
  moveCount: number
}

export interface Player {
  userId: string
  remainingTime: RangeValue
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
  subMode: SubModes
  timeLimit: RangeValue
  moveLimit: RangeValue
}
