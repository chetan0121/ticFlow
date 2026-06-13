import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import {
  GameConfigContext,
  INITIAL_STATE,
  type GameConfigActions,
  type GameConfigState,
} from './gameConfigContext'

function toSetterName(key: string): keyof GameConfigActions {
  return `set${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof GameConfigActions
}

function createActions(setState: Dispatch<SetStateAction<GameConfigState>>): GameConfigActions {
  return (Object.keys(INITIAL_STATE) as (keyof GameConfigState)[]).reduce((actions, key) => {
    return {
      ...actions,
      [toSetterName(key)]: (value: GameConfigState[typeof key]) => {
        setState(current => ({ ...current, [key]: value }))
      },
    }
  }, {} as GameConfigActions)
}

// Stores config state and exposes setters
export function GameConfigProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameConfigState>(INITIAL_STATE)

  const actions = useMemo(() => createActions(setState), [])

  const value = useMemo(
    () => ({
      state,
      actions,
    }),
    [actions, state]
  )

  return <GameConfigContext.Provider value={value}>{children}</GameConfigContext.Provider>
}
