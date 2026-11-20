import { isAxiosError } from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { PACKAGE_LIMIT_PATTERN } from "./constants";
import type { ValidationErrorBody } from "./types";

/** Server message of a failed request (also set for HTTP-200 `result:false`). */
export function getApiMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  const message: unknown = (error.response?.data as { message?: unknown })
    ?.message;
  if (typeof message === "string" && message) return message;
  if (Array.isArray(message) && message.length) return message.join(" ");
  return undefined;
}

/** Field errors of an HTTP 422 response, or null for any other failure. */
export function getValidationErrors(
  error: unknown,
): Record<string, string[]> | null {
  if (!isAxiosError(error) || error.response?.status !== 422) return null;
  const body = error.response.data as ValidationErrorBody | undefined;
  return body?.errors && Object.keys(body.errors).length > 0
    ? body.errors
    : { _form: [body?.message ?? "Please check the form and try again."] };
}

export function isPackageLimitError(error: unknown): boolean {
  const message = getApiMessage(error);
  return message ? PACKAGE_LIMIT_PATTERN.test(message) : false;
}

/** `food_meta.time_slots.0.start` -> `food_meta.time_slots.*.start`. */
const toPattern = (key: string) => key.replace(/\.\d+(?=\.|$)/g, ".*");

/**
 * Pushes server validation errors onto form fields. `fieldMap` maps server
 * keys (with `*` for array indexes) to form field names. Returns the fields
 * that received an error and the messages that had no field to land on, which
 * the screen shows in a Notice.
 */
export function applyServerErrors<T extends FieldValues>(
  errors: Record<string, string[]>,
  fieldMap: Record<string, Path<T>>,
  setError: UseFormSetError<T>,
): { mapped: Path<T>[]; unmapped: string[] } {
  const mapped: Path<T>[] = [];
  const unmapped: string[] = [];

  Object.entries(errors).forEach(([key, messages]) => {
    const field = fieldMap[key] ?? fieldMap[toPattern(key)];
    const message = messages[0] ?? "This value is not valid.";
    if (field) {
      if (!mapped.includes(field)) {
        setError(field, { type: "server", message });
        mapped.push(field);
      }
    } else {
      unmapped.push(...messages);
    }
  });

  return { mapped, unmapped };
}
