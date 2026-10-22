import { useMemo } from "react";
import {
  MinimaxBot,
  RandomBot,
  TacticalBot,
  type GameState,
} from "@ticflow/shared";
import type { BoardHookResult, GameConfig } from "../types";
import { useLocalBoard } from "../hooks/useLocalBoard";

const BOT_DELAY_RANGES = {
  easy: [250, 650],
  medium: [500, 1_100],
  hard: [800, 1_600],
} as const;

const bots = {
  easy: new RandomBot(),
  medium: new TacticalBot(),
  hard: new MinimaxBot(),
} as const;

type BotDifficulty = keyof typeof bots;

function getBotDelay(difficulty: BotDifficulty): number {
  const [minimum, maximum] = BOT_DELAY_RANGES[difficulty];

  return Math.floor(minimum + Math.random() * (maximum - minimum + 1));
}

export function useBotBoard(config: GameConfig): BoardHookResult {
  const difficulty: BotDifficulty =
    config.subMode in bots ? (config.subMode as BotDifficulty) : "easy";
  const botTurn = useMemo(
    () => ({
      getDelay: () => getBotDelay(difficulty),
      move: (game: GameState) => bots[difficulty].nextMove(game, config),
    }),
    [config, difficulty],
  );

  return useLocalBoard(config, botTurn);
}
