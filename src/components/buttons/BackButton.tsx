import { ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppRoutes from '../../router/AppRoutes'

const BACK_TARGETS: Partial<Record<string, string>> = {
  [AppRoutes.gameMenu.path]: AppRoutes.home.path,
  [AppRoutes.gameBoard.path]: AppRoutes.gameMenu.path,
}

function BackButton() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const targetPath = BACK_TARGETS[pathname]

  if (!targetPath) return null

  return (
    <button
      type="button"
      onClick={() => {
        void navigate(targetPath)
      }}
      className="group z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/10 text-white/85 shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-200 ease-out hover:bg-white/10 hover:text-white active:scale-95"
      aria-label="Go back"
    >
      <ArrowLeft
        size={22}
        strokeWidth={2.5}
        className="transition-transform duration-200 ease-out group-hover:text-white"
      />
    </button>
  )
}

export default BackButton
