import {
  GAME_MODES,
  GAME_MOVE_LIMITS,
  GAME_TIME_CONTROLS,
  type OptionSelection,
  type RangeConfig,
} from '../state/constants/menuConstants'
import { useGameConfigState } from '../state/game/config/useGameConfigState'

const GAME_SETUP_TEXT = {
  mode: {
    label: 'Play With',
    helper: 'Choose who you want to play against',
    modalTitle: 'Select Mode',
    listboxLabel: 'Play with',
  },
  turnTimer: {
    label: 'Player Timer',
    helper: 'The time each player gets (in minutes)',
  },
  moveCap: {
    label: 'Move Cap',
    helper: 'The total move limit before a draw',
  },
}

export type SetupText = {
  label: string
  helper: string
  modalTitle?: string
  listboxLabel?: string
}

export interface DropDownOptions {
  key: string
  text: SetupText
  selection: OptionSelection
}

export interface RangeOptions {
  key: string
  text: SetupText
  range: RangeConfig & {
    setValue: (value: RangeConfig['value']) => void
  }
}

type GameSetupOptions = DropDownOptions | RangeOptions

export function useGameSetupOptions(): readonly GameSetupOptions[] {
  const {
    state: { selectedMode, timeControl, moveLimit },
    actions: { setSelectedMode, setTimeControl, setMoveLimit },
  } = useGameConfigState()

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
