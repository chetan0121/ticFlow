import type { RefObject } from 'react'
import { Grid3X3, SidebarClose } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppRoutes from '../../../router/AppRoutes'
import SidebarNavigation from './SidebarNavigation'

interface SidebarPanelProps {
  panelRef: RefObject<HTMLDivElement | null>
  isOpen: boolean
  onClose: () => void
}

const BrandText = 'TicFlow'
const BottomLine = 'Classic strategy, clean moves.'

function SidebarPanel({ panelRef, isOpen, onClose }: SidebarPanelProps) {
  const navigate = useNavigate()

  const goHome = () => {
    void navigate(AppRoutes.home.path)
    onClose()
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] transition-opacity duration-200 ease-out ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onPointerDown={onClose}
        aria-hidden="true"
      />

      <div
        className={`fixed top-0 left-0 z-50 flex h-dvh w-72 max-w-[84vw] flex-col overflow-hidden border-r border-white/10 bg-linear-to-b from-[hsl(34,34%,16%)] via-[hsl(28,35%,12%)] to-[hsl(18,36%,9%)] shadow-[18px_0_55px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform max-[350px]:w-screen max-[350px]:max-w-none ${
          isOpen ? 'translate-x-0 opacity-100' : '-translate-x-[calc(100%+12px)] opacity-0'
        }`}
        ref={panelRef}
        aria-hidden={!isOpen}
      >
        <div className="flex w-full items-center justify-between border-b border-white/10 px-4 py-4">
          <button
            type="button"
            onClick={goHome}
            className="group flex min-w-0 items-center gap-3 rounded-md border border-transparent bg-transparent px-1 py-1 text-left transition-colors duration-200 hover:border-white/10 hover:bg-white/5 active:scale-[0.98]"
            aria-label="Go to home"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[hsl(38,95%,62%)]/35 bg-[hsl(38,95%,54%)]/15 text-[hsl(38,95%,68%)] shadow-[0_0_18px_rgba(245,171,42,0.15)] transition-colors duration-200 group-hover:bg-[hsl(38,95%,54%)]/25">
              <Grid3X3 size={19} strokeWidth={2.5} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-['Oswald'] text-2xl leading-6 font-semibold tracking-wide text-white">
                {BrandText}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/3 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
            aria-label="Close sidebar"
          >
            <SidebarClose size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="h-px w-full bg-linear-to-r from-transparent via-[hsl(38,95%,62%)]/35 to-transparent" />

        <SidebarNavigation />

        <div className="mt-auto border-t border-white/10 px-4 py-4 font-['Montserrat'] text-xs text-white/35">
          {BottomLine}
        </div>
      </div>
    </>
  )
}

export default SidebarPanel
