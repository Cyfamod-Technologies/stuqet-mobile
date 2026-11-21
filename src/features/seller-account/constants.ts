import type { VerificationFieldType } from "./types";

export const VERIFICATION_FIELD_TYPES: readonly VerificationFieldType[] = [
  "text",
  "file",
  "select",
  "multi_select",
  "radio",
];

/**
 * Whether the payout screen confirms the account name with the bank (the name
 * is read-only and filled in by the backend).
 *
 * TODO(backend): needs `POST /seller/bank/resolve` (see api.ts). It is off by
 * default so nothing calls the missing endpoint; set
 * `EXPO_PUBLIC_ENABLE_ACCOUNT_RESOLVE="true"` once it ships. While it is off,
 * the Account name stays an editable field.
 */
export const isAccountResolveEnabled =
  process.env.EXPO_PUBLIC_ENABLE_ACCOUNT_RESOLVE === "true";

/** A Nigerian NUBAN account number has 10 digits. */
export const ACCOUNT_NUMBER_LENGTH = 10;
