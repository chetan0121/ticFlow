import { cloneGameState } from './state.js'
import type { GameConfig, GameState, Move } from './types.js'

export class GameEngine {
  private constructor() {}

  static nextMove(game: GameState, nextMove: Move, config: GameConfig): GameState | null {
    const board = game.baseGame.board
    const boardSize = board.length
    const boardWidth = board[0]?.length ?? 0

    if (boardSize === 0 || boardSize !== boardWidth) return null
    if (nextMove[0] < 0 || nextMove[1] < 0) return null
    if (nextMove[0] >= boardSize || nextMove[1] >= boardWidth) return null
    if (board[nextMove[0]]?.[nextMove[1]] !== null) return null
    if (game.status !== 'playing') return null

    const currentGame = cloneGameState(game)
    const currentBoard = currentGame.baseGame.board
    const currentMark = currentGame.baseGame.currentTurn
    const currentPlayer = currentMark === 'O' ? currentGame.playerO : currentGame.playerX
    const targetRow = currentBoard[nextMove[0]]

    if (!targetRow) return null

    targetRow[nextMove[1]] = currentMark
    currentPlayer.moves.push(nextMove)

    if (currentPlayer.moves.length > currentBoard.length) {
      const oldestMove = currentPlayer.moves.shift()
      if (!oldestMove) return null

      const previousRow = currentBoard[oldestMove[0]]
      if (previousRow) previousRow[oldestMove[1]] = null
    }

    if (
      currentPlayer.moves.length === currentBoard.length &&
      GameEngine.checkWon(currentPlayer.moves)
    ) {
      currentGame.winner = currentMark
      currentGame.status = 'finished'
      return currentGame
    }

    currentGame.baseGame.currentTurn = currentMark === 'O' ? 'X' : 'O'
    currentGame.baseGame.moveCount += 1

    if (config.moveLimit && currentGame.baseGame.moveCount >= config.moveLimit) {
      currentGame.winner = 'draw'
      currentGame.status = 'finished'
    }

    return currentGame
  }

  static checkWon(moves: Move[]): boolean {
    const size = moves.length
    let won = true

    for (let index = 1; index < size; index += 1) {
      const previousMove = moves[index - 1]
      const currentMove = moves[index]

      if (!previousMove || !currentMove || previousMove[0] !== currentMove[0]) {
        won = false
        break
      }
    }

    if (won) return true
    won = true

    for (let index = 1; index < size; index += 1) {
      const previousMove = moves[index - 1]
      const currentMove = moves[index]

      if (!previousMove || !currentMove || previousMove[1] !== currentMove[1]) {
        won = false
        break
      }
    }

    if (won) return true
    won = true

    for (const move of moves) {
      if (move[0] !== move[1]) {
        won = false
        break
      }
    }

    if (won) return true
    won = true

    for (const move of moves) {
      if (move[0] + move[1] !== size - 1) {
        won = false
        break
      }
    }

    return won
  }
}
