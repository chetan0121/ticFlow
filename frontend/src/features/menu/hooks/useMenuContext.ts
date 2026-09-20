import { useContext } from "react";
import { GameMenuContext, type MenuContextType } from "../context/MenuContext";

// Access context with this safe hook
export function useMenuContext(): MenuContextType {
  const context = useContext<MenuContextType | undefined>(GameMenuContext);

  // Check if exist/created
  if (!context) {
    throw new Error("useMenuContext must be used within GameMenuProvider");
  }

  return context;
}
