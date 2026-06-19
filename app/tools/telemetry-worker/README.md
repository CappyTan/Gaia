# Telemetry auto-save — setup (~5 min, free)

The game can POST each finished run to a tiny **Cloudflare Worker** that commits it to
`telemetry/incoming/` in this repo. The GitHub token stays in the Worker (a server secret) — it
is **never** shipped in the public game bundle, so this can't be abused to write to the repo at
large. Until you set this up, telemetry still works via **Copy JSON** in the Stats screen.

## 1. Make a GitHub token (fine-grained)
GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate:
- **Repository access:** only this repo (`CappyTan/Gaia`).
- **Permissions:** **Contents → Read and write** (nothing else).
- Copy the token (starts `github_pat_…`).

## 2. Deploy the Worker
Easiest (dashboard): Cloudflare → **Workers & Pages** → Create → paste `worker.js`.
Or with the CLI:
```bash
npm i -g wrangler
cd app/tools/telemetry-worker
wrangler deploy            # uses wrangler.toml
wrangler secret put GH_TOKEN   # paste the token from step 1
# optional spam guard:
wrangler secret put GAIA_KEY   # any random string; then set the same in the client (see step 3)
```
Set the plain vars `REPO=CappyTan/Gaia` and `BRANCH=main` (in `wrangler.toml` or the dashboard).
Copy the deployed URL, e.g. `https://gaia-telemetry.<you>.workers.dev`.

## 3. Point the game at it
Paste the Worker URL into **`app/src/telemetry/endpoint.ts`**:
```ts
export const TELEMETRY_ENDPOINT = "https://gaia-telemetry.<you>.workers.dev";
```
Commit + push — CI rebuilds and deploys. From then on, every finished run (victory or wipe)
auto-commits to `telemetry/incoming/`. (If you set `GAIA_KEY`, also send it — tell me and I'll add
the header to the client POST.)

## Notes
- The Worker only ever creates files under `telemetry/incoming/`, caps payloads at ~96 KB, and
  (optionally) checks `X-Gaia-Key`. The shared key is a speed bump, not real auth (the client is
  public) — fine for a hobby project; rotate the GitHub token if it ever gets noisy.
- To analyze: pull the repo and hand any `telemetry/incoming/*.json` to the telemetry-analyst.
