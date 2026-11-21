# Setup & Local Development

This guide covers getting the app running locally and producing builds via EAS.
For the branching and deployment process, see [dev.md](./dev.md).

## Prerequisites

- **Node.js** (20+) and **npm**
- An **Expo / EAS account** — needed to run EAS builds/submits and to install
  development client builds. Run `eas init` to link a project.
- **EAS CLI** (`npm install -g eas-cli`, then `eas login`)
- **Xcode** (macOS) for iOS simulator builds and local iOS runs
- **Android Studio** (with an emulator/AVD) for Android runs

## Install dependencies

```bash
npm install
```

## Environment variables

This app uses Expo public env vars (the `EXPO_PUBLIC_` prefix inlines them into
the JS bundle at build time). Copy the example file and fill it in — never commit
secrets.

```bash
cp .env.example .env.local
```

| Variable                             | Required         | Description                                                                                                                                                                                                                                         |
| ------------------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_ROUTE`                  | No               | Which app a build targets: `customer` (default) or `vendor`. Picks the route tree, app identity and brand. Set by the `dev:*` scripts and the `*-customer` / `*-vendor` EAS profiles.                                                               |
| `EAS_PROJECT_ID_CUSTOMER`            | No               | EAS project id for the customer app (build-time). Set after running `eas init` for that app.                                                                                                                                                        |
| `EAS_PROJECT_ID_VENDOR`              | No               | EAS project id for the vendor app (build-time).                                                                                                                                                                                                     |
| `EAS_OWNER`                          | No               | Expo account/organization that owns both EAS projects (build-time).                                                                                                                                                                                 |
| `EXPO_PUBLIC_API_BASE_URL`           | Yes              | Base URL of your backend API. Used by the Axios clients in `src/lib/config/axios.ts`.                                                                                                                                                               |
| `EXPO_PUBLIC_SYSTEM_KEY`             | Yes (vendor app) | The backend's `app.system_key`. Sent as the `System-Key` header on every request; without it the API answers "Request not found!". Set `EXPO_PUBLIC_API_BASE_URL` to the `/api/v2` root.                                                            |
| `EXPO_PUBLIC_SENTRY_DSN`             | No               | Sentry DSN read by `src/lib/config/sentry.ts`. Sentry only initializes for `preview`/`production` builds when set.                                                                                                                                  |
| `EXPO_PUBLIC_ENABLE_THEME_SWITCH`    | No               | Shows the light/dark theme switch. Set to `"false"` to hide it and lock the theme (default light). Read in `src/lib/config/features.ts`.                                                                                                            |
| `EXPO_PUBLIC_ENABLE_SOCIAL_LOGIN`    | No               | Shows the Google / Apple buttons on the login screen. Set to `"false"` to hide them until OAuth is wired up (default shown). Read in `src/lib/config/features.ts`.                                                                                  |
| `EXPO_PUBLIC_ENABLE_ACCOUNT_RESOLVE` | No               | Vendor payout form: when `"true"` the account name is filled from the bank lookup (`POST /seller/bank/resolve`, not in the backend yet). Default off: the name is typed.                                                                            |
| `EXPO_PUBLIC_ENABLE_SUPPORT_TICKETS` | No               | Vendor app: shows support tickets in More. Default off, because the mobile API has no ticket endpoints.                                                                                                                                             |
| `EXPO_PUBLIC_WEB_REGISTRATION_URL`   | No               | Vendor app: web page opened by "Create a shop" (shop registration is web-only). Falls back to the API origin plus `/shop/registration/verification`.                                                                                                |
| `EXPO_PUBLIC_SUPPORT_EMAIL`          | No               | Vendor app: address used by "Contact support".                                                                                                                                                                                                      |
| `EXPO_PUBLIC_DEMO_MODE`              | No               | `"true"` runs the app on bundled sample data (no API, no network): the vendor data in `src/demo` (`npm run dev:vendor:demo`) or the customer + rider data in `src/demo/customer` (`npm run dev:customer:demo`). Never set it in a production build. |

> `APP_VARIANT` (separate from the `EXPO_PUBLIC_*` vars) selects the native app
> identity — bundle id, app name, and URL scheme — in `app.config.ts`. It is set
> per EAS profile in `eas.json` and by the `dev` script. It defaults to
> `production`.

## First-time customization

Search the codebase for `TODO` and set:

- `app.config.ts` — per-app identity lives in `ROUTE_CONFIG` (name, bundle id,
  scheme, slug, brand colour). Confirm the bundle ids (`com.stuqet.customer`,
  `com.stuqet.vendor`) before the first store build; they cannot change after
  publishing. Also set up Sentry (one project per app) and the store URLs.
- EAS (optional — only if you build or ship OTA updates through EAS rather than
  the GitHub workflows) — create **one project per app**: run `eas init` once
  with `EXPO_PUBLIC_ROUTE=customer` and once with `EXPO_PUBLIC_ROUTE=vendor`,
  then put the ids in `EAS_PROJECT_ID_CUSTOMER` / `EAS_PROJECT_ID_VENDOR`.
- Brand artwork — add per-app icons under `assets/brand/customer/` and
  `assets/brand/vendor/` (see [assets/brand/README.md](../assets/brand/README.md)
  for the file names). `app.config.ts` uses each file only if it exists, so
  builds work before the artwork does.
- `src/components/logo.tsx` — placeholder wordmark/icon.
- `src/features/auth/api.ts` — auth endpoints.
- `src/components/force-update-modal.tsx` — store URLs.

## Local development

| Command                        | What it does                                                            |
| ------------------------------ | ----------------------------------------------------------------------- |
| `npm start`                    | Starts the Expo dev server / Metro bundler.                             |
| `npm run dev`                  | Starts Expo with `APP_VARIANT=development` (default app: customer).     |
| `npm run dev:customer`         | Starts the customer + rider app (`EXPO_PUBLIC_ROUTE=customer`).         |
| `npm run dev:vendor`           | Starts the vendor app (`EXPO_PUBLIC_ROUTE=vendor`).                     |
| `npm run dev:customer:demo`    | Customer + rider app on demo data (see `src/demo/customer/README.md`).  |
| `npm run demo:images:customer` | Regenerates the customer and rider demo illustrations (Pillow).         |
| `npm run start:tunnel`         | Starts the dev server over an Expo tunnel (use on a different network). |
| `npm run ios`                  | Starts and opens the app in the iOS Simulator.                          |
| `npm run android`              | Starts and opens the app in the Android emulator.                       |
| `npm run web`                  | Starts the app in a browser (React Native Web).                         |

### Use a development build, not Expo Go

This template uses native modules (`expo-secure-store`, `expo-updates`) and
config plugins, so day-to-day work should run on the **EAS development client**
(the `development` / `ios-simulator` profile builds), not Expo Go. Install a
`development` build from the EAS dashboard, then run `npm run dev` and open the
project in that client.

## Quality checks

| Command                      | What it does                                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`               | ESLint.                                                                                                                      |
| `npm run format`             | Format with Prettier (`format:check` to verify).                                                                             |
| `npm run typecheck`          | `tsc --noEmit`.                                                                                                              |
| `npm run typecheck:vendor`   | Generates the vendor typed routes, then type-checks with `tsconfig.vendor.json` (customer/rider files excluded).             |
| `npm run typecheck:customer` | Same for the customer app with `tsconfig.customer.json` (vendor files excluded); restores the vendor route types afterwards. |
| `npm run build`              | Export the JS bundle for **both** apps (`build:customer` then `build:vendor`).                                               |

The first three run in CI on every PR into `main` (`.github/workflows/ci.yml`);
PRs into `prod` skip them, since only `main` can open one.

## EAS builds

Build profiles are defined in `eas.json`. The `build:*` scripts wrap `eas build`:

| Command                      | Profile      | Platform |
| ---------------------------- | ------------ | -------- |
| `npm run build:android`      | `preview`    | Android  |
| `npm run build:ios`          | `preview`    | iOS      |
| `npm run build:prod:ios`     | `production` | iOS      |
| `npm run build:prod:android` | `production` | Android  |
| `npm run build:prod:all`     | `production` | all      |

The route-less commands above build the default app (customer). For a specific
app use the per-app scripts:

| Command                          | Profile               | Platform |
| -------------------------------- | --------------------- | -------- |
| `npm run build:android:customer` | `preview-customer`    | Android  |
| `npm run build:android:vendor`   | `preview-vendor`      | Android  |
| `npm run build:ios:customer`     | `preview-customer`    | iOS      |
| `npm run build:ios:vendor`       | `preview-vendor`      | iOS      |
| `npm run build:prod:customer`    | `production-customer` | all      |
| `npm run build:prod:vendor`      | `production-vendor`   | all      |
| `npm run submit:customer`        | `production-customer` | all      |
| `npm run submit:vendor`          | `production-vendor`   | all      |

To build a development client directly:

```bash
eas build --profile development-customer --platform android
eas build --profile development-vendor --platform android
eas build --profile ios-simulator --platform ios   # customer app
```

## EAS build profiles (`eas.json`)

| Profile         | Highlights                                                                |
| --------------- | ------------------------------------------------------------------------- |
| `development`   | Dev client, internal distribution, `development` channel.                 |
| `ios-simulator` | Extends `development-customer` with `ios.simulator: true`.                |
| `preview`       | Internal distribution, `preview` channel. Used by the preview workflow.   |
| `production`    | Auto-incrementing, `production` channel. Used by the production workflow. |

Each of `development`, `preview` and `production` also has a `-customer` and a
`-vendor` variant that extends it, sets `EXPO_PUBLIC_ROUTE`, and uses its own
channel (for example `preview-vendor` publishes on the `preview-vendor`
channel), so the two apps never receive each other's OTA updates.

## Local Android builds

APKs and AABs for both apps can be built on your own machine, without EAS — see
[local-builds.md](./local-builds.md). The scripts are `npm run apk:customer`,
`apk:vendor`, `apk:all`, `aab:customer`, `aab:vendor` and `aab:all`.

## GitHub Actions secrets and variables

The build, release and distribution workflows (see [dev.md](./dev.md)) read these
repository **secrets**. The per-app ones exist once for Stuqet Customer and once
for Stuqet Vendor.

| Secret                                                                                                | Used for                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`                                                                            | Production API base URL embedded in the app (must be `https://`).                                                                                                                                                                                   |
| `EXPO_PUBLIC_ENABLE_THEME_SWITCH`                                                                     | Theme switch flag for release builds.                                                                                                                                                                                                               |
| `EXPO_PUBLIC_SENTRY_DSN_CUSTOMER` / `_VENDOR`                                                         | Per-app Sentry DSN.                                                                                                                                                                                                                                 |
| `SENTRY_AUTH_TOKEN`, `SENTRY_PROJECT_CUSTOMER`, `SENTRY_PROJECT_VENDOR`                               | Source map upload (also needs `SENTRY_ORG`).                                                                                                                                                                                                        |
| `ANDROID_UPLOAD_KEYSTORE_BASE64_CUSTOMER` / `_VENDOR`                                                 | Base64 upload keystore for each app.                                                                                                                                                                                                                |
| `ANDROID_UPLOAD_STORE_PASSWORD_*`, `ANDROID_UPLOAD_KEY_ALIAS_*`, `ANDROID_UPLOAD_KEY_PASSWORD_*`      | Upload key credentials, per app.                                                                                                                                                                                                                    |
| `PLAY_PUBLISHER_SERVICE_ACCOUNT_JSON`                                                                 | Google Play publisher service-account key (raw JSON).                                                                                                                                                                                               |
| `DISCORD_BUILD_WEBHOOK_URL`                                                                           | Build and release notifications.                                                                                                                                                                                                                    |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_S3_PUBLIC_BASE_URL` | Preview APK distribution (also optional `AWS_S3_PREFIX`, `S3_PRESIGN_EXPIRES_SECONDS`).                                                                                                                                                             |
| `APP_VERSION_PUBLISH_KEY`                                                                             | Optional: publishes the build number to the backend after a release.                                                                                                                                                                                |
| `GITLEAKS_LICENSE`                                                                                    | Required for this organization-owned repository's Gitleaks Action. Get the key from [gitleaks.io](https://gitleaks.io), then add it under **Settings → Secrets and variables → Actions**. `.github/workflows/security.yml` passes it to the action. |

Also needed for iOS releases (`release-ios.yml`):

| Secret / variable                                         | Used for                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `EXPO_TOKEN` (secret)                                     | Expo robot access token used to run `eas build` / `eas submit`.                       |
| `EAS_PROJECT_ID_CUSTOMER`, `EAS_PROJECT_ID_VENDOR` (vars) | EAS project ids; `app.config.ts` reads them to resolve the project. Secrets work too. |
| `EAS_OWNER` (var)                                         | Expo account/organization that owns both projects.                                    |

Repository **variables**: `ANDROID_UPLOAD_SHA1_CUSTOMER` and
`ANDROID_UPLOAD_SHA1_VENDOR` (the upload-key SHA-1 fingerprints). The Play track
is chosen each time you run **Release — Build & Publish Android**, so there is
no per-app track variable.

## Deployment

Branching, preview vs production distribution, and EAS Workflows are documented
in [dev.md](./dev.md). In short: PRs go into `main`; merging into `main` runs the
preview pipeline; promoting to `prod` runs the production pipeline.

## Typed routes and per-app type checks

Both apps share `src/features`, but typed routes are generated for one app at a
time (`npm run typegen:vendor|customer` writes `.expo/types`). A plain
`npm run typecheck` with one app's route types therefore fails on the other
app's screens (they navigate to routes that do not exist in this tree). Use
`typecheck:vendor` and `typecheck:customer` locally: each generates its own
route types and excludes the other app's feature files through
`tsconfig.vendor.json` / `tsconfig.customer.json`. When you add a feature that
belongs to one app only, add its folder to the other app's `exclude` list. CI
has no generated route types, so `npm run typecheck` passes there as before.
Shared code must not import route-navigating modules of one app; keep shared
state in small files (see `src/features/auth/session-expiry-state.ts`).
