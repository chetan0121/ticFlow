import { createContext } from 'react'
import { GAME_MODES, GAME_MOVE_LIMITS, GAME_TIME_CONTROLS } from '../../constants/menuConstants'

// Default config values (Add new config state here)
export const INITIAL_STATE = {
  selectedMode: GAME_MODES[0].value,
  timeControl: GAME_TIME_CONTROLS.value,
  moveLimit: GAME_MOVE_LIMITS.value,
}

export type GameConfigState = typeof INITIAL_STATE

type SetterName<Key extends string> = `set${Capitalize<Key>}`

export type GameConfigActions = {
  [Key in keyof GameConfigState as SetterName<string & Key>]: (
    value: GameConfigState[Key]
  ) => void
}

export interface GameConfigContextValue {
  state: GameConfigState
  actions: GameConfigActions
}

export const GameConfigContext = createContext<GameConfigContextValue | undefined>(undefined)
