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

| Branch           | Role                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Feature branches | Short-lived branches for a ticket (`feature/…`, `fix/…`). Branch from `dev`, PR back into `dev`.        |
| **`dev`**        | Integration line. PRs here run CI; pushes build and distribute preview APKs (see GitHub Actions below). |
| **`main`**       | **Preview** line. Merging here runs the **preview** pipeline. Protected — changes via PR.               |
| **`prod`**       | **Production** line. Promoting here runs the **production** pipeline. Protected — changes via PR.       |
| `release-gate`   | Static branch that release-request PRs target. Never developed on. See the release workflows below.     |

`main` and `prod` stay protected so release history stays reviewable and
deployments stay predictable.

## End-to-end workflow

1. **Branch from `dev`** — sync `dev`, then create a feature branch.
2. **Develop and test locally** — run `npm run dev:customer` or
   `npm run dev:vendor` and use the development client (not Expo Go).
3. **Open a PR into `dev`** — GitHub Actions CI (`.github/workflows/ci.yml`)
   runs format check, lint, type-check, and build. These are route-agnostic —
   one `tsconfig`/`eslint` pass covers `src/routes/customer` and
   `src/routes/vendor` — and `npm run build` exports both apps, so a
   route-specific bundling problem fails CI. Get review + green CI, then merge.
   - **What else runs:** the merge (a push to `main`) triggers the EAS Workflow
     **Deploy to preview** (`.eas/workflows/publish-preview-update.yml`). It
     fingerprints the project, reuses an existing native build when the
     fingerprint matches, otherwise builds with the **`preview`** profile, and
     publishes an OTA update to the **`preview`** branch when a matching build
     exists.
4. **Promote to production** — when preview is validated, open a PR from `main` →
   **`prod`** and merge after review.
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

Android builds, releases and housekeeping run on GitHub Actions
(`.github/workflows/`). They build **Stuqet Customer** and **Stuqet Vendor**
separately, using `scripts/build-android.mjs` (see
[local-builds.md](./local-builds.md)).

| Workflow                           | Trigger                              | What it does                                                                                                                                                                                            |
| ---------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`                           | Push to `dev`; PRs into `dev`/`main` | Format check, lint, type-check, build, a guard that keeps the publish workflow callable only from the approval workflow, and a non-blocking audit. Manual run builds a test APK/AAB for the chosen app. |
| `dev-android-apk-distribution.yml` | Push to `dev` (code paths); manual   | Builds both apps' preview APKs, uploads them to S3 and posts download links to Discord. A manual run can re-announce already-uploaded APKs without rebuilding.                                          |
| `release-android.yml`              | PRs touching it; manual              | **Release 1 — Request.** PRs run a preflight only (secrets, signing, Play track). A manual run opens a release-request PR into `release-gate`; it never publishes by itself.                            |
| `handle-release-approval.yml`      | A PR review on a release-request PR  | **Release 2 — Approve & publish.** Checks the reviewer is an authorised approver and is not the requester, then calls the publish workflow.                                                             |
| `_publish-android.yml`             | `workflow_call` only                 | **Release 3 — Publish.** Builds the signed AAB, uploads it to the Play track, posts to Discord and publishes the build number. It has no other trigger on purpose.                                      |
| `release-gate-merge-notice.yml`    | Merge of a release-request PR        | Comments that merging published nothing (approval does).                                                                                                                                                |
| `security.yml`                     | Push/PR to `dev`/`main`; weekly      | Gitleaks secret scan.                                                                                                                                                                                   |
| `cleanup-*.yml`                    | Schedules; PR close                  | Delete stale Actions caches and clear the self-hosted runner's disk.                                                                                                                                    |

The release path is a two-person gate: the person who requests a release cannot
approve it, and the approver must be on the hard-coded list in
`handle-release-approval.yml`. **That list ships empty**, so no release can be
published until it is filled in (see [setup.md](./setup.md#github-actions-secrets-and-variables)).

## One-time repository setup

The workflows assume:

- A `dev` branch (integration) and a `release-gate` branch (a static branch that
  release-request PRs target). Neither exists until you create it. Feature PRs
  go to `dev`; `dev` is promoted to `main`, and `main` to `prod`.
- The secrets and variables listed in
  [setup.md](./setup.md#github-actions-secrets-and-variables).
- `RUNNER_OS` set as a repository variable only if you use a self-hosted runner;
  otherwise the workflows use `ubuntu-latest`.
- `.github/CODEOWNERS` filled in, and the approver list in
  `handle-release-approval.yml` filled in.
- The repository path in `handle-release-approval.yml`'s `uses:` line matches the
  real repository (GitHub does not allow a variable there).

## Publishing the build number for force-update

The release workflow can publish the shipped `versionCode` to the backend after
Google Play accepts the build, so an in-app force-update check can tell whether
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

iOS is not automated: there is no iOS release workflow, so an iOS build number
has to be posted by hand after each App Store release, with `"app"` set to
`customer` or `vendor`.

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
- `.github/workflows/ci.yml` — PR checks (format, lint, typecheck, build).
- `.github/workflows/release-android.yml`, `handle-release-approval.yml`,
  `_publish-android.yml` — the three-step Play Store release flow.
- `.github/workflows/dev-android-apk-distribution.yml` — preview APKs to S3 and
  Discord on pushes to `dev`.
- `scripts/` — local build runner, Play version lookup, build-number publish and
  Discord notification scripts. See [local-builds.md](./local-builds.md).
- `docs/releases/` — release records, one folder per app.
- `eas.json` — build/submit profile names and channels referenced by the
  workflows.

For Expo's docs, see [EAS Workflows](https://docs.expo.dev/eas/workflows/get-started/)
and [Development builds](https://docs.expo.dev/develop/development-builds/introduction/).
