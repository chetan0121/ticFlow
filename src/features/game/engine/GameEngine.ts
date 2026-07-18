import { cloneGameState } from '../constants'
import type { GameConfig, GameState, Move } from '../types'

export class Engine {
  private readonly config: GameConfig
  private state: GameState

  constructor(config: GameConfig, state: GameState) {
    this.config = config
    this.state = cloneGameState(state)
    this.state.status = 'playing'
    this.state.baseGame.currentTurn = Math.random() < 0.5 ? 'O' : 'X'
  }

  nextMove(nextMove: Move): void {
    const board = this.state.baseGame.board

    if (board.length === 0 || board.length !== board[0].length) return
    if (nextMove[0] >= board.length || nextMove[1] >= board[0].length) return
    if (nextMove[0] < 0 || nextMove[1] < 0) return
    if (board[nextMove[0]][nextMove[1]] !== null) return
    if (this.state.status !== 'playing') return

    const currSign = this.state.baseGame.currentTurn
    const currPlayer = currSign === 'O' ? this.state.playerO : this.state.playerX

    // Add sign
    board[nextMove[0]][nextMove[1]] = currSign
    currPlayer.moves.push(nextMove)

    // Remove old sign
    if (currPlayer.moves.length > board.length) {
      const lastMove = currPlayer.moves.shift() as Move
      board[lastMove[0]][lastMove[1]] = null
    }

    // Check if winning
    if (currPlayer.moves.length === board.length && Engine.checkWon(currPlayer.moves)) {
      this.state.winner = currSign
      this.state.status = 'finished'
      return
    }

    // Change turn and increase total moves
    this.state.baseGame.currentTurn = currSign === 'O' ? 'X' : 'O'
    this.state.baseGame.moveCount += 1

    // Check move limit
    if (this.config.moveLimit && this.state.baseGame.moveCount >= this.config.moveLimit) {
      this.state.winner = 'draw'
      this.state.status = 'finished'
    }
  }

  tick(elapsedTimeInMs: number) {
    if (this.state.status !== 'playing') return
    if (this.config.timeLimit === null) return

    const currTurn = this.state.baseGame.currentTurn
    const currPlayer = currTurn == 'O' ? this.state.playerO : this.state.playerX
    currPlayer.remainingTime! -= elapsedTimeInMs

    if (currPlayer.remainingTime! <= 0.0) {
      this.state.winner = currTurn == 'O' ? 'X' : 'O'
      this.state.status = 'finished'
    }
  }

  getState(): GameState {
    return cloneGameState(this.state)
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
