---
name: deploy
description: Ship a change to production (GitHub Pages) cleanly and safely — re-cut the dev branch from main, verify locally, open a PR, squash-merge, watch the post-merge deploy, fix red builds, and confirm the live site serves. Bakes in the gotchas (App-token PRs don't trigger PR CI; squash-merge branch divergence; flaky RNG tests; never rewrite main). Use whenever the user asks to deploy / ship / release / "make it live", or to drive a red deploy to green.
---

# Deploy skill — the clean deploy for Gaia

The one repeatable way to get a change live on **GitHub Pages** without the finicky git issues.
**Dara is not a developer and contributes only via Claude sessions — he must never be asked to run
git or resolve a conflict. The agent does every step here and reports the outcome in plain terms.**

- **Repo:** `cappytan/gaia` · **Live site:** https://cappytan.github.io/Gaia/
- **How "live" works:** squash-merge a PR to **`main`** → `.github/workflows/deploy-pages.yml`
  runs `npm ci → typecheck → test → vite build`, then deploys `dist/` to Pages. **Nothing is live
  until that post-merge run is green.**

## 1 · Start from a clean branch base (this prevents the recurring rebase/force-push pain)
A squash-merge replaces the branch's commits with one new commit on `main`, so a *reused* branch
always diverges and conflicts next time. Re-cut it from fresh `main` before new work:
```
git fetch origin main
git checkout -B <branch> origin/main
git config user.email noreply@anthropic.com && git config user.name Claude
```
(The first push after re-cutting needs `--force-with-lease` — expected and safe; the old commits
are already merged. Never force-push `main`, only the dev branch.)

## 2 · Make the change
Edit code/content/art. If the change is player-visible, **bump `app/src/data/version.ts`
(`GAME_VERSION`) and add a `app/src/data/changelog.ts` entry** (newest first).

## 3 · Verify locally — THIS is the real gate
```
npm run typecheck && npm test && npm run build
```
All three must be green. **Tests must be deterministic** — `systems/` use RNG; pin it (mock
`Math.random`, or use `seeded` from `core/rng`) or a flake will randomly fail the deploy. A red
local test = a failed deploy = not live.

## 4 · Commit + push
Commit as `Claude <noreply@anthropic.com>` (clear message; never include the model identifier).
```
git add -A && git commit -m "..."
git push --force-with-lease -u origin <branch>
```

## 5 · Open the PR + merge
- Open the PR (`mcp__github__create_pull_request`).
- **Expected quirk:** PRs opened via the Claude/GitHub-App token **do not trigger the PR
  validation workflow** (GitHub anti-recursion). The PR will show *no checks / pending* — that is
  normal, not a failure. Local green (step 3) is the gate.
- Check `mcp__github__pull_request_read` (`get`): if `mergeable_state` is `dirty`, the branch
  wasn't re-cut — `git rebase --onto origin/main <old-base>` (or re-cut and cherry-pick), re-verify,
  force-push, re-check until `clean`/`unstable`.
- **Squash-merge** to `main` (`mcp__github__merge_pull_request`, `merge_method: "squash"`).

## 6 · Watch the post-merge deploy — the authoritative CI
- Find the `push`→`main` run for the merge commit: `mcp__github__actions_list`
  (`list_workflow_runs`, filter `branch: main`, `event: push`). (Results can be large — query with
  `jq` over the saved tool-result file for `status/conclusion/head_sha`.)
- It re-runs typecheck+test+build, then deploys.
- **On failure:** `mcp__github__get_job_logs` (`failed_only: true`, `return_content: true`) →
  find the failing step → fix it (for a flaky test, fix the *determinism*, don't just re-run) →
  back to step 3. Drive it to green; one red round is not the end state.
- **On success:** the `deploy` job green = **live**.

## 7 · Verify + report
- `WebFetch` https://cappytan.github.io/Gaia/ to confirm it serves the title screen (it can't see
  JS-rendered version strings — it confirms the page is up, not gameplay).
- Then re-cut the dev branch from the new `main` (step 1) so the next change starts clean.
- **Report to the user in plain terms:** what shipped, that it's merged and the site is updated
  (allow ~1 min for the CDN; hard-refresh) — or what failed and that you're handling it. No git
  mechanics.

## Guardrails
- **Never amend or force-push `main`.** GitHub's squash-merge commit is authored by the repo owner
  and committed by `GitHub <noreply@github.com>`; it shows **Verified** — that's correct, leave it.
- **Don't poll with `sleep`.** Query status / rely on PR-activity events; act on the next event.
- Stay scoped to `cappytan/gaia`. Don't open a PR unless shipping is the ask.
