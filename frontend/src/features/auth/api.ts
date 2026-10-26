import type { AuthResponse } from "./types";
import {
  apiClient,
  BACKEND_UNAVAILABLE_MESSAGE,
  getApiErrorMessage,
  type BackendUnavailableCode,
} from "../../api/http";

const AUTH_ERROR_MESSAGE = "Authentication failed";

async function requestAuth<TBody extends object>(
  path: string,
  body?: TBody,
  unavailableCode?: BackendUnavailableCode,
): Promise<AuthResponse> {
  try {
    const response = body
      ? await apiClient.post<AuthResponse>(path, body)
      : await apiClient.get<AuthResponse>(path);

    if (!response.data.user) {
      throw new Error(AUTH_ERROR_MESSAGE);
    }

    return response.data;
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        AUTH_ERROR_MESSAGE,
        BACKEND_UNAVAILABLE_MESSAGE,
        unavailableCode,
      ),
      { cause: error },
    );
  }
}

export function signup(username: string, email: string, password: string) {
  return requestAuth(
    "/auth/signup",
    { username, email, password },
    "AUTH_SIGNUP_BACKEND_UNAVAILABLE",
  );
}

export function login(identifier: string, password: string) {
  return requestAuth(
    "/auth/login",
    { identifier, password },
    "AUTH_LOGIN_BACKEND_UNAVAILABLE",
  );
}

export function getMe() {
  return requestAuth(
    "/auth/me",
    undefined,
    "AUTH_SESSION_CHECK_BACKEND_UNAVAILABLE",
  );
}

export async function logout() {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    throw new Error(
      getApiErrorMessage(
        error,
        BACKEND_UNAVAILABLE_MESSAGE,
        BACKEND_UNAVAILABLE_MESSAGE,
        "AUTH_LOGOUT_BACKEND_UNAVAILABLE",
      ),
      { cause: error },
    );
  }
}
