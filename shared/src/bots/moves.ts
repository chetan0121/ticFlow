import type { BoardState, GameState, Move } from '../types.js'

export function getAvailableMoves(game: GameState): Move[] {
  return getAvailableMovesFromBoard(game.baseGame.board)
}

export function getAvailableMovesFromBoard(board: BoardState): Move[] {
  return board.flatMap((row, rowIndex) =>
    row.flatMap((cell, columnIndex) =>
      cell === null ? ([[rowIndex, columnIndex]] as Move[]) : []
    )
  )
}

export function orderMoves(moves: Move[], boardSize: number): Move[] {
  const center = (boardSize - 1) / 2

  return [...moves].sort((left, right) => {
    const leftDistance = Math.abs(left[0] - center) + Math.abs(left[1] - center)
    const rightDistance = Math.abs(right[0] - center) + Math.abs(right[1] - center)

    return leftDistance - rightDistance
  })
}
