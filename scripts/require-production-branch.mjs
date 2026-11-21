import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function requireProductionBranch() {
  const branch =
    process.env.GITHUB_ACTIONS === "true"
      ? process.env.GITHUB_REF === "refs/heads/prod"
        ? "prod"
        : (process.env.GITHUB_REF ?? "unknown")
      : spawnSync("git", ["branch", "--show-current"], {
          cwd: projectRoot,
          encoding: "utf8",
        }).stdout?.trim();

  if (branch !== "prod") {
    console.error(
      `Production builds are only allowed from the prod branch (current: ${branch || "detached HEAD"}).`,
    );
    process.exit(1);
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  requireProductionBranch();
}
