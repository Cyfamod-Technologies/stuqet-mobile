/** Length of the emailed / texted password reset code (backend: 6 digits). */
export const RESET_CODE_LENGTH = 6;

/** Minimum seller password length (backend signup rule: `min:6`). */
export const VENDOR_PASSWORD_MIN_LENGTH = 6;

/** Support address for the "Contact support" action (optional). */
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? "";

/**
 * Web page where a seller registers a shop. The backend has no seller
 * registration API (routes/api_seller.php has it commented out), so the vendor
 * app hands registration to the website.
 *
 * Resolution: `EXPO_PUBLIC_WEB_REGISTRATION_URL`, else the origin of
 * `EXPO_PUBLIC_API_BASE_URL` + the web route `shop/registration/verification`.
 * Returns null when neither yields a usable https/http URL.
 */
export function resolveWebRegistrationUrl(): string | null {
  const explicit = process.env.EXPO_PUBLIC_WEB_REGISTRATION_URL?.trim();
  if (explicit && /^https?:\/\//i.test(explicit)) return explicit;

  const api = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const origin = api?.match(/^(https?:\/\/[^/]+)/i)?.[1];
  return origin ? `${origin}/shop/registration/verification` : null;
}
