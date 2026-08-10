import {
  GAME_MODES,
  GAME_SUB_MODES,
  GAME_TIME_CONTROLS,
  GAME_MOVE_LIMITS,
  type CoreModes,
  type SubModes,
} from '../constants'
import type { GameSetupOptions } from '../types'
import { useMenuContext } from './useMenuContext'

export function useGameSetupOptions(): GameSetupOptions[] {
  const {
    state: { coreMode, subMode, timeControl, moveLimit },
    actions: { setCoreMode, setSubMode, setTimeControl, setMoveLimit },
  } = useMenuContext()

  const { text: modeText, modes: codeModes } = GAME_MODES()
  const { text: subModeText, modes: subModes } = GAME_SUB_MODES(coreMode)

  const selectCoreMode = (value: string) => {
    const nextCoreMode = value as CoreModes
    const nextSubMode = GAME_SUB_MODES(nextCoreMode).modes[0]?.value ?? 'flocal'

    setCoreMode(nextCoreMode)
    setSubMode(nextSubMode as SubModes)
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
        selectOption: setSubMode as (value: string) => void,
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
