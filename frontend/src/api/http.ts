import axios from "axios";

export interface ApiErrorBody {
  error?: string;
}

export const BACKEND_UNAVAILABLE_MESSAGE =
  "The backend is unavailable. Please try again in a moment.";

export type BackendUnavailableCode =
  | "AUTH_LOGIN_BACKEND_UNAVAILABLE"
  | "AUTH_SIGNUP_BACKEND_UNAVAILABLE"
  | "AUTH_SESSION_CHECK_BACKEND_UNAVAILABLE"
  | "AUTH_LOGOUT_BACKEND_UNAVAILABLE";

const frontendEnv = import.meta.env as {
  readonly VITE_BACKEND_URL?: string;
};

const configuredBackendUrl = frontendEnv.VITE_BACKEND_URL?.trim();
export const apiBaseUrl =
  configuredBackendUrl ||
  `${globalThis.location.protocol}//${globalThis.location.hostname}:3000`;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
  networkFallback = fallback,
  unavailableCode?: BackendUnavailableCode,
) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;

    if (!error.response) {
      if (unavailableCode) {
        console.error(`[${unavailableCode}]`, error);
      }
      return networkFallback;
    }

    return data?.error ?? fallback;
  }

  return fallback;
}
