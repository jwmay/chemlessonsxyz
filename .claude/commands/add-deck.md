---
description: Add a new HTML slide deck — scaffold from demo-deck and register it in DECKS
argument-hint: <deck title> <unit> [short description]
allowed-tools: Bash(git:*), Bash(npm:*), Bash(cp:*)
---

Add a new interactive HTML slide deck to the Slide Decks gallery.
$ARGUMENTS should contain the deck title, the unit it belongs to, and
optionally a short description — ask (AskUserQuestion) for anything missing.

1. Confirm the current branch is `dev`; if not, stop and tell the user.
2. Duplicate the template: copy `slides/demo-deck/` to a new kebab-case folder
   under `slides/` (e.g. `slides/unit-4-bonding/`). Read the template's
   `index.html` and keep its structure — the `<section class="slide">` blocks,
   keyboard/swipe navigation, and progress bar.
3. Edit the new deck's slides for the requested title/unit; write copy in the
   site's voice (read a neighbouring deck or the curriculum content first).
4. Register it in `DECKS` in `js/data.js` so it shows in the gallery — copy an
   existing entry's shape (`title`, `unit`, optional `track`, `description`,
   `icon`, `fb` emoji fallback, and `url` pointing at the new folder's
   `index.html`). Optionally also add a `type: "html"` resource to the matching
   unit so it appears on the curriculum page.
5. Run `npm run check` — it must pass (html-validate + link check).
6. Remind the user to eyeball it at http://localhost:5500 (live-reload server)
   and wait for their go-ahead if they want tweaks.
7. Commit on dev with a message like "Add <title> slide deck". Do NOT release —
   the user ships with /ship when ready.
