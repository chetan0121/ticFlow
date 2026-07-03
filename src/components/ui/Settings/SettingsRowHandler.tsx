import type { LucideIcon } from 'lucide-react'
import useFullscreenSetting from './items/useFullscreenSetting'
import { useGoHome } from './items/useGoHome'
import useGotoGameSetup from './items/useGotoGameSetup'

interface SettingsRow {
  key: string
  label: string
  Icon: LucideIcon
  onClick: () => void
}

function SettingsRowHandler() {
  const goHome = useGoHome()
  const goGameSetup = useGotoGameSetup()
  const fullscreenSetting = useFullscreenSetting()
  const rows: SettingsRow[] = [goHome, goGameSetup, fullscreenSetting]

  return (
    <div className="border-y border-t-3 border-white/10 border-t-white/20">
      {rows.map(row => (
        <button
          key={row.key}
          type="button"
          onClick={row.onClick}
          className="group flex h-11 w-full items-center justify-between gap-3 border-x-0 border-t-0 border-b border-white/10 bg-transparent px-4 text-left font-['Montserrat'] text-base font-semibold text-white/80 transition-colors duration-200 last:border-b-0 hover:bg-white/10 hover:text-white"
        >
          <span className="min-w-0 truncate">{row.label}</span>
          <span className="flex shrink-0 items-center justify-center text-[hsl(38,95%,70%)] transition-colors duration-200 group-hover:text-[hsl(38,95%,62%)]">
            <row.Icon size={18} strokeWidth={2.4} />
          </span>
        </button>
      ))}
    </div>
  )
}

export default SettingsRowHandler
