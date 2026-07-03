import type { RefObject } from 'react'
import { X } from 'lucide-react'
import SettingsRowHandler from './SettingsRowHandler'

interface SettingsPanelProps {
  panelRef: RefObject<HTMLDivElement | null>
  isOpen: boolean
  onClose: () => void
}

const MenuText = 'Settings'

function SettingsPanel({ panelRef, isOpen, onClose }: SettingsPanelProps) {
  return (
    <div
      className={`fixed top-0 left-0 z-50 flex h-full w-60 max-w-[80vw] flex-col border-r border-white/10 bg-linear-to-b from-[hsl(34,34%,16%)] via-[hsl(28,35%,12%)] to-[hsl(18,36%,9%)] shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-in-out will-change-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      ref={panelRef}
    >
      <div className="flex w-full items-center justify-between px-4 py-3">
        <h2 className="text-lg font-semibold">{MenuText}</h2>
        <button
          type="button"
          onClick={onClose}
          className="group flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-transparent text-white/70 hover:bg-white/10 hover:text-white active:scale-95"
          aria-label="Close settings"
        >
          <X
            size={18}
            strokeWidth={2.5}
            className="group-hover:animate-[spinning_0.2s_ease-out]"
          />
        </button>
      </div>

      <SettingsRowHandler />
    </div>
  )
}

export default SettingsPanel
