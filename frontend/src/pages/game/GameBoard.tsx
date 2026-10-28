import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Circle,
  Copy,
  Handshake,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import BoardGrid from "../../features/game/components/Grid";
import ConfirmationDialog from "../../features/game/components/ConfirmationDialog";
import LeaveGameConfirm from "../../features/game/components/LeaveGameConfirm";
import MutualActionButton from "../../features/game/components/MutualActionButton";
import GameResultPopup from "../../features/game/components/ResultPopup";
import NotificationBar from "../../components/NotificationBar";
import PlayerTimer from "../../features/game/components/PlayerTimer";
import useBoard from "../../features/game/hooks/useBoard";
import { clearLocalGameState } from "../../features/game/hooks/useLocalBoard";
import { useGameActive } from "../../features/game/hooks/useGameActive";
import { useMenuContext } from "../../features/menu/hooks/useMenuContext";
import { GAME_MODES, GAME_SUB_MODES } from "../../features/menu/constants";
import AppRoutes from "../../router/AppRoutes";
import type { PlayerMark } from "../../features/game/types";

const PLAYER_STYLES: Record<PlayerMark, string> = {
  O: "border-cyan-300/45 bg-cyan-400/12 text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.12)]",
  X: "border-rose-300/45 bg-rose-400/12 text-rose-100 shadow-[0_0_28px_rgba(251,113,133,0.12)]",
};

function PlayerBadge({
  mark,
  active,
  won,
  label,
  turnCue,
}: {
  mark: PlayerMark;
  active: boolean;
  won: boolean;
  label: string;
  turnCue: boolean;
}) {
  const stateClass =
    active || won
      ? PLAYER_STYLES[mark]
      : "border-white/10 bg-black/18 text-white/48";
  const Icon = mark === "O" ? Circle : X;

  return (
    <div
      className={`relative flex min-w-0 flex-1 items-center justify-between overflow-hidden rounded-lg border px-3 py-2.5 transition-all duration-300 ${
        turnCue
          ? mark === "O"
            ? "animate-[your-turn-card_1.8s_ease-in-out_infinite]"
            : "animate-[your-turn-card-red_1.8s_ease-in-out_infinite]"
          : ""
      } ${stateClass}`}
    >
      <span
        className={`absolute inset-y-2 left-0 w-1 rounded-r-full transition-opacity ${
          active || won ? "opacity-100" : "opacity-0"
        } ${mark === "O" ? "bg-cyan-200" : "bg-rose-200"}`}
      />
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 opacity-85" strokeWidth={2.4} />
        <span className="truncate font-['Montserrat'] text-[9px] font-bold tracking-[0.14em] text-current/65 uppercase">
          {label}
        </span>
      </span>
      <span
        aria-hidden={!turnCue}
        className={`rounded-full bg-current/15 px-2 py-1 font-['Montserrat'] text-[8px] font-black tracking-[0.12em] text-current uppercase ${
          turnCue
            ? "animate-[your-turn-pop_1.8s_ease-out_infinite]"
            : "opacity-0"
        }`}
      >
        Your turn
      </span>
    </div>
  );
}

function getOnlineErrorTitle(message: string): string {
  if (message === "This room doesn't exist or is no longer available")
    return "Room unavailable";
  if (message === "This game is full") return "Game is full";
  if (message === "This game is no longer available")
    return "Game no longer available";
  if (message === "Please sign in to play online.") return "Sign-in required";
  if (message === "Game owner is unavailable") return "Game owner unavailable";
  if (
    message === "It is not your turn" ||
    message === "It is not your turn yet."
  )
    return "Not your turn";
  if (message === "The game has not started yet.") return "Game not started";

  return "Unable to join game";
}

function GameBoard() {
  const {
    board,
    currentTurn,
    isLastMove,
    onCellClick,
    pause,
    players,
    replay,
    resume,
    status,
    timeLimit,
    winner,
    online,
  } = useBoard();
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [, setGameActive] = useGameActive();
  const navigate = useNavigate();
  const {
    state: { coreMode, subMode },
  } = useMenuContext();

  const coreModeLabel =
    GAME_MODES()
      .modes.find((mode) => mode.value === coreMode)
      ?.label?.toUpperCase() ?? coreMode;
  const subModeLabel =
    GAME_SUB_MODES(coreMode).modes.find((mode) => mode.value === subMode)
      ?.label ?? subMode;

  useEffect(() => {
    if (status === "finished" && winner !== null) {
      // Schedule the state update to avoid cascading renders
      // by deferring it to the next tick.
      requestAnimationFrame(() => setShowResultPopup(true));
    }
  }, [status, winner]);

  useEffect(() => {
    if (!inviteCopied) return;
    const timeout = window.setTimeout(() => setInviteCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [inviteCopied]);

  const shouldConfirmLeave =
    (status === "playing" || status === "paused") && winner === null;

  useEffect(() => {
    setGameActive(shouldConfirmLeave);

    return () => setGameActive(false);
  }, [setGameActive, shouldConfirmLeave]);

  useEffect(() => {
    if (!online?.isUnavailable || !online.error) return;

    void navigate(AppRoutes.gameMenu.path, {
      state: { notification: online.error },
    });
  }, [navigate, online?.error, online?.isUnavailable]);

  useEffect(() => {
    if (!shouldConfirmLeave) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldConfirmLeave]);

  function handleBackToMenu() {
    if (shouldConfirmLeave) {
      setShowLeaveConfirm(true);
      return;
    }

    if (!online) clearLocalGameState(subMode);
    void navigate(AppRoutes.gameMenu.path);
  }

  function leaveToMenu() {
    online?.leave();
    if (!online) clearLocalGameState(subMode);
    setShowLeaveConfirm(false);
    void navigate(AppRoutes.gameMenu.path);
  }

  function handleReplay() {
    replay();
    setShowResultPopup(false);
    setShowRestartConfirm(false);
  }

  function handleRestartRequest() {
    if ((status === "playing" || status === "paused") && winner === null) {
      setShowRestartConfirm(true);
      return;
    }

    handleReplay();
  }

  function handlePauseToggle() {
    if (status === "playing") {
      pause();
    } else if (status === "paused") {
      resume();
    }
  }

  async function handleCopyInviteCode() {
    if (!online?.inviteCode) return;
    try {
      await copyText(online.inviteCode);
      setInviteCopied(true);
    } catch {
      // Copy failed silently; clipboard may be blocked.
    }
  }

  async function copyText(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return;
      } catch {
        // Fall back for browsers that expose Clipboard API without allowing it.
      }
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    try {
      if (!document.execCommand("copy")) {
        throw new Error("The browser rejected the copy request");
      }
    } finally {
      document.body.removeChild(textArea);
    }
  }

  const isPaused = status === "paused";
  const isGameActive = status === "playing";
  const isWaitingForOpponent = Boolean(online?.waitingForOpponent);
  const canPause =
    !online && (status === "playing" || status === "paused") && winner === null;
  const playerOrder: PlayerMark[] = online?.myMark
    ? [online.myMark, online.myMark === "O" ? "X" : "O"]
    : ["O", "X"];
  const playerLabel = (mark: PlayerMark) => {
    if (coreMode === "bot") return mark === "O" ? "YOU" : `${subModeLabel} BOT`;

    if (online?.myMark) {
      if (online.myMark === mark) return `${online.myName ?? "Player"} (YOU)`;
      return online.opponentName ?? "Opponent";
    }
    return mark === "O" ? "Player 1" : "Player 2";
  };
  const isCurrentUser = (mark: PlayerMark) =>
    coreMode === "bot" ? mark === "O" : online?.myMark === mark;
  const botMatchupTitle =
    coreMode === "bot" ? subModeLabel.toUpperCase() : subModeLabel;
  const matchup =
    coreMode === "bot"
      ? `YOU vs ${subModeLabel} Bot`
      : online?.myMark
        ? `${online.myName ?? "YOU"} vs ${online.opponentName ?? "Opponent"}`
        : "Player 1 vs Player 2";
  const winnerName =
    winner !== null && winner !== "draw"
      ? coreMode === "bot"
        ? winner === "O"
          ? "YOU"
          : `${subModeLabel} BOT`
        : online?.myMark
          ? winner === online.myMark
            ? (online.myName ?? "YOU")
            : (online.opponentName ?? "OPPONENT")
          : playerLabel(winner)
      : undefined;

  const notification = online?.error
    ? {
        type: "error" as const,
        title: getOnlineErrorTitle(online.error),
        message: online.error,
      }
    : online?.connectionNotice
      ? {
          type: "info" as const,
          title: online.connectionNotice.title,
          message: online.connectionNotice.message,
        }
      : online?.opponentDrawRequested
        ? {
            type: "info" as const,
            title: "Draw requested",
            message: "Your opponent wants to end this game as a draw.",
          }
        : online?.opponentRestartRequested
          ? {
              type: "info" as const,
              title: "Restart requested",
              message: "Your opponent is ready for another game.",
            }
          : null;

  const onlineAction = online
    ? status !== "finished"
      ? {
          Icon: Handshake,
          label: online.opponentDrawRequested
            ? "Accept draw"
            : online.drawRequested
              ? "Draw requested"
              : "Draw",
          disabled: status !== "playing",
          pending: online.drawRequested,
          opponentRequested: online.opponentDrawRequested,
          attentionAnimation: "animate-[agreement-glow_10s_ease-in-out]",
          onClick: online.requestDraw,
        }
      : {
          Icon: RotateCcw,
          label: online.opponentRestartRequested
            ? "Accept restart"
            : online.restartRequested
              ? "Restart requested"
              : "Restart",
          disabled: status !== "finished",
          pending: online.restartRequested,
          opponentRequested: online.opponentRestartRequested,
          onClick: handleReplay,
        }
    : null;

  useEffect(() => {
    if (status !== "playing") return;

    const page = document.documentElement;
    page.style.setProperty(
      "--ticflow-page-background",
      currentTurn === "O"
        ? "linear-gradient(135deg, hsl(194 62% 11%), hsl(205 42% 16%), hsl(27 31% 13%))"
        : "linear-gradient(135deg, hsl(349 47% 12%), hsl(352 37% 17%), hsl(205 24% 14%))",
    );

    return () => {
      page.style.removeProperty("--ticflow-page-background");
    };
  }, [currentTurn, status]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center px-0 py-3 sm:py-5">
      {notification ? (
        <NotificationBar
          {...notification}
          eventKey={
            online?.error ? online.errorRevision : online?.connectionNotice?.id
          }
          onClose={
            online?.isUnavailable
              ? undefined
              : online?.connectionNotice
                ? online.dismissConnectionNotice
                : online?.dismissError
          }
        />
      ) : null}
      <div
        className={`flex w-full max-w-[min(92vw,40rem)] flex-col gap-3 sm:gap-4 ${
          online?.isUnavailable ? "hidden" : ""
        }`}
      >
        <header className="rounded-2xl border border-white/10 bg-black/15 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-['Montserrat'] text-[10px] font-semibold tracking-[0.2em] text-amber-200/75 uppercase">
                {coreModeLabel}
              </p>
              <h1 className="mt-1 truncate font-['Oswald'] text-3xl leading-none font-semibold text-white sm:text-4xl">
                {botMatchupTitle}
              </h1>
            </div>
            <div className="flex shrink-0 items-start gap-2">
              {online && subMode !== "matchmaking" ? (
                <button
                  type="button"
                  onClick={() => {
                    void handleCopyInviteCode();
                  }}
                  className="flex flex-col items-start gap-1 rounded-lg border border-white/15 bg-black/20 px-3 py-2 font-mono tracking-widest text-white transition-colors hover:border-amber-200/45 hover:bg-amber-200/10 hover:text-amber-100 focus-visible:ring-2 focus-visible:ring-amber-200/45 focus-visible:outline-none"
                  aria-label="Copy invite code"
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-['Montserrat'] text-[10px] font-bold text-white/75">
                      Invite code:
                    </span>
                    <div className="flex items-center gap-1">
                      {online.inviteCode ? (
                        <>
                          <span className="font-['Oswald'] text-base font-semibold tracking-[0.14em] text-white">
                            {online.inviteCode}
                          </span>
                          {inviteCopied ? (
                            <Check
                              className="h-3.5 w-3.5 text-emerald-200"
                              strokeWidth={2.5}
                              aria-hidden="true"
                            />
                          ) : (
                            <Copy
                              className="h-3.5 w-3.5 text-white/70"
                              strokeWidth={2.2}
                              aria-hidden="true"
                            />
                          )}
                        </>
                      ) : (
                        <div
                          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                          aria-label="Loading invite code"
                        />
                      )}
                    </div>
                  </div>
                </button>
              ) : null}
              {!online ? (
                <button
                  type="button"
                  onClick={handlePauseToggle}
                  disabled={!canPause}
                  className="group flex h-10 items-center justify-center gap-2 rounded-lg border border-white/12 bg-black/18 px-3 font-['Montserrat'] text-xs font-bold text-white/72 transition-colors hover:border-cyan-200/35 hover:bg-cyan-200/10 hover:text-cyan-100 focus-visible:ring-2 focus-visible:ring-cyan-200/45 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={isPaused ? "Resume game" : "Pause game"}
                >
                  {isPaused ? (
                    <Play
                      className="h-4 w-4"
                      fill="currentColor"
                      strokeWidth={2.4}
                    />
                  ) : (
                    <Pause
                      className="h-4 w-4"
                      fill="currentColor"
                      strokeWidth={2.4}
                    />
                  )}
                  <span className="hidden min-[430px]:inline">
                    {isPaused ? "Resume" : "Pause"}
                  </span>
                </button>
              ) : null}
              {onlineAction ? (
                <MutualActionButton {...onlineAction} />
              ) : (
                <button
                  type="button"
                  onClick={handleRestartRequest}
                  className="group flex h-10 items-center justify-center gap-2 rounded-lg border border-white/12 bg-black/18 px-3 font-['Montserrat'] text-xs font-bold text-white/72 transition-colors hover:border-amber-200/35 hover:bg-amber-200/10 hover:text-amber-100 focus-visible:ring-2 focus-visible:ring-amber-200/45 focus-visible:outline-none"
                  aria-label="Restart same game"
                >
                  <RotateCcw
                    className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-45"
                    strokeWidth={2.4}
                  />
                  <span className="hidden min-[430px]:inline">
                    {winner ? "Replay" : "Restart"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-3">
          {timeLimit !== null
            ? playerOrder.map((mark) => (
                <PlayerTimer
                  key={mark}
                  mark={mark}
                  remainingTime={players[mark].remainingTime}
                  active={currentTurn === mark && isGameActive && !winner}
                  winner={winner}
                  label={playerLabel(mark)}
                  turnCue={
                    isCurrentUser(mark) &&
                    currentTurn === mark &&
                    isGameActive &&
                    !winner
                  }
                />
              ))
            : playerOrder.map((mark) => (
                <PlayerBadge
                  key={mark}
                  mark={mark}
                  active={currentTurn === mark && isGameActive && !winner}
                  won={winner === mark}
                  label={playerLabel(mark)}
                  turnCue={
                    isCurrentUser(mark) &&
                    currentTurn === mark &&
                    isGameActive &&
                    !winner
                  }
                />
              ))}
        </div>
      </div>

      <div className="relative mx-auto mt-3 w-full max-w-[min(92vw,58vh,38rem)] sm:mt-4">
        <BoardGrid
          board={board}
          isLast={isLastMove}
          onCellClick={onCellClick}
        />
        {isWaitingForOpponent ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[rgba(11,27,32,0.42)] p-3 backdrop-blur-[2px]">
            <div className="w-full max-w-sm rounded-xl border border-cyan-100/20 bg-[rgba(11,27,32,0.88)] px-5 py-4 text-center shadow-[0_18px_45px_rgba(0,0,0,0.4)]">
              <p className="font-['Oswald'] text-2xl leading-none text-white">
                {online?.queueing ||
                (subMode === "matchmaking" && online?.waitingForOpponent)
                  ? "Finding an opponent"
                  : "Waiting for your friend"}
              </p>
              <p className="mt-2 text-sm text-white/65">
                {online?.queueing ||
                (subMode === "matchmaking" && online?.waitingForOpponent)
                  ? "You are in the matchmaking queue. Your game will start as soon as an opponent is found."
                  : "Share the invite code above to begin."}
              </p>
            </div>
          </div>
        ) : null}
        {isPaused ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30 backdrop-blur-[1px]">
            <div className="rounded-lg border border-cyan-200/24 bg-black/55 px-4 py-3 text-center shadow-[0_18px_50px_rgba(0,0,0,0.42)]">
              <p className="font-['Montserrat'] text-[10px] font-bold tracking-[0.22em] text-cyan-100/65 uppercase">
                Paused
              </p>
              <p className="mt-1 font-['Oswald'] text-2xl leading-none text-white">
                Game paused
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <ConfirmationDialog
        cancelLabel="Cancel"
        confirmIcon={<RotateCcw className="h-4 w-4" strokeWidth={2.35} />}
        confirmLabel="Restart"
        description="Current moves and timers will reset."
        id="restart-confirm-title"
        kicker="Restart game"
        open={showRestartConfirm}
        onCancel={() => setShowRestartConfirm(false)}
        onConfirm={handleReplay}
        title="Start this game over?"
      />
      <LeaveGameConfirm
        open={showLeaveConfirm}
        onCancel={() => setShowLeaveConfirm(false)}
        onConfirm={leaveToMenu}
      />
      <GameResultPopup
        actions={{
          back: handleBackToMenu,
          close: () => setShowResultPopup(false),
          replay: handleReplay,
        }}
        open={showResultPopup}
        winner={winner}
        winnerName={winnerName}
        resultFor={
          winner !== null && winner !== "draw"
            ? coreMode === "bot"
              ? winner === "O"
                ? "winner"
                : "loser"
              : online?.myMark
                ? winner === online.myMark
                  ? "winner"
                  : "loser"
                : undefined
            : undefined
        }
        matchup={matchup}
        backLabel="Menu"
        replayLabel="Play again"
        replayPending={online?.restartRequested ?? false}
        replayAttention={online?.opponentRestartRequested ?? false}
      />
    </div>
  );
}

export default GameBoard;
