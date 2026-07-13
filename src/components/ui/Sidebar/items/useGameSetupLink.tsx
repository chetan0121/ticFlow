import { Gamepad2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppRoutes from '../../../../router/AppRoutes'

function useGameSetupLink() {
  const nav = useNavigate()

  return {
    key: 'gameSetup',
    label: 'Game Setup',
    Icon: Gamepad2,
    onClick: () => {
      void nav(AppRoutes.gameMenu.path)
    },
  }
}

export default useGameSetupLink
