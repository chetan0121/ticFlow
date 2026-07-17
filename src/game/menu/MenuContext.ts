import { createContext } from 'react'
import {
  GAME_MODES,
  GAME_MOVE_LIMITS,
  GAME_SUB_MODES,
  GAME_TIME_CONTROLS,
  type CoreModes,
  type RangeValue,
  type SubModes,
} from '../../constants/menuConstants'

// Default Menu values (Add new Menu state here)
const defaultCoreMode = GAME_MODES().modes[0].value
const defaultSubMode = GAME_SUB_MODES(defaultCoreMode).modes[0].value

export interface MenuStateType {
  coreMode: CoreModes
  subMode: SubModes
  timeControl: RangeValue
  moveLimit: RangeValue
}

export const INITIAL_STATE = {
  coreMode: defaultCoreMode,
  subMode: defaultSubMode,
  timeControl: GAME_TIME_CONTROLS.range.value,
  moveLimit: GAME_MOVE_LIMITS.range.value,
} satisfies MenuStateType

type SetterName<Key extends string> = `set${Capitalize<Key>}`

export type GameMenuSetters = {
  [Key in keyof MenuStateType as SetterName<string & Key>]: (value: MenuStateType[Key]) => void
}

export interface MenuContextType {
  state: MenuStateType
  actions: GameMenuSetters
}

export const GameMenuContext = createContext<MenuContextType | undefined>(undefined)
