import type { LucideIcon } from "lucide-react";

interface MutualActionButtonProps {
  Icon: LucideIcon;
  label: string;
  disabled: boolean;
  pending: boolean;
  opponentRequested: boolean;
  onClick: () => void;
}

/** A server-confirmed two-player action, reusable by friend and matchmaking games. */
function MutualActionButton({
  Icon,
  label,
  disabled,
  pending,
  opponentRequested,
  onClick,
}: MutualActionButtonProps) {
  const stateClass = disabled
    ? "cursor-not-allowed border-white/8 bg-black/10 text-white/28 shadow-none"
    : opponentRequested
      ? "animate-[agreement-glow_1.65s_ease-in-out_infinite] border-sky-200/60 bg-sky-300/18 text-sky-50"
      : pending
        ? "cursor-wait border-white/14 bg-white/8 text-white/55"
        : "border-white/14 bg-black/20 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      aria-label={label}
      className={`group flex h-10 items-center justify-center gap-2 rounded-lg border px-3 font-['Montserrat'] text-xs font-bold transition-[color,background-color,border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-sky-200/50 focus-visible:outline-none ${stateClass}`}
    >
      <Icon
        className={`h-4 w-4 transition-transform duration-300 ${
          !disabled && !pending ? "group-hover:-rotate-45" : ""
        }`}
        strokeWidth={2.4}
      />
      <span className="hidden min-[430px]:inline">{label}</span>
    </button>
  );
}

export default MutualActionButton;
