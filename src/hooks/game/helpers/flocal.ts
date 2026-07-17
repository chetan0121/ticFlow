import type { Dispatch, SetStateAction } from 'react'
import type { GameCellClickHandler, GameState } from '../../../types/gameTypes'
import { cloneGameState, DEFAULT_GAME_STATE } from '../../../game/board/GameConstants'

export function forFriendLocal(
  setBoardState: Dispatch<SetStateAction<GameState>>
): GameCellClickHandler {
  return () => {
    setBoardState(cloneGameState(DEFAULT_GAME_STATE))
    void Math.random()
  }
}
