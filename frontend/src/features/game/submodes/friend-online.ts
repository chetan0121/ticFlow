import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  createDefaultGameState,
  type FriendGameSnapshot,
  type GameState,
} from "@ticflow/shared";
import { apiBaseUrl } from "../../../api/http";
import type { BoardHookResult, GameConfig } from "../types";

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
): BoardHookResult {
  const [snapshot, setSnapshot] = useState<FriendGameSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const nextSocket = io(apiBaseUrl, { withCredentials: true });
    socketRef.current = nextSocket;

    const loadGame = async () => {
      const response = inviteCode
        ? await request<{ game?: FriendGameSnapshot; error?: string }>(
            nextSocket,
            "friend-game:join",
            inviteCode,
          )
        : await request<{ game?: FriendGameSnapshot; error?: string }>(
            nextSocket,
            "friend-game:create",
            { timeLimit: config.timeLimit, moveLimit: config.moveLimit },
          );

      if (response.error) setError(response.error);
      else if (response.game) setSnapshot(response.game);
    };
    const showError = (message: string) => setError(message);

    nextSocket.on("connect", () => void loadGame());
    nextSocket.on("friend-game:state", setSnapshot);
    nextSocket.on("connect_error", () =>
      showError("Please sign in to play online."),
    );

    return () => {
      nextSocket.disconnect();
      socketRef.current = null;
    };
  }, [config.moveLimit, config.timeLimit, inviteCode]);

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
        return;
      }
      if (snapshot.myMark !== snapshot.game.baseGame.currentTurn) {
        setError("It is not your turn yet.");
        return;
      }

      void request<{ error?: string }>(socket, "friend-game:move", {
        gameId: snapshot.id,
        row,
        column,
      }).then((response) => {
        if (response.error) setError(response.error);
      });
    },
    [snapshot],
  );

  const replay = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !snapshot) return;
    void request<{ error?: string }>(
      socket,
      "friend-game:rematch",
      snapshot.id,
    ).then((response) => {
      if (response.error) setError(response.error);
    });
  }, [snapshot]);

  const requestDraw = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !snapshot) return;
    void request<{ error?: string }>(
      socket,
      "friend-game:draw",
      snapshot.id,
    ).then((response) => {
      if (response.error) setError(response.error);
    });
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
