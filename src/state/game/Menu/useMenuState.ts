import { useContext } from 'react'
import { GameMenuContext, type MenuContextValueType } from './MenuContext'

// Access context with this safe hook
export function useMenuState(): MenuContextValueType {
  const context = useContext<MenuContextValueType | undefined>(GameMenuContext)

  // Check if exist/created
  if (!context) {
    throw new Error('useMenuState must be used within GameMenuProvider')
  }

  return context
}
