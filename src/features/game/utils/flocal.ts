import type { Engine } from '../engine/GameEngine'

import type { GameCellClickHandler, GameState } from '../types'

type EngineInstance = InstanceType<typeof Engine>

export function forFriendLocal(
  setGame: React.Dispatch<React.SetStateAction<GameState>>,
  engine: EngineInstance
): GameCellClickHandler {
  return (rowIndex: number, cellIndex: number) => {
    engine.nextMove([rowIndex, cellIndex])
    setGame(engine.getState())
  }
}
