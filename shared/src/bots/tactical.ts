import { GameEngine } from '../engine.js'
import { getAvailableMoves, orderMoves } from './moves.js'
import type { GameConfig, GameState, Move } from '../types.js'

export class TacticalBot {
  nextMove(game: GameState, config: GameConfig): GameState | null {
    const moves = orderMoves(getAvailableMoves(game), game.baseGame.board.length)

    if (moves.length === 0 || game.status !== 'playing') return null

    const winningMove = moves.find(move => this.winsWithMove(game, move, config))
    if (winningMove) return GameEngine.nextMove(game, winningMove, config)

    const safeMove = moves.find(move => !this.givesOpponentWin(game, move, config))
    const selectedMove = safeMove ?? moves[0]

    return selectedMove ? GameEngine.nextMove(game, selectedMove, config) : null
  }

  private winsWithMove(game: GameState, move: Move, config: GameConfig): boolean {
    const nextGame = GameEngine.nextMove(game, move, config)
    return nextGame?.winner === game.baseGame.currentTurn
  }

  private givesOpponentWin(game: GameState, move: Move, config: GameConfig): boolean {
    const nextGame = GameEngine.nextMove(game, move, config)
    if (!nextGame || nextGame.status !== 'playing') return false

    return getAvailableMoves(nextGame).some(opponentMove => {
      const opponentGame = GameEngine.nextMove(nextGame, opponentMove, config)
      return opponentGame?.winner === nextGame.baseGame.currentTurn
    })
  }
}
