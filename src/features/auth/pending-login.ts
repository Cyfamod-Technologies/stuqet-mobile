import type { LoginDTO } from "./types";

// Credentials of a login that was blocked because the shop is still under
// review. Held in JS memory only (never persisted) so "Check again" can retry
// without sending the seller back to the form; cleared as soon as they leave
// the screen or the login succeeds.
let pending: LoginDTO | null = null;

export const pendingLogin = {
  set(credentials: LoginDTO) {
    pending = credentials;
  },
  get(): LoginDTO | null {
    return pending;
  },
  clear() {
    pending = null;
  },
};
