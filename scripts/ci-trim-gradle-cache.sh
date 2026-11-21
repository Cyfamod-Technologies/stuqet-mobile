#!/usr/bin/env bash
# Drop bulky, machine-specific Gradle leftovers so the post-job
# `actions/cache` save has room to write cache.tzst. We only persist
# ~/.gradle/caches/modules-2 and ~/.gradle/wrapper; everything else here
# is regenerated on the next build and is not worth archiving.

set -euo pipefail

if [[ "${GITHUB_ACTIONS:-}" != "true" ]]; then
  echo "Refusing to run outside GitHub Actions." >&2
  exit 1
fi

pkill -f 'GradleDaemon|KotlinCompileDaemon' || true

rm -rf ~/.gradle/caches/transforms-*
rm -rf ~/.gradle/caches/build-cache-*
rm -rf ~/.gradle/caches/journal-*
find ~/.gradle/caches -name '*.lock' -delete || true

# Generated native project intermediates — the APK/AAB has already been
# copied to local-builds/ (and uploaded) by the time this runs.
rm -rf android/.gradle android/app/build
rm -rf node_modules

echo "Disk after Gradle trim:"
df -h
