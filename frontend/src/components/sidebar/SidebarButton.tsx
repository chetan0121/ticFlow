import { SidebarOpen } from "lucide-react";
import { useState } from "react";
import SidebarPanel from "./SidebarPanel";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import NotificationBar, { type NotificationType } from "../NotificationBar";

function SidebarButton() {
  const { ref, isOpen, open, close } = useOutsideClick();
  const [notification, setNotification] = useState<{
    type: NotificationType;
    title: string;
    message?: string;
    eventKey: number;
  } | null>(null);

  function showNotification(
    type: NotificationType,
    title: string,
    message?: string,
  ) {
    setNotification((current) => ({
      type,
      title,
      eventKey: (current?.eventKey ?? 0) + 1,
      ...(message ? { message } : {}),
    }));
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="group z-40 flex h-10 w-10 translate-x-0 items-center justify-center rounded-lg border border-white/10 bg-black/10 text-white/85 opacity-100 shadow-lg shadow-black/10 backdrop-blur-sm transition-colors duration-300 hover:bg-white/10 active:scale-95"
        aria-label="Open sidebar"
      >
        <SidebarOpen
          size={24}
          className="transition-transform duration-200 ease-out group-hover:text-white"
        />
      </button>

      <SidebarPanel
        isOpen={isOpen}
        onClose={close}
        onLogoutError={(message) =>
          showNotification("error", "Logout failed", message)
        }
        onLogoutSuccess={() =>
          showNotification("success", "Logged out successfully")
        }
        panelRef={ref}
      />
      {notification ? <NotificationBar {...notification} /> : null}
    </>
  );
}

export default SidebarButton;
