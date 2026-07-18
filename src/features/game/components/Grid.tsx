import type { BoardState } from '../types'
import BoardCell from './Cell'

interface GridProps {
  board: BoardState
  isLast: (rowIndex: number, cellIndex: number) => boolean
  onCellClick: (rowIndex: number, cellIndex: number) => void
}

function BoardGrid({ board, isLast, onCellClick }: GridProps) {
  const columnCount = board[0]?.length ?? 0

  return (
    <div
      className="grid aspect-square w-full max-w-[min(86vw,58vh,34rem)] gap-2 rounded-lg border border-white/14 bg-black/30 p-2 shadow-[0_22px_70px_rgba(0,0,0,0.38)] sm:gap-3 sm:p-3"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((value, cellIndex) => (
          <BoardCell
            key={`${rowIndex}-${cellIndex}`}
            value={value}
            rowIndex={rowIndex}
            cellIndex={cellIndex}
            isLast={isLast(rowIndex, cellIndex)}
            onClick={onCellClick}
          />
        ))
      )}
    </div>
  )
}

export default BoardGrid
