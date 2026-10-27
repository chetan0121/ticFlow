import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import {
  cloneGameState,
  createDefaultGameState,
  GameEngine,
  type FriendGameSnapshot,
  type GameState,
  type MatchmakingSnapshot,
} from "@ticflow/shared";
import { apiBaseUrl, BACKEND_UNAVAILABLE_MESSAGE } from "../../../api/http";
import type { BoardHookResult, GameConfig } from "../types";

type CommandResponse = { error?: string };
type OnlineSnapshot = FriendGameSnapshot | MatchmakingSnapshot;
type GameResponse = CommandResponse & {
  game?: OnlineSnapshot;
  queued?: boolean;
};
type ConnectionNotice = {
  type: "info";
  title: string;
  message: string;
};

function request<T>(
  socket: Socket,
  event: string,
  ...args: unknown[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Request timeout")), 10000);
    socket.emit(event, ...args, (response: unknown) => {
      clearTimeout(timer);
      resolve(response as T);
    });
  });
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
  requestedBy: OnlineSnapshot["drawRequestedBy"],
  myMark: OnlineSnapshot["myMark"],
): boolean {
  return requestedBy.some((mark) => mark !== myMark);
}

export function useFriendOnlineBoard(
  config: GameConfig,
  inviteCode: string | null,
  gameId: string | null,
  isMatchmaking = false,
): BoardHookResult {
  const [snapshot, setSnapshot] = useState<OnlineSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorRevision, setErrorRevision] = useState(0);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [connectionNotice, setConnectionNotice] = useState<
    (ConnectionNotice & { id: number }) | null
  >(null);
  const [optimisticGame, setOptimisticGame] = useState<GameState | null>(null);
  const snapshotRef = useRef<OnlineSnapshot | null>(null);
  const activeGameIdRef = useRef<string | null>(gameId);
  const connectionNoticeRef = useRef<ConnectionNotice | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pendingMoveRef = useRef<{ row: number; column: number } | null>(null);

  useEffect(() => {
    const nextSocket = io(apiBaseUrl, {
      withCredentials: true,
      timeout: 10000,
    });
    socketRef.current = nextSocket;

    const loadGame = async () => {
      let response: GameResponse;
      try {
        const activeGameId = activeGameIdRef.current ?? gameId;
        response = isMatchmaking
          ? activeGameId
            ? await request<GameResponse>(
                nextSocket,
                "matchmaking:resume",
                activeGameId,
              )
            : await request<GameResponse>(nextSocket, "matchmaking:queue")
          : inviteCode
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
      } catch (error) {
        showError(
          error instanceof Error
            ? error.message
            : "Unable to connect to the game server.",
        );
        return;
      }

      if (response.error) {
        setError(response.error);
        setErrorRevision((revision) => revision + 1);
        setIsUnavailable(true);
      } else if (response.game) {
        applySnapshot(response.game, true);
      }
    };
    const showError = (message: string) => {
      setError(message);
      setErrorRevision((revision) => revision + 1);
      setIsUnavailable(true);
    };
    const applySnapshot = (
      nextSnapshot: OnlineSnapshot,
      clearConnectionError = false,
    ) => {
      activeGameIdRef.current = nextSnapshot.id;
      snapshotRef.current = nextSnapshot;
      setSnapshot(nextSnapshot);
      if (clearConnectionError) {
        setError(null);
        setIsUnavailable(false);
      }
      // Clear optimistic state when we get server confirmation
      setOptimisticGame(null);
      pendingMoveRef.current = null;
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("game", nextSnapshot.id);
      currentUrl.searchParams.delete("join");
      if (isMatchmaking) currentUrl.searchParams.delete("code");
      else
        currentUrl.searchParams.set(
          "code",
          (nextSnapshot as FriendGameSnapshot).inviteCode,
        );
      window.history.replaceState({}, "", currentUrl);
    };

    nextSocket.on("connect", () => void loadGame());
    const handleState = (nextSnapshot: OnlineSnapshot) => {
      const previousSnapshot = snapshotRef.current;
      const previousOpponentConnected = previousSnapshot
        ? previousSnapshot.players[previousSnapshot.myMark === "O" ? "X" : "O"]
            ?.connected
        : undefined;
      const nextOpponentConnected =
        nextSnapshot.players[nextSnapshot.myMark === "O" ? "X" : "O"]
          ?.connected;

      if (previousOpponentConnected === false && nextOpponentConnected) {
        const notice = {
          type: "info" as const,
          title: "Opponent rejoined",
          message: "Your opponent has rejoined the game.",
        };
        connectionNoticeRef.current = notice;
        setConnectionNotice({ ...notice, id: Date.now() });
      } else if (
        previousOpponentConnected === true &&
        nextOpponentConnected === false &&
        connectionNoticeRef.current?.title !== "Opponent left"
      ) {
        const notice = {
          type: "info" as const,
          title: "Opponent disconnected",
          message: "Waiting for them to reconnect.",
        };
        connectionNoticeRef.current = notice;
        setConnectionNotice({ ...notice, id: Date.now() });
      }

      applySnapshot(nextSnapshot);
    };
    nextSocket.on(
      isMatchmaking ? "matchmaking:state" : "friend-game:state",
      handleState,
    );
    if (isMatchmaking) nextSocket.on("matchmaking:matched", handleState);
    if (isMatchmaking)
      nextSocket.on("matchmaking:queued", () => {
        snapshotRef.current = null;
        setSnapshot(null);
        setError(null);
        setIsUnavailable(false);
        setErrorRevision((revision) => revision + 1);
      });
    nextSocket.on("friend-game:notice", (notice: ConnectionNotice) => {
      connectionNoticeRef.current = notice;
      setConnectionNotice({ ...notice, id: Date.now() });
    });
    nextSocket.on("connect_error", (error) => {
      console.error("[ONLINE_GAME_BACKEND_UNAVAILABLE]", error);
      showError(BACKEND_UNAVAILABLE_MESSAGE);
    });
    nextSocket.on("matchmaking:error", (response: CommandResponse) =>
      showError(response.error ?? "Unable to start a match. Please try again."),
    );

    return () => {
      if (isMatchmaking && !snapshotRef.current)
        nextSocket.emit("matchmaking:cancel", () => undefined);
      nextSocket.disconnect();
      socketRef.current = null;
      snapshotRef.current = null;
      connectionNoticeRef.current = null;
    };
  }, [config.moveLimit, config.timeLimit, gameId, inviteCode, isMatchmaking]);

  const leave = useCallback(() => {
    const socket = socketRef.current;
    const currentSnapshot = snapshotRef.current;
    if (!socket || !currentSnapshot) return;
    socket.emit("friend-game:leave", currentSnapshot.id);
  }, []);

  const dismissConnectionNotice = useCallback(() => {
    connectionNoticeRef.current = null;
    setConnectionNotice(null);
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  useEffect(() => {
    const handleLeaveRequest = () => leave();
    window.addEventListener("ticflow:leave-online-game", handleLeaveRequest);
    return () =>
      window.removeEventListener(
        "ticflow:leave-online-game",
        handleLeaveRequest,
      );
  }, [leave]);

  const game = optimisticGame ?? snapshot?.game ?? createDefaultGameState();
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

      // Apply move optimistically for instant UI feedback
      const currentGame = optimisticGame ?? snapshot.game;
      const optimisticState = GameEngine.nextMove(
        cloneGameState(currentGame),
        [row, column],
        config,
      );
      if (optimisticState) {
        setOptimisticGame(optimisticState);
        pendingMoveRef.current = { row, column };
      }

      void request<CommandResponse>(socket, "friend-game:move", {
        gameId: snapshot.id,
        row,
        column,
      })
        .then((response) => {
          if (response.error) {
            // Revert optimistic move on error
            setOptimisticGame(null);
            pendingMoveRef.current = null;
            setError(response.error);
            setErrorRevision((revision) => revision + 1);
          }
          // On success, server will send state update which clears optimistic state
        })
        .catch((error) => {
          // Revert optimistic move on error
          setOptimisticGame(null);
          pendingMoveRef.current = null;
          setError(
            error instanceof Error ? error.message : "Move request failed.",
          );
          setErrorRevision((revision) => revision + 1);
        });
    },
    [snapshot, optimisticGame, config],
  );

  const replay = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !snapshot) return;
    void request<CommandResponse & { queued?: boolean }>(
      socket,
      "friend-game:rematch",
      snapshot.id,
    )
      .then((response) => {
        if (response.error) {
          setError(response.error);
          setErrorRevision((revision) => revision + 1);
          return;
        }
        if (isMatchmaking && response.queued) {
          // Opponent left; re-queue the remaining player for a new match.
          snapshotRef.current = null;
          setSnapshot(null);
          setError(null);
          setIsUnavailable(false);
          setErrorRevision((revision) => revision + 1);
        }
      })
      .catch((error) => {
        setError(
          error instanceof Error ? error.message : "Rematch request failed.",
        );
        setErrorRevision((revision) => revision + 1);
      });
  }, [isMatchmaking, snapshot]);

  const requestDraw = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !snapshot) return;
    void request<CommandResponse>(socket, "friend-game:draw", snapshot.id)
      .then((response) => {
        if (response.error) {
          setError(response.error);
          setErrorRevision((revision) => revision + 1);
        }
      })
      .catch((error) => {
        setError(
          error instanceof Error ? error.message : "Draw request failed.",
        );
        setErrorRevision((revision) => revision + 1);
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
        errorRevision,
        isUnavailable,
        inviteCode:
          snapshot && "inviteCode" in snapshot ? snapshot.inviteCode : null,
        myMark,
        myName,
        opponentName,
        opponentConnected,
        connectionNotice,
        waitingForOpponent:
          game.status === "waiting" || (isMatchmaking && !snapshot),
        queueing: isMatchmaking && !snapshot,
        drawRequested:
          snapshot?.drawRequestedBy.includes(myMark ?? "O") ?? false,
        opponentDrawRequested:
          game.status === "playing" &&
          wasRequestedByOpponent(snapshot?.drawRequestedBy ?? [], myMark),
        restartRequested:
          snapshot?.rematchRequestedBy.includes(myMark ?? "O") ?? false,
        opponentRestartRequested: wasRequestedByOpponent(
          snapshot?.rematchRequestedBy ?? [],
          myMark,
        ),
        leave,
        dismissConnectionNotice,
        requestDraw,
        dismissError,
      },
    }),
    [
      config.timeLimit,
      connectionNotice,
      dismissConnectionNotice,
      dismissError,
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
      leave,
      isMatchmaking,
      snapshot,
    ],
  );
}
