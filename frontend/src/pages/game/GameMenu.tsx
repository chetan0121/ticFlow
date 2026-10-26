import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import NextButton from "../../components/buttons/NextButton";
import NotificationBar from "../../components/NotificationBar";
import MenuHeader from "../../features/menu/components/MenuHeader";
import MenuSetupPanel from "../../features/menu/components/MenuSetup";
import AppRoutes from "../../router/AppRoutes";
import { useMenuContext } from "../../features/menu/hooks/useMenuContext";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useEnterKey } from "../../hooks/useEnterKey";
import { VALID_INVITE_CODE_LENGTH } from "@ticflow/shared";

const TEXT = {
  title: "Game Setup",
  buttons: {
    createRoom: "Create room",
    joinRoom: "Join room",
    startGame: "Start Game",
    findGame: "FIND GAME",
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
  const [joining, setJoining] = useState(false);

  const showJoinError = (message: string) => {
    setJoinError(message);
    setJoinErrorRevision((revision) => revision + 1);
  };

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

  const startGame = () => {
    if (joining) return;

    if (
      (state.subMode === "fOnline" || state.subMode === "matchmaking") &&
      !user
    ) {
      void nav(AppRoutes.auth.path);
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

      setJoining(true);
      window.setTimeout(() => {
        setJoining(false);
        void nav(
          `${AppRoutes.gameBoard.path}?code=${encodeURIComponent(code)}`,
        );
      }, 300);
      return;
    }

    const destination = AppRoutes.gameBoard.path;
    void nav(destination);
  };

  useEnterKey(startGame);

  return (
    <div className="flex h-full w-full max-w-6xl flex-col gap-10 py-10">
      {joinError ? (
        <NotificationBar
          type="error"
          eventKey={joinErrorRevision}
          title={getJoinErrorTitle(joinError)}
          message={joinError}
          onClose={() => setJoinError(null)}
        />
      ) : null}
      <MenuHeader title={TEXT.title} />

      <MenuSetupPanel />

      {state.subMode === "fOnline" ? (
        <label className="mx-auto flex w-full max-w-sm flex-col gap-2 rounded-lg border border-white/12 bg-black/15 px-4 py-3 font-['Montserrat'] text-sm text-white/75 sm:max-w-md md:mx-0 md:max-w-md">
          Join a friend (optional)
          <input
            value={inviteCode}
            onChange={(event) => updateInviteCode(event.target.value)}
            onFocus={(event) => {
              if (inviteCode.length === VALID_INVITE_CODE_LENGTH) {
                event.currentTarget.select();
              }
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              startGame();
            }}
            placeholder="Paste their invite code"
            maxLength={VALID_INVITE_CODE_LENGTH}
            className="h-10 w-full rounded-md border border-white/15 bg-black/20 px-3 font-mono tracking-widest text-white outline-none focus:border-[hsl(38,95%,62%)]/60 focus:ring-2 focus:ring-[hsl(38,95%,58%)]/25"
          />
        </label>
      ) : null}

      <div
        className={`self-center pb-20 md:self-baseline md:pb-0 ${
          state.subMode === "matchmaking" || state.subMode === "fOnline"
            ? "w-full max-w-xs sm:max-w-sm"
            : ""
        }`}
      >
        <NextButton
          text={
            joining
              ? "Checking code..."
              : state.subMode === "matchmaking"
                ? TEXT.buttons.findGame
                : state.subMode === "fOnline"
                  ? inviteCode.trim()
                    ? TEXT.buttons.joinRoom
                    : TEXT.buttons.createRoom
                  : TEXT.buttons.startGame
          }
          onClick={startGame}
        />
      </div>
    </div>
  );
}

export default GameMenu;
