import type { BoardHookResult, GameConfig } from "../types";
import { useLocalBoard } from "../hooks/useLocalBoard";

export function useFLocalBoard(config: GameConfig): BoardHookResult {
  return useLocalBoard(config);
}
