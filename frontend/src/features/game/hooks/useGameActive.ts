import { useSyncExternalStore, type Dispatch, type SetStateAction } from 'react'

let gameActive = false

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return gameActive
}

function setGameActive(nextValue: SetStateAction<boolean>) {
  const nextActive = typeof nextValue === 'function' ? nextValue(gameActive) : nextValue

  if (Object.is(gameActive, nextActive)) return

  gameActive = nextActive
  listeners.forEach(listener => listener())
}

/**
 * Tracks whether the current game flow should block leaving the board.
 *
 * The value is shared across the tree so the board can enable the guard and
 * the back button can observe it from anywhere inside React.
 */
export function useGameActive(): [boolean, Dispatch<SetStateAction<boolean>>] {
  const isActive = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return [isActive, setGameActive]
}
