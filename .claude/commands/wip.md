---
description: Checkpoint work-in-progress — commit everything on dev and push (no release)
argument-hint: [optional commit message]
allowed-tools: Bash(git:*)
---

Commit and push the current work on `dev` as a backup checkpoint. This must
NOT open a PR, touch `main`, or deploy anything.

1. Confirm the current branch is `dev`; if not, stop and tell the user.
2. `git status --short` — if the tree is clean, say "nothing to checkpoint"
   and stop.
3. Stage everything and commit. Use $ARGUMENTS as the message if provided;
   otherwise write a concise summary of the actual changes, prefixed "WIP: ".
4. Push, then report the commit hash and a one-line list of what was included.
