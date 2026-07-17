import type { CellValue } from '../../../types/gameTypes'

interface TicTacToeCellProps {
  value: CellValue
  rowIndex: number
  cellIndex: number
  onClick: (rowIndex: number, cellIndex: number) => void
}

function TicTacToeCell({ value, rowIndex, cellIndex, onClick }: TicTacToeCellProps) {
  return (
    <button
      type="button"
      aria-label={`Cell ${rowIndex + 1}, ${cellIndex + 1}`}
      onClick={() => onClick(rowIndex, cellIndex)}
      className="aspect-square min-w-0 rounded-md border border-white/10 bg-white/6 font-['Oswald'] text-4xl font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:border-[hsl(38,95%,54%)]/60 hover:bg-white/11 focus-visible:border-[hsl(38,95%,54%)] focus-visible:ring-2 focus-visible:ring-[hsl(38,95%,54%)]/45 focus-visible:outline-none active:bg-white/16 sm:text-5xl md:text-6xl"
    >
      {value}
    </button>
  )
}

export default TicTacToeCell
