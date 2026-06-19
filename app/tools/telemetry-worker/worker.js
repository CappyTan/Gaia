// Gaia telemetry relay — a tiny Cloudflare Worker that receives a run's telemetry JSON from the
// game and commits it to telemetry/incoming/ in the repo via the GitHub API. The GitHub token
// lives ONLY here (a Worker secret), never in the public game bundle — which is why this relay
// exists instead of the page writing to the repo directly.
//
// Env (set in the Cloudflare dashboard or wrangler.toml):
//   GH_TOKEN  (secret)  fine-grained PAT with Contents: Read & Write on the repo
//   REPO                "CappyTan/Gaia"
//   BRANCH              "main"   (optional, defaults to main)
//   GAIA_KEY  (secret)  optional shared string; if set, requests must send header X-Gaia-Key
//
// Deploy: see README.md (≈5 minutes, free tier).

const MAX_BYTES = 96 * 1024; // a run is a few KB; cap to stop abuse filling the repo

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Gaia-Key",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return new Response("POST only", { status: 405, headers: cors });
    if (env.GAIA_KEY && request.headers.get("X-Gaia-Key") !== env.GAIA_KEY)
      return new Response("forbidden", { status: 403, headers: cors });

    const body = await request.text();
    if (body.length > MAX_BYTES) return new Response("payload too large", { status: 413, headers: cors });
    let data;
    try { data = JSON.parse(body); } catch { return new Response("bad json", { status: 400, headers: cors }); }

    // safe, deterministic-ish path: telemetry/incoming/<timestamp>-<version>-<id>.json
    const ver = String(data.version || "v0").replace(/[^\w.\-]/g, "");
    const id = String(data.id || Date.now()).replace(/[^\w.\-]/g, "");
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const path = `telemetry/incoming/${ts}-${ver}-${id}.json`;
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))); // base64 of UTF-8

    const gh = await fetch(`https://api.github.com/repos/${env.REPO}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${env.GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "gaia-telemetry-worker",
      },
      body: JSON.stringify({ message: `telemetry: ${ver} run ${id}`, content, branch: env.BRANCH || "main" }),
    });
    if (!gh.ok) return new Response(`github ${gh.status}`, { status: 502, headers: cors });
    return new Response("ok", { status: 200, headers: cors });
  },
};
