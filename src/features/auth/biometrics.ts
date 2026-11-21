import { useCallback, useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { axiosPrivate } from "~/lib/config/axios";
import { useAuthStore } from "~/hooks/use-auth-store";
import {
  getToken,
  isBiometricEnabled,
  setBiometricEnabled,
  setBiometricPrompted,
} from "~/lib/secure-storage";

export type BiometricOutcome =
  { ok: true } | { ok: false; reason: "cancelled" | "failed" | "unavailable" };

const CANCEL_ERRORS = new Set([
  "user_cancel",
  "system_cancel",
  "app_cancel",
  "user_fallback",
]);

/** Whether the device has a fingerprint / face sensor with something enrolled. */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    const [hardware, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    return hardware && enrolled;
  } catch {
    return false;
  }
}

/** Shows the system biometric prompt. Never throws. */
export async function authenticateWithBiometrics(
  promptMessage: string,
): Promise<BiometricOutcome> {
  try {
    if (!(await isBiometricAvailable())) {
      return { ok: false, reason: "unavailable" };
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: "Use password",
      // Biometrics only: the passcode fallback would defeat "use password".
      disableDeviceFallback: true,
    });
    if (result.success) return { ok: true };
    return {
      ok: false,
      reason: CANCEL_ERRORS.has(result.error) ? "cancelled" : "failed",
    };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

/** Turns biometric unlock on after the user confirms once with the sensor. */
export async function enableBiometricUnlock(): Promise<BiometricOutcome> {
  const outcome = await authenticateWithBiometrics(
    "Confirm to turn on fingerprint login",
  );
  if (outcome.ok) {
    await setBiometricEnabled(true);
    await setBiometricPrompted(true);
  }
  return outcome;
}

export async function disableBiometricUnlock(): Promise<void> {
  await setBiometricEnabled(false);
}

export type UnlockOutcome =
  BiometricOutcome | { ok: false; reason: "no-session" };

/**
 * Unlocks the session token already stored in secure storage behind a
 * biometric check and makes it the active session. Returns "no-session" when
 * there is nothing to unlock (the user logged out or the session expired).
 */
export async function unlockStoredSession(): Promise<UnlockOutcome> {
  const token = await getToken();
  if (!token) return { ok: false, reason: "no-session" };

  const outcome = await authenticateWithBiometrics("Log in to Stuqet Vendor");
  if (!outcome.ok) return outcome;

  useAuthStore.getState().setAuthToken({ access: token });
  axiosPrivate.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return { ok: true };
}

/** Device support, resolved once per mount (null while checking). */
export function useBiometricAvailable(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    isBiometricAvailable().then((value) => {
      if (active) setAvailable(value);
    });
    return () => {
      active = false;
    };
  }, []);

  return available;
}

/**
 * Preference for a settings toggle: `enabled` reflects secure storage,
 * `setEnabled(true)` asks for a fingerprint confirmation first. Resolves to
 * whether the preference ended up on.
 */
export function useBiometricPreference() {
  const available = useBiometricAvailable();
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    let active = true;
    isBiometricEnabled().then((value) => {
      if (active) setEnabledState(value);
    });
    return () => {
      active = false;
    };
  }, []);

  const setEnabled = useCallback(async (next: boolean) => {
    if (next) {
      const outcome = await enableBiometricUnlock();
      setEnabledState(outcome.ok);
      return outcome.ok;
    }
    await disableBiometricUnlock();
    setEnabledState(false);
    return false;
  }, []);

  return { available: available === true, enabled, setEnabled };
}
