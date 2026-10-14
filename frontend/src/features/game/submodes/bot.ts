import { useCallback, useEffect, useState } from "react";
import {
  cloneGameState,
  createDefaultGameState,
  GameEngine,
  MinimaxBot,
  RandomBot,
  TacticalBot,
  type GameState,
} from "@ticflow/shared";
import type { BoardHookResult, GameConfig } from "../types";

const MINUTE_IN_MS = 60_000;
const BOT_MOVE_DELAY_MS = 300;

function createInitialGameState(timeLimit: GameConfig["timeLimit"]): GameState {
  const initialState = createDefaultGameState();
  const initialTime = timeLimit === null ? null : timeLimit * MINUTE_IN_MS;

  initialState.baseGame.currentTurn = "O";
  initialState.status = "playing";
  initialState.playerO.remainingTime = initialTime;
  initialState.playerX.remainingTime = initialTime;

  return initialState;
}

const bots = {
  easy: new RandomBot(),
  medium: new TacticalBot(),
  hard: new MinimaxBot(),
} as const;

export function useBotBoard(config: GameConfig): BoardHookResult {
  const [game, setGame] = useState(() =>
    createInitialGameState(config.timeLimit),
  );

  useEffect(() => {
    if (config.timeLimit === null) return;

    const timer = setInterval(() => {
      setGame((prev) => {
        if (prev.status !== "playing") return prev;

        const nextGame = cloneGameState(prev);
        const currentPlayer =
          nextGame.baseGame.currentTurn === "O"
            ? nextGame.playerO
            : nextGame.playerX;

        if (currentPlayer.remainingTime === null) return prev;

        currentPlayer.remainingTime = Math.max(
          0,
          currentPlayer.remainingTime - 100,
        );

        if (currentPlayer.remainingTime <= 0) {
          nextGame.winner = nextGame.baseGame.currentTurn === "O" ? "X" : "O";
          nextGame.status = "finished";
        }

        return nextGame;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [config.timeLimit]);

  useEffect(() => {
    if (game.status !== "playing" || game.baseGame.currentTurn !== "X") return;

    const timer = setTimeout(() => {
      setGame((prev) => {
        const bot = bots[config.subMode as keyof typeof bots] ?? bots.easy;
        return bot.nextMove(prev, config) ?? prev;
      });
    }, BOT_MOVE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [config, game.baseGame.currentTurn, game.status]);

  const onCellClick = useCallback(
    (rowIndex: number, cellIndex: number) => {
      setGame((prev) => {
        if (prev.baseGame.currentTurn !== "O") return prev;

        return GameEngine.nextMove(prev, [rowIndex, cellIndex], config) ?? prev;
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

      return (
        (game.playerO.moves.length === boardSize &&
          lastMoveO?.[0] === rowIndex &&
          lastMoveO[1] === cellIndex) ||
        (game.playerX.moves.length === boardSize &&
          lastMoveX?.[0] === rowIndex &&
          lastMoveX[1] === cellIndex)
      );
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
