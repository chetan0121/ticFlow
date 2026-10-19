import type { BoardState } from "../types";
import BoardCell from "./Cell";

interface GridProps {
  board: BoardState;
  isLast: (rowIndex: number, cellIndex: number) => boolean;
  onCellClick: (rowIndex: number, cellIndex: number) => void;
}

function BoardGrid({ board, isLast, onCellClick }: GridProps) {
  const columnCount = board[0]?.length ?? 0;

  return (
    <div className="mx-auto w-full max-w-[min(92vw,58vh,38rem)]">
      <div
        className="grid aspect-square w-full gap-1.5 rounded-2xl border border-amber-100/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.055),rgba(0,0,0,0.32))] p-1.5 shadow-[0_30px_90px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-sm sm:gap-2.5 sm:p-2.5"
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
          )),
        )}
      </div>
    </div>
  );
}

export default BoardGrid;
