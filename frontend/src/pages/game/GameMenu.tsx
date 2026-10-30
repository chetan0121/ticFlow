import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import NextButton from "../../components/buttons/NextButton";
import NotificationBar from "../../components/NotificationBar";
import MenuHeader from "../../features/menu/components/MenuHeader";
import MenuSetupPanel from "../../features/menu/components/MenuSetup";
import InviteCodeInput from "../../features/menu/components/InviteCodeInput";
import AppRoutes from "../../router/AppRoutes";
import { useMenuContext } from "../../features/menu/hooks/useMenuContext";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useEnterKey } from "../../hooks/useEnterKey";
import { VALID_INVITE_CODE_LENGTH } from "@ticflow/shared";
import { apiBaseUrl } from "../../api/http";

const TEXT = {
  title: "Game Setup",
  buttons: {
    createRoom: "Create Room",
    joinRoom: "Join Room",
    startGame: "Start Game",
    findGame: "Find Game",
  },
};

const INVITE_CODE_STORAGE_KEY = "ticflow:friend-online-invite-code";

function getJoinErrorTitle(message: string): string {
  if (message === "Unable to check the invite code. Please try again.") {
    return "Connection unavailable";
  }
  if (message === "This game is full") return "Game is full";
  if (message === "This room doesn't exist or is no longer available") {
    return "Room unavailable";
  }
  return "Unable to join room";
}

function getNavigationNotification(state: unknown): string | null {
  if (!state || typeof state !== "object" || !("notification" in state)) {
    return null;
  }

  const notification = state.notification;
  return typeof notification === "string" ? notification : null;
}

function validateInviteCode(code: string): Promise<string | null> {
  const socket = io(apiBaseUrl, { withCredentials: true, timeout: 10000 });

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      socket.disconnect();
      resolve("Unable to connect to the game server.");
    }, 10000);

    socket.on("connect", () => {
      socket.emit("friend-game:join", code, (response: { error?: string }) => {
        clearTimeout(timer);
        socket.disconnect();
        resolve(response.error ?? null);
      });
    });

    socket.on("connect_error", () => {
      clearTimeout(timer);
      socket.disconnect();
      resolve("Unable to connect to the game server.");
    });
  });
}

function GameMenu() {
  const nav = useNavigate();
  const location = useLocation();
  const { state } = useMenuContext();
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(INVITE_CODE_STORAGE_KEY) ?? "";
  });
  const [joinError, setJoinError] = useState<string | null>(() =>
    getNavigationNotification(location.state),
  );
  const [joinErrorRevision, setJoinErrorRevision] = useState(() =>
    getNavigationNotification(location.state) ? 1 : 0,
  );

  const showJoinError = (message: string) => {
    setJoinError(message);
    setJoinErrorRevision((revision) => revision + 1);
  };

  const handleClose = useCallback(() => {
    setTimeout(() => {
      setJoinError(null);
    }, 0);
  }, [setJoinError]);

  useEffect(() => {
    if (!getNavigationNotification(location.state)) return;
    void nav(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, nav]);

  function updateInviteCode(value: string) {
    const nextCode = value.toUpperCase();
    setInviteCode(nextCode);

    if (typeof window === "undefined") return;
    if (nextCode) {
      window.sessionStorage.setItem(INVITE_CODE_STORAGE_KEY, nextCode);
    } else {
      window.sessionStorage.removeItem(INVITE_CODE_STORAGE_KEY);
    }
  }

  const startGame = async () => {
    if (
      (state.subMode === "fOnline" || state.subMode === "matchmaking") &&
      !user
    ) {
      void nav(AppRoutes.auth.path, { state: { from: location.pathname } });
      return;
    }

    const code = inviteCode.trim().toUpperCase();

    if (state.subMode === "fOnline" && code.length > 0) {
      if (code.length !== VALID_INVITE_CODE_LENGTH) {
        showJoinError(
          `Invite code must be exactly ${VALID_INVITE_CODE_LENGTH} characters.`,
        );
        return;
      }

      const error = await validateInviteCode(code);
      if (error) {
        showJoinError(error);
        return;
      }

      void nav(`${AppRoutes.gameBoard.path}?code=${encodeURIComponent(code)}`);
      return;
    }

    const destination = AppRoutes.gameBoard.path;
    void nav(destination);
  };

  useEnterKey(() => {
    void startGame();
  });

  return (
    <div className="flex h-full w-full max-w-6xl flex-col gap-10 py-10">
      {joinError ? (
        <NotificationBar
          type="error"
          eventKey={joinErrorRevision}
          title={getJoinErrorTitle(joinError)}
          message={joinError}
          onClose={handleClose}
        />
      ) : null}
      <MenuHeader title={TEXT.title} />

      <MenuSetupPanel>
        {state.subMode === "fOnline" ? (
          <InviteCodeInput
            value={inviteCode}
            onChange={updateInviteCode}
            onFocus={(event) => {
              if (inviteCode.length === VALID_INVITE_CODE_LENGTH) {
                event.currentTarget.select();
              }
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              void startGame();
            }}
            placeholder="Paste their invite code"
            maxLength={VALID_INVITE_CODE_LENGTH}
          />
        ) : null}
      </MenuSetupPanel>

      <div
        className={`self-center pb-20 md:self-baseline md:pb-0 ${
          state.subMode === "matchmaking" || state.subMode === "fOnline"
            ? "w-full max-w-xs sm:max-w-sm"
            : ""
        }`}
      >
        <NextButton
          text={
            state.subMode === "matchmaking"
              ? TEXT.buttons.findGame
              : state.subMode === "fOnline"
                ? inviteCode.trim()
                  ? TEXT.buttons.joinRoom
                  : TEXT.buttons.createRoom
                : TEXT.buttons.startGame
          }
          onClick={() => {
            void startGame();
          }}
        />
      </div>
    </div>
  );
}

export default GameMenu;
