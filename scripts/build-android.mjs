#!/usr/bin/env node

import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const VALID_ROUTES = new Set(["customer", "vendor"]);
const VALID_ARTIFACTS = new Set(["apk", "aab"]);
const [route, artifact] = process.argv.slice(2);

if (!VALID_ROUTES.has(route) || !VALID_ARTIFACTS.has(artifact)) {
  console.error(
    "Usage: node scripts/build-android.mjs <customer|vendor> <apk|aab>",
  );
  process.exit(1);
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const androidDirectory = join(projectRoot, "android");
const expoCli = join(projectRoot, "node_modules", "expo", "bin", "cli");
const outputDirectory = join(projectRoot, "local-builds", "android");
const versionStatePath = join(outputDirectory, ".version-state.json");
const androidHome =
  process.env.ANDROID_HOME ?? join(homedir(), "Library", "Android", "sdk");
const androidStudioJavaHome =
  "/Applications/Android Studio.app/Contents/jbr/Contents/Home";
const appVariant = artifact === "apk" ? "preview" : "production";
const gradleTask =
  artifact === "apk" ? ":app:assembleRelease" : ":app:bundleRelease";

function readJson(path, fallback) {
  if (!existsSync(path)) return fallback;

  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    console.error(`Unable to read JSON from ${path}: ${error.message}`);
    process.exit(1);
  }
}

function incrementPatchVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);

  if (!match) {
    console.error(
      `Unable to increment version "${version}". Expected major.minor.patch, for example 1.0.0.`,
    );
    process.exit(1);
  }

  const [, major, minor, patch] = match;
  return `${major}.${minor}.${Number(patch) + 1}`;
}

function migrateVersionState(state) {
  const migratedState = { ...state };

  for (const variant of ["preview", "production"]) {
    const candidates = [
      state[variant],
      state[`customer-${variant}`],
      state[`vendor-${variant}`],
    ].filter(Boolean);

    if (candidates.length > 0) {
      migratedState[variant] = candidates.reduce((latest, candidate) =>
        Number(candidate.buildNumber) > Number(latest.buildNumber)
          ? candidate
          : latest,
      );
    }

    delete migratedState[`customer-${variant}`];
    delete migratedState[`vendor-${variant}`];
  }

  return migratedState;
}

function getLocalBuildDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const getPart = (type) => parts.find((part) => part.type === type)?.value;
  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");
  return `${year}-${month}-${day}`;
}

function saveVersionState(state) {
  mkdirSync(outputDirectory, { recursive: true });
  const temporaryPath = `${versionStatePath}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(state, null, 2)}\n`);
  renameSync(temporaryPath, versionStatePath);
}

const RELEASE_FILENAME_PATTERN = /^v(\d+\.\d+\.\d+)-b(\d+)-\d{8}\.md$/;

// Production releases are named for a specific version by a human, ahead of
// time, in a release-notes file that is committed to git — e.g.
// docs/releases/customer/v1.1.1-b10-20260809.md. That filename is the only
// record of "what version this release is supposed to be" that survives a
// fresh CI runner, so it is the source of truth for the versionName shipped
// to Play, not the local, gitignored build counter below (which is what
// silently shipped v1.0.1-b2 instead of the intended v1.1.1-b10 previously).
function getLatestDocumentedRelease(forRoute) {
  const releasesDirectory = join(projectRoot, "docs", "releases", forRoute);

  if (!existsSync(releasesDirectory)) return undefined;

  const releases = readdirSync(releasesDirectory)
    .map((filename) => RELEASE_FILENAME_PATTERN.exec(filename))
    .filter(Boolean)
    .map(([, version, buildNumber]) => ({
      version,
      buildNumber: Number(buildNumber),
    }));

  if (releases.length === 0) return undefined;

  return releases.reduce((latest, candidate) =>
    candidate.buildNumber > latest.buildNumber ? candidate : latest,
  );
}

const packageJson = readJson(join(projectRoot, "package.json"), {});
const versionState = migrateVersionState(readJson(versionStatePath, {}));
const storedBuild = versionState[appVariant];
const previousBuild = storedBuild ?? {
  version: packageJson.version ?? "1.0.0",
  buildNumber: 1,
};
const buildDate = getLocalBuildDate();

function getReleaseName(build) {
  const fileDate = build.buildDate.replaceAll("-", "");
  return `v${build.version}-b${build.buildNumber}-${fileDate}`;
}

function getOutputArtifact(build) {
  const releaseName = getReleaseName(build);
  return join(
    outputDirectory,
    appVariant,
    releaseName,
    `stuqet-${route}-${appVariant}-${releaseName}.${artifact}`,
  );
}

const previousBuildNumber = Number(previousBuild.buildNumber);

if (!Number.isSafeInteger(previousBuildNumber) || previousBuildNumber < 1) {
  console.error(
    `Invalid previous build number "${previousBuild.buildNumber}" in ${versionStatePath}.`,
  );
  process.exit(1);
}

// The state file above is local to whatever machine last ran a build — it is
// gitignored and does not survive a fresh CI runner. Play Console itself is
// the only durable record of what versionCode has actually shipped (whether
// this script uploaded it or a human did it by hand), so CI passes that in
// as a floor via PLAY_MAX_VERSION_CODE. Without it (e.g. local `apk:*`/
// `aab:*` runs that never touch Play) this is 0 and has no effect.
const playMaxVersionCodeRaw = process.env.PLAY_MAX_VERSION_CODE;
let playMaxVersionCode = 0;

if (playMaxVersionCodeRaw !== undefined && playMaxVersionCodeRaw !== "") {
  playMaxVersionCode = Number(playMaxVersionCodeRaw);

  if (!Number.isSafeInteger(playMaxVersionCode) || playMaxVersionCode < 0) {
    console.error(
      `Invalid PLAY_MAX_VERSION_CODE "${playMaxVersionCodeRaw}". Expected a non-negative integer.`,
    );
    process.exit(1);
  }
}

let buildVersion;
let buildNumber;
let canReuseCurrentRelease = false;

if (artifact === "aab") {
  // Play only enforces that versionCode strictly increases — it has no
  // opinion on versionName — so the release-notes file supplies the name
  // and Play's own history supplies the number. Neither depends on the
  // local counter, so this is deterministic on a fresh runner every time.
  const documentedRelease = getLatestDocumentedRelease(route);

  if (!documentedRelease) {
    console.error(
      `No release notes found in docs/releases/${route}/ matching vX.Y.Z-bN-YYYYMMDD.md.\n` +
        "Add one (see docs/releases/RELEASE_TEMPLATE.md) before building a production release — its filename is the source of truth for the version name shipped to Play.",
    );
    process.exit(1);
  }

  buildVersion = documentedRelease.version;
  buildNumber = playMaxVersionCode + 1;

  if (buildNumber !== documentedRelease.buildNumber) {
    // A plain console.warn is easy to lose in 45 minutes of Gradle output,
    // and the mismatch has no other consequence Play will surface on its
    // own, so it needs to surface somewhere a human is actually looking:
    // a GitHub Actions annotation (shows up on the PR/commit checks tab)
    // and the job summary (shows up on the run's own overview page).
    const message =
      `docs/releases/${route}/ is named for build ${documentedRelease.buildNumber}, but Play's highest known versionCode for this app is ${playMaxVersionCode}, so this release will actually ship as versionCode ${buildNumber}. ` +
      "Rename the release-notes file (and any build-number mentions inside it) to match once you've confirmed the number that shipped.";

    console.warn(`::warning::${message}`);

    if (process.env.GITHUB_STEP_SUMMARY) {
      appendFileSync(
        process.env.GITHUB_STEP_SUMMARY,
        `\n⚠️ **Release-notes/versionCode mismatch — ${route}**: ${message}\n`,
      );
    }

    // Also written as a small file so the Discord notification step later
    // in this same job can read it directly and fold it into the release
    // message — see scripts/notify-release-discord.py's mismatch_section().
    mkdirSync(outputDirectory, { recursive: true });
    writeFileSync(
      join(outputDirectory, `version-mismatch-${route}.json`),
      `${JSON.stringify(
        {
          route,
          documentedBuildNumber: documentedRelease.buildNumber,
          actualVersionCode: buildNumber,
          playMaxVersionCode,
        },
        null,
        2,
      )}\n`,
    );
  }
} else {
  canReuseCurrentRelease =
    storedBuild &&
    storedBuild.buildDate === buildDate &&
    !existsSync(getOutputArtifact(storedBuild));
  buildVersion = canReuseCurrentRelease
    ? storedBuild.version
    : incrementPatchVersion(previousBuild.version);
  buildNumber = canReuseCurrentRelease
    ? previousBuildNumber
    : previousBuildNumber + 1;
}

// The release workflow publishes this number to the backend's app-version
// endpoint once Play accepts the build, which is what lets the in-app
// force-update check know a newer build exists (see release-android.yml).
//
// Emitted from here rather than recomputed in YAML as
// PLAY_MAX_VERSION_CODE + 1: the reuse branch above can leave buildNumber
// unchanged, and the aab branch derives it from Play's own history, so any
// second calculation would eventually disagree with the binary that shipped.
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `version_code=${buildNumber}\nversion_name=${buildVersion}\n`,
  );
}

// Gradle 8.14.3, pinned by the Expo Android template, cannot run on a JVM
// newer than Java 24, and Android Studio's bundled runtime has already moved
// past it. So the JDK is resolved and version-checked instead of assumed:
// an explicit `JAVA_HOME` first, then a supported JDK registered with macOS,
// then Android Studio's runtime.
const MINIMUM_JAVA_MAJOR = 17;
const MAXIMUM_JAVA_MAJOR = 24;
const PREFERRED_JAVA_MAJORS = [17, 21];

function getJavaMajorVersion(candidate) {
  const result = spawnSync(join(candidate, "bin", "java"), ["-version"], {
    encoding: "utf8",
  });

  if (result.error || result.status !== 0) return undefined;

  // Version output goes to stderr on most JDKs, stdout on some.
  const output = `${result.stderr ?? ""}${result.stdout ?? ""}`;
  const major = Number.parseInt(
    /version "(?:1\.)?(\d+)/.exec(output)?.[1] ?? "",
    10,
  );
  return Number.isSafeInteger(major) ? major : undefined;
}

function findRegisteredJavaHome(major) {
  const result = spawnSync("/usr/libexec/java_home", ["-v", String(major)], {
    encoding: "utf8",
  });

  if (result.error || result.status !== 0) return undefined;

  const path = result.stdout.trim();
  return path.length > 0 ? path : undefined;
}

function resolveJavaHome() {
  const explicitJavaHome = process.env.JAVA_HOME?.trim();
  const candidates = [
    explicitJavaHome,
    ...PREFERRED_JAVA_MAJORS.map(findRegisteredJavaHome),
    androidStudioJavaHome,
  ].filter(Boolean);
  const rejected = [];

  for (const candidate of candidates) {
    if (!existsSync(join(candidate, "bin", "java"))) continue;

    const major = getJavaMajorVersion(candidate);

    if (
      major !== undefined &&
      major >= MINIMUM_JAVA_MAJOR &&
      major <= MAXIMUM_JAVA_MAJOR
    ) {
      if (explicitJavaHome && candidate !== explicitJavaHome) {
        console.warn(
          `JAVA_HOME (${explicitJavaHome}) is not usable by Gradle. Building with ${candidate} instead.`,
        );
      }
      return candidate;
    }

    rejected.push(`${candidate} (Java ${major ?? "unreadable"})`);
  }

  console.error(
    `No JDK between ${MINIMUM_JAVA_MAJOR} and ${MAXIMUM_JAVA_MAJOR} was found.\n` +
      `Checked: ${rejected.length > 0 ? rejected.join(", ") : "none"}.\n` +
      "Install one with `brew install --cask temurin@17`, or set JAVA_HOME to a supported JDK.",
  );
  process.exit(1);
}

const javaHome = resolveJavaHome();

const requiredPaths = [
  [expoCli, "Project Expo CLI"],
  [androidHome, "Android SDK"],
];

for (const [path, label] of requiredPaths) {
  if (!existsSync(path)) {
    console.error(`${label} was not found at ${path}`);
    process.exit(1);
  }
}

// Play requires apps to target API 36 or newer, so the SDK only has to be at
// least that recent. Match on the major version rather than an exact
// directory name: extension releases install as `android-36.1`, and build
// tools move to `36.1.0`/`37.0.0`, none of which are a literal `36`/`36.0.0`.
const MINIMUM_ANDROID_API = 36;

function getInstalledMajorVersions(directory, parse) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory)
    .map(parse)
    .filter((major) => Number.isSafeInteger(major));
}

function requireSdkComponent(directory, label, parse, installHint) {
  const majors = getInstalledMajorVersions(directory, parse);

  if (majors.some((major) => major >= MINIMUM_ANDROID_API)) return;

  console.error(
    `${label} ${MINIMUM_ANDROID_API} or newer was not found in ${directory}.\n` +
      `Installed: ${majors.length > 0 ? majors.sort((a, b) => a - b).join(", ") : "none"}.\n` +
      installHint,
  );
  process.exit(1);
}

requireSdkComponent(
  join(androidHome, "platforms"),
  "Android SDK Platform",
  (name) => Number.parseInt(/^android-(\d+)/.exec(name)?.[1] ?? "", 10),
  "Install it from Android Studio's SDK Manager (SDK Platforms tab).",
);

requireSdkComponent(
  join(androidHome, "build-tools"),
  "Android SDK Build Tools",
  (name) => Number.parseInt(/^(\d+)\./.exec(name)?.[1] ?? "", 10),
  "Install them from Android Studio's SDK Manager (SDK Tools tab).",
);

// `.env.prod` is the single environment source for local Android release
// builds. It is loaded explicitly because Expo does not recognize that custom
// filename, and Gradle also needs values such as the Sentry auth token.
function readEnvProd() {
  const envPath = join(projectRoot, ".env.prod");

  if (!existsSync(envPath)) {
    console.error(`Production environment file was not found at ${envPath}`);
    process.exit(1);
  }

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
    const value = isQuoted
      ? trimmedValue.slice(1, -1)
      : trimmedValue.replace(/\s+#.*$/, "").trim();
    values[key] = value;
  }
  return values;
}

const prodEnvironment = readEnvProd();
const sentryAuthToken =
  process.env.SENTRY_AUTH_TOKEN ?? prodEnvironment.SENTRY_AUTH_TOKEN;

if (!sentryAuthToken) {
  console.warn(
    "SENTRY_AUTH_TOKEN is not set — this build will not upload source maps.",
  );
}

const environment = {
  ...prodEnvironment,
  ...process.env,
  ANDROID_HOME: androidHome,
  ANDROID_SDK_ROOT: androidHome,
  APP_VARIANT: appVariant,
  APP_BUILD_DATE: buildDate,
  APP_BUILD_NUMBER: String(buildNumber),
  APP_VERSION: buildVersion,
  // Prevent Expo from mixing standard `.env*` files such as `.env.local`
  // into the explicitly loaded production environment.
  EXPO_NO_DOTENV: "1",
  EXPO_PUBLIC_ROUTE: route,
  JAVA_HOME: javaHome,
  NODE_ENV: "production",
};

console.log(
  `${canReuseCurrentRelease ? "Completing" : "Building"} ${appVariant} release v${buildVersion} (build ${buildNumber}) for ${buildDate} with the ${route} app`,
);

function run(command, args, cwd = projectRoot) {
  console.log(`\n> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd,
    env: environment,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function requireEnvironmentValue(name) {
  const value = environment[name]?.trim();

  if (!value) {
    console.error(`${name} is required to sign production Android AAB builds.`);
    process.exit(1);
  }

  return value;
}

function configureAndroidReleaseSigning() {
  if (artifact !== "aab") return;

  requireEnvironmentValue("ANDROID_UPLOAD_KEYSTORE_FILE");
  requireEnvironmentValue("ANDROID_UPLOAD_STORE_PASSWORD");
  requireEnvironmentValue("ANDROID_UPLOAD_KEY_ALIAS");
  requireEnvironmentValue("ANDROID_UPLOAD_KEY_PASSWORD");

  const buildGradlePath = join(androidDirectory, "app", "build.gradle");

  if (!existsSync(buildGradlePath)) {
    console.error(
      `Android app Gradle file was not found at ${buildGradlePath}`,
    );
    process.exit(1);
  }

  let buildGradle = readFileSync(buildGradlePath, "utf8");
  const debugSigningBlock = `        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
`;
  const releaseSigningBlock = `${debugSigningBlock}        release {
            storeFile file(System.getenv("ANDROID_UPLOAD_KEYSTORE_FILE"))
            storePassword System.getenv("ANDROID_UPLOAD_STORE_PASSWORD")
            keyAlias System.getenv("ANDROID_UPLOAD_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_UPLOAD_KEY_PASSWORD")
        }
`;

  if (!buildGradle.includes(debugSigningBlock)) {
    console.error(
      "Unable to locate the generated Android debug signing block. The Expo Android template may have changed.",
    );
    process.exit(1);
  }

  buildGradle = buildGradle.replace(debugSigningBlock, releaseSigningBlock);

  const debugReleaseSigning = `            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;
  const uploadReleaseSigning = `            signingConfig signingConfigs.release`;

  if (!buildGradle.includes(debugReleaseSigning)) {
    console.error(
      "Unable to locate the generated Android release signing config. The Expo Android template may have changed.",
    );
    process.exit(1);
  }

  buildGradle = buildGradle.replace(debugReleaseSigning, uploadReleaseSigning);
  writeFileSync(buildGradlePath, buildGradle);
}

run(process.execPath, [
  expoCli,
  "prebuild",
  "--platform",
  "android",
  "--clean",
  "--no-install",
]);

configureAndroidReleaseSigning();

run(
  join(androidDirectory, "gradlew"),
  [
    "--no-daemon",
    "--max-workers=2",
    "-Dorg.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m",
    gradleTask,
  ],
  androidDirectory,
);

const sourceArtifact =
  artifact === "apk"
    ? join(
        androidDirectory,
        "app",
        "build",
        "outputs",
        "apk",
        "release",
        "app-release.apk",
      )
    : join(
        androidDirectory,
        "app",
        "build",
        "outputs",
        "bundle",
        "release",
        "app-release.aab",
      );

if (!existsSync(sourceArtifact)) {
  console.error(`Expected build artifact was not found at ${sourceArtifact}`);
  process.exit(1);
}

const completedBuild = {
  version: buildVersion,
  buildNumber,
  buildDate,
};
const outputArtifact = getOutputArtifact(completedBuild);
const artifactDirectory = dirname(outputArtifact);

mkdirSync(artifactDirectory, { recursive: true });
copyFileSync(sourceArtifact, outputArtifact);
saveVersionState({
  ...versionState,
  [appVariant]: completedBuild,
});

console.log(`\nBuild complete: ${outputArtifact}`);

if (artifact === "aab") {
  console.log(
    "Note: configure the Play Store upload key before submitting this local AAB.",
  );
}
