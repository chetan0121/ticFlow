import { createContext } from 'react'
import { GAME_MODES, GAME_MOVE_LIMITS, GAME_TIME_CONTROLS } from '../../constants/menuConstants'

// Default Menu values (Add new Menu state here)
export const INITIAL_STATE = {
  selectedMode: GAME_MODES[0].value,
  timeControl: GAME_TIME_CONTROLS.value,
  moveLimit: GAME_MOVE_LIMITS.value,
}

export type GameMenuState = typeof INITIAL_STATE

type SetterName<Key extends string> = `set${Capitalize<Key>}`

export type GameMenuSetters = {
  [Key in keyof GameMenuState as SetterName<string & Key>]: (value: GameMenuState[Key]) => void
}

export interface MenuContextValueType {
  state: GameMenuState
  actions: GameMenuSetters
}

export const GameMenuContext = createContext<MenuContextValueType | undefined>(undefined)
