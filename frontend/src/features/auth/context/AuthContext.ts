import { createContext } from "react";

import type { AuthUser } from "../types";

export interface AuthContextValue {
  isLoading: boolean;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
