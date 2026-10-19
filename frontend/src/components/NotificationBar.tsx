import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export type NotificationType = "error" | "info" | "success";

interface NotificationBarProps {
  type: NotificationType;
  title: string;
  message?: string;
  onClose?: (() => void) | undefined;
}

const NOTIFICATION_STYLES = {
  error: {
    Icon: AlertCircle,
    className:
      "border-rose-300/35 bg-rose-400/12 text-rose-50 shadow-[0_12px_30px_rgba(127,29,29,0.16)]",
    iconClassName: "text-rose-200",
  },
  info: {
    Icon: Info,
    className:
      "border-sky-200/35 bg-sky-400/12 text-sky-50 shadow-[0_12px_30px_rgba(14,116,144,0.2)]",
    iconClassName: "text-sky-200",
  },
  success: {
    Icon: CheckCircle2,
    className:
      "border-emerald-300/35 bg-emerald-400/12 text-emerald-50 shadow-[0_12px_30px_rgba(6,95,70,0.2)]",
    iconClassName: "text-emerald-200",
  },
} as const;

function NotificationBar({
  type,
  title,
  message,
  onClose,
}: NotificationBarProps) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const { Icon, className, iconClassName } = NOTIFICATION_STYLES[type];

  useEffect(() => {
    const timeout = window.setTimeout(() => setLeaving(true), 4500);

    return () => window.clearTimeout(timeout);
  }, []);

  function close() {
    setLeaving(true);
  }

  function finishClosing() {
    if (!leaving) return;
    setVisible(false);
    onClose?.();
  }

  if (!visible) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center gap-3 rounded-lg border px-4 py-3 ${leaving ? "animate-[notification-exit_220ms_ease-in_forwards]" : "animate-[notification-enter_260ms_cubic-bezier(0.22,1,0.36,1)]"} ${className}`}
      role={type === "error" ? "alert" : "status"}
      onAnimationEnd={finishClosing}
    >
      <Icon className={`h-5 w-5 shrink-0 ${iconClassName}`} strokeWidth={2.2} />
      <div className="min-w-0 flex-1">
        <p className="font-['Montserrat'] text-xs font-bold tracking-wide">
          {title}
        </p>
        {message ? (
          <p className="mt-0.5 text-xs text-white/62">{message}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Close notification"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-current/65 transition-colors hover:bg-white/10 hover:text-current focus-visible:ring-2 focus-visible:ring-current/45 focus-visible:outline-none"
      >
        <X className="h-4 w-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}

export default NotificationBar;
