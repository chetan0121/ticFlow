import { Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppRoutes from '../../../../router/AppRoutes'

export function useGoHome() {
  const nav = useNavigate()

  return {
    key: 'gohome',
    label: 'Home',
    Icon: Home,
    onClick: () => {
      void nav(AppRoutes.home.path)
    },
  }
}
