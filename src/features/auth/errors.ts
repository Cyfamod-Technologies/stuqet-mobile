import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "~/types/api";
import type { LoginFailure } from "./types";

/** The backend message of a failed request, or null. */
export function getApiMessage(error: unknown): string | null {
  if (!isAxiosError(error)) return null;
  const data = error.response?.data as ApiErrorResponse | undefined;
  const message = data?.message ?? data?.detail ?? data?.error;
  return typeof message === "string" && message.length > 0 ? message : null;
}

/**
 * Classifies a failed POST /auth/login by the real AuthController messages:
 * - "User is banned"                                   -> suspended
 * - "Your seller account is under review. We will
 *    notify you once approved."                        -> under-review
 * - "User not found" / "Unauthorized"                  -> invalid-credentials
 * Matching is by keyword so a translated-but-similar string still works.
 */
export function classifyLoginError(error: unknown): LoginFailure {
  if (!isAxiosError(error) || error.response?.status !== 401) return "other";
  const message = (getApiMessage(error) ?? "").toLowerCase();

  if (message.includes("banned") || message.includes("suspended")) {
    return "suspended";
  }
  if (message.includes("under review") || message.includes("approval")) {
    return "under-review";
  }
  return "invalid-credentials";
}

/** Friendly inline copy for the failures the login screen shows itself. */
export function loginErrorCopy(error: unknown): string {
  if (isAxiosError(error) && !error.response) {
    return "We couldn't reach Stuqet. Check your connection and try again.";
  }
  switch (classifyLoginError(error)) {
    case "invalid-credentials":
      return "That email, phone or password doesn't match a seller account.";
    default:
      return getApiMessage(error) ?? "Something went wrong. Please try again.";
  }
}
