#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const VALID_ROUTES = new Set(["customer", "vendor"]);
const [route] = process.argv.slice(2);

if (!VALID_ROUTES.has(route)) {
  console.error("Usage: node scripts/build-local-eas.mjs <customer|vendor>");
  process.exit(1);
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const androidHome =
  process.env.ANDROID_HOME ?? join(homedir(), "Library", "Android", "sdk");
const outputDirectory = join(
  projectRoot,
  "local-builds",
  "android",
  "eas-local",
);
const outputPath = join(
  outputDirectory,
  `stuqet-${route}-production-local.aab`,
);

// `eas build --local` runs the same managed build as the cloud, using the
// upload keystore already registered with Play App Signing for this project
// (fetched via `eas credentials`), which is why this produces a correctly
// signed AAB where `npm run aab:*` (debug-keystore signed) does not.
//
// `.env.prod` carries SENTRY_AUTH_TOKEN, which the local build plugin does
// not read on its own — cloud builds get it from EAS's own env store instead.
function readEnvProd() {
  const envPath = join(projectRoot, ".env.prod");
  if (!existsSync(envPath)) return {};

  const values = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(
      line,
    );
    if (!match) continue;
    const [, key, rawValue] = match;
    const trimmedValue = rawValue.trim();
    const isQuoted =
      (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
      (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"));
    values[key] = isQuoted
      ? trimmedValue.slice(1, -1)
      : trimmedValue.replace(/\s+#.*$/, "").trim();
  }
  return values;
}

const sentryAuthToken =
  process.env.SENTRY_AUTH_TOKEN ?? readEnvProd().SENTRY_AUTH_TOKEN;

if (!sentryAuthToken) {
  console.warn(
    "SENTRY_AUTH_TOKEN is not set — this build will not upload source maps.",
  );
}

mkdirSync(outputDirectory, { recursive: true });

const environment = {
  ...process.env,
  ANDROID_HOME: androidHome,
  ANDROID_SDK_ROOT: androidHome,
  ...(sentryAuthToken ? { SENTRY_AUTH_TOKEN: sentryAuthToken } : {}),
};

const result = spawnSync(
  "npx",
  [
    "eas-cli",
    "build",
    "--platform",
    "android",
    "--profile",
    `production-${route}`,
    "--local",
    "--non-interactive",
    "--output",
    outputPath,
  ],
  { cwd: projectRoot, env: environment, stdio: "inherit" },
);

process.exit(result.status ?? 1);
