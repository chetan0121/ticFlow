import {
  GAME_MODES,
  GAME_MOVE_LIMITS,
  GAME_SETUP_TEXT,
  GAME_TIME_CONTROLS,
  type OptionSelection,
  type GameParamRange,
  type SetupText,
} from '../state/constants/menuConstants'
import { useMenuState } from '../state/game/Menu/useMenuState'

export interface DropDownOptions {
  key: string
  text: SetupText
  selection: OptionSelection
}

export interface RangeOptions {
  key: string
  text: SetupText
  range: GameParamRange & {
    setValue: (value: GameParamRange['value']) => void
  }
}

type GameSetupOptions = DropDownOptions | RangeOptions

export function useGameSetupOptions(): readonly GameSetupOptions[] {
  const {
    state: { selectedMode, timeControl, moveLimit },
    actions: { setSelectedMode, setTimeControl, setMoveLimit },
  } = useMenuState()

  return [
    {
      key: 'mode',
      text: GAME_SETUP_TEXT.mode,
      selection: {
        options: GAME_MODES,
        currentOption: selectedMode,
        selectOption: setSelectedMode,
      },
    },
    {
      key: 'turnTimer',
      text: GAME_SETUP_TEXT.turnTimer,
      range: {
        min: GAME_TIME_CONTROLS.min,
        max: GAME_TIME_CONTROLS.max,
        step: GAME_TIME_CONTROLS.step,
        value: timeControl,
        setValue: setTimeControl,
      },
    },
    {
      key: 'moveCap',
      text: GAME_SETUP_TEXT.moveCap,
      range: {
        min: GAME_MOVE_LIMITS.min,
        max: GAME_MOVE_LIMITS.max,
        step: GAME_MOVE_LIMITS.step,
        value: moveLimit,
        setValue: setMoveLimit,
      },
    },
  ] as const
}
