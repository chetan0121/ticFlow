import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ConfirmationDialogProps {
  cancelLabel?: string;
  confirmIcon: ReactNode;
  confirmLabel: string;
  description: string;
  id: string;
  kicker: string;
  onCancel?: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}

function ConfirmationDialog({
  cancelLabel,
  confirmIcon,
  confirmLabel,
  description,
  id,
  kicker,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmationDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/58 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
    >
      <div className="w-full max-w-95 overflow-hidden rounded-lg border border-white/14 bg-[hsl(26,34%,10%)] shadow-[0_26px_90px_rgba(0,0,0,0.58)]">
        <div className="relative flex flex-col items-start gap-2 border-b border-amber-100/14 px-5 py-5">
          <button
            type="button"
            aria-label="Close"
            onClick={() => onCancel?.()}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-black/18 text-white/72 transition-colors hover:border-white/22 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-200/45 focus-visible:outline-none"
          >
            <X className="h-4 w-4" strokeWidth={2.4} />
          </button>
          <p className="font-['Montserrat'] text-[10px] font-bold tracking-[0.2em] text-amber-100/60 uppercase">
            {kicker}
          </p>
          <h2
            id={id}
            className="mt-1 font-['Oswald'] text-3xl leading-none font-semibold text-white"
          >
            {title}
          </h2>
          <p className="mt-3 text-sm leading-5 text-white/58">{description}</p>
        </div>

        <div className="px-5 py-5">
          {cancelLabel ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onCancel?.()}
                className="flex h-11 items-center justify-center rounded-md border border-white/12 bg-white/6 px-3 font-['Montserrat'] text-sm font-semibold text-white/78 transition-colors hover:border-white/24 hover:bg-white/11 hover:text-white focus-visible:ring-2 focus-visible:ring-amber-200/45 focus-visible:outline-none"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex h-11 items-center justify-center gap-2 rounded-md border border-amber-200/35 bg-amber-300/12 px-3 font-['Montserrat'] text-sm font-semibold text-amber-100 transition-colors hover:border-amber-100/55 hover:bg-amber-300/18 focus-visible:ring-2 focus-visible:ring-amber-200/55 focus-visible:outline-none"
              >
                {confirmIcon}
                {confirmLabel}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-amber-200/35 bg-amber-300/12 px-3 font-['Montserrat'] text-sm font-semibold text-amber-100 transition-colors hover:border-amber-100/55 hover:bg-amber-300/18 focus-visible:ring-2 focus-visible:ring-amber-200/55 focus-visible:outline-none"
            >
              {confirmIcon}
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmationDialog;
