import { isAxiosError } from "axios";
import { router } from "expo-router";
import { axiosPrivate } from "~/lib/config/axios";
import { useAuthStore } from "~/hooks/use-auth-store";
import { deleteToken } from "~/lib/secure-storage";

// Vendor app: an authenticated request answered with 401 means the Sanctum
// token is no longer valid (revoked, deleted or expired). Instead of the silent
// redirect to login done by src/lib/config/axios.ts, land on the Session
// expired screen.
//
// axios.ts only reacts to the messages "Token is invalid or expired" / "Token is
// blacklisted", which this Laravel backend never sends (Sanctum answers
// "Unauthenticated."), and it cannot be edited here, so this handler is
// registered from the vendor root layout as an additional response interceptor.
// It runs after axios.ts's own interceptor, so its navigation wins.

let registered = false;
let handling = false;

/** Call once after a successful login so the next expiry is handled again. */
export function resetSessionExpiry() {
  handling = false;
}

/** Call before an intentional logout so in-flight 401s don't show the screen. */
export function suppressSessionExpiry() {
  handling = true;
}

export async function expireSession() {
  if (handling) return;
  handling = true;
  useAuthStore.getState().clearAuthToken();
  delete axiosPrivate.defaults.headers.common["Authorization"];
  await deleteToken();
  router.replace("/(auth)/session-expired");
}

export function registerSessionExpiryHandler() {
  if (registered) return;
  registered = true;

  axiosPrivate.interceptors.response.use(undefined, async (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? "";
      // Only requests that carried a session count, and logging out itself
      // answers 401 when the token is already gone.
      const hadSession = Boolean(error.config?.headers?.Authorization);
      if (hadSession && !url.includes("/auth/logout")) {
        await expireSession();
      }
    }
    return Promise.reject(error);
  });
}
