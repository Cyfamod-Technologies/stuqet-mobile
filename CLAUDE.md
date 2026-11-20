# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working in this repository.

## Read this first

The full working agreement lives in **[AGENTS.md](AGENTS.md)** — project
overview, conventions, where code goes, the data/networking patterns, key paths,
and the pre-finish command checklist. Everything there applies to Claude; this
file only adds Claude-specific notes and does not repeat it. When the two
overlap, AGENTS.md wins. For setup, env vars, and scripts see
[docs/setup.md](docs/setup.md).

## Claude-specific guidance

- **Prefer editing existing files** over adding new ones; reach for the existing
  primitives (`src/components/ui`, `Screen`, `FormField`, `QUERY_KEYS`,
  `useThemeColors`, `cn`) before writing new abstractions. Release records under
  `docs/releases/` are the exception — see below.
- **Release records are append-only.** Every fix, change, or feature gets a
  brand-new record under `docs/releases/customer/` _and_ `docs/releases/vendor/`.
  Never edit a record that is already committed, not even to reword one line —
  it describes a build that already shipped. See
  [AGENTS.md](AGENTS.md#release-records) and
  [docs/releases/RELEASE_TEMPLATE.md](docs/releases/RELEASE_TEMPLATE.md).
- **Use the `~/*` import alias**, never deep relative paths.
- **Don't run destructive git or EAS commands.** Merging into `main` deploys
  preview and merging into `prod` deploys production — don't push to those
  branches; open a PR.
- When you change scripts, workflows, or the branch model, update
  [docs/dev.md](docs/dev.md) and the relevant docs in the same change.
- **Never add AI attribution to commits or PRs** — no `Co-Authored-By: Claude`
  trailer and no "Generated with …" lines. See [AGENTS.md](AGENTS.md#commits).
