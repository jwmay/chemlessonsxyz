---
description: Project status report — branches, changes, PRs, CI, deploys, live site
allowed-tools: Bash(git:*), Bash(gh:*), Bash(curl:*)
---

Produce a compact situation report for this project. Gather (in parallel
where possible, after a `git fetch -q`):

- Current branch + uncommitted changes (`git status --short`)
- dev vs main: `git rev-list --left-right --count origin/main...origin/dev`
  (i.e. is there unshipped work on dev?)
- Open PRs and their CI state (`gh pr list`, `gh pr checks`)
- Latest deploy: `gh run list --workflow deploy.yml --limit 1`
- Live site: `curl -s -o /dev/null -w "%{http_code}" https://chemlessons.xyz`
- Local dev server: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5500`

Present as a short table, then end with a one-line verdict such as
"everything shipped and live", "unshipped work on dev (N commits)", or
"PR #N awaiting merge". Keep it tight — no narration of the commands run.
