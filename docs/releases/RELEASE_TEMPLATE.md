# Mobile Release Record Template

Use this template for every Stuqet mobile release that is prepared for internal testing, closed testing, App Store review, Play Store review, or production.

This file is the internal release record. It is not the same as the public store release notes.

## How to Use This Template

1. Copy this file into the folder for the app being released — `docs/releases/customer/` or `docs/releases/vendor/`.
2. Rename the copied file using the release naming convention below.
3. Fill in every section before the build is submitted to a store track.
4. Commit the release record in the same PR as the release preparation work, or in a dedicated release-record PR if the build is prepared separately.
5. Use the public store notes section as the source for Play Store/App Store "What's new" text.

## Where Release Records Live

Records are filed per app, because the Customer and Vendor apps version and ship
independently — each has its own Play Store listing and its own build-number
sequence:

```text
docs/releases/
├── RELEASE_TEMPLATE.md
├── customer/
│   └── v<version>-b<build-number>-<YYYYMMDD>.md
└── vendor/
    └── v<version>-b<build-number>-<YYYYMMDD>.md
```

A build number must be unique within its app's folder, not across both. The
same version and build number appearing under `customer/` and `vendor/` is
expected and is not a collision.

When one change ships to both apps, write a record in each folder rather than
one shared record, so each store upload has exactly one record to point at.

## Release Naming Convention

Release records must use this filename format:

```text
v<version>-b<build-number>-<YYYYMMDD>.md
```

Example shape:

```text
v1.0.21-b22-20260729.md
```

The release name inside the file must match the filename without `.md`:

```text
v1.0.21-b22-20260729
```

Use these fields consistently:

- `Version` maps to the public app version shown to users, for example `1.0.21`.
- `Build Number` maps to Android `versionCode` and iOS build number, for example `22`.
- `Release Name` combines the public version, build number, and build date for internal tracking.

## Versioning Rules

- The version should use semantic versioning: `MAJOR.MINOR.PATCH`.
- Increase `PATCH` for bug fixes and small safe updates.
- Increase `MINOR` for new user-facing functionality.
- Increase `MAJOR` for major product changes or breaking changes.
- The build number must increase for every store upload, even if the public version stays the same.
- Do not reuse a build number after it has been uploaded to Play Store or App Store Connect.

## Release Record

### Release Name

`v<version>-b<build-number>-<YYYYMMDD>`

### App

`Stuqet Customer` / `Stuqet Vendor`

### Platform

`Android` / `iOS` / `Android and iOS`

### Store Track

`Internal testing` / `Closed testing` / `Production` / `App Store TestFlight` / `App Store Review`

### Version

`<MAJOR.MINOR.PATCH>`

### Build Number

`<integer>`

### Build Date

`<YYYY-MM-DD>`

### Release Owner

`<name or team>`

### Approval Status

`Draft` / `Ready for QA` / `Approved for Store Upload` / `Submitted` / `Released`

### Summary

`<One clear sentence describing the purpose of this release.>`

### User-Facing Changes

- `<List changes that testers or users can see or use.>`

### Bug Fixes

- `<List user-impacting bugs fixed in this release.>`

### Security, Privacy, and Compliance

- `<List auth, permission, privacy policy, analytics, crash reporting, data safety, account, or data deletion changes.>`
- `<Write "No security, privacy, or compliance changes" only if this was checked.>`

### Store Listing Impact

- App name changed: `Yes` / `No`
- App icon changed: `Yes` / `No`
- Screenshots changed: `Yes` / `No`
- Feature graphic changed: `Yes` / `No`
- Description changed: `Yes` / `No`
- Privacy policy URL changed: `Yes` / `No`
- Play Store Data Safety / App Store Privacy answers changed: `Yes` / `No`

### Testing Scope

- `<List the flows QA/testers must verify before this release is approved.>`

### Known Issues

- `<List accepted issues that remain in this release.>`
- `<Write "No known issues" only if this was checked.>`

### Rollback Notes

- Previous stable release: `<release name or build number>`
- Rollback instructions: `<what to do if this release must be withdrawn or replaced>`

## Public Store Release Notes

Use this section for the short "What's new" text shown to testers/users in Play Store or App Store.

Keep it short, user-facing, and accurate. Do not include internal ticket numbers, developer-only language, or features that are not available in the build.

```text
<Public release notes go here.>
```
