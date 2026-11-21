import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "app_auth_token";
const BIOMETRIC_ENABLED_KEY = "app_biometric_enabled";
const BIOMETRIC_PROMPTED_KEY = "app_biometric_prompted";
const REMEMBER_ME_KEY = "app_remember_me";

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function hasToken(): Promise<boolean> {
  const token = await getToken();
  return token !== null && token.length > 0;
}

// --- Biometric unlock + "remember me" (vendor app) --------------------------
// Flags live in the same encrypted store as the session token so they cannot be
// flipped from outside the app. The session token itself is unchanged.

async function readFlag(key: string): Promise<boolean | null> {
  const value = await SecureStore.getItemAsync(key);
  if (value === null) return null;
  return value === "1";
}

async function writeFlag(key: string, value: boolean): Promise<void> {
  await SecureStore.setItemAsync(key, value ? "1" : "0");
}

/** Whether the user turned on fingerprint / Face ID unlock. */
export async function isBiometricEnabled(): Promise<boolean> {
  return (await readFlag(BIOMETRIC_ENABLED_KEY)) === true;
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await writeFlag(BIOMETRIC_ENABLED_KEY, enabled);
}

/** Whether the "Enable fingerprint" offer was already shown (or answered). */
export async function wasBiometricPrompted(): Promise<boolean> {
  return (await readFlag(BIOMETRIC_PROMPTED_KEY)) === true;
}

export async function setBiometricPrompted(prompted: boolean): Promise<void> {
  await writeFlag(BIOMETRIC_PROMPTED_KEY, prompted);
}

/** "Remember me" choice from the last login; defaults to true when unset. */
export async function getRememberMe(): Promise<boolean> {
  return (await readFlag(REMEMBER_ME_KEY)) !== false;
}

export async function setRememberMe(remember: boolean): Promise<void> {
  await writeFlag(REMEMBER_ME_KEY, remember);
}
