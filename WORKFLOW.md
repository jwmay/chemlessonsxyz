# WORKFLOW.md

How to *operate* chemlessons.xyz day to day — the npm scripts, the slash
commands, and the recurring flows (ship, add content, track versions). For the
project's architecture and content model, read `README.md`; for guardrails, read
`CLAUDE.md`. This file is the "I've been away for a while, how do I do X again?"
reference.

---

## Golden rules

- **Never commit to `main`.** `main` is production and auto-deploys to
  chemlessons.xyz. Work on `dev`; ship via a PR.
- **Run `npm run check` before finishing** any HTML/CSS/JS change — it's exactly
  what CI runs on every PR.
- **Content lives in `js/data.js`**, not the HTML. Tracks → units → resources,
  plus `DECKS` and `SITE`.
- **No inline `style=`** — add a class in `css/style.css`; design tokens live in
  `:root`.

---

## Everyday flow

```
edit on dev  →  npm run check  →  /wip (checkpoint)  →  /ship (go live)
```

Serve locally while editing: `npm run dev` (live-reload at http://localhost:5500).

---

## npm scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Live-reload dev server at `localhost:5500` (opens a browser). |
| `npm run dev:quiet` | Same server, no auto-open browser. |
| `npm run ngrok` | Public tunnel to the dev server (`ngrok http 5500`) — share a preview. |
| `npm run lint` | `html-validate` over all HTML (pages + slide decks). |
| `npm run links` | `linkinator` broken-link check (skips external URLs). |
| `npm run check` | `lint` + `links` — **run before every commit/PR**. |
| `npm run versions` | The version-tracking tool (`scripts/versions.mjs`) — see below. |
| `npm run sync` | Level local `main`/`dev` with origin after a merge, and push. |
| `npm run release` | Open a `dev → main` PR (`/ship` does this and more). |

---

## Slash commands

| Command | What it does |
| --- | --- |
| `/wip [message]` | Commit + push everything on `dev` as a checkpoint. No PR, no deploy. |
| `/ship [title] [auto]` | `dev → main`: check, commit, PR, watch CI, (ask), merge, sync, verify live. Add `auto` to skip the merge confirmation. |
| `/sitrep` | Status report — branches, changes, open PRs, CI, deploys, live site. |
| `/add-deck <title> <unit>` | Scaffold a new HTML slide deck from `slides/demo-deck/` and register it in `DECKS`. |
| `/add-content <course> <unit #>` | Copy a unit's approved resources into Drive + wire them into the site (full flow below). |
| `/check-updates [unit]` | Detect Drive edits to tracked resources and bump the versions you approve. |

---

## Resource versioning (how "v# · updated" works)

Every resource copied into the site account starts at **v1** the moment it's
copied. When you edit a master copy in Drive, its Drive `modifiedTime` moves past
the recorded baseline — that's the signal for a new version. Nothing bumps
without your approval.

- **State:** `.build/versions.json`, keyed by each resource's `copyUrl` file id
  (the exact file a teacher gets from "Make a copy"). Holds `version`, `modified`
  (the diff baseline), `updated` (YYYY-MM-DD), and `history`.
- **Tool:** `scripts/versions.mjs` (`node scripts/versions.mjs …`):
  - `seed <observed.json>` — baseline new files at v1.
  - `propose <observed.json>` — list files whose `modifiedTime` moved (candidates).
  - `apply <observed.json> <fileId …>` — bump only the ids you approve.
- The tool writes `version` + `updated` into `js/data.js`; the curriculum page
  shows a muted "v2 · Aug 2026" chip on each linked resource.

**`observed.json`** is a `{ "<fileId>": "<modifiedTimeISO>" }` map. Drive access
lives with the connector (only Claude can fetch modified times), so the cycle is:

1. Edit master docs in Drive whenever you mean to.
2. Run **`/check-updates`** — Claude fetches each tracked file's `modifiedTime`,
   writes `observed.json`, and runs `propose`.
3. Claude shows the candidates; **you say which are real edits.**
4. Claude runs `apply` on the approved ones, then `/ship`.

---

## Adding content to the site

Use **`/add-content <course> <unit #>`**. It follows the flow used for Unit 0:

1. Verify the Drive connector is the site account (`chemlessons.xyz@gmail.com`).
2. Read the course's mapping sheet, reconcile against `.build/mapping-master.csv`
   by RowID (sheet edits win), skip Include = no/REVIEW.
3. Copy approved files into `chemlessons.xyz — Public/<Course>/Unit NN — …`
   (educators-only material into `chemlessons.xyz — Educators Only/…`) with clean
   `U## · Kind · Title` names; record old→new ids in `.build/copy-manifest.csv`.
4. **Set the Public folder to "Anyone with the link – Viewer"** (a one-time click
   on the root folder — everything under it inherits it) or links/thumbnails 403.
5. Wire the unit into `js/data.js` (link formats: native `/preview` + `/copy`;
   PDF `/view`; Doc+PDF pair = PDF view + native copy; gated assessments listed
   with `url: ""`).
6. Seed versions (`scripts/versions.mjs seed`) so new resources start at v1.
7. `npm run check`, screenshot, then `/ship`.

**Shared units (e.g. Unit 0 Classroom Procedures)** belong to both courses but
their files exist **once**. In `js/data.js`, both course entries reuse the *same*
file ids — never a second copy. In Drive, the files live under the first course;
the other course gets a **shortcut** to that `Unit NN — …` folder (the connector
can't create shortcuts, so that click is manual). The empty
`Public / Mathematical Chemistry` and `Educators Only / Mathematical Chemistry`
folders already exist as the home for those shortcuts and future Math content.

Files under review (not yet approved) are copied — not skipped — into
`chemlessons.xyz — Site Build/Pending Review/` — **outside** the public share, so
they don't leak. Each is named with a **`[REVIEW]`** prefix
(`[REVIEW] U## · Kind · Title`) so it's obvious at a glance in Drive, and it's
left out of `js/data.js` (unlinked on the site) until you approve it.

---

## Ground-truth files (`.build/`)

| File | In git? | What it is |
| --- | --- | --- |
| `versions.json` | **committed** | Resource version state (see above). |
| `copy-manifest.csv` | **committed** | Every copy made: old id → new id, name, destination, audience. |
| `mapping-master.csv` | local only | RowID (C####/M####/R####) → original Drive file ids + metadata. |
| `drive-inventory.jsonl` | local only | Raw Drive crawl (2,172 items). |
| `build_mapping.py` | local only | Documents the original mapping heuristics (one-time crawl tooling). |

**Why the split:** this repo is **public** (required for free GitHub Pages), and
`drive-inventory.jsonl` + `mapping-master.csv` enumerate the entire *private*
district Drive — every file title, id, and folder path, plus the account email —
so they stay out of git. `versions.json` and `copy-manifest.csv` contain only
already-public site data (the same file ids that live in `js/data.js`, public
resource titles, versions, dates), and they're the state you'd least want to lose,
so they're **committed** as durable backup. The `.gitignore` uses
`.build/*` + `!` exceptions to draw that line.

---

## Drive & the site account

- Working files live in the **district account** and are shared read-only to the
  **site account** `chemlessons.xyz@gmail.com`, which owns all site copies.
- The connector must be signed into the site account — a flow that copies/reads
  should verify this first (`owner = 'me'`, check the owner email).
- The connector is **read / copy / create only**: it can't edit a Sheet cell,
  rename a file, or edit a Doc's body. Those are manual (or a hand-run Apps
  Script, e.g. `scripts/educator-access-form.gs`).

---

## Local preview & screenshots

- `npm run dev` → http://localhost:5500. Font Awesome renders only on authorized
  domains (chemlessons.xyz / localhost) — on other hosts (e.g. an ngrok domain)
  the emoji fallback shows, which is expected.
- Headless Chrome screenshots clamp the window at 500px wide; to capture true
  phone widths use `--force-device-scale-factor=2` with a doubled `--window-size`
  (e.g. `--window-size=780,1600` → 390px CSS).
