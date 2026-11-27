// DealSleuth hand-in program (Node 22, standard library only).
//
// What it does: takes this repository's deal-finder site (app/) and its
// screenshots (screenshots/), copies them into the output directory, and
// writes the dossier.json the make.fun judge reads, using the vendored
// make.fun library. It writes nothing else and reads nothing outside
// this repository, so running it twice produces byte-identical output.
//
// Run it outside the grader with MAKEFUN_OUTPUT_DIR pointing at a
// directory, e.g.:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Inside the grader the output directory is /output.

import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const SOURCE_DIR = fileURLToPath(new URL(".", import.meta.url));
const OUTPUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

const APP_DIR = join(SOURCE_DIR, "app");
const SHOTS_DIR = join(SOURCE_DIR, "screenshots");
const DOSSIER_FILE = join(OUTPUT_DIR, "dossier.json");

// The caps the scorer enforces on this competition's hand-in. They are
// passed straight to the dossier builder, which refuses anything past
// them instead of writing a dossier the gate would reject.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
} as const;

function fail(message: string): never {
  throw new Error(`main.ts: ${message}`);
}

function countEntries(dir: string): number {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    total += 1;
    if (statSync(path).isDirectory()) total += countEntries(path);
  }
  return total;
}

function checkInputs(): void {
  if (!existsSync(join(APP_DIR, "index.html"))) {
    fail("app/index.html is missing; the site cannot be handed in.");
  }
  if (!existsSync(SHOTS_DIR)) {
    fail("screenshots/ is missing; the hand-in needs 3 or 4 screenshots.");
  }
  const shots = readdirSync(SHOTS_DIR).filter((name) => !name.startsWith("."));
  if (shots.length < 3 || shots.length > 4) {
    fail(`screenshots/ holds ${shots.length} files; the hand-in needs 3 or 4.`);
  }
  const appEntries = countEntries(APP_DIR);
  if (appEntries > DOSSIER_CAPS.app_max_files) {
    fail(`app/ holds ${appEntries} entries; the cap is ${DOSSIER_CAPS.app_max_files}.`);
  }
}

function copyTree(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true, dereference: true });
}

function handIn(): void {
  checkInputs();
  mkdirSync(OUTPUT_DIR, { recursive: true });
  copyTree(APP_DIR, join(OUTPUT_DIR, "app"));
  copyTree(SHOTS_DIR, join(OUTPUT_DIR, "screenshots"));

  // The dossier must be byte for byte what the vendored library writes
  // from the copied files, so it is built from the output directory,
  // after the copies, never from the source tree.
  const dossier = buildDossier(OUTPUT_DIR, DOSSIER_CAPS);
  writeFileSync(DOSSIER_FILE, dossier);

  // Confirm the hand-in is complete before reporting success: the site
  // must be present in the output and the dossier must be non-empty.
  if (!existsSync(join(OUTPUT_DIR, "app", "index.html"))) {
    fail("app/index.html did not reach the output directory.");
  }
  if (dossier.length === 0) {
    fail("dossier.json was written empty.");
  }
  console.log(
    `DealSleuth hand-in written to ${OUTPUT_DIR} ` +
      `(app/ + ${readdirSync(SHOTS_DIR).length} screenshots + dossier.json, ` +
      `${dossier.length} bytes).`,
  );
}

handIn();
