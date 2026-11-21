#!/usr/bin/env bash
# Reclaim GitHub-hosted runner disk before an Android build. Standard
# ubuntu-latest images advertise ~14GB free after the preinstalled image
# lands; Android SDK + Gradle + node_modules + a cache archive easily
# fill that, and the post-job `actions/cache` save then fails with
# "No space left on device". A release AAB build (expo prebuild --clean, R8,
# JS bundle) needs even more headroom than an APK. This repo never uses the
# toolchains below.
#
# Deliberately NOT touching the Android SDK, its platforms/build-tools, cmake
# or the NDK: the jobs that call this run android-actions/setup-android and
# sdkmanager afterwards, and react-native-reanimated compiles C++ against the
# NDK, so deleting it breaks the build in a way that looks unrelated. Only the
# emulator and system images are removed — a build never boots a device.
#
# Set MIN_FREE_GB to also fail fast, with a clear reason, when the runner
# still has less than that much free space afterwards (release builds set 12)
# instead of dying ~20 minutes into Gradle with a confusing bundler error.
#
# Safe to call only on GitHub Actions — it deletes system paths.

set -euo pipefail

if [[ "${GITHUB_ACTIONS:-}" != "true" ]]; then
  echo "Refusing to run outside GitHub Actions." >&2
  exit 1
fi

echo "Disk before cleanup:"
df -h

# Each removal is tolerant: a path missing from a future runner image must not
# fail the job.
sudo rm -rf /usr/share/dotnet || true
sudo rm -rf /opt/ghc || true
sudo rm -rf /usr/local/share/boost || true
sudo rm -rf /usr/share/swift || true
sudo rm -rf /usr/local/.ghcup || true
sudo rm -rf /usr/local/share/powershell || true
sudo rm -rf /usr/local/share/chromium || true
sudo rm -rf /opt/hostedtoolcache/CodeQL || true
sudo rm -rf /opt/hostedtoolcache/chromium || true
sudo rm -rf /opt/hostedtoolcache/go || true
sudo rm -rf /opt/hostedtoolcache/Python || true
sudo rm -rf /opt/hostedtoolcache/Ruby || true
sudo rm -rf /opt/hostedtoolcache/Java_Temurin-Hotspot_jdk || true
sudo rm -rf /opt/hostedtoolcache/node || true
sudo rm -rf /usr/local/lib/android/sdk/emulator || true
sudo rm -rf /usr/local/lib/android/sdk/system-images || true

if command -v docker >/dev/null 2>&1; then
  sudo docker image prune -af || true
fi

sudo apt-get clean || true

echo "Disk after cleanup:"
df -h

if [[ -n "${MIN_FREE_GB:-}" ]]; then
  available_gb=$(( $(df --output=avail -k / | tail -1 | tr -d ' ') / 1024 / 1024 ))
  echo "Available disk space: ${available_gb} GiB (need ${MIN_FREE_GB} GiB)"

  if (( available_gb < MIN_FREE_GB )); then
    echo "::error::Only ${available_gb} GiB free — this build needs at least ${MIN_FREE_GB} GiB. The cleanup above did not free enough, which usually means the runner image changed and some paths it removes no longer exist. Check its before/after output."
    exit 1
  fi
fi
