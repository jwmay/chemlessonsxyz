---
description: Check tracked resources for Drive edits and bump the versions you approve
argument-hint: [unit, e.g. "Conceptual 0" — defaults to all tracked files]
allowed-tools: Bash(node:*), Bash(npm:*), Bash(git:*), Bash(python3:*), mcp__claude_ai_Google_Drive__get_file_metadata, mcp__claude_ai_Google_Drive__search_files
---

Run the resource version-tracking cycle: detect which site-account master copies
were edited in Drive, and bump the versions the user approves. NEVER auto-bump —
the user has final say on what counts as a real update.

Background: every resource copied into the site account starts at **v1** the
moment it's copied. State lives in `.build/versions.json`, keyed by each
resource's `copyUrl` file id (the exact file a teacher gets from "Make a copy").
`scripts/versions.mjs` does the diffing; Drive access is via the connector, so
only Claude can fetch the current modified times.

1. Confirm the Drive connector is signed into the SITE account
   `chemlessons.xyz@gmail.com` — search `owner = 'me'` and check the owner email.
   If it's a different account, STOP and tell the user to switch the connector.
2. Confirm the current branch is `dev`; if not, stop and tell the user.
3. Read the tracked file ids from `.build/versions.json` (its top-level keys).
   $ARGUMENTS may narrow to one unit — if so, keep only that unit's resources
   (match ids against `js/data.js`); otherwise check every tracked file.
4. For each tracked id, fetch its current Drive `modifiedTime` with
   `get_file_metadata` (set `excludeContentSnippets: true` to keep responses
   small). Write the results as `{ "<fileId>": "<modifiedTimeISO>", ... }` to a
   working `observed.json` in the scratchpad.
5. Run `node scripts/versions.mjs propose <observed.json>`. It lists files whose
   `modifiedTime` moved since their recorded baseline (update candidates), plus
   any untracked files.
6. Show the candidates to the user and let them choose which are REAL updates —
   a stray auto-save should not bump a version. If there are untracked files
   (newly added resources not yet seeded), offer to `seed` them at v1 instead.
7. Apply the user's decisions:
   - Approved bumps: `node scripts/versions.mjs apply <observed.json> <id> [<id> …]`
     (bumps the version, sets `updated` to today, and rewrites the version/updated
     fields in `js/data.js`).
   - New files to baseline: `node scripts/versions.mjs seed <observed.json>`.
8. Run `npm run check` (must pass).
9. Report the bumps (title, v→v, date). The user ships with `/ship` when ready.
