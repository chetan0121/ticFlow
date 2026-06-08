import { createContext } from 'react'
import type { GameMode, GameMoveLimit, GameTimeControl } from '../../constants/menuConstants'

export interface GameConfigState {
  selectedMode: GameMode
  timeControl: GameTimeControl
  moveLimit: GameMoveLimit
}

export interface GameConfigContextValue {
  state: GameConfigState
  actions: {
    setSelectedMode: (mode: GameMode) => void
    setTimeControl: (value: GameTimeControl) => void
    setMoveLimit: (value: GameMoveLimit) => void
  }
}

export const GameConfigContext = createContext<GameConfigContextValue | undefined>(undefined)
