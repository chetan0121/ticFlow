import type { BoardState, BaseGameState, GameState } from '../../types/gameTypes'

export const DEFAULT_BOARD_STATE: BoardState = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
]

export const DEFAULT_BASE_GAME: BaseGameState = {
  board: DEFAULT_BOARD_STATE,
  currentTurn: 'O',
  onCellClick: () => null,
  moveCount: 0,
}

export const DEFAULT_GAME_STATE: GameState = {
  baseGame: DEFAULT_BASE_GAME,
  playerO: {
    userId: '1',
    remainingTime: 0,
    moves: [],
  },
  playerX: {
    userId: '2',
    remainingTime: 0,
    moves: [],
  },
  status: 'waiting',
  winner: null,
}

export function cloneGameState(gameState: GameState): GameState {
  return {
    ...gameState,
    baseGame: {
      ...gameState.baseGame,
      board: gameState.baseGame.board.map(row => [...row]),
    },
    playerO: {
      ...gameState.playerO,
      moves: gameState.playerO.moves.map(move => [...move]),
    },
    playerX: {
      ...gameState.playerX,
      moves: gameState.playerX.moves.map(move => [...move]),
    },
  }
}
