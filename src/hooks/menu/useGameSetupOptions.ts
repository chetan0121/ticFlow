import {
  GAME_MODES,
  GAME_SUB_MODES,
  GAME_TIME_CONTROLS,
  GAME_MOVE_LIMITS,
  type CoreModes,
} from '../../constants/menuConstants'
import type { GameSetupOptions } from '../../types/menuOptions'
import { useMenuState } from './useMenuState'

export function useGameSetupOptions(): GameSetupOptions[] {
  const {
    state: { coreMode, subMode, timeControl, moveLimit },
    actions: { setCoreMode, setSubMode, setTimeControl, setMoveLimit },
  } = useMenuState()

  const { text: modeText, modes: codeModes } = GAME_MODES()
  const { text: subModeText, modes: subModes } = GAME_SUB_MODES(coreMode)

  const selectCoreMode = (value: string) => {
    const nextCoreMode = value as CoreModes
    setCoreMode(nextCoreMode)
    setSubMode(GAME_SUB_MODES(nextCoreMode).modes[0].value)
  }

  return [
    {
      key: 'mode',
      text: modeText,
      selection: {
        options: codeModes,
        currentOption: coreMode,
        selectOption: selectCoreMode,
      },
    },
    {
      key: 'subMode',
      text: subModeText,
      selection: {
        options: subModes,
        currentOption: subMode,
        selectOption: setSubMode as (value: string) => unknown,
      },
    },
    {
      key: 'turnTimer',
      text: GAME_TIME_CONTROLS.text,
      range: {
        ...GAME_TIME_CONTROLS.range,
        value: timeControl,
        setValue: setTimeControl,
      },
    },
    {
      key: 'moveCap',
      text: GAME_MOVE_LIMITS.text,
      range: {
        ...GAME_MOVE_LIMITS.range,
        value: moveLimit,
        setValue: setMoveLimit,
      },
    },
  ]
}
