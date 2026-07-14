---
description: Copy a unit's approved resources into Drive and wire them into the site
argument-hint: <course> <unit #> (e.g. "Conceptual 1" or "Mathematical 3")
allowed-tools: Bash(node:*), Bash(npm:*), Bash(git:*), Bash(python3:*), mcp__claude_ai_Google_Drive__search_files, mcp__claude_ai_Google_Drive__read_file_content, mcp__claude_ai_Google_Drive__get_file_metadata, mcp__claude_ai_Google_Drive__copy_file, mcp__claude_ai_Google_Drive__create_file
---

Copy a unit's approved resources into the site-account Drive and wire them into
the site, following the established content flow. $ARGUMENTS names the course and
unit (e.g. "Conceptual 1"); ask (AskUserQuestion) if unclear.

**Read the project memory first** — it holds the review-sheet ids, the Drive
folder ids (reuse them; don't recreate the trees), and the naming/link
conventions. `.build/mapping-master.csv` maps every RowID to the original Drive
file ids; `.build/copy-manifest.csv` records old id → new id for every copy.

1. Confirm the Drive connector is signed into `chemlessons.xyz@gmail.com` (search
   `owner = 'me'`, check owner email). If not, STOP and tell the user to switch.
2. Confirm the current branch is `dev`.
3. Read the mapping sheet for that course (ids in memory) with
   `read_file_content`; parse the target unit's rows. Reconcile against
   `.build/mapping-master.csv` by RowID — **the sheet's edits win**. Skip rows
   with Include = "no" or "REVIEW" (report the counts). Report a reconciliation
   summary BEFORE copying anything.
4. Ensure the folder tree exists (reuse the ids in memory; create a
   `Unit NN — <name>` folder where needed):
   `chemlessons.xyz — Public/<Course>/…` and
   `chemlessons.xyz — Educators Only/<Course>/…`. Semester-final material goes in
   a `Semester Finals` folder per course.
5. Copy each approved file with `copy_file` into its folder using a clean name:
   `U## · <Kind> · <Title>` (keep the LG/U numbering as the unit number). Copy
   BOTH formats of a Doc+PDF pair. Append every old id → new id to
   `.build/copy-manifest.csv`. Verify counts per unit; report failures rather
   than skipping silently. Never move or modify originals.
6. If the Public folder isn't shared "Anyone with the link – Viewer" yet, STOP
   and remind the user — otherwise the links and hover/card thumbnails 403.
7. Wire `js/data.js`: add or extend the unit (`id: "<course>-unit-<n>"`, `num`,
   `symbol`, `semester`, `title`, `weeks`, `description`, `topics`, `resources`).
   Link formats from the NEW file ids:
   - Google-native → `url` = `/preview`, `copyUrl` = `/copy`
   - Binary (PDF) → `url` = `.../file/d/<id>/view`
   - Doc+PDF pair → `url` = PDF `/view`, `copyUrl` = native `/copy`
   Educators-only assessments: list them but leave `url` "" (the lock-note UI
   gates them). Honors variants get "(Honors)" in the title. A shared unit (e.g.
   Unit 0 Classroom Procedures) is identical in both courses — mirror it.
8. Seed versions for the new resources: fetch the new copy-source ids'
   `modifiedTime`s (`get_file_metadata`, `excludeContentSnippets: true`) → write
   `observed.json` → `node scripts/versions.mjs seed <observed.json>` (bakes v1
   and the version/updated fields into `js/data.js`).
9. Verify: `node --check js/data.js`, `npm run check`, then serve locally and
   screenshot both course views (headless Chrome clamps below 500px CSS unless
   you use `--force-device-scale-factor`). Report anything unresolved as a list.
10. The user ships with `/ship`.
