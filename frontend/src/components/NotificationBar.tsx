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

interface QueuedNotification extends NotificationBarProps {
  id: number;
}

const DISPLAY_TIME_MS = 4500;
const MAX_NOTIFICATION_QUEUE_SIZE = 5;

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
  const [queue, setQueue] = useState<QueuedNotification[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const currentRef = useRef<QueuedNotification | undefined>(undefined);

  const current = queue[0];

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const dismissCurrent = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setQueue((currentQueue) => {
      const nextQueue = currentQueue.slice(1);
      if (nextQueue.length === 0) {
        currentRef.current?.onClose?.();
      }
      return nextQueue;
    });
  }, [setQueue]);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    if (!current) return;

    timeoutRef.current = window.setTimeout(dismissCurrent, DISPLAY_TIME_MS);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [current, dismissCurrent]);

  useEffect(() => {
    if (!type || !title) return;

    const nextNotification: QueuedNotification = {
      type,
      title,
      message,
      onClose,
      id: ++notificationSequence.current,
    };

    setQueue((currentQueue) => {
      const last = currentQueue[currentQueue.length - 1];
      const isDuplicate =
        last &&
        last.type === nextNotification.type &&
        last.title === nextNotification.title &&
        last.message === nextNotification.message;
      if (isDuplicate) return currentQueue;

      return [...currentQueue, nextNotification].slice(
        -MAX_NOTIFICATION_QUEUE_SIZE,
      );
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
      {queue
        .slice()
        .reverse()
        .map((item) => {
          const stackIndex = queue.indexOf(item);
          const isCurrent = item.id === current.id;
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
                    key={item.id}
                    aria-hidden="true"
                    className="absolute right-0 bottom-0 left-0 h-px origin-left animate-[notification-progress_4500ms_linear_forwards] bg-white/75"
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
