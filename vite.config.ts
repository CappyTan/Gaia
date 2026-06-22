import { defineConfig, type Plugin } from "vite";
import { readFileSync, writeFileSync } from "node:fs";

// Stamp the build's GAME_VERSION into the (otherwise static) service worker after the bundle is
// written, so sw.js's bytes change every release. That byte change is what makes the browser detect a
// SW update — which lets the installed PWA auto-update to the new build (main.ts reloads on the SW
// taking control) instead of needing a delete/re-add. No-op if there's no token to replace.
function stampServiceWorker(): Plugin {
  return {
    name: "stamp-sw-version",
    closeBundle() {
      try {
        const ver = /GAME_VERSION\s*=\s*"([^"]+)"/.exec(readFileSync("app/src/data/version.ts", "utf8"))?.[1]
          || String(Date.now());
        const sw = "dist/sw.js";
        const src = readFileSync(sw, "utf8");
        if (src.includes("__SW_VERSION__")) writeFileSync(sw, src.replaceAll("__SW_VERSION__", ver));
      } catch { /* sw.js absent / unreadable — offline support just won't auto-version */ }
    },
  };
}

// The game lives under app/. We build to repo-root dist/ and deploy that to GitHub Pages.
// base:'./' makes all asset URLs relative, so the build works at any path
// (e.g. https://<user>.github.io/Gaia/) without hardcoding the repo name.
export default defineConfig({
  root: "app",
  base: "./",
  plugins: [stampServiceWorker()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "es2020",
  },
});
