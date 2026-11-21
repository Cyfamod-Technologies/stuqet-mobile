// Whether the app is already handling (or deliberately causing) a logout, so a
// 401 from an in-flight request does not trigger the "Session expired" screen.
// Kept apart from session-expiry.ts (which navigates with vendor-only route
// paths) so shared code such as useLogout can import it without pulling the
// vendor route types into the customer typecheck.
let handling = false;

export const isSessionExpiryHandled = () => handling;

export function markSessionExpiryHandled() {
  handling = true;
}

/** Call once after a successful login so the next expiry is handled again. */
export function resetSessionExpiry() {
  handling = false;
}

/** Call before an intentional logout so in-flight 401s don't show the screen. */
export function suppressSessionExpiry() {
  handling = true;
}
