import { defineConfig } from "vite";

// The game lives under app/. We build to repo-root dist/ and deploy that to GitHub Pages.
// base:'./' makes all asset URLs relative, so the build works at any path
// (e.g. https://<user>.github.io/Gaia/) without hardcoding the repo name.
export default defineConfig({
  root: "app",
  base: "./",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: "es2020",
  },
});
