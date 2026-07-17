import type { GameConfig, GameState, Move } from '../../types/gameTypes'
import { cloneGameState } from '../board/GameConstants'

export class engine {
  private readonly config: GameConfig

  constructor(config: GameConfig) {
    this.config = config
  }

  nextMove(game: GameState, nextMove: Move): GameState | null {
    const board = game.baseGame.board

    if (board.length === 0 || board.length !== board[0].length) return null
    if (nextMove[0] >= board.length || nextMove[1] >= board[0].length) return null
    if (nextMove[0] < 0 || nextMove[1] < 0) return null
    if (board[nextMove[0]][nextMove[1]] !== null) return null
    if (game.status !== 'playing') return null

    const currGame = cloneGameState(game)
    const currBoard = currGame.baseGame.board
    const currSign = currGame.baseGame.currentTurn
    const currPlayer = currSign === 'O' ? currGame.playerO : currGame.playerX

    // Add sign
    currBoard[nextMove[0]][nextMove[1]] = currSign
    currPlayer.moves.push(nextMove)

    // Remove old sign
    if (currPlayer.moves.length > currBoard.length) {
      const lastMove = currPlayer.moves.shift() as Move
      currBoard[lastMove[0]][lastMove[1]] = null
    }

    // Check if winning
    if (currPlayer.moves.length === currBoard.length && engine.checkWon(currPlayer.moves)) {
      currGame.winner = currSign
      currGame.status = 'finished'
      return currGame
    }

    // Change turn and increase total moves
    currGame.baseGame.currentTurn = currSign === 'O' ? 'X' : 'O'
    currGame.baseGame.moveCount += 1

    // Check move limit
    if (this.config.moveLimit && currGame.baseGame.moveCount >= this.config.moveLimit) {
      currGame.winner = 'draw'
      currGame.status = 'finished'
    }

    return currGame
  }

  static checkWon(currMoves: Move[]) {
    const n = currMoves.length // Assuming len of square board
    let won = true

    // Check rows
    for (let i = 1; i < n; i++) {
      if (currMoves[i - 1][0] !== currMoves[i][0]) {
        won = false
        break
      }
    }

    if (won) return true
    won = true

    // Check cols
    for (let i = 1; i < n; i++) {
      if (currMoves[i - 1][1] !== currMoves[i][1]) {
        won = false
        break
      }
    }

    if (won) return true
    won = true

    // Check diagonal left to right (\)
    for (const move of currMoves) {
      if (move[0] !== move[1]) {
        won = false
        break
      }
    }

    if (won) return true
    won = true

    // Check diagonal right to left (/)
    for (const move of currMoves) {
      if (move[0] + move[1] !== n - 1) {
        won = false
        break
      }
    }

    return won
  }
}
