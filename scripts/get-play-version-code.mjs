#!/usr/bin/env node

// Looks up the highest Android versionCode Google Play already knows about
// for a package, across every track (internal/alpha/beta/production and any
// custom ones) and every release on those tracks — not just the one this
// workflow itself last set. That makes it safe even if a build is ever
// uploaded to Play by hand again: the next automated release will always
// look at Play's own truth instead of a local counter.
//
// Usage: node scripts/get-play-version-code.mjs <packageName> [track]
// Requires PLAY_PUBLISHER_SERVICE_ACCOUNT_JSON (the same secret already used by
// the r0adkll/upload-google-play publish step) in the environment.
// Prints a single integer to STDOUT ONLY: 0 if the app has no releases yet
// on Play (e.g. a brand-new app), otherwise the highest versionCode found.
// Everything else — including the [track]'s diagnostic country-availability
// dump below — goes to stderr, so callers that capture stdout as "the
// version code" (see release-android.yml) are unaffected by it.
//
// The diagnostic exists because `countryTargeting` on a release (what
// r0adkll/upload-google-play could theoretically set, but doesn't) only
// applies to the production track per Google's own androidpublisher docs.
// A closed-testing track's actual country reach is a separate, track-level
// concept — Schema$TrackCountryAvailability, read via
// edits.countryavailability.get — which is what "Release in track
// targeting no countries" is actually about for a non-production track.
// Printing it here gives real data instead of guessing at Play Console
// state neither of us can otherwise see from here.

import { google } from "googleapis";

const [packageName, track] = process.argv.slice(2);

if (!packageName) {
  console.error(
    "Usage: node scripts/get-play-version-code.mjs <packageName> [track]",
  );
  process.exit(1);
}

const serviceAccountJson = process.env.PLAY_PUBLISHER_SERVICE_ACCOUNT_JSON;

if (!serviceAccountJson) {
  console.error("PLAY_PUBLISHER_SERVICE_ACCOUNT_JSON is required.");
  process.exit(1);
}

let credentials;
try {
  credentials = JSON.parse(serviceAccountJson);
} catch (error) {
  console.error(
    `PLAY_PUBLISHER_SERVICE_ACCOUNT_JSON is not valid JSON: ${error.message}`,
  );
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/androidpublisher"],
});

const androidpublisher = google.androidpublisher({ version: "v3", auth });

let editId;

try {
  const edit = await androidpublisher.edits.insert({ packageName });
  editId = edit.data.id;

  const { data } = await androidpublisher.edits.tracks.list({
    packageName,
    editId,
  });

  const versionCodes = (data.tracks ?? []).flatMap((track) =>
    (track.releases ?? []).flatMap((release) =>
      (release.versionCodes ?? []).map(Number),
    ),
  );

  const highest = versionCodes.length > 0 ? Math.max(...versionCodes) : 0;

  // Print every track this app has, not just the configured one -- a
  // package can have more tracks than PLAY_STORE_TRACK names (e.g. a
  // custom-named closed-testing track alongside an unused default "alpha"
  // one), and the workflow will silently keep publishing to the wrong one
  // if nobody ever compares them against what Play Console actually shows.
  for (const trackEntry of data.tracks ?? []) {
    console.error(
      `[diagnostic] ${packageName} all tracks — "${trackEntry.track}": ${JSON.stringify(trackEntry.releases ?? [])}`,
    );
  }

  if (track) {
    try {
      const { data: availability } =
        await androidpublisher.edits.countryavailability.get({
          packageName,
          editId,
          track,
        });
      console.error(
        `[diagnostic] ${packageName} track "${track}" country availability: ${JSON.stringify(availability)}`,
      );
    } catch (availabilityError) {
      console.error(
        `[diagnostic] Could not read country availability for ${packageName} track "${track}": ${availabilityError.message}`,
      );
    }

    const trackData = (data.tracks ?? []).find((t) => t.track === track);
    console.error(
      `[diagnostic] ${packageName} track "${track}" releases: ${JSON.stringify(trackData?.releases ?? [])}`,
    );
  }

  console.log(highest);
} catch (error) {
  const status = error?.response?.status ?? error?.code;

  // A brand-new app with nothing published yet returns 404 for tracks.list.
  // Treat that as "no existing versionCode" rather than a hard failure.
  if (status === 404) {
    console.log(0);
  } else {
    console.error(
      `Failed to read existing Play Console versionCodes for ${packageName}: ${error.message}`,
    );
    process.exit(1);
  }
} finally {
  if (editId) {
    // Best-effort cleanup — this edit only ever read data, it made no
    // changes, so a failure to delete it is not worth failing the build for.
    await androidpublisher.edits
      .delete({ packageName, editId })
      .catch(() => {});
  }
}
