import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Circle, Pause, Play, RotateCcw, X } from "lucide-react";
import BoardGrid from "../../features/game/components/Grid";
import LeaveGameConfirm from "../../features/game/components/LeaveGameConfirm";
import GameResultPopup from "../../features/game/components/ResultPopup";
import PlayerTimer from "../../features/game/components/PlayerTimer";
import useBoard from "../../features/game/hooks/useBoard";
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
}: {
  mark: PlayerMark;
  active: boolean;
  won: boolean;
}) {
  const stateClass =
    active || won
      ? PLAYER_STYLES[mark]
      : "border-white/10 bg-black/18 text-white/48";
  const Icon = mark === "O" ? Circle : X;

  const Name = "Player";

  return (
    <div
      className={`relative flex min-w-0 flex-1 items-center justify-between overflow-hidden rounded-lg border px-3 py-2.5 transition-all duration-300 ${stateClass}`}
    >
      <span
        className={`absolute inset-y-2 left-0 w-1 rounded-r-full transition-opacity ${
          active || won ? "opacity-100" : "opacity-0"
        } ${mark === "O" ? "bg-cyan-200" : "bg-rose-200"}`}
      />
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 opacity-85" strokeWidth={2.4} />
        <span className="mt-0.65 font-['Montserrat'] text-[10px] font-bold tracking-widest text-white/45 uppercase">
          {Name}
        </span>
      </span>
      <span className="font-['Oswald'] text-2xl leading-none font-semibold">
        {mark}
      </span>
    </div>
  );
}

interface RestartConfirmProps {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

function RestartConfirm({ onCancel, onConfirm, open }: RestartConfirmProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/58 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restart-confirm-title"
    >
      <div className="w-full max-w-95 overflow-hidden rounded-lg border border-white/14 bg-[hsl(26,34%,10%)] shadow-[0_26px_90px_rgba(0,0,0,0.58)]">
        <div className="border-b border-amber-100/14 px-5 py-5">
          <p className="font-['Montserrat'] text-[10px] font-bold tracking-[0.2em] text-amber-100/60 uppercase">
            Restart game
          </p>
          <h2
            id="restart-confirm-title"
            className="mt-1 font-['Oswald'] text-3xl leading-none font-semibold text-white"
          >
            Start this game over?
          </h2>
          <p className="mt-3 text-sm leading-5 text-white/58">
            Current moves and timers will reset.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 px-5 py-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-11 items-center justify-center rounded-md border border-white/12 bg-white/6 px-3 font-['Montserrat'] text-sm font-semibold text-white/78 transition-colors hover:border-white/24 hover:bg-white/11 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-200/45 focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-11 items-center justify-center gap-2 rounded-md border border-amber-200/35 bg-amber-300/12 px-3 font-['Montserrat'] text-sm font-semibold text-amber-100 transition-colors hover:border-amber-100/55 hover:bg-amber-300/18 focus-visible:ring-2 focus-visible:ring-amber-200/55 focus-visible:outline-none"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2.35} />
            Restart
          </button>
        </div>
      </div>
    </div>
  );
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
  } = useBoard();
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [, setGameActive] = useGameActive();
  const navigate = useNavigate();
  const {
    state: { coreMode, subMode },
  } = useMenuContext();

  const coreModeLabel =
    GAME_MODES().modes.find((mode) => mode.value === coreMode)?.label ??
    coreMode;
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

  const shouldConfirmLeave =
    (status === "playing" || status === "paused") && winner === null;

  useEffect(() => {
    setGameActive(shouldConfirmLeave);

    return () => setGameActive(false);
  }, [setGameActive, shouldConfirmLeave]);

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

    void navigate(AppRoutes.gameMenu.path);
  }

  function leaveToMenu() {
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

  const isPaused = status === "paused";
  const isGameActive = status === "playing";
  const canPause =
    (status === "playing" || status === "paused") && winner === null;

  return (
    <div className="flex h-full min-h-0 w-full flex-col items-center justify-center px-0 py-3 sm:py-5">
      <div className="flex w-full max-w-[min(92vw,38rem)] flex-col gap-3 sm:gap-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-['Montserrat'] text-[10px] font-semibold tracking-[0.2em] text-amber-200/75 uppercase">
              {coreModeLabel}
            </p>
            <h1 className="mt-1 truncate font-['Oswald'] text-3xl leading-none font-semibold text-white sm:text-4xl">
              {subModeLabel}
            </h1>
          </div>
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={handlePauseToggle}
              disabled={!canPause}
              className="group mr-2 flex h-11 items-center justify-center gap-2 rounded-lg border border-white/12 bg-black/18 px-3 font-['Montserrat'] text-xs font-bold text-white/72 transition-colors hover:border-cyan-200/35 hover:bg-cyan-200/10 hover:text-cyan-100 focus-visible:ring-2 focus-visible:ring-cyan-200/45 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
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
            <button
              type="button"
              onClick={handleRestartRequest}
              className="group flex h-11 items-center justify-center gap-2 rounded-lg border border-white/12 bg-black/18 px-3 font-['Montserrat'] text-xs font-bold text-white/72 transition-colors hover:border-amber-200/35 hover:bg-amber-200/10 hover:text-amber-100 focus-visible:ring-2 focus-visible:ring-amber-200/45 focus-visible:outline-none"
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
          </div>
        </div>

        <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-3">
          {timeLimit !== null ? (
            <>
              <PlayerTimer
                mark="O"
                remainingTime={players.O.remainingTime}
                active={currentTurn === "O" && isGameActive && !winner}
                winner={winner}
              />
              <PlayerTimer
                mark="X"
                remainingTime={players.X.remainingTime}
                active={currentTurn === "X" && isGameActive && !winner}
                winner={winner}
              />
            </>
          ) : (
            <>
              <PlayerBadge
                mark="O"
                active={currentTurn === "O" && isGameActive && !winner}
                won={winner === "O"}
              />
              <PlayerBadge
                mark="X"
                active={currentTurn === "X" && isGameActive && !winner}
                won={winner === "X"}
              />
            </>
          )}
        </div>
      </div>

      <div className="relative mx-auto mt-3 w-full max-w-[min(92vw,58vh,38rem)] sm:mt-4">
        <BoardGrid
          board={board}
          isLast={isLastMove}
          onCellClick={onCellClick}
        />
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
      <RestartConfirm
        open={showRestartConfirm}
        onCancel={() => setShowRestartConfirm(false)}
        onConfirm={handleReplay}
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
      />
    </div>
  );
}

export default GameBoard;
