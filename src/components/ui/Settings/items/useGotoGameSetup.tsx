import { Gamepad2 } from "lucide-react"
import AppRoutes from "../../../../router/AppRoutes"
import { useNavigate } from "react-router-dom"

function useGotoGameSetup() {
  const nav = useNavigate()

  return {
    key: 'goGameSetup',
    label: 'Game Setup',
    Icon: Gamepad2,
    onClick: () => {
      void nav(AppRoutes.gameMenu.path)
    },
  }
}

export default useGotoGameSetup