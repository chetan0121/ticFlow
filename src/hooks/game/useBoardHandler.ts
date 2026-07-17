import { useState } from 'react'
import { cloneGameState, DEFAULT_GAME_STATE } from '../../game/board/GameConstants'
import type { GameCellClickHandler, GameState } from '../../types/gameTypes'
import { useMenuState } from '../menu/useMenuState'
import { forFriendLocal } from './helpers/flocal'

function useBoardHandler() {
  const {
    state: { timeControl, subMode },
  } = useMenuState()
  const initialBoardState: GameState = cloneGameState(DEFAULT_GAME_STATE)
  initialBoardState.playerO.remainingTime = timeControl
  initialBoardState.playerX.remainingTime = timeControl
  const [boardState, setBoardState] = useState(initialBoardState)
  let onCellClick: GameCellClickHandler = DEFAULT_GAME_STATE.baseGame.onCellClick
  switch (subMode) {
    case 'flocal':
      onCellClick = forFriendLocal(setBoardState)
      break
    default:
      break
  }
  return {
    ...boardState.baseGame,
    onCellClick,
    playerO: boardState.playerO,
    playerX: boardState.playerX,
  }
}

export default useBoardHandler
