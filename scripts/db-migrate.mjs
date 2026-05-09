#!/usr/bin/env node
/**
 * One-shot migration runner.
 *
 * Tries paths in this order, stopping at the first one that works:
 *   1. `psql` on PATH + DATABASE_URL  -> runs migrations directly
 *   2. `supabase` CLI on PATH         -> `supabase db push`
 *   3. `npx supabase`                 -> same, without global install
 *   4. Manual copy-paste              -> prints the SQL with instructions
 *
 * Usage:
 *   # Easiest:
 *   export DATABASE_URL='postgres://postgres:<pwd>@db.<ref>.supabase.co:5432/postgres'
 *   node scripts/db-migrate.mjs
 *
 *   # Or fall through to copy-paste mode:
 *   node scripts/db-migrate.mjs
 */

import { readdirSync, readFileSync } from "node:fs";
import { execSync, spawnSync } from "node:child_process";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = resolve(__dirname, "..", "supabase", "migrations");

function listMigrations() {
  return readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith(".sql"))
    .sort();
}

function hasOnPath(cmd) {
  try {
    execSync(`${process.platform === "win32" ? "where" : "command -v"} ${cmd}`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function runPsql(databaseUrl, files) {
  console.log("→ Using psql");
  for (const f of files) {
    const full = join(MIGRATIONS_DIR, f);
    console.log(`  applying ${f}...`);
    const r = spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", full], {
      stdio: "inherit",
    });
    if (r.status !== 0) {
      console.error(`  ✗ ${f} failed`);
      process.exit(r.status ?? 1);
    }
    console.log(`  ✓ ${f}`);
  }
  console.log("\nAll migrations applied.");
}

function runSupabaseCli() {
  console.log("→ Using supabase CLI");
  const r = spawnSync("supabase", ["db", "push"], { stdio: "inherit" });
  if (r.status !== 0) {
    console.error("supabase db push failed.");
    process.exit(r.status ?? 1);
  }
}

function runSupabaseNpx() {
  console.log("→ Using npx supabase");
  const r = spawnSync("npx", ["--yes", "supabase", "db", "push"], { stdio: "inherit" });
  if (r.status !== 0) {
    console.error("npx supabase db push failed.");
    process.exit(r.status ?? 1);
  }
}

function printManualInstructions(files) {
  console.log("\n========================================================");
  console.log(" MANUAL MODE — no DATABASE_URL and no supabase CLI found.");
  console.log("========================================================\n");
  console.log("Easiest path:");
  console.log("  1. Open  https://supabase.com/dashboard");
  console.log("  2. Select your project → SQL Editor → + New query");
  console.log("  3. Paste the SQL below and click Run\n");

  for (const f of files) {
    console.log(`────── ${f} ──────`);
    console.log(readFileSync(join(MIGRATIONS_DIR, f), "utf8"));
    console.log();
  }

  console.log("Alternatively, set DATABASE_URL and re-run this script:");
  console.log("  export DATABASE_URL='postgres://postgres:<pwd>@db.<ref>.supabase.co:5432/postgres'");
  console.log("  node scripts/db-migrate.mjs\n");
}

const files = listMigrations();
if (files.length === 0) {
  console.log("No migrations found in supabase/migrations/. Nothing to do.");
  process.exit(0);
}

console.log(`Found ${files.length} migration(s):\n  ${files.join("\n  ")}\n`);

const dbUrl = process.env.DATABASE_URL;

if (dbUrl && hasOnPath("psql")) {
  runPsql(dbUrl, files);
  process.exit(0);
}

if (hasOnPath("supabase")) {
  runSupabaseCli();
  process.exit(0);
}

if (hasOnPath("npx")) {
  // Best-effort — only works if the project has been `supabase link`-ed.
  try {
    runSupabaseNpx();
    process.exit(0);
  } catch {
    // fall through to manual
  }
}

printManualInstructions(files);
