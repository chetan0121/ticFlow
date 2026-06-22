import { useContext } from 'react'
import { GameMenuContext, type MenuContextType } from '../state/game/menu/MenuContext'

// Access context with this safe hook
export function useMenuState(): MenuContextType {
  const context = useContext<MenuContextType | undefined>(GameMenuContext)

  // Check if exist/created
  if (!context) {
    throw new Error('useMenuState must be used within GameMenuProvider')
  }

  return context
}
