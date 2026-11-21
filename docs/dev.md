# Development to Deployment

This document is the standard for how the app is built and shipped: branching,
local development, EAS builds/updates, and preview vs production distribution.

It matches the EAS Workflows in `.eas/workflows/` and the build profiles in
`eas.json`. When process or automation changes, update this file in the same
change.

## Use a development build (not Expo Go)

Day-to-day feature work, bugfixes, and integration testing must run on the **EAS
development client** (`development` / `ios-simulator` profiles), not Expo Go. The
dev client is compiled for this project's native modules, config plugins, and
EAS Update channel semantics, so you catch real build issues early. Expo Go
ships a fixed native runtime and is not the target for work merged into this
repo.

## Branch model

| Branch           | Role                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Feature branches | Short-lived branches for a ticket (`feature/…`, `fix/…`). Branch from `main`, PR back into `main`.                                |
| **`main`**       | **Preview** line. PRs here run CI; merging runs the **preview** pipeline and builds preview APKs. Protected — changes via PR.     |
| **`prod`**       | **Production** line. Only ever receives `main` (`prod-pr-guard.yml`). Promoting here runs the **production** pipeline. Protected. |

`main` and `prod` stay protected so release history stays reviewable and
deployments stay predictable.

## End-to-end workflow

1. **Branch from `main`** — sync `main`, then create a feature branch.
2. **Develop and test locally** — run `npm run dev:customer` or
   `npm run dev:vendor` and use the development client (not Expo Go).
3. **Open a PR into `main`** — GitHub Actions CI (`.github/workflows/ci.yml`)
   runs format check, lint, type-check, and audit, and the secret scan
   (`security.yml`) runs alongside it. These are route-agnostic —
   one `tsconfig`/`eslint` pass covers `src/routes/customer` and
   `src/routes/vendor`. Get review + green CI, then merge.
   - **What else runs:** the merge (a push to `main`) triggers the EAS Workflow
     **Deploy to preview** (`.eas/workflows/publish-preview-update.yml`). It
     fingerprints the project, reuses an existing native build when the
     fingerprint matches, otherwise builds with the **`preview`** profile, and
     publishes an OTA update to the **`preview`** branch when a matching build
     exists.
4. **Promote to production** — when preview is validated, open a PR from `main` →
   **`prod`** and merge after review. The only check on that PR is
   `prod-pr-guard.yml` (it must come from `main`): the code already passed CI
   and the secret scan on its way into `main`, so they are not run again.
   - **What runs:** the push to `prod` triggers **Deploy to production**
     (`.eas/workflows/deploy-to-production.yml`). Same fingerprint /
     get-build / build-or-update pattern using the **`production`** profile, OTA
     updates on the **`production`** channel, plus Android/iOS **submit** steps
     for new native builds (TestFlight / Play internal testing per `eas.json`).

## How "PR vs merge" relates to EAS

The EAS workflow files trigger on **`push`** to `main` or `prod`, not on "PR
opened":

- **Merging a PR** into `main` or `prod` updates the branch tip → Git sends a
  **push** event → the matching EAS workflow runs.
- **Opening a PR** alone does not deploy; it only runs the GitHub Actions CI
  checks.

So the operational rule is: **merging into `main` runs preview; merging into
`prod` runs production.**

> **EAS Workflows and the two apps:** both EAS Workflow files use the
> route-less `preview` and `production` profiles, so they build the default app
> (customer) only, and they are deliberately minimal: the preview workflow's
> `on.push` trigger and the iOS jobs in both workflows are commented out. Android
> builds for **both** apps go through the GitHub Actions workflows below. If you
> later move builds onto EAS Workflows, add jobs per app using the
> `preview-customer` / `preview-vendor` and `production-customer` /
> `production-vendor` profiles, and test how EAS fingerprinting behaves with two
> route-specific app configs first.

## GitHub Actions workflows

Android builds, releases and checks run on GitHub Actions
(`.github/workflows/`), all on GitHub-hosted `ubuntu-latest` runners. They build
**Stuqet Customer** and **Stuqet Vendor** separately, using
`scripts/build-android.mjs` (see [local-builds.md](./local-builds.md)).

| Workflow                           | Trigger                                 | What it does                                                                                                                                                                                                                                      |
| ---------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`                           | Push to `main`; PRs into `main`; manual | Format check, lint, type-check and a non-blocking audit. A manual run builds a test **APK** for the chosen app from any branch.                                                                                                                   |
| `security.yml`                     | Push/PR to `main`; weekly               | Gitleaks secret scan.                                                                                                                                                                                                                             |
| `prod-pr-guard.yml`                | PRs into `prod`                         | Fails unless the PR comes from `main` in this repository. Seconds long; it does not re-run CI.                                                                                                                                                    |
| `dev-android-apk-distribution.yml` | Push to `main` (code paths); manual     | Builds both apps' preview APKs, uploads them to S3 and posts download links to Discord. A manual run can re-announce already-uploaded APKs without rebuilding.                                                                                    |
| `release-android.yml`              | Manual, from `prod`                     | Preflight (secrets, signing, Play auth), then builds the signed **AAB** and publishes it to the chosen Play track for `customer`, `vendor` or `both`. `preflight_only` validates only; `skip_publish` builds the AAB and keeps it as an artifact. |
| `release-ios.yml`                  | Manual, from `prod`                     | Preflight (EAS auth, App Store Connect app id), then an EAS iOS build, uploaded to App Store Connect/TestFlight unless `skip_submit` is checked.                                                                                                  |

Checks that run on PRs into `main` are deliberately **not** repeated on PRs into
`prod` or on the push to `prod`: only `main` can open a PR into `prod`, so that
code has already been checked.

A real release (anything but `preflight_only`) can only be dispatched with
**`prod`** selected as the branch; the preflight step fails loudly otherwise.
There is no request/approval step — whoever dispatches the workflow is the one
releasing — so protect `prod` and limit who can run workflows in the
repository settings.

To ship an Android release: merge `main` → `prod`, then run **Release — Build &
Publish Android** on `prod`, pick the app and the Play track, and leave the
boxes unchecked. Run it once with `preflight_only` first if credentials or
signing keys changed.

## One-time repository setup

The workflows assume:

- A `main` branch and a `prod` branch. Feature PRs go to `main`; `main` is
  promoted to `prod`. In `prod`'s branch protection, mark the
  **Only main may target prod** check (`prod-pr-guard.yml`) as required, so the
  guard is a real gate and not just a red X.
- The secrets and variables listed in
  [setup.md](./setup.md#github-actions-secrets-and-variables).
- For iOS releases: `eas.json` → `submit.production-customer.ios.ascAppId` and
  `submit.production-vendor.ios.ascAppId` set to each app's App Store Connect
  app id, and the build-time values (`EXPO_PUBLIC_API_BASE_URL`, the Sentry
  values) present on the EAS project's `production` environment — nothing set
  on the GitHub runner reaches the EAS build worker.

## Publishing the build number for force-update

The Android release workflow publishes the shipped `versionCode` to the backend
after Google Play accepts a build **on the `production` track** (internal, alpha
and beta builds are not what store users install, so they are skipped), so an in-app force-update check can tell whether
an installed binary is behind. It runs `scripts/publish-app-version.mjs`, which
posts `{ app, platform, build }` to `POST <EXPO_PUBLIC_API_BASE_URL>/app-version`
with the shared key in `X-App-Version-Key`.

This is **optional and off by default**: when `APP_VERSION_PUBLISH_KEY` is not
set the step logs a notice and does nothing, so it can never fail a release. To
use it, the backend needs that endpoint, and the app's force-update check
(`src/features/app-version`, which currently compares the semantic version
against `GET /get-app-version`) needs to compare build numbers. Re-sending the
same number is a safe no-op.

If the backend sits behind a WAF that challenges the release runner, allow the
endpoint for it — match on the path, or on the `stuqet-release-bot/1.0`
user agent the script sends — and skip bot protection for that endpoint. It is
already guarded by the shared key.

`release-ios.yml` does not post a build number, so an iOS build number has to be
posted by hand after each App Store release, with `"app"` set to `customer` or
`vendor`.

## Distribution notes

- **Preview (`main`)** — internal distribution on the `preview` channel; no store
  submission. Good for internal QA and stakeholder OTA previews.
- **Production (`prod`)** — new native builds are submitted to the stores
  (TestFlight for iOS, Play internal testing for Android per
  `submit.production` in `eas.json`); otherwise an OTA update ships on the
  `production` channel.

## Secrets

Do not commit API keys, keystores, or provider tokens. Use EAS **environment
secrets** (referenced as `${{ env.SECRET_NAME }}` in workflows), GitHub
**Actions secrets**, and local env files that stay out of git.

## Where to look in the repo

- `.eas/workflows/publish-preview-update.yml` — preview pipeline (push to `main`).
- `.eas/workflows/deploy-to-production.yml` — production pipeline (push to `prod`).
- `.github/workflows/ci.yml`, `security.yml` — PR checks (format, lint, typecheck,
  secret scan) for PRs into `main`.
- `.github/workflows/prod-pr-guard.yml` — only `main` may open a PR into `prod`.
- `.github/workflows/release-android.yml`, `release-ios.yml` — manual store
  releases, from `prod`.
- `.github/workflows/dev-android-apk-distribution.yml` — preview APKs to S3 and
  Discord on pushes to `main`.
- `scripts/` — local build runner, Play version lookup, build-number publish,
  Discord notification and CI runner-disk helper scripts. See [local-builds.md](./local-builds.md).
- `docs/releases/` — release records, one folder per app.
- `eas.json` — build/submit profile names and channels referenced by the
  workflows.

For Expo's docs, see [EAS Workflows](https://docs.expo.dev/eas/workflows/get-started/)
and [Development builds](https://docs.expo.dev/develop/development-builds/introduction/).
