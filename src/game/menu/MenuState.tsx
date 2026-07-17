import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import {
  GameMenuContext,
  INITIAL_STATE,
  type GameMenuSetters,
  type MenuStateType,
} from './MenuContext'

function toSetterName(key: string): keyof GameMenuSetters {
  return `set${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof GameMenuSetters
}

function createActions(setState: Dispatch<SetStateAction<MenuStateType>>): GameMenuSetters {
  return (Object.keys(INITIAL_STATE) as (keyof MenuStateType)[]).reduce((actions, key) => {
    return {
      ...actions,
      [toSetterName(key)]: (value: MenuStateType[typeof key]) => {
        setState(current => ({ ...current, [key]: value }))
      },
    }
  }, {} as GameMenuSetters)
}

// Stores Menu state and exposes setters
export function GameMenuProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MenuStateType>(INITIAL_STATE)

  const actions = useMemo(() => createActions(setState), [])

  const value = useMemo(
    () => ({
      state,
      actions,
    }),
    [actions, state]
  )

  return <GameMenuContext.Provider value={value}>{children}</GameMenuContext.Provider>
}
