import type { Engine } from '../engine/GameEngine'
import type { GameCellClickHandler, GameState } from '../types'

type EngineInstance = InstanceType<typeof Engine>

export function flocalHandler(
  setGame: React.Dispatch<React.SetStateAction<GameState>>,
  engine: EngineInstance
): GameCellClickHandler {
  return (rowIndex: number, cellIndex: number) => {
    setGame(prev => {
      const newState = engine.nextMove(prev, [rowIndex, cellIndex])
      return newState ? newState : prev
    })
  }
}
