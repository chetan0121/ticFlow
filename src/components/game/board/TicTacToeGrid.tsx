import type { BoardState } from '../../../types/gameTypes'
import TicTacToeCell from './TicTacToeCell'

interface TicTacToeGridProps {
  board: BoardState
  onCellClick: (rowIndex: number, cellIndex: number) => void
}

function TicTacToeGrid({ board, onCellClick }: TicTacToeGridProps) {
  const columnCount = board[0]?.length ?? 0

  return (
    <div
      className="grid aspect-square w-full max-w-[min(82vw,70vh,42rem)] gap-2 rounded-lg border border-white/12 bg-black/25 p-2 shadow-2xl shadow-black/35 sm:gap-3 sm:p-3"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((value, cellIndex) => (
          <TicTacToeCell
            key={`${rowIndex}-${cellIndex}`}
            value={value}
            rowIndex={rowIndex}
            cellIndex={cellIndex}
            onClick={onCellClick}
          />
        ))
      )}
    </div>
  )
}

export default TicTacToeGrid
