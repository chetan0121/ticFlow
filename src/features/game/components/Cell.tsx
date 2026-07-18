import { Circle, X } from 'lucide-react'
import type { CellValue } from '../types'

interface CellProps {
  value: CellValue
  rowIndex: number
  cellIndex: number
  onClick: (rowIndex: number, cellIndex: number) => void
}

function BoardCell({ value, rowIndex, cellIndex, onClick }: CellProps) {
  const renderSign = () => {
    if (value === 'O') {
      return (
        <Circle
          className="h-8 w-8 text-[hsl(38,95%,62%)] drop-shadow-[0_0_10px_rgba(255,190,80,0.25)] sm:h-10 sm:w-10 md:h-12 md:w-12"
          strokeWidth={1.75}
          fill="none"
        />
      )
    } else if (value === 'X') {
      return (
        <X
          className="h-8 w-8 text-[hsl(38,95%,72%)] drop-shadow-[0_0_10px_rgba(255,220,140,0.2)] sm:h-10 sm:w-10 md:h-12 md:w-12"
          strokeWidth={2.2}
        />
      )
    }
    return null
  }

  return (
    <button
      type="button"
      aria-label={`Cell ${rowIndex + 1}, ${cellIndex + 1}`}
      onClick={() => onClick(rowIndex, cellIndex)}
      className="flex aspect-square min-w-0 items-center justify-center rounded-md border border-white/10 bg-white/6 font-['Oswald'] text-4xl font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:border-[hsl(38,95%,54%)]/60 hover:bg-white/11 focus-visible:border-[hsl(38,95%,54%)] focus-visible:ring-2 focus-visible:ring-[hsl(38,95%,54%)]/45 focus-visible:outline-none active:bg-white/16 sm:text-5xl md:text-6xl"
    >
      {renderSign()}
    </button>
  )
}

export default BoardCell
