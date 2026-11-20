#!/usr/bin/env python3
"""Posts one dev-APK-build Discord message for a single matrix leg
(customer or vendor). Called directly from dev-android-apk-distribution.yml
-- each build job posts its own result, so there's nothing to relay
between jobs, and nothing here can go missing in an artifact relay.

NOTIFY_MODE selects which of the three messages to build: success,
failure, or cancelled. A failure to actually reach Discord (a webhook
hiccup, a timeout) is reported as a GitHub warning annotation and a
non-zero exit -- the caller runs this with continue-on-error: true, so
that never takes the real build/upload down with it.
"""
import json
import os
import re
import sys
import urllib.error
import urllib.request


def parse_mib(value):
    # Accepts values like "362MiB", "7.8Gi", "7.8G" -- returns None
    # (rather than raising) for anything unparseable, so a stat we can't
    # relate to anything just gets omitted, not crash the notification.
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


def build_content(mode, route, tag, branch):
    if mode == "success":
        apk_url = os.environ["APK_URL"]
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
            "🚀 **Dev Android APK ready for testing**\n"
            "\n"
            f"**{route} APK:** {apk_url}\n"
            "\n"
            f"Branch: `{branch}`\n"
            f"Runner: `self-hosted` ({cpu_cores} CPU cores, {memory_total} RAM)\n"
            f"Build time: {elapsed} | Peak memory: {memory_part}\n"
            f"Disk available before build: {disk_available}\n"
            f"Run logs: {run_url()}"
        )

    if mode == "failure":
        return (
            f"{tag}\n"
            "🚨 **Dev Android APK build failed**\n"
            f"Branch: `{branch}`\n"
            f"Run logs: {run_url()}\n"
            "Please check the failed step before sharing this APK."
        )

    if mode == "cancelled":
        return (
            f"{tag}\n"
            "⏹️ **Dev Android APK build cancelled**\n"
            f"Branch: `{branch}`\n"
            f"Run logs: {run_url()}\n"
            "This run was deliberately cancelled -- nothing failed."
        )

    raise ValueError(f"unknown NOTIFY_MODE: {mode!r}")


def main():
    webhook = os.environ.get("DISCORD_BUILD_WEBHOOK_URL")
    if not webhook:
        print("DISCORD_BUILD_WEBHOOK_URL secret is not configured; skipping Discord notification.")
        return 0

    route = os.environ["ROUTE"].capitalize()
    short_sha = os.environ["SHORT_SHA"][:7]
    tag = f"📦 Build `{short_sha}` — {route}"
    content = build_content(os.environ["NOTIFY_MODE"], route, tag, os.environ["BRANCH_NAME"])

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
