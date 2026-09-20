import { useCallback, useEffect, useState } from "react";
import { cloneGameState, createDefaultGameState } from "../constants";
import { Engine } from "../engine/GameEngine";
import type { BoardHookResult, GameConfig, GameState } from "../types";

const MINUTE_IN_MS = 60_000;

function createInitialGameState(timeLimit: GameConfig["timeLimit"]): GameState {
  const initialState = createDefaultGameState();
  const initialTime = timeLimit === null ? null : timeLimit * MINUTE_IN_MS;

  initialState.baseGame.currentTurn = "O";
  initialState.status = "playing";
  initialState.playerO.remainingTime = initialTime;
  initialState.playerX.remainingTime = initialTime;

  return initialState;
}

export function useFLocalBoard(config: GameConfig): BoardHookResult {
  const [game, setGame] = useState(() =>
    createInitialGameState(config.timeLimit),
  );

  useEffect(() => {
    if (config.timeLimit === null) return;

    const timer = setInterval(() => {
      setGame((prev) => {
        if (prev.status !== "playing") return prev;

        const nextGame = cloneGameState(prev);
        const currPlayer =
          nextGame.baseGame.currentTurn === "O"
            ? nextGame.playerO
            : nextGame.playerX;

        if (currPlayer.remainingTime === null) return prev;

        currPlayer.remainingTime = Math.max(0, currPlayer.remainingTime - 100);

        if (currPlayer.remainingTime <= 0) {
          nextGame.winner = nextGame.baseGame.currentTurn === "O" ? "X" : "O";
          nextGame.status = "finished";
        }

        return nextGame;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [config.timeLimit]);

  const onCellClick = useCallback(
    (rowIndex: number, cellIndex: number) => {
      setGame((prev) => {
        const newState = Engine.nextMove(prev, [rowIndex, cellIndex], config);
        return newState ?? prev;
      });
    },
    [config],
  );

  const isLastMove = useCallback(
    (rowIndex: number, cellIndex: number) => {
      if (game.status !== "playing") return false;

      const boardSize = game.baseGame.board.length;
      const lastMoveO = game.playerO.moves[0];
      const lastMoveX = game.playerX.moves[0];

      if (
        game.playerO.moves.length === boardSize &&
        lastMoveO !== undefined &&
        lastMoveO[0] === rowIndex &&
        lastMoveO[1] === cellIndex
      ) {
        return true;
      }

      if (
        game.playerX.moves.length === boardSize &&
        lastMoveX !== undefined &&
        lastMoveX[0] === rowIndex &&
        lastMoveX[1] === cellIndex
      ) {
        return true;
      }

      return false;
    },
    [game],
  );

  const replay = useCallback(() => {
    setGame(createInitialGameState(config.timeLimit));
  }, [config.timeLimit]);

  const pause = useCallback(() => {
    setGame((prev) => {
      if (prev.status !== "playing") return prev;

      const nextGame = cloneGameState(prev);
      nextGame.status = "paused";
      return nextGame;
    });
  }, []);

  const resume = useCallback(() => {
    setGame((prev) => {
      if (prev.status !== "paused") return prev;

      const nextGame = cloneGameState(prev);
      nextGame.status = "playing";
      return nextGame;
    });
  }, []);

  return {
    board: game.baseGame.board,
    currentTurn: game.baseGame.currentTurn,
    isLastMove,
    onCellClick,
    pause,
    players: {
      O: game.playerO,
      X: game.playerX,
    },
    replay,
    resume,
    status: game.status,
    timeLimit: config.timeLimit,
    winner: game.winner,
  };
}
