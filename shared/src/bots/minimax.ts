import { GameEngine } from '../engine.js'
import { getAvailableMoves, orderMoves } from './moves.js'
import type { GameConfig, GameState, PlayerMark } from '../types.js'

const SEARCH_DEPTH = 8
const WIN_SCORE = 100_000

export class MinimaxBot {
  nextMove(game: GameState, config: GameConfig): GameState | null {
    const moves = orderMoves(getAvailableMoves(game), game.baseGame.board.length)

    if (moves.length === 0 || game.status !== 'playing') return null

    const botMark = game.baseGame.currentTurn
    let bestMove = moves[0]
    let bestScore = Number.NEGATIVE_INFINITY
    let alpha = Number.NEGATIVE_INFINITY

    for (const move of moves) {
      const nextGame = GameEngine.nextMove(game, move, config)
      if (!nextGame) continue

      const score = this.search(
        nextGame,
        config,
        botMark,
        SEARCH_DEPTH - 1,
        alpha,
        Number.POSITIVE_INFINITY
      )

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }

      alpha = Math.max(alpha, bestScore)
    }

    return bestMove ? GameEngine.nextMove(game, bestMove, config) : null
  }

  private search(
    game: GameState,
    config: GameConfig,
    botMark: PlayerMark,
    depth: number,
    alpha: number,
    beta: number
  ): number {
    const terminalScore = this.getTerminalScore(game, botMark, depth)
    if (terminalScore !== null) return terminalScore
    if (depth === 0) return this.getHeuristicScore(game, botMark, config)

    const moves = orderMoves(getAvailableMoves(game), game.baseGame.board.length)
    if (moves.length === 0) return 0

    const maximizing = game.baseGame.currentTurn === botMark
    let bestScore = maximizing ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY

    for (const move of moves) {
      const nextGame = GameEngine.nextMove(game, move, config)
      if (!nextGame) continue

      const score = this.search(nextGame, config, botMark, depth - 1, alpha, beta)

      if (maximizing) {
        bestScore = Math.max(bestScore, score)
        alpha = Math.max(alpha, bestScore)
      } else {
        bestScore = Math.min(bestScore, score)
        beta = Math.min(beta, bestScore)
      }

      if (beta <= alpha) break
    }

    return bestScore
  }

  private getTerminalScore(game: GameState, botMark: PlayerMark, depth: number): number | null {
    if (game.status !== 'finished') return null
    if (game.winner === 'draw') return 0
    if (game.winner === botMark) return WIN_SCORE + depth
    return -WIN_SCORE - depth
  }

  private getHeuristicScore(game: GameState, botMark: PlayerMark, config: GameConfig): number {
    const opponent: PlayerMark = botMark === 'O' ? 'X' : 'O'
    const botThreats = this.countWinningMoves(game, botMark, config)
    const opponentThreats = this.countWinningMoves(game, opponent, config)

    return (botThreats - opponentThreats) * 100
  }

  private countWinningMoves(game: GameState, mark: PlayerMark, config: GameConfig): number {
    if (game.baseGame.currentTurn !== mark) return 0

    return getAvailableMoves(game).filter(move => {
      const nextGame = GameEngine.nextMove(game, move, config)
      return nextGame?.winner === mark
    }).length
  }
}
