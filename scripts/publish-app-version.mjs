#!/usr/bin/env node

// Publishes the versionCode of a build Play has just accepted to the backend,
// so the in-app force-update check can tell whether an installed binary is
// behind.
//
// This exists because the alternative is a person remembering to update a
// number by hand on every release. That step is easy to forget, and a stale
// number fails silently: the modal simply never appears again, exactly as if
// the feature had never been built.
//
// Usage: node scripts/publish-app-version.mjs <customer|vendor> <ios|android> <build>
//
// Env:
//   APP_VERSION_PUBLISH_KEY  shared secret, sent as X-App-Version-Key. When it
//                            is not set this script does nothing and exits 0,
//                            so a release is never failed by a backend that has
//                            not been set up for this yet.
//   EXPO_PUBLIC_API_BASE_URL the production API base URL the shipped app uses.
//
// The target is the app's own configured production API base URL rather than a
// separate secret, so it cannot drift out of step with what a production
// install actually asks. It must be https: the publish key never travels over
// plaintext.
//
// Writes local-builds/android/version-publish-<app>.json for the Discord
// notification step, following the same in-job hand-off that
// version-mismatch-<route>.json already uses.

import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const VALID_APPS = new Set(["customer", "vendor"]);
const VALID_PLATFORMS = new Set(["ios", "android"]);
const ATTEMPTS = 3;
const RETRY_DELAY_MS = 3000;

// Node's fetch defaults to `User-Agent: node`, which is useless in a WAF log
// and impossible to write an allow rule against. This is a stable selector a
// WAF rule can match on to let the release pipeline through — see the WAF note
// in docs/dev.md. It is not a security control: the shared key is. It only
// makes this traffic identifiable.
const USER_AGENT = "stuqet-release-bot/1.0";

const [app, platform, buildRaw] = process.argv.slice(2);
const build = Number(buildRaw);

if (
  !VALID_APPS.has(app) ||
  !VALID_PLATFORMS.has(platform) ||
  !Number.isSafeInteger(build) ||
  build < 1
) {
  console.error(
    "Usage: node scripts/publish-app-version.mjs <customer|vendor> <ios|android> <build>",
  );
  process.exit(1);
}

const publishKey = process.env.APP_VERSION_PUBLISH_KEY;

if (!publishKey) {
  console.log(
    "::notice::APP_VERSION_PUBLISH_KEY is not set — skipping the app-version publish. " +
      "Set it (and add the endpoint to the backend) to keep the in-app force-update check current.",
  );
  process.exit(0);
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = join(projectRoot, "local-builds", "android");

function targets() {
  // The production API base URL the shipped app uses -- see the header.
  const raw = [process.env.EXPO_PUBLIC_API_BASE_URL];

  const seen = new Set();

  for (const value of raw) {
    const trimmed = value?.trim().replace(/\/+$/, "");
    if (!trimmed) continue;

    let url;
    try {
      url = new URL(trimmed);
    } catch {
      console.error(`::warning::Ignoring unparseable API base URL: ${trimmed}`);
      continue;
    }

    // A publish key must never leave over plaintext, and these are the same
    // URLs the shipped app uses, so a non-https one is a misconfiguration
    // worth failing on rather than quietly skipping.
    if (url.protocol !== "https:") {
      console.error(
        `::error::Refusing to send the publish key over ${url.protocol}//: ${trimmed}`,
      );
      process.exit(1);
    }

    seen.add(trimmed);
  }

  return [...seen];
}

async function publishTo(baseUrl) {
  const endpoint = `${baseUrl}/app-version`;
  let lastError;

  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    let response;

    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-App-Version-Key": publishKey,
          "User-Agent": USER_AGENT,
        },
        body: JSON.stringify({ app, platform, build }),
        signal: AbortSignal.timeout(20000),
      });
    } catch (error) {
      // Transport-level only — worth another try.
      lastError = `network error: ${error.message}`;
      if (attempt < ATTEMPTS) {
        console.error(
          `  attempt ${attempt}/${ATTEMPTS} failed (${lastError}), retrying…`,
        );
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
      continue;
    }

    if (response.ok) return { ok: true };

    const body = await response.text().catch(() => "");

    // A WAF challenge is an HTML interstitial, not an API response. Pasting
    // 300 characters of `<!DOCTYPE html><title>Just a moment...` into the job
    // log buries the one thing worth knowing: the request never reached the
    // backend, so the key, the payload, and the build number are all
    // irrelevant to the fix.
    const isChallenge =
      /^\s*</.test(body) &&
      /just a moment|cf-browser-verification|challenge-platform|attention required/i.test(
        body,
      );

    if (isChallenge) {
      return {
        ok: false,
        error:
          `HTTP ${response.status}: blocked by a WAF challenge before reaching the backend ` +
          `(Cloudflare or similar). This is not an auth or payload problem — it is where the ` +
          `request came from. Allow this endpoint for the release runner: match on the ` +
          `User-Agent "${USER_AGENT}" or the path, and skip bot protection for it. ` +
          `The endpoint is protected by its own shared key, so skipping bot management ` +
          `exposes nothing new. See docs/dev.md.`,
      };
    }

    const detail = body.slice(0, 300);

    // 4xx means the request itself is wrong — a bad key, an unconfigured
    // deployment, a build number lower than what is already published.
    // Retrying cannot change any of those, and doing so would only bury
    // the real message under two more identical failures.
    if (response.status >= 400 && response.status < 500) {
      return { ok: false, error: `HTTP ${response.status}: ${detail}` };
    }

    lastError = `HTTP ${response.status}: ${detail}`;
    if (attempt < ATTEMPTS) {
      console.error(
        `  attempt ${attempt}/${ATTEMPTS} failed (${lastError}), retrying…`,
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }

  return { ok: false, error: lastError };
}

const baseUrls = targets();

if (baseUrls.length === 0) {
  console.error(
    "::error::No API base URLs configured — nothing to publish the version to.",
  );
  process.exit(1);
}

console.log(
  `Publishing ${app}/${platform} build ${build} to ${baseUrls.length} deployment(s).`,
);

const results = [];

// Every deployment is attempted even after one fails, so a single broken
// backend can't mask a second one behind it.
for (const baseUrl of baseUrls) {
  console.log(`→ ${baseUrl}`);
  const result = await publishTo(baseUrl);

  if (result.ok) {
    console.log(`  ok`);
  } else {
    console.error(
      `::error::Failed to publish app version to ${baseUrl} — ${result.error}`,
    );
  }

  results.push({ baseUrl, ...result });
}

const failed = results.filter((result) => !result.ok);

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(
  join(outputDirectory, `version-publish-${app}.json`),
  `${JSON.stringify(
    {
      app,
      platform,
      build,
      published: results.filter((r) => r.ok).map((r) => r.baseUrl),
      failed: failed.map(({ baseUrl, error }) => ({ baseUrl, error })),
    },
    null,
    2,
  )}\n`,
);

if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = results
    .map(
      (r) =>
        `- ${r.ok ? "✅" : "❌"} \`${r.baseUrl}\`${r.ok ? "" : ` — ${r.error}`}`,
    )
    .join("\n");
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    `\n### App version publish — ${app} ${platform} build ${build}\n\n${lines}\n`,
  );
}

if (failed.length > 0) {
  // Deliberately a hard failure, even though Play has already accepted the
  // build and the release itself is out. A green run with a stale version
  // endpoint is the precise failure this whole mechanism exists to prevent,
  // so it must not be possible to scroll past it.
  console.error(
    `\n::error::The release IS published to Play — only the version endpoint update failed ` +
      `(${failed.length}/${results.length} deployment(s)). Re-run this step, or POST it by hand: ` +
      `{"app":"${app}","platform":"${platform}","build":${build}}. Re-sending the same number is a safe no-op.`,
  );
  process.exit(1);
}

console.log("\nAll deployments updated.");
