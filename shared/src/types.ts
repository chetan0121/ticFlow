export type PlayerMark = 'O' | 'X'

export type Move = [number, number]

export type CellValue = PlayerMark | null

export type BoardState = CellValue[][]

export type WinState = PlayerMark | 'draw' | null

export type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished'

export type OnlineModeKind = 'friend' | 'matchmaking'

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

export interface FriendGamePlayer {
  id: string
  username: string
  mark: PlayerMark
  connected: boolean
}

/** The only game state sent over the network. The server remains authoritative. */
export interface FriendGameSnapshot {
  id: string
  inviteCode: string
  config: GameConfig
  game: GameState
  players: Partial<Record<PlayerMark, FriendGamePlayer>>
  myMark: PlayerMark | null
  drawRequestedBy: PlayerMark[]
  rematchRequestedBy: PlayerMark[]
}

export interface SocketCommandResult {
  error?: string
}

export interface CreateFriendGameResult extends SocketCommandResult {
  game?: FriendGameSnapshot
}

export interface JoinFriendGameResult extends SocketCommandResult {
  game?: FriendGameSnapshot
}

export interface MatchmakingSnapshot {
  id: string
  config: GameConfig
  game: GameState
  players: Partial<Record<PlayerMark, FriendGamePlayer>>
  myMark: PlayerMark | null
  drawRequestedBy: PlayerMark[]
  rematchRequestedBy: PlayerMark[]
}

export interface QueueMatchmakingResult extends SocketCommandResult {
  game?: MatchmakingSnapshot
  queued?: boolean
}
