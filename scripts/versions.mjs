#!/usr/bin/env node
/* ==========================================================================
   Resource version tracking for chemlessons.xyz
   --------------------------------------------------------------------------
   Every resource copied into the site account starts at v1 the moment it's
   copied. When Dr. May edits a master copy in Drive, its Drive `modifiedTime`
   advances past the baseline we recorded — that's the signal for a new version.

   State lives in `.build/versions.json`, keyed by the copy-source file id (the
   id in each resource's `copyUrl` — i.e. the exact file a teacher gets when
   they click "Make a copy"). Each entry:
     { title, version, modified, updated, history: [{version, date}] }
       modified = the Drive modifiedTime we last recorded (the diff baseline)
       updated  = the date (YYYY-MM-DD) the current version was published

   Drive access lives with the connector (Claude), NOT this script, so the
   caller supplies an "observed" map { fileId: modifiedTimeISO } fetched via
   the connector. This script does the deterministic diff / bump / data.js sync.

   Commands:
     seed <observed.json>              first run — create v1 for every tracked
                                       file (baseline = observed modifiedTime)
     propose <observed.json>           list files whose modifiedTime moved
                                       since the recorded baseline (candidates)
     apply <observed.json> <id ...>    bump ONLY the given file ids to the next
                                       version (this is your approval gate)

   `seed` and `apply` also rewrite the version/updated fields in js/data.js.
   ========================================================================== */

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const DATA = new URL("../js/data.js", import.meta.url);
const STATE = new URL("../.build/versions.json", import.meta.url);

const today = () => new Date().toISOString().slice(0, 10);
const loadState = () => (existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {});
const saveState = (s) => writeFileSync(STATE, JSON.stringify(s, null, 2) + "\n");
const loadObserved = (p) => JSON.parse(readFileSync(p, "utf8")); // { fileId: modifiedTimeISO }

// Pull the current title for a copy-source id straight from data.js, so the
// state file's labels never drift from the site.
function titlesFromData() {
  const src = readFileSync(DATA, "utf8");
  const out = {};
  for (const line of src.split("\n")) {
    const t = /title: "([^"]*)"/.exec(line);
    const c = /copyUrl: "https:\/\/[^"]*\/d\/([^/"]+)\//.exec(line);
    if (t && c) out[c[1]] = t[1];
  }
  return out;
}

// Write version/updated into every data.js resource line whose copyUrl points
// at a tracked file (a resource shared across both courses is matched twice).
function syncData(state) {
  const src = readFileSync(DATA, "utf8");
  let touched = 0;
  const lines = src.split("\n").map((line) => {
    const c = /copyUrl: "https:\/\/[^"]*\/d\/([^/"]+)\//.exec(line);
    if (!c || !state[c[1]]) return line;
    const { version, updated } = state[c[1]];
    let out = line.replace(/, version: \d+, updated: "[^"]*"/, ""); // idempotent
    out = out.replace(/(copyUrl: "[^"]*")/, `$1, version: ${version}, updated: "${updated}"`);
    touched++;
    return out;
  });
  writeFileSync(DATA, lines.join("\n"));
  return touched;
}

function seed(observedPath) {
  const observed = loadObserved(observedPath);
  const titles = titlesFromData();
  const state = loadState();
  let added = 0;
  for (const [id, modified] of Object.entries(observed)) {
    if (state[id]) continue; // never re-seed an already-tracked file
    state[id] = {
      title: titles[id] || "(unknown)",
      version: 1,
      modified,
      updated: today(),
      history: [{ version: 1, date: today() }],
    };
    added++;
  }
  saveState(state);
  const touched = syncData(state);
  console.log(`seeded ${added} new file(s) at v1; wrote version/updated to ${touched} data.js line(s)`);
}

function propose(observedPath) {
  const observed = loadObserved(observedPath);
  const state = loadState();
  const titles = titlesFromData();
  const changed = [];
  const untracked = [];
  for (const [id, modified] of Object.entries(observed)) {
    if (!state[id]) untracked.push({ id, title: titles[id] || "(unknown)" });
    else if (modified !== state[id].modified) changed.push({ id, ...state[id], now: modified });
  }
  if (!changed.length && !untracked.length) {
    console.log("No changes: every tracked file's modifiedTime matches its baseline.");
    return;
  }
  if (changed.length) {
    console.log(`Proposed updates (${changed.length}) — modifiedTime moved since the recorded baseline:\n`);
    for (const c of changed) {
      console.log(`  ${c.title}`);
      console.log(`    v${c.version} -> v${c.version + 1}   baseline ${c.modified}  ->  now ${c.now}`);
      console.log(`    id: ${c.id}\n`);
    }
    console.log("Approve the real ones, then run:");
    console.log(`  node scripts/versions.mjs apply ${observedPath} <id> [<id> ...]`);
  }
  if (untracked.length) {
    console.log(`\nUntracked files (${untracked.length}) — run \`seed\` to start them at v1:`);
    untracked.forEach((u) => console.log(`  ${u.title}  (${u.id})`));
  }
}

function apply(observedPath, ids) {
  const observed = loadObserved(observedPath);
  const state = loadState();
  const d = today();
  let bumped = 0;
  for (const id of ids) {
    if (!state[id]) { console.warn(`skip ${id}: not tracked (seed it first)`); continue; }
    if (!observed[id]) { console.warn(`skip ${id}: no observed modifiedTime supplied`); continue; }
    state[id].version += 1;
    state[id].modified = observed[id];
    state[id].updated = d;
    state[id].history.push({ version: state[id].version, date: d });
    console.log(`bumped "${state[id].title}" -> v${state[id].version} (${d})`);
    bumped++;
  }
  saveState(state);
  const touched = syncData(state);
  console.log(`applied ${bumped} bump(s); rewrote ${touched} data.js line(s)`);
}

// Acknowledge an edit WITHOUT bumping: advance the recorded baseline to the
// observed modifiedTime (so it stops showing as a candidate) and refresh the
// state label from data.js. The version and data.js are left untouched. Use
// this when you decide a change isn't a real "new version" (a rename, a typo
// fix, finalizing touches on a just-published file).
function dismiss(observedPath, ids) {
  const observed = loadObserved(observedPath);
  const state = loadState();
  const titles = titlesFromData();
  let updated = 0;
  for (const id of ids) {
    if (!state[id]) { console.warn(`skip ${id}: not tracked (seed it first)`); continue; }
    if (!observed[id]) { console.warn(`skip ${id}: no observed modifiedTime supplied`); continue; }
    state[id].modified = observed[id];
    if (titles[id]) state[id].title = titles[id];
    console.log(`dismissed "${state[id].title}" — baseline -> ${observed[id]} (still v${state[id].version})`);
    updated++;
  }
  saveState(state);
  console.log(`re-baselined ${updated} file(s); no version bumped, js/data.js unchanged`);
}

const [cmd, observedPath, ...rest] = process.argv.slice(2);
if (cmd === "seed" && observedPath) seed(observedPath);
else if (cmd === "propose" && observedPath) propose(observedPath);
else if (cmd === "apply" && observedPath && rest.length) apply(observedPath, rest);
else if (cmd === "dismiss" && observedPath && rest.length) dismiss(observedPath, rest);
else {
  console.log("usage:");
  console.log("  node scripts/versions.mjs seed    <observed.json>");
  console.log("  node scripts/versions.mjs propose <observed.json>");
  console.log("  node scripts/versions.mjs apply   <observed.json> <fileId> [<fileId> ...]");
  console.log("  node scripts/versions.mjs dismiss <observed.json> <fileId> [<fileId> ...]");
  process.exit(1);
}
