import { Clock3 } from "lucide-react";
import type { PlayerMark, WinState } from "../types";

const PLAYER_TIMER_STYLES: Record<PlayerMark, string> = {
  O: "border-cyan-300/45 bg-cyan-400/10 text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.1)]",
  X: "border-rose-300/45 bg-rose-400/10 text-rose-100 shadow-[0_0_26px_rgba(251,113,133,0.1)]",
};

function formatTime(value: number | null) {
  if (value === null) return "--:--";

  const totalSeconds = Math.max(0, Math.ceil(value / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface PlayerTimerProps {
  mark: PlayerMark;
  remainingTime: number | null;
  active: boolean;
  winner: WinState;
  label?: string;
  turnCue?: boolean;
}

function PlayerTimer({
  mark,
  remainingTime,
  active,
  winner,
  label = "Player",
  turnCue = false,
}: PlayerTimerProps) {
  const isWinner = winner === mark;
  const stateClass =
    active || isWinner
      ? PLAYER_TIMER_STYLES[mark]
      : "border-white/10 bg-black/18 text-white/52";

  return (
    <div
      className={`relative flex min-w-0 flex-1 items-center justify-between overflow-hidden rounded-lg border px-3 py-2.5 transition-all duration-300 ${turnCue ? "animate-[your-turn-card_1.8s_ease-in-out_infinite]" : ""} ${stateClass}`}
    >
      <span
        className={`absolute inset-y-2 left-0 w-1 rounded-r-full transition-opacity ${
          active || isWinner ? "opacity-100" : "opacity-0"
        } ${mark === "O" ? "bg-cyan-200" : "bg-rose-200"}`}
      />
      <div className="flex min-w-0 items-center gap-2">
        <span
          className="font-['Oswald'] text-2xl leading-none font-semibold"
          aria-hidden="true"
        >
          {mark}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-['Montserrat'] text-[9px] font-bold tracking-[0.14em] text-current/65 uppercase">
            {label}
          </span>
          <Clock3 className="mt-0.5 h-3 w-3 opacity-65" strokeWidth={2.3} />
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {turnCue ? (
          <span className="hidden animate-[your-turn-pop_1.8s_ease-out_infinite] rounded-full bg-current/15 px-1.5 py-1 font-['Montserrat'] text-[7px] font-black tracking-[0.12em] text-current uppercase min-[440px]:inline-flex">
            Your turn
          </span>
        ) : null}
        <span className="font-['Montserrat'] text-sm leading-none font-bold tabular-nums min-[360px]:text-base sm:text-lg">
          {formatTime(remainingTime)}
        </span>
      </div>
    </div>
  );
}

export default PlayerTimer;
