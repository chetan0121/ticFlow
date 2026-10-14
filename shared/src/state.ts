import type { BoardState, GameState } from './types.js'

export function createEmptyBoard(size: number): BoardState {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => null))
}

export function createDefaultGameState(boardSize = 3): GameState {
  return {
    baseGame: {
      board: createEmptyBoard(boardSize),
      currentTurn: 'O',
      moveCount: 0,
    },
    playerO: {
      userId: '1',
      remainingTime: null,
      moves: [],
    },
    playerX: {
      userId: '2',
      remainingTime: null,
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
