import { existsSync } from "node:fs";
import { ConfigContext, ExpoConfig } from "expo/config";
import { withGradleProperties } from "expo/config-plugins";

const APP_VARIANT = process.env.APP_VARIANT ?? "production";
const IS_DEV = APP_VARIANT === "development";
const IS_PREVIEW = APP_VARIANT === "preview";

// Version metadata. The local build runner (scripts/build-android.mjs) and the
// release workflows generate these and pass them in; a plain `expo start` uses
// the defaults. See docs/local-builds.md.
const APP_VERSION = process.env.APP_VERSION ?? "1.0.0";
const APP_BUILD_NUMBER = Number.parseInt(
  process.env.APP_BUILD_NUMBER ?? "1",
  10,
);
const APP_BUILD_DATE = process.env.APP_BUILD_DATE ?? null;

if (!Number.isSafeInteger(APP_BUILD_NUMBER) || APP_BUILD_NUMBER < 1) {
  throw new Error(
    `Invalid APP_BUILD_NUMBER "${process.env.APP_BUILD_NUMBER}". Expected a positive integer.`,
  );
}

// Preview APKs are for internal sideload testing only, so we skip bundling
// every ABI's native libs and keep just the one testers' devices use.
// Production stays multi-arch since Play Store already serves per-device
// splits from the AAB.
const withPreviewSingleArch = (config: ExpoConfig): ExpoConfig =>
  IS_PREVIEW
    ? withGradleProperties(config, (mod) => {
        mod.modResults.push({
          type: "property",
          key: "reactNativeArchitectures",
          value: "arm64-v8a",
        });
        return mod;
      })
    : config;

// Which audience-specific app this build targets. Controls the Expo Router
// root directory (src/routes/<route>), bundle identifier, name, scheme and
// brand below. `customer` is the combined customer + rider app (riders are an
// authenticated mode inside it, not a separate build); `vendor` is the shop
// owner app.
export type AppRoute = "customer" | "vendor";
const ROUTE = (process.env.EXPO_PUBLIC_ROUTE ?? "customer") as AppRoute;

// Splash/launch background shared by both apps (the off-white screen colour).
const BRAND_BACKGROUND_COLOR = "#FBFAF8";

// Returns the path only when the asset exists, so a route can be built before
// its brand artwork has been added (the app falls back to Expo's defaults).
// Put per-app artwork in `assets/brand/<route>/` — see assets/brand/README.md.
const assetIfExists = (path: string): string | undefined =>
  existsSync(path) ? path : undefined;

// Sentry — the customer and vendor apps report to separate Sentry projects so
// issues, alerts and release health stay per app. The org slug is shared.
const SENTRY_ORG = process.env.SENTRY_ORG;
const SENTRY_URL = process.env.SENTRY_URL ?? "https://sentry.io/";

const ROUTE_CONFIG: Record<
  AppRoute,
  {
    bundleId: string;
    appName: string;
    scheme: string;
    slug: string;
    // EAS project id for this app. Run `eas init` once per route (with
    // EXPO_PUBLIC_ROUTE set) and put the id in the env var named here.
    projectId: string | undefined;
    brandColor: string;
    brandForegroundColor: string;
    icon: string | undefined;
    adaptiveIcon: string | undefined;
    splashIcon: string | undefined;
    favicon: string | undefined;
    sentryProject: string | undefined;
    sentryDsn: string | undefined;
  }
> = {
  customer: {
    bundleId: "com.stuqet.customer",
    appName: "Stuqet Customer",
    scheme: "stuqet-customer",
    slug: "stuqet-customer-app",
    projectId: process.env.EAS_PROJECT_ID_CUSTOMER,
    brandColor: "#EB6C1A",
    brandForegroundColor: "#FFFFFF",
    icon: assetIfExists("./assets/brand/customer/app-icon-1024.png"),
    adaptiveIcon: assetIfExists(
      "./assets/brand/customer/adaptive-icon-foreground-1024.png",
    ),
    splashIcon: assetIfExists("./assets/brand/customer/splash-icon-1024.png"),
    favicon: assetIfExists("./assets/brand/customer/icon-32.png"),
    sentryProject: process.env.SENTRY_PROJECT_CUSTOMER,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN_CUSTOMER,
  },
  vendor: {
    bundleId: "com.stuqet.vendor",
    appName: "Stuqet Vendor",
    scheme: "stuqet-vendor",
    slug: "stuqet-vendor-app",
    projectId: process.env.EAS_PROJECT_ID_VENDOR,
    brandColor: "#EB6C1A",
    brandForegroundColor: "#FFFFFF",
    icon: assetIfExists("./assets/brand/vendor/app-icon-1024.png"),
    adaptiveIcon: assetIfExists(
      "./assets/brand/vendor/adaptive-icon-foreground-1024.png",
    ),
    splashIcon: assetIfExists("./assets/brand/vendor/splash-icon-1024.png"),
    favicon: assetIfExists("./assets/brand/vendor/icon-32.png"),
    sentryProject: process.env.SENTRY_PROJECT_VENDOR,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN_VENDOR,
  },
};

if (!(ROUTE in ROUTE_CONFIG)) {
  throw new Error(
    `Invalid EXPO_PUBLIC_ROUTE "${ROUTE}". Expected one of: ${Object.keys(ROUTE_CONFIG).join(", ")}`,
  );
}

const {
  bundleId: BUNDLE_ID,
  appName: BASE_APP_NAME,
  scheme: BASE_SCHEME,
  slug: SLUG,
  projectId: PROJECT_ID,
  brandColor: BRAND_COLOR,
  brandForegroundColor: BRAND_FOREGROUND_COLOR,
  icon: APP_ICON,
  adaptiveIcon: ADAPTIVE_ICON,
  splashIcon: SPLASH_ICON,
  favicon: FAVICON,
  sentryProject: SENTRY_PROJECT,
  sentryDsn: SENTRY_DSN,
} = ROUTE_CONFIG[ROUTE];

// Source maps only upload when the org/project slugs are present. Without the
// plugin the app still reports crashes, but every stack frame stays minified,
// so warn loudly on the builds that actually ship.
const SENTRY_UPLOAD_ENABLED = Boolean(SENTRY_ORG && SENTRY_PROJECT);

if (!IS_DEV && !SENTRY_UPLOAD_ENABLED) {
  console.warn(
    `[sentry] SENTRY_ORG / SENTRY_PROJECT_${ROUTE.toUpperCase()} not set — ` +
      "building without source map upload. Stack traces will be minified.",
  );
}

if (!IS_DEV && !SENTRY_DSN) {
  console.warn(
    `[sentry] EXPO_PUBLIC_SENTRY_DSN_${ROUTE.toUpperCase()} not set — ` +
      "this build will not report crashes.",
  );
}

const sentryPlugin: NonNullable<ExpoConfig["plugins"]> = SENTRY_UPLOAD_ENABLED
  ? [
      [
        "@sentry/react-native/expo",
        {
          url: SENTRY_URL,
          organization: SENTRY_ORG,
          project: SENTRY_PROJECT,
          // Dev builds change on every reload; uploading their maps just
          // burns build time and clutters the release list.
          ...(IS_DEV ? { enableSourceMaps: false, upload: false } : {}),
        },
      ],
    ]
  : [];

const getUniqueIdentifier = () => {
  if (IS_DEV) return `${BUNDLE_ID}.dev`;
  if (IS_PREVIEW) return `${BUNDLE_ID}.preview`;
  return BUNDLE_ID;
};

const getAppName = () => {
  if (IS_DEV) return `${BASE_APP_NAME} (Dev)`;
  if (IS_PREVIEW) return `${BASE_APP_NAME} (Preview)`;
  return BASE_APP_NAME;
};

const getAppScheme = () => {
  if (IS_DEV) return `${BASE_SCHEME}-dev`;
  if (IS_PREVIEW) return `${BASE_SCHEME}-preview`;
  return BASE_SCHEME;
};

export default ({ config }: ConfigContext): ExpoConfig =>
  withPreviewSingleArch({
    ...config,
    name: getAppName(),
    slug: SLUG,
    version: APP_VERSION,
    orientation: "portrait",
    userInterfaceStyle: "light",
    scheme: getAppScheme(),
    ...(APP_ICON ? { icon: APP_ICON } : {}),
    ios: {
      supportsTablet: true,
      bundleIdentifier: getUniqueIdentifier(),
      buildNumber: String(APP_BUILD_NUMBER),
      infoPlist: {
        CFBundleDisplayName: getAppName(),
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      package: getUniqueIdentifier(),
      versionCode: APP_BUILD_NUMBER,
      ...(ADAPTIVE_ICON
        ? {
            adaptiveIcon: {
              foregroundImage: ADAPTIVE_ICON,
              backgroundColor: BRAND_BACKGROUND_COLOR,
            },
          }
        : {}),
    },
    ...(FAVICON ? { web: { favicon: FAVICON } } : {}),
    plugins: [
      "expo-router",
      "expo-secure-store",
      // Photo uploads (shop logo, banners, product photos, documents). Without
      // these strings iOS refuses the camera and photo library.
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow $(PRODUCT_NAME) to access your photos so you can upload them.",
          cameraPermission:
            "Allow $(PRODUCT_NAME) to use your camera so you can take photos to upload.",
        },
      ],
      // Vendor app only: fingerprint / Face ID unlock. The plugin adds the iOS
      // NSFaceIDUsageDescription string (without it Face ID cannot be used) and
      // the Android biometric permissions.
      ...(ROUTE === "vendor"
        ? ([
            [
              "expo-local-authentication",
              {
                faceIDPermission:
                  "Allow $(PRODUCT_NAME) to use Face ID to unlock your shop account.",
              },
            ],
          ] satisfies NonNullable<ExpoConfig["plugins"]>)
        : []),
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "16.4",
          },
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            // Off by default in the Expo/RN template — R8 shrinks + obfuscates
            // the unshrunk dex, resource shrinking drops unused Android
            // resources. Requires a real release build to confirm nothing
            // needs an extra proguard-rules.pro entry.
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
        },
      ],
      [
        "expo-splash-screen",
        {
          ...(SPLASH_ICON ? { image: SPLASH_ICON } : {}),
          backgroundColor: BRAND_BACKGROUND_COLOR,
          resizeMode: "contain",
        },
      ],
      "expo-asset",
      ...sentryPlugin,
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      // Expo Router uses this directory as its routes root, so each build only
      // bundles its own app's screens. Everything else in `src/` is shared.
      router: { root: `./src/routes/${ROUTE}` },
      appVariant: APP_VARIANT,
      route: ROUTE,
      brand: {
        primary: BRAND_COLOR,
        primaryForeground: BRAND_FOREGROUND_COLOR,
        background: BRAND_BACKGROUND_COLOR,
      },
      // Resolved here rather than read from process.env in the app so the
      // per-route project selection lives in one place.
      sentryDsn: SENTRY_DSN,
      build: {
        version: APP_VERSION,
        number: APP_BUILD_NUMBER,
        date: APP_BUILD_DATE,
      },
      storeUrls: {
        // TODO: Replace with real store links once each app is published.
        ios: "https://apps.apple.com/app/id000000000",
        android: `https://play.google.com/store/apps/details?id=${BUNDLE_ID}`,
      },
      ...(PROJECT_ID ? { eas: { projectId: PROJECT_ID } } : {}),
    },
    ...(PROJECT_ID
      ? { updates: { url: `https://u.expo.dev/${PROJECT_ID}` } }
      : {}),
    runtimeVersion: {
      policy: "appVersion",
    },
    // Optional: set EAS_OWNER to the Expo account/organization that owns both
    // projects.
    ...(process.env.EAS_OWNER ? { owner: process.env.EAS_OWNER } : {}),
  });
