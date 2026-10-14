import { GameEngine } from '../engine.js'
import { getAvailableMoves } from './moves.js'
import type { GameConfig, GameState, Move } from '../types.js'

export class RandomBot {
  private readonly random: () => number

  constructor(random: () => number = Math.random) {
    this.random = random
  }

  nextMove(game: GameState, config: GameConfig): GameState | null {
    const availableMoves = this.getAvailableMoves(game)

    if (availableMoves.length === 0) return null

    const moveIndex = Math.min(
      availableMoves.length - 1,
      Math.floor(this.random() * availableMoves.length)
    )
    const move = availableMoves[moveIndex]

    return move ? GameEngine.nextMove(game, move, config) : null
  }

  private getAvailableMoves(game: GameState): Move[] {
    return game.status === 'playing' ? getAvailableMoves(game) : []
  }
}
