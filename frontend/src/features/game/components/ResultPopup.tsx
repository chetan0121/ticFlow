import { ArrowLeft, Handshake, RotateCcw, Trophy, X } from "lucide-react";
import type { WinState } from "../types";

export interface GameResultActions {
  back: () => void | Promise<void>;
  close: () => void | Promise<void>;
  replay: () => void | Promise<void>;
}

interface GameResultPopupProps {
  actions: GameResultActions;
  open: boolean;
  winner: WinState;
}

function getResultContent(winner: WinState) {
  if (winner === "draw") {
    return {
      Icon: Handshake,
      title: "Draw Game",
      label: "No winner",
      tone: "border-amber-200/45 bg-amber-300/10 text-amber-100",
    };
  } else if (winner === "O") {
    return {
      Icon: Trophy,
      title: "Player O Wins",
      label: "Winner",
      tone: "border-cyan-300/45 bg-cyan-400/10 text-cyan-100",
    };
  }

  return {
    Icon: Trophy,
    title: "Player X Wins",
    label: "Winner",
    tone: "border-rose-300/45 bg-rose-400/10 text-rose-100",
  };
}

function GameResultPopup({ actions, open, winner }: GameResultPopupProps) {
  if (!open || winner === null) return null;

  const { Icon, title, label, tone } = getResultContent(winner);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/58 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-result-title"
    >
      <div className="w-full max-w-105 overflow-hidden rounded-lg border border-white/14 bg-[hsl(26,34%,10%)] shadow-[0_26px_90px_rgba(0,0,0,0.58)]">
        <div
          className={`relative flex flex-col items-center gap-4 border-b px-6 py-7 ${tone}`}
        >
          <button
            type="button"
            aria-label="Close result"
            onClick={() => void actions.close()}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/18 text-white/72 transition-colors hover:border-white/22 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-200/45 focus-visible:outline-none"
          >
            <X className="h-4 w-4" strokeWidth={2.4} />
          </button>

          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-current/30 bg-black/20 shadow-[0_0_30px_currentColor] shadow-current/10">
            <Icon className="h-8 w-8" strokeWidth={2.15} />
          </div>

          <div className="text-center">
            <p className="font-['Montserrat'] text-xs font-semibold tracking-[0.18em] uppercase">
              {label}
            </p>
            <h2
              id="game-result-title"
              className="mt-1 font-['Oswald'] text-4xl leading-none font-semibold text-white"
            >
              {title}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => void actions.back()}
              className="flex h-11 items-center justify-center gap-2 rounded-md border border-white/12 bg-white/6 px-3 font-['Montserrat'] text-sm font-semibold text-white/78 transition-colors hover:border-white/24 hover:bg-white/11 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-200/45 focus-visible:outline-none"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.35} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => void actions.replay()}
              className="flex h-11 items-center justify-center gap-2 rounded-md border border-amber-200/35 bg-amber-300/12 px-3 font-['Montserrat'] text-sm font-semibold text-amber-100 transition-colors hover:border-amber-100/55 hover:bg-amber-300/18 focus-visible:ring-2 focus-visible:ring-amber-200/55 focus-visible:outline-none"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2.35} />
              <span>Replay</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameResultPopup;
