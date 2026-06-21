#!/usr/bin/env node
/**
 * Quick health check for local dev issues.
 * Run: node scripts/health-check.mjs
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const prismaClient = join(root, "node_modules/.prisma/client/index.d.ts");
const schema = readFileSync(join(root, "prisma/schema.prisma"), "utf8");

let exitCode = 0;

function pass(msg) {
  console.log(`✓ ${msg}`);
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  exitCode = 1;
}

if (!existsSync(prismaClient)) {
  fail("Prisma client not generated — run: npx prisma generate");
} else {
  const client = readFileSync(prismaClient, "utf8");
  if (client.includes("stripeSessionId")) {
    fail("Stale Prisma client still references stripeSessionId — stop dev server, run: npx prisma generate");
  } else if (schema.includes("paymentReference") && !client.includes("paymentReference")) {
    fail("Prisma client out of sync with schema — stop dev server, run: npx prisma generate");
  } else {
    pass("Prisma client matches current schema");
  }
}

try {
  execSync("npx tsx -e \"import { getAdminAnalytics } from './lib/admin-analytics.ts'; getAdminAnalytics().then(() => console.log('analytics-ok'))\"", {
    cwd: root,
    stdio: "pipe",
    encoding: "utf8",
  });
  pass("Admin analytics queries succeed");
} catch (error) {
  fail(`Admin analytics failed: ${error.stdout || error.stderr || error.message}`);
}

try {
  execSync("npm run build", { cwd: root, stdio: "pipe", encoding: "utf8" });
  pass("Production build succeeds");
} catch (error) {
  fail("Production build failed — run: npm run build");
}

if (exitCode === 0) {
  console.log("\nIf /admin still fails in the browser, restart the dev server:");
  console.log("  Ctrl+C in the terminal running npm run dev");
  console.log("  npm run dev");
}

process.exit(exitCode);
