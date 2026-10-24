import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  createDefaultGameState,
  type FriendGameSnapshot,
  type GameState,
} from "@ticflow/shared";
import {
  apiBaseUrl,
  BACKEND_UNAVAILABLE_MESSAGE,
} from "../../../api/http";
import type { BoardHookResult, GameConfig } from "../types";

type CommandResponse = { error?: string };
type GameResponse = CommandResponse & { game?: FriendGameSnapshot };

function request<T>(
  socket: Socket,
  event: string,
  ...args: unknown[]
): Promise<T> {
  return new Promise((resolve) => socket.emit(event, ...args, resolve));
}

function getLastMove(game: GameState, row: number, column: number): boolean {
  if (game.status !== "playing") return false;
  const size = game.baseGame.board.length;

  return [game.playerO, game.playerX].some(
    (player) =>
      player.moves.length === size &&
      player.moves[0]?.[0] === row &&
      player.moves[0]?.[1] === column,
  );
}

function wasRequestedByOpponent(
  requestedBy: FriendGameSnapshot["drawRequestedBy"],
  myMark: FriendGameSnapshot["myMark"],
): boolean {
  return requestedBy.some((mark) => mark !== myMark);
}

export function useFriendOnlineBoard(
  config: GameConfig,
  inviteCode: string | null,
  gameId: string | null,
): BoardHookResult {
  const [snapshot, setSnapshot] = useState<FriendGameSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorRevision, setErrorRevision] = useState(0);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const nextSocket = io(apiBaseUrl, {
      withCredentials: true,
      timeout: 10000,
    });
    socketRef.current = nextSocket;

    const loadGame = async () => {
      const response = inviteCode
        ? await request<GameResponse>(
            nextSocket,
            "friend-game:join",
            inviteCode,
          )
        : gameId
          ? await request<GameResponse>(
              nextSocket,
              "friend-game:resume",
              gameId,
            )
          : await request<GameResponse>(nextSocket, "friend-game:create", {
              timeLimit: config.timeLimit,
              moveLimit: config.moveLimit,
            });

      if (response.error) {
        setError(response.error);
        setErrorRevision((revision) => revision + 1);
        setIsUnavailable(true);
      } else if (response.game) {
        setSnapshot(response.game);
        setError(null);
        setIsUnavailable(false);
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("game", response.game.id);
        currentUrl.searchParams.set("code", response.game.inviteCode);
        currentUrl.searchParams.delete("join");
        window.history.replaceState({}, "", currentUrl);
      }
    };
    const showError = (message: string) => {
      setError(message);
      setErrorRevision((revision) => revision + 1);
      setIsUnavailable(true);
    };

    nextSocket.on("connect", () => void loadGame());
    nextSocket.on("friend-game:state", setSnapshot);
    nextSocket.on("connect_error", (error) => {
      console.error("[ONLINE_GAME_BACKEND_UNAVAILABLE]", error);
      showError(BACKEND_UNAVAILABLE_MESSAGE);
    });

    return () => {
      nextSocket.disconnect();
      socketRef.current = null;
    };
  }, [config.moveLimit, config.timeLimit, gameId, inviteCode]);

  const game = snapshot?.game ?? createDefaultGameState();
  const opponentMark = snapshot?.myMark === "O" ? "X" : "O";
  const myName = snapshot?.players[snapshot?.myMark ?? "O"]?.username ?? null;
  const opponentName = snapshot?.players[opponentMark]?.username ?? null;
  const opponentConnected = snapshot?.players[opponentMark]?.connected ?? null;

  const onCellClick = useCallback(
    (row: number, column: number) => {
      const socket = socketRef.current;
      if (!socket || !snapshot) return;
      if (snapshot.game.status !== "playing") {
        setError("The game has not started yet.");
        setErrorRevision((revision) => revision + 1);
        return;
      }
      if (snapshot.myMark !== snapshot.game.baseGame.currentTurn) {
        setError("It is not your turn yet.");
        setErrorRevision((revision) => revision + 1);
        return;
      }

      void request<CommandResponse>(socket, "friend-game:move", {
        gameId: snapshot.id,
        row,
        column,
      }).then((response) => {
        if (response.error) {
          setError(response.error);
          setErrorRevision((revision) => revision + 1);
        }
      });
    },
    [snapshot],
  );

  const replay = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !snapshot) return;
    void request<CommandResponse>(
      socket,
      "friend-game:rematch",
      snapshot.id,
    ).then((response) => {
      if (response.error) {
        setError(response.error);
        setErrorRevision((revision) => revision + 1);
      }
    });
  }, [snapshot]);

  const requestDraw = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !snapshot) return;
    void request<CommandResponse>(socket, "friend-game:draw", snapshot.id).then(
      (response) => {
        if (response.error) {
          setError(response.error);
          setErrorRevision((revision) => revision + 1);
        }
      },
    );
  }, [snapshot]);

  const myMark = snapshot?.myMark ?? null;

  return useMemo(
    () => ({
      board: game.baseGame.board,
      currentTurn: game.baseGame.currentTurn,
      isLastMove: (row: number, column: number) =>
        getLastMove(game, row, column),
      onCellClick,
      pause: () => undefined,
      players: { O: game.playerO, X: game.playerX },
      replay,
      resume: () => undefined,
      status: game.status,
      timeLimit: snapshot?.config.timeLimit ?? config.timeLimit,
      winner: game.winner,
      online: {
        error,
        errorRevision,
        isUnavailable,
        inviteCode: snapshot?.inviteCode ?? null,
        myMark,
        myName,
        opponentName,
        opponentConnected,
        waitingForOpponent: game.status === "waiting",
        drawRequested:
          snapshot?.drawRequestedBy.includes(myMark ?? "O") ?? false,
        opponentDrawRequested: wasRequestedByOpponent(
          snapshot?.drawRequestedBy ?? [],
          myMark,
        ),
        restartRequested:
          snapshot?.rematchRequestedBy.includes(myMark ?? "O") ?? false,
        opponentRestartRequested: wasRequestedByOpponent(
          snapshot?.rematchRequestedBy ?? [],
          myMark,
        ),
        requestDraw,
        dismissError: () => setError(null),
      },
    }),
    [
      config.timeLimit,
      error,
      errorRevision,
      isUnavailable,
      game,
      myName,
      myMark,
      onCellClick,
      opponentName,
      opponentConnected,
      replay,
      requestDraw,
      snapshot,
    ],
  );
}
