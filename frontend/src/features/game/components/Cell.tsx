import { Circle, X } from 'lucide-react'
import type { CellValue } from '../types'

const MARK_STYLES: Record<Exclude<CellValue, null>, string> = {
  O: 'border-cyan-300/50 bg-cyan-400/10 text-cyan-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_24px_rgba(34,211,238,0.14)]',
  X: 'border-rose-300/50 bg-rose-400/10 text-rose-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_24px_rgba(251,113,133,0.14)]',
}

interface CellProps {
  value: CellValue
  rowIndex: number
  cellIndex: number
  isLast: boolean
  onClick: (rowIndex: number, cellIndex: number) => void
}

function BoardCell({ value, rowIndex, cellIndex, isLast, onClick }: CellProps) {
  const renderSign = () => {
    if (value === 'O') {
      return (
        <Circle
          className="h-[46%] w-[46%] text-cyan-200 drop-shadow-[0_0_14px_rgba(103,232,249,0.32)]"
          strokeWidth={1.75}
          fill="none"
        />
      )
    } else if (value === 'X') {
      return (
        <X
          className="h-[52%] w-[52%] text-rose-200 drop-shadow-[0_0_14px_rgba(253,164,175,0.3)]"
          strokeWidth={2.45}
        />
      )
    }
    return null
  }

  const cellStateClass = value
    ? MARK_STYLES[value]
    : 'border-white/10 bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] hover:-translate-y-0.5 hover:border-amber-300/55 hover:bg-white/10 active:translate-y-0 active:bg-white/14'
  const lastMoveClass = isLast ? 'saturate-85 ring-2 ring-amber-200/50' : ''

  return (
    <button
      type="button"
      aria-label={
        value
          ? `Cell ${rowIndex + 1}, ${cellIndex + 1}, ${value}`
          : `Empty cell ${rowIndex + 1}, ${cellIndex + 1}`
      }
      onClick={() => onClick(rowIndex, cellIndex)}
      disabled={value !== null}
      className={`relative flex aspect-square min-w-0 items-center justify-center rounded-lg border transition-[background,border-color,box-shadow,opacity,transform] duration-200 focus-visible:border-amber-300 focus-visible:ring-2 focus-visible:ring-amber-300/45 focus-visible:outline-none disabled:cursor-default ${cellStateClass} ${lastMoveClass}`}
    >
      {isLast ? (
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(253,230,138,0.75)]" />
      ) : null}
      {renderSign()}
    </button>
  )
}

export default BoardCell
