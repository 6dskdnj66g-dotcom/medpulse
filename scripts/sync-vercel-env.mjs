#!/usr/bin/env node
/**
 * One-shot Vercel env sync.
 *
 * Reads .env.local (or any file passed as argv[2]) and uploads every
 * variable to the linked Vercel project for one or more environments
 * (default: production + preview).
 *
 * Requirements:
 *   - `vercel` CLI on PATH (auto-installed via npx if missing)
 *   - The repo is linked: run `vercel link` once locally
 *   - Either: `vercel login` was run, OR VERCEL_TOKEN env var is set
 *
 * Usage:
 *   node scripts/sync-vercel-env.mjs                 # syncs .env.local
 *   node scripts/sync-vercel-env.mjs .env.production # syncs custom file
 *   ENVS=production node scripts/sync-vercel-env.mjs # production only
 *   DRY_RUN=1 node scripts/sync-vercel-env.mjs       # show what would happen
 *
 * Sensitive variables (anything not starting with NEXT_PUBLIC_) are uploaded
 * as Encrypted; public ones go in plaintext as Vercel does anyway.
 *
 * SAFE: existing values are first removed before being added so re-runs
 * always reflect the local file as the source of truth. Removal failures
 * (variable doesn't exist yet) are non-fatal.
 */

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const SOURCE_FILE = resolve(process.argv[2] ?? ".env.local");
const ENVS = (process.env.ENVS ?? "production,preview")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const DRY_RUN = ["1", "true", "yes"].includes(String(process.env.DRY_RUN).toLowerCase());

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function note(msg) {
  console.log(`  ${msg}`);
}

function parseEnvFile(path) {
  if (!existsSync(path)) fail(`File not found: ${path}`);
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  const vars = new Map();
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (value === "") continue; // skip placeholders
    // Strip wrapping quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars.set(key, value);
  }
  return vars;
}

function vercelCmd() {
  const direct = spawnSync("vercel", ["--version"], { stdio: "ignore" });
  if (direct.status === 0) return ["vercel"];
  return ["npx", "--yes", "vercel"];
}

function runVercel(cmd, args, opts = {}) {
  const r = spawnSync(cmd[0], [...cmd.slice(1), ...args], {
    stdio: opts.silent ? "pipe" : "inherit",
    input: opts.input,
    encoding: "utf8",
    env: { ...process.env },
  });
  return { status: r.status ?? 1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

function maskValue(v) {
  if (v.length <= 8) return "*".repeat(v.length);
  return v.slice(0, 3) + "*".repeat(v.length - 6) + v.slice(-3);
}

const vars = parseEnvFile(SOURCE_FILE);
if (vars.size === 0) {
  fail(`No variables in ${SOURCE_FILE}`);
}

console.log(`\nSyncing ${vars.size} variable(s) from ${SOURCE_FILE}`);
console.log(`Target env(s): ${ENVS.join(", ")}`);
if (DRY_RUN) console.log("DRY RUN — no changes will be made.");
console.log();

const cli = vercelCmd();
console.log(`Using: ${cli.join(" ")}\n`);

for (const [key, value] of vars) {
  console.log(`• ${key} (${maskValue(value)})`);
  if (DRY_RUN) {
    note("would remove old value, then add fresh.");
    continue;
  }

  for (const env of ENVS) {
    // Remove existing — ignore failure (means it didn't exist).
    runVercel(cli, ["env", "rm", key, env, "--yes"], { silent: true });

    const add = runVercel(cli, ["env", "add", key, env], {
      input: value + "\n",
    });
    if (add.status !== 0) {
      console.error(`  ✗ failed to set ${key} for ${env}`);
      process.exit(add.status);
    }
    note(`✓ set in ${env}`);
  }
}

console.log("\nDone. Trigger a redeploy for changes to take effect:");
console.log("  vercel --prod      # production");
console.log("  git push           # auto-deploy via Vercel/GitHub integration");
