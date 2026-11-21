# AGENTS.md

Guidance for AI coding agents working in this repository. Human contributors
should read [docs/](docs/) — this file summarizes the same conventions in a
form that's quick to act on.

## What this is

The Stuqet mobile apps: **Expo SDK 58 · Expo Router 58 · React 19 · NativeWind ·
TanStack Query · Axios · Zustand · React Hook Form + Zod · Sentry · EAS**. It
ships auth, a tab shell, a themed UI kit, networking, and OTA/force update
handling.

One project ships **2 apps — customer and vendor** — from a single `src/`.
The **customer app is for food only**; the product (non-food) e-commerce
storefront is the **website**, not a mobile app.
`src/routes/customer` and `src/routes/vendor` each hold a full Expo Router route
tree for that audience; everything else in `src/` (components, features, hooks,
lib, providers, types) is shared by both. Which one builds/runs is controlled by
the `EXPO_PUBLIC_ROUTE` env var — see `app.config.ts` and the
`dev:customer`/`dev:vendor` npm scripts. Riders are an authenticated mode within
the customer app, not a separate build target.

## Golden rules

1. **Match the surrounding code.** Follow existing file structure, naming, and
   idioms. Avoid unrelated churn and broad reformatting.
2. **Use the `~/*` alias** for all `src` imports (`~/lib/...`, `~/components/...`).
3. **Type everything.** Strict mode is on; avoid `any`. Type API responses,
   DTOs, and hook returns.
4. **Keep the layers separate:** screens in `src/routes/<route>`
   (composition/wiring only, where `<route>` is `customer`/`vendor`), domain
   logic in `src/features/<feature>` (`api.ts`, `hooks.ts`, `types.ts`,
   `schemas.ts`), infra in `src/lib`.
5. **Don't hardcode secrets, colors, or app identity.** Use `EXPO_PUBLIC_*` env
   vars, the theme system, and `Constants.expoConfig` (name, store URLs) —
   never a literal app name/URL, since the same component can serve both apps.
6. **Share by default.** Components, hooks, themes and styles live in `src/`
   and serve both apps. If something is only for one app, put it under that
   app's `src/routes/<route>` tree or a feature folder it alone uses; if you
   need to branch on the app inside shared code, use `isCustomerApp` /
   `isVendorApp` from `src/lib/config/features.ts`.

## Where things go

| You want to…              | Do this                                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Add a screen              | Create a route file under `src/routes/<route>` (respect `(auth)` / `(tabs)` groups); mirror it into the other route if it applies to both apps |
| Call an API               | Add a method to `src/features/<feature>/api.ts` (use `axiosPrivate` for auth'd, `axiosInstance` for public)                                    |
| Fetch/mutate server state | Wrap the service in a hook in `src/features/<feature>/hooks.ts` using `QUERY_KEYS`                                                             |
| Add a query key           | Extend `QUERY_KEYS` in `src/lib/utils/query-keys.ts` — never inline arrays                                                                     |
| Build a form              | React Hook Form + Zod schema in the feature's `schemas.ts`; use `FormField` from `src/components/forms/form-field.tsx`                         |
| A scrollable screen       | Wrap content in `<Screen>` (`src/components/screen.tsx`), don't re-implement insets                                                            |
| Style something           | NativeWind `className` + `cn()`; runtime colors via `useThemeColors()`                                                                         |
| New shared UI primitive   | Add to `src/components/ui`, following the existing `cva` variant pattern                                                                       |

## Data & networking

- Global query/mutation error handling lives in
  `src/providers/tanstack-query.tsx` (Sentry + `handleApiError`). Set
  `meta: { suppressGlobalError: true }` when a hook handles its own errors.
- For instant-feeling mutations, follow
  [docs/optimistic-updates.md](docs/optimistic-updates.md)
  (`onMutate` → `cancelQueries` → snapshot → `setQueryData` → rollback in
  `onError` → invalidate in `onSettled`).
- Auth token is stored encrypted via `src/lib/secure-storage.ts` and injected by
  the `axiosPrivate` interceptor. A `401` with an invalid-token message triggers
  logout to `/(auth)/login`.

## Before you finish

Run and keep green:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

These are exactly what CI runs on PRs into `main`
(`.github/workflows/ci.yml`). If you add a `package.json` script or change the
workflows/branch model, update [docs/dev.md](docs/dev.md) in the same change.

## Release records

Every fix, change, or feature gets a release record — one under
`docs/releases/customer/` **and** one under `docs/releases/vendor/`, both apps
(Stuqet Customer and Stuqet Vendor), every time. Copy
[docs/releases/RELEASE_TEMPLATE.md](docs/releases/RELEASE_TEMPLATE.md) and
follow it; the rules that matter most:

- **Never edit a release record that has already been committed** — not to add
  a change, not to reword an entry. A committed record describes the build
  that shipped; new work goes in a new record, including work that changes
  something an older record described. `git log --oneline -- <record>` tells
  you whether it is committed. The one exception is a committed record's
  `Approval Status` line, which is tracking state.
- **Write both apps' records, not one shared file.** Shared code
  (`src/lib`, `src/components`, `src/features/auth`) reaches the Customer and
  Vendor apps alike, so a fix reported against one app still needs a record in
  the other, written from that app's point of view.
- New record, new build number. Build numbers are per app and are never
  reused. The newest record's filename (`vX.Y.Z-bN-YYYYMMDD.md`) is the source
  of truth for the version name a production build ships with — see
  [docs/local-builds.md](docs/local-builds.md).

## Commits

- **Do not add AI attribution to commits or PRs.** Never include a
  `Co-Authored-By: Claude` (or any AI/agent) trailer, and do not append
  "Generated with …" lines to commit messages or PR bodies. Commits are authored
  solely by the human contributor.
- Write clear, imperative commit subjects describing what changed and why.

## Deployment (don't trigger by accident)

- Merging into **`main`** runs the **preview** EAS Workflow.
- Merging into **`prod`** runs the **production** EAS Workflow (store submits).
- Both branches are protected; land changes via PR. See
  [docs/dev.md](docs/dev.md).

## More detail

- [docs/architecture.md](docs/architecture.md) — routing, data flow, theming, services
- [docs/DESIGN.md](docs/DESIGN.md) — design system: typography, colour tokens, UI kit
- [docs/code-style.md](docs/code-style.md) — conventions
- [docs/folder-structure.md](docs/folder-structure.md) — where everything lives
- [docs/setup.md](docs/setup.md) — env vars, scripts, EAS, CI secrets
- [docs/local-builds.md](docs/local-builds.md) — local Android APK/AAB builds and versioning
- [docs/optimistic-updates.md](docs/optimistic-updates.md) — mutation pattern
- [docs/releases/RELEASE_TEMPLATE.md](docs/releases/RELEASE_TEMPLATE.md) — release record format, versioning, and the never-edit-a-committed-record rule
