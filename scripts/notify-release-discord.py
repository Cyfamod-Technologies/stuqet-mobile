#!/usr/bin/env python3
"""Posts one Play Store release Discord message for a single matrix leg
(customer or vendor). Called directly from release-android.yml -- each
build job posts its own result, so there's nothing to relay between jobs.

NOTIFY_MODE selects the message: success, failure, or cancelled.
IS_PREFLIGHT further splits "success" into "preflight passed" (no AAB
built or submitted) vs "submitted" (a real release). Mismatch info, if
any, is read directly from the local version-mismatch file this job's
own build already wrote -- no artifact upload/download needed to relay
it anymore either.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request


def parse_mib(value):
    match = re.match(r"([\d.]+)\s*([GgMm])i?B?$", value.strip())
    if not match:
        return None
    amount, unit = float(match.group(1)), match.group(2).upper()
    return amount * 1024 if unit == "G" else amount


def run_url():
    return (
        f"{os.environ['GITHUB_SERVER_URL']}/"
        f"{os.environ['GITHUB_REPOSITORY']}/actions/runs/"
        f"{os.environ['GITHUB_RUN_ID']}"
    )


def location_line():
    # A PR link is strictly more useful than a branch name (one click gets
    # the diff, description, and checks), but only exists for
    # pull_request-triggered runs -- workflow_dispatch runs have no PR.
    pr_url = os.environ.get("PR_URL", "").strip()
    if pr_url:
        return f"PR: {pr_url}\n"
    return f"Branch: `{os.environ['BRANCH_NAME']}`\n"


def mismatch_section(route):
    # scripts/build-android.mjs writes this file only when it detects the
    # docs/releases filename doesn't match the versionCode Play actually
    # required -- reading it directly here, since this step already runs
    # in the same job that wrote it. No relay needed for this anymore.
    path = f"local-builds/android/version-mismatch-{route}.json"
    if not os.path.exists(path):
        return ""
    with open(path, encoding="utf-8") as f:
        info = json.load(f)
    return (
        "\n\n⚠️ **Release-notes/versionCode mismatch**: docs/releases says "
        f"build {info['documentedBuildNumber']}, but this shipped as "
        f"versionCode {info['actualVersionCode']} (Play's prior highest was "
        f"{info['playMaxVersionCode']}). Update docs/releases/{route}/ to "
        "match once you've confirmed the number that shipped."
    )


def version_publish_section(route):
    # scripts/publish-app-version.mjs writes this file after Play accepts a
    # build, recording which backends took the new versionCode and which
    # didn't. Read directly here, same in-job hand-off as mismatch_section().
    #
    # It matters most on the failure path: without it, a run where Play
    # published fine and only this endpoint update failed would announce
    # itself as "release failed", sending someone to re-run a release that
    # already shipped.
    path = f"local-builds/android/version-publish-{route}.json"
    if not os.path.exists(path):
        return ""
    with open(path, encoding="utf-8") as f:
        info = json.load(f)

    published = info.get("published", [])
    failed = info.get("failed", [])

    if not failed:
        return (
            f"\nVersion endpoint: updated to build {info['build']} on "
            f"{len(published)} deployment(s)."
        )

    hosts = ", ".join(f"`{item['baseUrl']}`" for item in failed)
    return (
        "\n\n⚠️ **The release IS published to Play** -- only the version "
        f"endpoint update failed, on {hosts}. Until it is set to build "
        f"{info['build']}, the in-app update prompt stays silent for those "
        "users. Re-run that step, or POST the number by hand -- re-sending "
        "the same value is a safe no-op."
    )


def build_content(mode, is_preflight, route, tag):
    branch_or_pr = location_line()

    if mode == "cancelled":
        return (
            f"{tag}\n"
            "⏹️ **Play Store Android release cancelled**\n"
            f"{branch_or_pr}"
            f"Run logs: {run_url()}\n"
            "This run was deliberately cancelled -- nothing failed."
        )

    if mode == "failure":
        title = "🚨 **Play Store Android release preflight failed**" if is_preflight else "🚨 **Play Store Android release failed**"
        return (
            f"{tag}\n"
            f"{title}\n"
            f"{branch_or_pr}"
            f"Run logs: {run_url()}\n"
            "Please check the failed step before retrying."
            f"{version_publish_section(route)}"
        )

    # mode == "success"
    if is_preflight:
        return (
            f"{tag}\n"
            "✅ **Play Store Android release preflight passed**\n"
            "Checked: required secrets, Play track, and upload-key SHA1 "
            "fingerprint. No AAB was built or "
            "submitted.\n"
            f"{branch_or_pr}"
            f"Run logs: {run_url()}"
        )

    elapsed = os.environ.get("ELAPSED") or "unavailable"
    max_rss = os.environ.get("MAX_RSS") or "unavailable"
    memory_total = os.environ.get("MEMORY_TOTAL") or "unavailable"
    cpu_cores = os.environ.get("CPU_CORES") or "unavailable"
    disk_available = os.environ.get("DISK_AVAILABLE") or "unavailable"

    memory_part = max_rss
    if max_rss != "unavailable" and memory_total != "unavailable":
        peak_mib = parse_mib(max_rss)
        total_mib = parse_mib(memory_total)
        if peak_mib is not None and total_mib:
            percent = round(peak_mib / total_mib * 100)
            memory_part = f"{max_rss} ({percent}% of {memory_total})"

    return (
        f"{tag}\n"
        "🚀 **Play Store Android release submitted**\n"
        f"Track: `{os.environ['TRACK']}`\n"
        f"Build time: {elapsed} | Peak memory: {memory_part}\n"
        f"Runner: `github-hosted` ({cpu_cores} CPU cores, {memory_total} RAM)\n"
        f"Disk available before build: {disk_available}\n"
        f"{branch_or_pr}"
        f"Run logs: {run_url()}"
        f"{version_publish_section(route)}"
        f"{mismatch_section(route)}"
    )


def main():
    webhook = os.environ.get("DISCORD_BUILD_WEBHOOK_URL")
    if not webhook:
        print("DISCORD_BUILD_WEBHOOK_URL secret is not configured; skipping Discord notification.")
        return 0

    route = os.environ["ROUTE"].capitalize()
    short_sha = os.environ["SHORT_SHA"][:7]
    tag = f"📦 Release `{short_sha}` — {route}"
    is_preflight = os.environ.get("IS_PREFLIGHT") == "true"
    content = build_content(os.environ["NOTIFY_MODE"], is_preflight, os.environ["ROUTE"], tag)

    request = urllib.request.Request(
        webhook,
        data=json.dumps({"content": content}).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Stuqet-Build-Bot/1.0",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            if response.status >= 300:
                print(f"::warning::Discord notification failed with HTTP {response.status}")
                return 1
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        print(f"::warning::Discord notification failed with HTTP {error.code}: {body}")
        return 1
    except urllib.error.URLError as error:
        print(f"::warning::Discord notification failed: {error.reason}")
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
