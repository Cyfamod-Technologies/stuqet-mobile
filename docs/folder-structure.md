# Folder Structure

This document describes the repository layout and the responsibility of each
important directory. The path alias `~/*` maps to `src/*`.

```
stuqet/
├── .eas/
│   └── workflows/              # EAS Workflows (preview + production pipelines)
├── .github/
│   └── workflows/              # GitHub Actions CI (lint, format, typecheck, build)
├── assets/
│   ├── brand/                  # Per-app artwork: customer/ and vendor/ (optional)
│   └── store/                  # Store listing graphics: customer/ and vendor/
├── docs/                       # Developer documentation (this folder)
│   └── releases/               # Release records: customer/ and vendor/ + template
├── scripts/                    # Local Android build runner, Play/backend release scripts
├── src/
│   ├── routes/
│   │   ├── customer/           # Expo Router routes for the customer + rider app
│   │   └── vendor/             # Routes for the vendor app
│   │       ├── _layout.tsx     # Root layout (fonts, providers, theme, global UI)
│   │       ├── global.css      # NativeWind global stylesheet entry
│   │       ├── index.tsx       # Splash/landing screen
│   │       ├── (auth)/         # Unauthenticated screens (login, forgot/reset)
│   │       └── (tabs)/         # Authenticated tab navigation + nested stacks
│   ├── components/             # Shared app components
│   │   ├── forms/              # Form field components (form-field, date-time-field)
│   │   ├── ui/                 # Reusable UI primitives
│   │   └── screen.tsx          # Reusable safe-area scroll container
│   ├── features/               # Domain feature modules (auth, app-version)
│   ├── hooks/                  # Shared hooks (auth store)
│   ├── lib/                    # App infrastructure & utilities
│   │   ├── config/             # Axios + Sentry config
│   │   ├── stores/             # Zustand stores (theme)
│   │   └── utils/              # Helpers, query keys, toast, logger, ...
│   ├── providers/              # App-wide providers (TanStack Query)
│   └── types/                  # Shared/ambient TypeScript types
├── app.config.ts               # Expo app config (variants, plugins, updates)
├── eas.json                    # EAS build/submit profiles
├── metro.config.js             # Metro (NativeWind + SVG + Sentry)
├── babel.config.js             # Babel preset + ~/ alias + reanimated
├── tailwind.config.ts          # NativeWind theme (CSS-variable colors)
├── eslint.config.js            # ESLint flat config (expo + prettier)
├── .prettierrc                 # Prettier config (with Tailwind class sorting)
├── tsconfig.json               # TypeScript config + ~/* alias
└── nativewind-env.d.ts         # NativeWind type reference
```

## `.eas/workflows`

EAS Workflow definitions that drive CI/CD: `publish-preview-update.yml` (preview
pipeline, push to `main`) and `deploy-to-production.yml` (production pipeline,
push to `prod`). See [dev.md](./dev.md).

## `.github/workflows`

GitHub Actions `ci.yml` runs on PRs into `main`: install, format check, lint,
type-check, and build (`expo export`).

## `src/routes/customer` and `src/routes/vendor`

One Expo project serves 2 apps — customer (customers and riders) and vendor —
that share every component, hook, feature, and lib in `src/`. Each folder is a
self-contained Expo Router root (its own `_layout.tsx`, `index.tsx`,
`global.css`, `(auth)`/`(tabs)` route groups), structured identically to what a
single-app `src/app` would look like. Folder and file names define the
navigation tree; `_layout.tsx` files define nested navigators/stacks.

Which one is active is controlled by the `EXPO_PUBLIC_ROUTE` env var
(`customer` | `vendor`), read by `app.config.ts` and `metro.config.js`.
`app.config.ts` sets `extra.router.root` to `./src/routes/<route>`, which Expo
Router uses as its routes directory, and derives the app name/bundle id/scheme
for that route. `metro.config.js` points NativeWind's CSS entry at
`./src/routes/<route>/global.css`. See [setup.md](./setup.md) for the exact
commands.

- **`(auth)`** — route group for unauthenticated screens (login, forgot/reset
  password) with its own `_layout.tsx`.
- **`(tabs)`** — route group for the authenticated experience: the tab navigator
  plus the `more` nested stack.

Riders use the customer app: they are an authenticated mode within it, separated
by role-based authentication, permissions, and screens where needed — not a
third build target.

When a screen applies to both apps, build it from shared components and features
rather than copying logic between the two route trees.

## `src/components`

Shared, app-specific components used across screens — e.g. `logo`,
`offline-banner`, `force-update-modal`, `ota-update-handler`, `theme-toggle`,
`debug-overlay`, and `screen` (a reusable safe-area scroll container).

- **`ui/`** — reusable UI primitives (`button`, `input`, `card`, `badge`,
  `avatar`, `checkbox`, `select`, `accordion`, `segmented-control`, `skeleton`).
  Prefer these before building new UI.
- **`forms/`** — form field components used with React Hook Form: `form-field`
  (a typed `Controller` + `Input` wrapper) and `date-time-field`.

## `src/features`

Domain feature modules, one folder per domain. The template ships `auth` and
`app-version`. Each module commonly contains:

- `api.ts` — service calls (Axios)
- `hooks.ts` — TanStack Query hooks
- `types.ts` — API/domain types
- `schemas.ts` — Zod validation schemas (where present)
- `constants.ts` — feature constants (where present)

### Customer and rider features

| Folder                | Holds                                                                             |
| --------------------- | --------------------------------------------------------------------------------- |
| `customer-onboarding` | intro, welcome, create account (verify first), role picker, set-up steps          |
| `customer-food`       | home, search, vendor menu, dish; `useFoodNav`; dish, vendor and search components |
| `customer-cart`       | cart, checkout, delivery addresses, order placed; cart and checkout hooks         |
| `customer-orders`     | orders list, tracking with map, chat, rating sheet, notifications (both roles)    |
| `customer-account`    | profile, appearance, addresses and profile API, address form, demo tools          |
| `rider-onboarding`    | rider application steps (profile, vehicle, documents, payout) and under review    |
| `rider-deliveries`    | rider home, deliveries, delivery detail and confirm, earnings                     |
| `rider-account`       | rider profile API, vehicle and documents, payout details                          |

Each has `api.ts`, `hooks.ts`, `types.ts`, `screens/` and (where it has forms)
`schemas.ts`; the route files under `src/routes/customer` only re-export screens.

### Demo data

`src/demo` is the vendor demo; `src/demo/customer` and `src/demo/rider` are the
customer and rider ones (`data/`, `handlers`, `db.ts`, generated `images/`).
`scripts/generate-demo-customer-images.py` draws the customer images.

## `src/hooks`

Cross-feature shared hooks (e.g. `use-auth-store.ts`, the Zustand auth token
store).

## `src/lib`

App infrastructure and utilities not tied to a single feature: `colors.ts`,
`theme-vars.ts`, `secure-storage.ts`, `debug-store.ts`, plus the `config`,
`stores`, and `utils` subfolders.

- **`config/`** — `axios.ts` (the `axiosInstance` / `axiosPrivate` clients) and
  `sentry.ts` (Sentry init).
- **`stores/`** — Zustand stores that aren't feature-scoped (currently
  `theme-store.ts`).
- **`utils/`** — `helpers.ts` (incl. `cn()`), `query-keys.ts` (`QUERY_KEYS`),
  `toast.ts`, `error-handler.ts`, `logger.ts`, and `constants.ts`.

## `src/providers`

App-wide context providers composed in the root layout — currently
`tanstack-query.tsx`.

## `src/types`

Shared and ambient TypeScript types: `api.ts` (shared API types) and `env.d.ts`
(typed `EXPO_PUBLIC_*` environment variables).

## Root configuration files

- **`app.config.ts`** — Expo app config; resolves app identity by `APP_VARIANT`
  (dev/preview/production), registers plugins, and configures Updates.
- **`eas.json`** — EAS build profiles and submit settings.
- **`metro.config.js`** — Metro config wrapping the Sentry Expo config, the SVG
  transformer, and NativeWind.
- **`babel.config.js`** — `babel-preset-expo` with NativeWind JSX, the `~` →
  `./src` module-resolver alias, and the Reanimated plugin (last).
- **`tailwind.config.ts`** — NativeWind preset and theme; maps color names to
  `var(--…)` CSS variables.
- **`eslint.config.js` / `.prettierrc`** — linting and formatting config.
- **`tsconfig.json`** — extends `expo/tsconfig.base`, enables `strict`, and
  defines the `~/*` → `./src/*` path alias.
