# Local Android Builds

This guide is the canonical reference for producing shareable Android APKs and
local Android App Bundles (AABs) for the Stuqet Customer and Stuqet Vendor apps without
using an EAS cloud build.

The local build runner lives at `scripts/build-android.mjs`. It selects the app
route, generates the native Android project, assigns an automatic version, runs
the Gradle release task, and copies the finished artifact into a versioned
directory under `local-builds/android/`.

For EAS cloud builds and deployment workflows, see [setup.md](./setup.md) and
[dev.md](./dev.md).

## What local builds are for

- Use a preview APK to give QA, managers, or other internal testers an app they
  can install directly on a physical Android device.
- Use a local build when UI or integration testing should not consume an EAS
  cloud build.
- Use a local AAB to validate that an Android production bundle compiles.
- Continue using EAS production builds for store releases unless production
  upload signing and version synchronization have been configured locally.

An APK can be installed directly. An AAB cannot be installed directly; it is a
Play Store distribution artifact.

## Prerequisites

Local Android builds currently target macOS and expect:

- Node.js 20 or newer and npm.
- Project dependencies installed with `npm install`.
- Android Studio installed in `/Applications/Android Studio.app`.
- A JDK between 17 and 24, for example `brew install --cask temurin@17`.
  Android Studio's bundled runtime is used only when it falls in that range.
- Android SDK at `~/Library/Android/sdk`, unless `ANDROID_HOME` is set.
- Android SDK Platform 36 or newer.
- Android SDK Build Tools 36.0.0 or newer.
- Accepted Android SDK licenses.
- A configured `.env.prod` with a reachable
  `EXPO_PUBLIC_API_BASE_URL` for builds shared with other devices.

The build script validates the JDK, SDK, and the presence of a Platform and
Build Tools of at least API 36 before starting. Newer installs satisfy it, so
an extension release such as `android-36.1` is accepted. Gradle may install additional compatible native dependencies,
such as the NDK or CMake, on the first build.

The JDK range is not a preference. The Gradle version the Expo Android
template pins (9.4.1 as of SDK 58) bounds the newest JVM it can run on, so the
script keeps its upper limit at Java 24 until a newer JDK has been verified with
a local build. 17 is the version React Native 0.88 targets. Nothing needs to be exported: the script picks a
supported JDK on its own, preferring `JAVA_HOME` when it points at one.

The first build is slower because Gradle, native dependencies, and Metro caches
must be populated. Later builds still run a clean Expo prebuild but can reuse
downloaded Gradle dependencies.

## Build commands

Run all commands from the repository root.

### Preview APKs

| Command                | Result                                        |
| ---------------------- | --------------------------------------------- |
| `npm run apk:customer` | Builds a shareable customer preview APK.      |
| `npm run apk:vendor`   | Builds a vendor preview APK.                  |
| `npm run apk:all`      | Builds customer and vendor APKs sequentially. |

APK builds use `APP_VARIANT=preview`. Preview package identifiers have a
`.preview` suffix, so customer and vendor preview apps can coexist with their
production apps and with each other.

Preview APKs contain only the `arm64-v8a` native architecture. They are intended
for modern physical Android devices and will not run on an `x86`/`x86_64`
emulator.

### Production AABs

| Command                | Result                                  |
| ---------------------- | --------------------------------------- |
| `npm run aab:customer` | Builds a local customer production AAB. |
| `npm run aab:vendor`   | Builds a local vendor production AAB.   |
| `npm run aab:all`      | Builds both AABs sequentially.          |

AAB builds use `APP_VARIANT=production` and retain all configured native
architectures. A local AAB proves that the bundle compiles, but it must have the
correct Play upload key and a valid store version code before submission.

## Automatic versioning

Every successful local build receives three generated values:

- **Version**: the semantic patch version increases, for example `1.0.2` to
  `1.0.3`.
- **Build number**: the positive integer increases, for example `3` to `4`.
  Android uses it as `versionCode`; iOS-compatible app configuration uses it as
  `buildNumber`.
- **Build date**: the current date in the `Africa/Lagos` timezone. App metadata
  uses `YYYY-MM-DD`; directory and file names use `YYYYMMDD`.

The build runner passes these private build-time variables to `app.config.ts`:

| Variable           | Expo configuration destination                          |
| ------------------ | ------------------------------------------------------- |
| `APP_VERSION`      | `version` and `extra.build.version`                     |
| `APP_BUILD_NUMBER` | Android `versionCode`, iOS `buildNumber`, and app extra |
| `APP_BUILD_DATE`   | `extra.build.date`                                      |

These variables are generated by the runner. They do not need to be added to
`.env.prod`.

### Version state

The last successful values are stored locally per variant at:

```text
local-builds/android/.version-state.json
```

Example:

```json
{
  "preview": {
    "version": "1.0.3",
    "buildNumber": 4,
    "buildDate": "2026-07-17"
  },
  "production": {
    "version": "1.0.1",
    "buildNumber": 2,
    "buildDate": "2026-07-17"
  }
}
```

State is independent for:

- `preview`
- `production`

Customer and vendor artifacts share the same release version within a variant.
For example, `npm run apk:all` places both APKs in the same `preview` release
directory. The first app starts the release; the second app reuses that release
on the same date while its artifact is missing. Rebuilding an artifact that
already exists advances the shared variant to the next version and build
number. Preview APK builds do not increment the production AAB state.

If a state entry does not exist, the runner uses the version from `package.json`
and build number `1` as the previous values. With a package version of `1.0.0`,
the first generated local build is `1.0.1` with build number `2`.

The state file is updated only when the build completes and the artifact is
copied successfully. A failed Expo or Gradle build does not advance the stored
version.

`local-builds/` is ignored by Git. Version history is local to the machine and
is not synchronized between developers, EAS, or the app stores. Deleting the
state file resets the local counters to their defaults and can cause version
reuse, so do not delete it when version continuity matters.

## Artifact directory structure

Every build has a release identifier in this format:

```text
v<version>-b<build-number>-<YYYYMMDD>
```

The release identifier appears in both the directory and the artifact filename:

```text
local-builds/
└── android/
    ├── .version-state.json
    ├── preview/
    │   └── v1.0.2-b3-20260717/
    │       ├── stuqet-customer-preview-v1.0.2-b3-20260717.apk
    │       └── stuqet-vendor-preview-v1.0.2-b3-20260717.apk
    └── production/
        └── v1.0.2-b3-20260717/
            ├── stuqet-customer-production-v1.0.2-b3-20260717.aab
            └── stuqet-vendor-production-v1.0.2-b3-20260717.aab
```

Previous releases are preserved; a new build creates a new versioned directory
instead of overwriting an older artifact.

## What the build runner does

For each command, `scripts/build-android.mjs`:

1. Validates the requested route (`customer` or `vendor`) and artifact (`apk` or
   `aab`).
2. Resolves the Android SDK and a Gradle-compatible JDK.
3. Reads the previous variant state and either calculates the next patch
   version or completes the current release with its missing app artifact.
4. Exports the route, variant, version, number, and date to the Expo config.
5. Runs a clean Android prebuild through the project-installed Expo CLI:

   ```bash
   node node_modules/expo/bin/cli prebuild --platform android --clean --no-install
   ```

6. Runs the appropriate Gradle release task:
   - APK: `:app:assembleRelease`
   - AAB: `:app:bundleRelease`
7. Uses a single-use Gradle daemon, at most two workers, a 4 GB heap, and 1 GB
   metaspace to keep native compilation stable.
8. Copies the artifact into its versioned directory.
9. Saves the new local version state.

The generated `android/` directory is ignored by Git and can be regenerated by
the next build.

## Installing and sharing an APK

Share the `.apk` inside the relevant versioned directory through an internal
file-sharing service. On the receiving Android device, the tester may need to
allow installation from the app that opens the APK.

With Android Debug Bridge available, an APK can also be installed with:

```bash
adb install -r /absolute/path/to/stuqet-customer-preview-v1.0.2-b3-20260717.apk
```

The current local preview APK is release-optimized but signed with the local
Android debug certificate. It is suitable for internal installation, not Play
Store submission. Reinstalling over a build signed by a different key requires
uninstalling the existing app first.

Before sharing, confirm that `.env.prod` does not point to `localhost` or a
private address unavailable to the tester's device. `EXPO_PUBLIC_*` values are
embedded into the JavaScript bundle and must never contain secrets.

## Verifying an APK

Inspect the package, version name, and version code with Android Build Tools:

```bash
~/Library/Android/sdk/build-tools/36.0.0/aapt dump badging \
  local-builds/android/preview/v1.0.2-b3-20260717/\
stuqet-customer-preview-v1.0.2-b3-20260717.apk
```

Generate a checksum before sharing when artifact integrity matters:

```bash
shasum -a 256 \
  local-builds/android/preview/v1.0.2-b3-20260717/\
stuqet-customer-preview-v1.0.2-b3-20260717.apk
```

## Local AABs versus EAS production builds

Local AAB counters are stored only in `.version-state.json`. They do not know
the latest version code uploaded to Google Play, and EAS uses remote app
versioning with production auto-increment. A locally generated production build
number can therefore conflict with a store or EAS build number.

For store releases, use the EAS production profiles unless local upload signing
and version synchronization have been deliberately configured:

```bash
npm run build:prod:customer
npm run build:prod:vendor
```

To build only Android through EAS:

```bash
npx eas build --platform android --profile production-customer
npx eas build --platform android --profile production-vendor
```

EAS builds do not read or update `local-builds/android/.version-state.json`.

## Cleaning local artifacts

Generated APK and AAB directories can be removed when they are no longer
needed. Preserve `.version-state.json` so the next build continues from the
latest version and build number. Removing the state file resets the local
counters and can cause version reuse.

## Troubleshooting

### No supported JDK was found

The script lists every JDK it checked and the version each one reported. Install
a JDK in the supported range and rerun the build:

```bash
brew install --cask temurin@17
```

Temurin registers itself with macOS, so the script finds it without any
environment variable. To build against a JDK that is not registered, point
`JAVA_HOME` at it.

### Unsupported class file major version

A raw Gradle failure such as `Unsupported class file major version 69` means
Gradle started on a JVM that is too new — major version 69 is Java 25. This
should no longer happen through `npm run apk:*` or `aab:*`, which check the JDK
first, but it can appear when `android/gradlew` is invoked directly. Set
`JAVA_HOME` to a JDK in the supported range for that shell.

Do not fix it by editing `android/gradle.properties` or the Gradle wrapper.
Every build runs `expo prebuild --clean`, which deletes and regenerates the
whole `android/` directory.

### Android SDK or Build Tools not found

Open Android Studio's SDK Manager and install Android SDK Platform 36 or newer
and Android SDK Build Tools 36.0.0 or newer. If the SDK is not under
`~/Library/Android/sdk`, set `ANDROID_HOME` to its location.

### Gradle downloads or SDK licenses fail

Confirm the machine has network access and accept the SDK licenses from Android
Studio's SDK Manager or `sdkmanager --licenses`.

### APK does not install on an emulator

Preview APKs are `arm64-v8a` only. Use a compatible physical device or build a
variant that includes the emulator's ABI.

### Existing app conflicts with the APK

Confirm the installed application has the same package identifier and signing
key. The preview identifiers are:

```text
com.stuqet.customer.preview
com.stuqet.vendor.preview
```

If Android reports a signature mismatch, uninstall the existing preview app and
install the new APK again.

### Build fails before completion

Fix the reported Expo, Metro, native, or Gradle error and rerun the same npm
command. The failed attempt does not update the version state.
