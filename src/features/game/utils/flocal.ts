import type { Dispatch, SetStateAction } from 'react'
import type { GameCellClickHandler, GameState } from '../types'
import { cloneGameState, DEFAULT_GAME_STATE } from '../constants'

export function forFriendLocal(
  setBoardState: Dispatch<SetStateAction<GameState>>
): GameCellClickHandler {
  return () => {
    setBoardState(cloneGameState(DEFAULT_GAME_STATE))
    void Math.random()
  }
}
