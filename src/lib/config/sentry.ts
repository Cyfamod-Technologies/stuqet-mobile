import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { Platform } from "react-native";

function getExtra(): Record<string, unknown> | undefined {
  return (
    (Constants.expoConfig?.extra as Record<string, unknown> | undefined) ??
    ((
      Constants as unknown as { manifest?: { extra?: Record<string, unknown> } }
    ).manifest?.extra as Record<string, unknown> | undefined)
  );
}

function getAppVariant(): string {
  const variant = getExtra()?.appVariant;
  if (typeof variant === "string" && variant.length > 0) return variant;
  return __DEV__ ? "development" : "production";
}

/** Per-app DSN resolved in `app.config.ts` (the customer and vendor apps are
 * separate Sentry projects), falling back to the single shared DSN. */
function getDsn(): string | undefined {
  const dsn = getExtra()?.sentryDsn;
  if (typeof dsn === "string" && dsn.length > 0) return dsn;
  return process.env.EXPO_PUBLIC_SENTRY_DSN;
}

export function initSentry() {
  const dsn = getDsn();
  const variant = getAppVariant();
  const shouldSend = variant === "preview" || variant === "production";

  // Only initialize for preview/production builds when a DSN is configured
  if (!dsn || !shouldSend || __DEV__) return;

  Sentry.init({
    dsn,
    environment: variant,
    initialScope: {
      tags: {
        platform: Platform.OS,
        appVariant: variant,
      },
    },
    // Privacy-safe defaults for a template. `sendDefaultPii` attaches the
    // user's IP and request data — enable it only if your privacy policy allows.
    sendDefaultPii: false,
    enableLogs: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      // Session replay masks all text/images by default so password fields,
      // tokens, and PII are never captured. Relax these per-app only for
      // screens you've confirmed contain no sensitive data.
      Sentry.mobileReplayIntegration({
        maskAllText: true,
        maskAllImages: true,
        maskAllVectors: false,
      }),
    ],
    debug: false,
  });
}
