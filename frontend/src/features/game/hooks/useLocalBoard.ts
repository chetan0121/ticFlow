import { useCallback, useEffect, useState } from "react";
import {
  cloneGameState,
  createDefaultGameState,
  GameEngine,
  MINUTE_MS,
  type GameState,
} from "@ticflow/shared";
import type { BoardHookResult, GameConfig } from "../types";

interface BotTurn {
  getDelay: () => number;
  move: (game: GameState) => GameState | null;
}

const LOCAL_GAME_STORAGE_PREFIX = "ticflow:local-game:";

interface StoredLocalGame {
  config: Pick<GameConfig, "moveLimit" | "subMode" | "timeLimit">;
  game: GameState;
}

function getStorageKey(subMode: GameConfig["subMode"]): string {
  return `${LOCAL_GAME_STORAGE_PREFIX}${subMode}`;
}

function loadGame(config: GameConfig, createGame: () => GameState): GameState {
  if (typeof window === "undefined") return createGame();

  const stored = window.sessionStorage.getItem(getStorageKey(config.subMode));
  if (!stored) return createGame();

  try {
    const parsed = JSON.parse(stored) as StoredLocalGame;
    if (
      parsed.config.timeLimit !== config.timeLimit ||
      parsed.config.moveLimit !== config.moveLimit ||
      parsed.config.subMode !== config.subMode
    ) {
      return createGame();
    }
    return parsed.game;
  } catch {
    window.sessionStorage.removeItem(getStorageKey(config.subMode));
    return createGame();
  }
}

export function clearLocalGameState(subMode: GameConfig["subMode"]): void {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(getStorageKey(subMode));
  }
}

function createInitialGameState(timeLimit: GameConfig["timeLimit"]): GameState {
  const initialState = createDefaultGameState();
  const initialTime = timeLimit === null ? null : timeLimit * MINUTE_MS;

  initialState.baseGame.currentTurn = "O";
  initialState.status = "playing";
  initialState.playerO.remainingTime = initialTime;
  initialState.playerX.remainingTime = initialTime;

  return initialState;
}

export function useLocalBoard(
  config: GameConfig,
  botTurn?: BotTurn,
): BoardHookResult {
  const createGame = useCallback(
    () => createInitialGameState(config.timeLimit),
    [config.timeLimit],
  );
  const [game, setGame] = useState(() => loadGame(config, createGame));

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored: StoredLocalGame = {
      config: {
        moveLimit: config.moveLimit,
        subMode: config.subMode,
        timeLimit: config.timeLimit,
      },
      game,
    };
    window.sessionStorage.setItem(
      getStorageKey(config.subMode),
      JSON.stringify(stored),
    );
  }, [config, game]);

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
    if (
      !botTurn ||
      game.status !== "playing" ||
      game.baseGame.currentTurn !== "X"
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setGame((prev) => botTurn.move(prev) ?? prev);
    }, botTurn.getDelay());

    return () => clearTimeout(timer);
  }, [botTurn, game.baseGame.currentTurn, game.status]);

  const onCellClick = useCallback(
    (rowIndex: number, cellIndex: number) => {
      setGame((prev) => {
        if (botTurn && prev.baseGame.currentTurn !== "O") return prev;

        return GameEngine.nextMove(prev, [rowIndex, cellIndex], config) ?? prev;
      });
    },
    [botTurn, config],
  );

  const isLastMove = useCallback(
    (rowIndex: number, cellIndex: number) => {
      if (game.status !== "playing") return false;

      const boardSize = game.baseGame.board.length;
      return [game.playerO, game.playerX].some(
        (player) =>
          player.moves.length === boardSize &&
          player.moves[0]?.[0] === rowIndex &&
          player.moves[0]?.[1] === cellIndex,
      );
    },
    [game],
  );

  const replay = useCallback(() => {
    setGame(createGame());
  }, [createGame]);

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
