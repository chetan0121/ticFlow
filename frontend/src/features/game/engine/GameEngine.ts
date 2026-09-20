import { cloneGameState } from "../constants.ts";
import type { GameConfig, GameState, Move } from "../types.ts";

export class Engine {
  private constructor() {}

  static nextMove(
    game: GameState,
    nextMove: Move,
    config: GameConfig,
  ): GameState | null {
    const board = game.baseGame.board;
    const boardSize = board.length;
    const boardWidth = board[0]?.length ?? 0;

    if (boardSize === 0 || boardSize !== boardWidth) return null;
    if (nextMove[0] < 0 || nextMove[1] < 0) return null;
    if (nextMove[0] >= boardSize || nextMove[1] >= boardWidth) return null;
    if (board[nextMove[0]]?.[nextMove[1]] !== null) return null;
    if (game.status !== "playing") return null;

    const currGame = cloneGameState(game);
    const currBoard = currGame.baseGame.board;
    const currSign = currGame.baseGame.currentTurn;
    const currPlayer = currSign === "O" ? currGame.playerO : currGame.playerX;
    const targetRow = currBoard[nextMove[0]];

    if (!targetRow) return null;

    // Add sign
    targetRow[nextMove[1]] = currSign;
    currPlayer.moves.push(nextMove);

    // Remove old sign
    if (currPlayer.moves.length > currBoard.length) {
      const lastMove = currPlayer.moves.shift();
      if (!lastMove) return null;

      const prevRow = currBoard[lastMove[0]];
      if (prevRow) prevRow[lastMove[1]] = null;
    }

    // Check if winning
    if (
      currPlayer.moves.length === currBoard.length &&
      Engine.checkWon(currPlayer.moves)
    ) {
      currGame.winner = currSign;
      currGame.status = "finished";
      return currGame;
    }

    // Change turn and increase total moves
    currGame.baseGame.currentTurn = currSign === "O" ? "X" : "O";
    currGame.baseGame.moveCount += 1;

    // Check move limit
    if (config.moveLimit && currGame.baseGame.moveCount >= config.moveLimit) {
      currGame.winner = "draw";
      currGame.status = "finished";
    }

    return currGame;
  }

  static checkWon(currMoves: Move[]) {
    const n = currMoves.length; // Assuming len of square board
    let won = true;

    // Check rows
    for (let i = 1; i < n; i++) {
      const previousMove = currMoves[i - 1];
      const currentMove = currMoves[i];

      if (!previousMove || !currentMove) {
        won = false;
        break;
      }

      if (previousMove[0] !== currentMove[0]) {
        won = false;
        break;
      }
    }

    if (won) return true;
    won = true;

    // Check cols
    for (let i = 1; i < n; i++) {
      const previousMove = currMoves[i - 1];
      const currentMove = currMoves[i];

      if (!previousMove || !currentMove) {
        won = false;
        break;
      }

      if (previousMove[1] !== currentMove[1]) {
        won = false;
        break;
      }
    }

    if (won) return true;
    won = true;

    // Check diagonal left to right (\)
    for (const move of currMoves) {
      if (move[0] !== move[1]) {
        won = false;
        break;
      }
    }

    if (won) return true;
    won = true;

    // Check diagonal right to left (/)
    for (const move of currMoves) {
      if (move[0] + move[1] !== n - 1) {
        won = false;
        break;
      }
    }

    return won;
  }
}
