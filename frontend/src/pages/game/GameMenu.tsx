import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NextButton from "../../components/buttons/NextButton";
import MenuHeader from "../../features/menu/components/MenuHeader";
import MenuSetupPanel from "../../features/menu/components/MenuSetup";
import { useEnterKey } from "../../hooks/useEnterKey";
import AppRoutes from "../../router/AppRoutes";
import { useMenuContext } from "../../features/menu/hooks/useMenuContext";
import { useAuth } from "../../features/auth/hooks/useAuth";

const TEXT = {
  title: "Game Setup",
  buttons: {
    startGame: "Start Game",
  },
};

function GameMenu() {
  const nav = useNavigate();
  const { state } = useMenuContext();
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState("");
  const startGame = () => {
    if (state.subMode === "fOnline" && !user) {
      void nav(AppRoutes.auth.path);
      return;
    }
    const code = inviteCode.trim().toUpperCase();
    const destination =
      state.subMode === "fOnline" && code
        ? `${AppRoutes.gameBoard.path}?join=${encodeURIComponent(code)}`
        : AppRoutes.gameBoard.path;
    void nav(destination);
  };

  useEnterKey(startGame);

  return (
    <div className="flex h-full w-full max-w-6xl flex-col gap-10 py-10">
      <MenuHeader title={TEXT.title} />

      <MenuSetupPanel />

      {state.subMode === "fOnline" ? (
        <label className="mx-auto flex w-full max-w-md flex-col gap-2 rounded-lg border border-white/12 bg-black/15 px-4 py-3 font-['Montserrat'] text-sm text-white/75 md:mx-0">
          Join a friend (optional)
          <input
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value)}
            placeholder="Paste their invite code"
            maxLength={8}
            className="h-10 rounded-md border border-white/15 bg-black/20 px-3 font-mono tracking-widest text-white outline-none focus:border-cyan-200/55"
          />
        </label>
      ) : null}

      <div className="self-center pb-20 md:self-baseline md:pb-0">
        <NextButton text={TEXT.buttons.startGame} onClick={startGame} />
      </div>
    </div>
  );
}

export default GameMenu;
