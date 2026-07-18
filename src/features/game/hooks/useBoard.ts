import { useState } from 'react'
import { createDefaultGameState } from '../constants'
import { useMenuContext } from '../../menu/hooks/useMenuContext'
import type { GameCellClickHandler, GameConfig } from '../types'

import { forFriendLocal } from '../utils/flocal'
import { Engine } from '../engine/GameEngine'

function useBoard() {
  const { state } = useMenuContext()
  const config: GameConfig = {
    subMode: state.subMode,
    timeLimit: state.timeControl,
    moveLimit: state.moveLimit,
  }

  const [game, setGame] = useState(createDefaultGameState())
  const engine = new Engine(config, game)

  let onCellClick: GameCellClickHandler = () => undefined

  switch (state.subMode) {
    case 'flocal':
      onCellClick = forFriendLocal(setGame, engine)
      break
  }

  return {
    board: game.baseGame.board,
    onCellClick,
  }
}

export default useBoard
