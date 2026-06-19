// Telemetry auto-save endpoint. Leave "" to disable (Copy JSON / Download still work).
// To enable: deploy app/tools/telemetry-worker/ (a tiny Cloudflare Worker that commits each run
// to telemetry/incoming/ in the repo using a server-side GitHub token), then paste its URL here.
// See app/tools/telemetry-worker/README.md for the 5-minute setup. The URL is NOT a secret —
// only the Worker holds the GitHub token.
export const TELEMETRY_ENDPOINT = "https://gaia-telemetry.cpollack.workers.dev";
