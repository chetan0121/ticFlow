import { AlertCircle, CheckCircle2, CircleX, Info } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type NotificationType = "error" | "info" | "success";

interface NotificationBarProps {
  type: NotificationType;
  title: string;
  message?: string | undefined;
  onClose?: (() => void) | undefined;
  eventKey?: string | number | undefined;
}

interface StackedNotification extends NotificationBarProps {
  id: number;
  totalMs: number;
  remainingMs: number;
}

const DISPLAY_TIME_MS = 5000;
const MAX_STACK_SIZE = 5;

const NOTIFICATION_STYLES = {
  error: {
    Icon: AlertCircle,
    className:
      "border-rose-300/35 bg-rose-400/12 text-rose-50 shadow-[0_14px_36px_rgba(127,29,29,0.2)]",
    iconClassName: "text-rose-200",
  },
  info: {
    Icon: Info,
    className:
      "border-sky-200/35 bg-sky-400/12 text-sky-50 shadow-[0_14px_36px_rgba(14,116,144,0.24)]",
    iconClassName: "text-sky-200",
  },
  success: {
    Icon: CheckCircle2,
    className:
      "border-emerald-300/35 bg-emerald-400/12 text-emerald-50 shadow-[0_14px_36px_rgba(6,95,70,0.24)]",
    iconClassName: "text-emerald-200",
  },
} as const;

function NotificationBar({
  type,
  title,
  message,
  onClose,
  eventKey,
}: NotificationBarProps) {
  const notificationSequence = useRef(0);
  const [stack, setStack] = useState<StackedNotification[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastIncomingRef = useRef<{
    type: NotificationType;
    title: string;
    message?: string | undefined;
    eventKey?: string | number | undefined;
  } | null>(null);

  const current = stack[0];

  const dismissCurrent = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setStack((currentStack) => {
      const dismissed = currentStack[0];
      if (!dismissed) return currentStack;

      const rest = currentStack.slice(1);
      if (rest.length === 0) {
        dismissed.onClose?.();
      }
      return rest;
    });
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!current) {
      startTimeRef.current = null;
      return;
    }

    startTimeRef.current = Date.now();

    const timeout = window.setTimeout(
      dismissCurrent,
      Math.max(50, current.remainingMs),
    );
    timerRef.current = timeout;

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [current, dismissCurrent]);

  useEffect(() => {
    if (!type || !title) {
      lastIncomingRef.current = null;
      return;
    }

    const isDuplicate =
      lastIncomingRef.current !== null &&
      lastIncomingRef.current.type === type &&
      lastIncomingRef.current.title === title &&
      lastIncomingRef.current.message === message &&
      lastIncomingRef.current.eventKey === eventKey;

    if (isDuplicate) return;

    lastIncomingRef.current = { type, title, message, eventKey };

    const nextNotification: StackedNotification = {
      type,
      title,
      message,
      onClose,
      eventKey,
      id: ++notificationSequence.current,
      totalMs: DISPLAY_TIME_MS,
      remainingMs: DISPLAY_TIME_MS,
    };

    setStack((currentStack) => {
      const currentTop = currentStack[0];
      if (!currentTop) {
        return [nextNotification];
      }

      const elapsed =
        startTimeRef.current !== null ? Date.now() - startTimeRef.current : 0;
      const updatedRemainingMs = Math.max(0, currentTop.remainingMs - elapsed);

      const updatedTop: StackedNotification = {
        ...currentTop,
        remainingMs: updatedRemainingMs,
      };

      const nextStack = [
        nextNotification,
        updatedTop,
        ...currentStack.slice(1),
      ];
      return nextStack.slice(0, MAX_STACK_SIZE);
    });
  }, [type, title, message, onClose, eventKey]);

  function close() {
    dismissCurrent();
  }

  if (!current) return null;
  return (
    <div
      className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2"
      role={current.type === "error" ? "alert" : "status"}
    >
      {stack
        .slice()
        .reverse()
        .map((item) => {
          const stackIndex = stack.indexOf(item);
          const isCurrent = stackIndex === 0;
          const itemStyle = NOTIFICATION_STYLES[item.type];
          const ItemIcon = itemStyle.Icon;

          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 overflow-hidden rounded-xl border bg-black/35 px-4 py-3.5 backdrop-blur-md ${itemStyle.className} ${
                isCurrent
                  ? "relative z-10 animate-[notification-enter_420ms_cubic-bezier(0.22,1,0.36,1)] shadow-[0_18px_45px_rgba(0,0,0,0.28)]"
                  : "pointer-events-none absolute inset-x-0 top-0 z-0 opacity-45 shadow-[0_10px_24px_rgba(0,0,0,0.2)]"
              }`}
              style={
                isCurrent
                  ? undefined
                  : {
                      transform: `translateY(${stackIndex * 7}px) scale(${
                        1 - stackIndex * 0.04
                      })`,
                      transition:
                        "transform 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease",
                    }
              }
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-black/12">
                <ItemIcon
                  className={`h-5 w-5 ${itemStyle.iconClassName}`}
                  strokeWidth={2.2}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-['Montserrat'] text-xs font-bold tracking-wide">
                  {item.title}
                </p>
                {item.message ? (
                  <p className="mt-0.5 text-xs leading-5 text-white/65">
                    {item.message}
                  </p>
                ) : null}
              </div>
              {isCurrent ? (
                <>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close notification"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/7 text-current/70 transition-colors hover:border-white/25 hover:bg-white/14 hover:text-current focus-visible:ring-2 focus-visible:ring-current/45 focus-visible:outline-none"
                  >
                    <CircleX className="h-4.5 w-4.5" strokeWidth={2} />
                  </button>
                  <span
                    key={`${item.id}-${item.remainingMs}`}
                    aria-hidden="true"
                    className="absolute right-0 bottom-0 left-0 h-px origin-left bg-white/75"
                    style={
                      {
                        "--notification-progress-start":
                          item.remainingMs / item.totalMs,
                        animation: `notification-progress ${item.remainingMs}ms linear forwards`,
                      } as React.CSSProperties
                    }
                  />
                </>
              ) : null}
            </div>
          );
        })}
    </div>
  );
}

export default NotificationBar;
