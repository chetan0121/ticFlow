import type { AuthResponse } from "./types";
import { apiClient, getApiErrorMessage } from "../../api/http";

const AUTH_ERROR_MESSAGE = "Authentication failed";

async function requestAuth<TBody extends object>(
  path: string,
  body?: TBody,
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
    throw new Error(getApiErrorMessage(error, AUTH_ERROR_MESSAGE), {
      cause: error,
    });
  }
}

export function signup(username: string, email: string, password: string) {
  return requestAuth("/auth/signup", { username, email, password });
}

export function login(identifier: string, password: string) {
  return requestAuth("/auth/login", { identifier, password });
}

export function getMe() {
  return requestAuth("/auth/me");
}

export async function logout() {
  await apiClient.post("/auth/logout");
}
