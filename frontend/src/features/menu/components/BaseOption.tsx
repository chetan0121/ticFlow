import type { ReactNode } from "react";
import type { SetupText } from "../constants";

const hasText = (value: string) => value.trim().length > 0;

interface BaseOptionProps {
  children: ReactNode;
  isActive?: boolean;
  text: SetupText;
}

function BaseOption({ children, isActive = false, text }: BaseOptionProps) {
  return (
    <section
      className={`relative flex h-full w-full max-w-100 flex-col rounded-2xl border p-4 transition-colors duration-300 ${
        isActive
          ? "z-30 border-amber-100/20 bg-black/30"
          : "border-white/10 bg-white/5.5"
      }`}
    >
      <div>
        {hasText(text.label) ? (
          <span className="block text-left font-['Montserrat'] text-xs font-semibold tracking-[0.25em] text-amber-100/70 uppercase">
            {text.label}
          </span>
        ) : null}
        {hasText(text.helper) ? (
          <p className="mt-1.5 text-left text-sm leading-5 text-white/50">
            {text.helper}
          </p>
        ) : null}
      </div>

      <div className="mt-auto pt-4">{children}</div>
    </section>
  );
}

export default BaseOption;
