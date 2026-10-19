import axios from "axios";

export interface ApiErrorBody {
  error?: string;
}

const frontendEnv = import.meta.env as {
  readonly VITE_BACKEND_URL?: string;
};

const configuredBackendUrl = frontendEnv.VITE_BACKEND_URL?.trim();
export const apiBaseUrl =
  configuredBackendUrl ||
  `${globalThis.location.protocol}//${globalThis.location.hostname}:3000`;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;

    return data?.error ?? error.message ?? fallback;
  }

  return fallback;
}
