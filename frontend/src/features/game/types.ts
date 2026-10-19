import type { SubModes } from "../menu/constants";
import type {
  BoardState,
  GameConfig as SharedGameConfig,
  GameStatus,
  Player,
  PlayerMark,
  WinState,
} from "@ticflow/shared";

export type {
  BoardState,
  CellValue,
  GameState,
  GameStatus,
  Player,
  PlayerMark,
  WinState,
} from "@ticflow/shared";

export type GameConfig = SharedGameConfig & { subMode: SubModes };
export type RangeValue = SharedGameConfig["timeLimit"];

export type GameCellClickHandler = (
  rowIndex: number,
  cellIndex: number,
) => void;

export interface BoardPlayers {
  O: Player;
  X: Player;
}

export interface BoardHookResult {
  board: BoardState;
  currentTurn: PlayerMark;
  isLastMove: (rowIndex: number, cellIndex: number) => boolean;
  onCellClick: GameCellClickHandler;
  pause: () => void;
  players: BoardPlayers;
  replay: () => void;
  resume: () => void;
  status: GameStatus;
  timeLimit: RangeValue;
  winner: WinState;
  online?: {
    error: string | null;
    inviteCode: string | null;
    myMark: PlayerMark | null;
    myName: string | null;
    opponentName: string | null;
    opponentConnected: boolean | null;
    waitingForOpponent: boolean;
    drawRequested: boolean;
    opponentDrawRequested: boolean;
    restartRequested: boolean;
    opponentRestartRequested: boolean;
    requestDraw: () => void;
    dismissError: () => void;
  };
}
