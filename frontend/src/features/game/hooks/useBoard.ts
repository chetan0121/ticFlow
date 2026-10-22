import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useMenuContext } from "../../menu/hooks/useMenuContext";
import type { SubModes } from "../../menu/constants";
import type { BoardHookResult, GameConfig } from "../types";
import { useBotBoard } from "../submodes/bot";
import { useFLocalBoard } from "../submodes/flocal";
import { useFriendOnlineBoard } from "../submodes/friend-online";

type BoardSubModeHook = (
  config: GameConfig,
  inviteCode: string | null,
  gameId: string | null,
) => BoardHookResult;

const BOARD_SUB_MODE_HOOKS: Partial<Record<SubModes, BoardSubModeHook>> = {
  easy: useBotBoard,
  medium: useBotBoard,
  hard: useBotBoard,
  flocal: useFLocalBoard,
  fOnline: useFriendOnlineBoard,
};

function useBoard(): BoardHookResult {
  const { state } = useMenuContext();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get("code") ?? searchParams.get("join");
  const gameId = searchParams.get("game");
  const config = useMemo<GameConfig>(
    () => ({
      subMode: state.subMode,
      timeLimit: state.timeControl,
      moveLimit: state.moveLimit,
    }),
    [state.moveLimit, state.subMode, state.timeControl],
  );

  const useSubModeBoard =
    gameId || inviteCode ? useFriendOnlineBoard : BOARD_SUB_MODE_HOOKS[state.subMode];

  if (!useSubModeBoard)
    throw new Error(`Unsupported game submode: ${state.subMode}`);

  return useSubModeBoard(
    config,
    inviteCode,
    gameId,
  );
}

export default useBoard;
