import { useEffect, useMemo, useState, type ReactNode } from "react";

import * as authApi from "../api";
import type { AuthUser } from "../types";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    authApi
      .getMe()
      .then((response) => {
        if (!isMounted) return;

        setUser(response.user);
      })
      .catch((error) => {
        if (!isMounted) return;

        const err = error as {
          cause?: { response?: { status?: number } };
          message?: string;
        };
        const cause = err.cause;
        const isAuthRejected =
          cause?.response?.status === 401 || cause?.response?.status === 403;

        if (isAuthRejected) {
          document.cookie =
            "ticflow_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        } else {
          console.error("[AUTH_SESSION_CHECK_BACKEND_UNAVAILABLE]", error);
        }

        setUser(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      user,
      setUser,
      login: async (identifier: string, password: string) => {
        const response = await authApi.login(identifier, password);
        setUser(response.user);
      },
      signup: async (username: string, email: string, password: string) => {
        const response = await authApi.signup(username, email, password);
        setUser(response.user);
      },
      logout: async () => {
        await authApi.logout();
        setUser(null);
      },
    }),
    [isLoading, user, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
