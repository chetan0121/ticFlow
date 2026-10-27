import type { FocusEvent, KeyboardEvent } from "react";
import BaseOption from "./BaseOption";

interface InviteCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
}

function InviteCodeInput({
  value,
  onChange,
  onFocus,
  onKeyDown,
  placeholder = "Paste their invite code",
  maxLength,
}: InviteCodeInputProps) {
  return (
    <BaseOption
      text={{
        label: "Invite code (optional)",
        helper: "Enter your friend's invite code to join their room",
      }}
    >
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        className="h-10 w-full rounded-md border border-white/15 bg-black/20 px-3 font-mono tracking-widest text-white outline-none focus:border-[hsl(38,95%,62%)]/60 focus:ring-2 focus:ring-[hsl(38,95%,58%)]/25"
      />
    </BaseOption>
  );
}

export default InviteCodeInput;
