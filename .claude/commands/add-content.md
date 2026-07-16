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
   `.build/mapping-master.csv` by RowID — **the sheet's edits win**. Skip only
   rows with Include = "no". Rows marked "REVIEW" ARE still copied, but into
   staging and never published (see step 5). Report a reconciliation summary
   (published / direct-published / staged-for-review / skipped counts) BEFORE
   copying anything.
   - **Direct-publish rows** (`Flags` = `direct-publish`, `Published id` column
     set) were uploaded straight into the final site tree by the import add-on
     (`scripts/mapping-import.gs`). They have NEW RowIDs that are NOT in
     `mapping-master.csv` — that's expected; use the ids already in the sheet
     (`Published id` / `View file id` / `Copy file id`), don't try to join the
     master. Do NOT re-copy them (step 5); just wire + version them (steps 7–8).
4. Ensure the folder tree exists (reuse the ids in memory; create a
   `Unit NN — <name>` folder where needed):
   `chemlessons.xyz — Public/<Course>/…` and
   `chemlessons.xyz — Educators Only/<Course>/…`. Semester-final material goes in
   a `Semester Finals` folder per course. (Both `Mathematical Chemistry` course
   folders already exist — ids in memory.)
   - **Shared unit (e.g. Unit 0 Classroom Procedures):** its files live ONCE,
     under whichever course first received them. Do NOT re-copy them into the
     other course — instead add a Drive **shortcut** to that existing
     `Unit NN — …` folder inside the other course's folder. The connector can't
     create shortcuts, so this is a one-time manual step for the user; note it in
     the final report.
5. Copy each file with `copy_file`, choosing its name + destination by status
   (keep the LG/U numbering as the unit number; copy BOTH formats of a Doc+PDF
   pair). **Skip direct-publish rows entirely** — their file already lives in the
   final folder with the final id; instead append a manifest row with Role
   `direct` and Old id = New id = `Published id`, then move on to step 7:
   - **Approved** (Include = "yes"): name `U## · <Kind> · <Title>`, into the
     course's `Unit NN — …` folder (educators-only material into the Educators
     Only tree). Audience = public / educators.
   - **REVIEW**: name **`[REVIEW] U## · <Kind> · <Title>`** — the `[REVIEW]`
     prefix makes it obvious at a glance in Drive. Copy into
     `chemlessons.xyz — Site Build/Pending Review/<Course> Unit NN — …`
     (**outside** the public share, so it can't leak). Audience = review, and do
     NOT wire it into `js/data.js` (step 7) — it stays unlinked until approved.
   Append every old id → new id (with Audience) to `.build/copy-manifest.csv`.
   Verify counts per unit; report failures rather than skipping silently. Never
   move or modify originals.
6. If the Public folder isn't shared "Anyone with the link – Viewer" yet, STOP
   and remind the user — otherwise the links and hover/card thumbnails 403.
7. Wire `js/data.js`: add or extend the unit (`id: "<course>-unit-<n>"`, `num`,
   `symbol`, `semester`, `title`, `weeks`, `description`, `topics`, `resources`).
   Only PUBLISHED resources go here — REVIEW-staged files stay out until approved.
   Link formats from the NEW file ids:
   - Google-native → `url` = `/preview`, `copyUrl` = `/copy`
   - Binary (PDF) → `url` = `.../file/d/<id>/view`
   - Doc+PDF pair → `url` = PDF `/view`, `copyUrl` = native `/copy`
   Educators-only assessments: list them but leave `url` "" (the lock-note UI
   gates them). Honors variants get "(Honors)" in the title. A shared unit (e.g.
   Unit 0 Classroom Procedures) is identical in both courses — reuse the SAME
   file ids in both course entries (never a second copy; see step 4's shortcut
   rule for the Drive side).
8. Seed versions for the new resources: fetch the new copy-source ids'
   `modifiedTime`s (`get_file_metadata`, `excludeContentSnippets: true`) → write
   `observed.json` → `node scripts/versions.mjs seed <observed.json>` (bakes v1
   and the version/updated fields into `js/data.js`). Direct-publish rows use
   their `Published id` as the copy-source id, so include those the same way —
   the published file IS the living master the version chip tracks.
9. Verify: `node --check js/data.js`, `npm run check`, then serve locally and
   screenshot both course views (headless Chrome clamps below 500px CSS unless
   you use `--force-device-scale-factor`). Report anything unresolved as a list.
10. The user ships with `/ship`.
