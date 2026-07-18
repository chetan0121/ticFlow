import { useState } from 'react'
import { cloneGameState, DEFAULT_GAME_STATE } from '../constants'
import { forFriendLocal } from '../utils/flocal'
import type { GameCellClickHandler, GameState } from '../types'
import { useMenuContext } from '../../menu/hooks/useMenuContext'

function useBoard() {
  const {
    state: { timeControl, subMode },
  } = useMenuContext()
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

export default useBoard
