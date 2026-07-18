import type { BoardState, GameState } from './types'

export function createEmptyBoard(size: number): BoardState {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null))
}

export function createDefaultGameState(boardSize: number = 3): GameState {
  return {
    baseGame: {
      board: createEmptyBoard(boardSize),
      currentTurn: 'O',
      onCellClick: () => null,
      moveCount: 0,
    },
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
