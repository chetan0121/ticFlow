import { useMemo } from "react";
import { useMenuContext } from "../../menu/hooks/useMenuContext";
import type { SubModes } from "../../menu/constants";
import type { BoardHookResult, GameConfig } from "../types";
import { useBotBoard } from "../submodes/bot";
import { useFLocalBoard } from "../submodes/flocal";

type BoardSubModeHook = (config: GameConfig) => BoardHookResult;

const BOARD_SUB_MODE_HOOKS: Partial<Record<SubModes, BoardSubModeHook>> = {
  easy: useBotBoard,
  medium: useBotBoard,
  hard: useBotBoard,
  flocal: useFLocalBoard,
};

function useBoard(): BoardHookResult {
  const { state } = useMenuContext();
  const config = useMemo<GameConfig>(
    () => ({
      subMode: state.subMode,
      timeLimit: state.timeControl,
      moveLimit: state.moveLimit,
    }),
    [state.moveLimit, state.subMode, state.timeControl],
  );

  const useSubModeBoard = BOARD_SUB_MODE_HOOKS[state.subMode];

  if (!useSubModeBoard)
    throw new Error(`Unsupported game submode: ${state.subMode}`);

  return useSubModeBoard(config);
}

export default useBoard;
