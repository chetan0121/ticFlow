import {
  useMemo,
  useState,
  useEffect,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  GameMenuContext,
  INITIAL_STATE,
  type GameMenuSetters,
  type MenuStateType,
} from "./MenuContext";

const MENU_STATE_STORAGE_KEY = "ticflow:menu-state";

function getInitialState(): MenuStateType {
  if (typeof window === "undefined") return INITIAL_STATE;

  const stored = window.sessionStorage.getItem(MENU_STATE_STORAGE_KEY);
  if (!stored) return INITIAL_STATE;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return INITIAL_STATE;
    }
    return { ...INITIAL_STATE, ...(parsed as Partial<MenuStateType>) };
  } catch {
    window.sessionStorage.removeItem(MENU_STATE_STORAGE_KEY);
    return INITIAL_STATE;
  }
}

function toSetterName(key: string): keyof GameMenuSetters {
  return `set${key.charAt(0).toUpperCase()}${key.slice(1)}` as keyof GameMenuSetters;
}

function createActions(
  setState: Dispatch<SetStateAction<MenuStateType>>,
): GameMenuSetters {
  return (Object.keys(INITIAL_STATE) as (keyof MenuStateType)[]).reduce(
    (actions, key) => {
      return {
        ...actions,
        [toSetterName(key)]: (value: MenuStateType[typeof key]) => {
          setState((current) => ({ ...current, [key]: value }));
        },
      };
    },
    {} as GameMenuSetters,
  );
}

// Stores Menu state and exposes setters
export function GameMenuProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MenuStateType>(getInitialState);

  const actions = useMemo(() => createActions(setState), []);

  const value = useMemo(
    () => ({
      state,
      actions,
    }),
    [actions, state],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        MENU_STATE_STORAGE_KEY,
        JSON.stringify(state),
      );
    }
  }, [state]);

  return (
    <GameMenuContext.Provider value={value}>
      {children}
    </GameMenuContext.Provider>
  );
}
