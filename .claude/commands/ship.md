---
description: Release dev to production — check, commit, PR, CI, merge, sync, verify live
argument-hint: [release title] [auto]
allowed-tools: Bash(git:*), Bash(npm:*), Bash(gh:*), Bash(curl:*)
---

Ship the current state of the `dev` branch to production (`main` auto-deploys
to chemlessons.xyz). $ARGUMENTS may contain a release title and/or the word
"auto" (= merge without asking).

Follow these steps in order. If any step fails, stop and report clearly.

1. Confirm the current branch is `dev` (`git branch --show-current`). If not,
   stop and tell the user — never ship from another branch.
2. If there are uncommitted changes: run `npm run check`. If checks fail,
   report the failures and stop (offer to fix). If they pass, stage and
   commit ALL changes with a concise message describing the work (use the
   release title from $ARGUMENTS if one was given).
3. Push dev.
4. If `origin/dev` has no commits ahead of `origin/main`, say "nothing to
   ship" and stop.
5. Open the PR: `gh pr create --base main --head dev --fill` (override the
   title with the one from $ARGUMENTS if given). If a dev→main PR is already
   open, reuse it.
6. Watch CI to completion (`gh pr checks <n> --watch`). If CI fails, pull the
   failed-step logs, diagnose, report, and do NOT merge.
7. Show a short summary of what's shipping (`git diff --stat origin/main...origin/dev`
   plus a one-sentence description). Unless $ARGUMENTS contains "auto", ask
   the user to confirm the merge before proceeding.
8. Merge with a merge commit: `gh pr merge <n> --merge`. Never delete the
   dev branch.
9. Run `npm run sync` to level local main/dev with origin and push.
10. Verify the release: latest `deploy.yml` run concluded `success`, and
    `curl -s -o /dev/null -w "%{http_code}" https://chemlessons.xyz` returns
    200. Report the final state with the PR link and site URL.
