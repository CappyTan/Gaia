// Gaia service worker — offline launch + instant loads for the installed PWA.
// Strategy (no build-time manifest, fully static):
//   • Navigations / index.html → NETWORK-FIRST (so a new deploy is picked up when online), with the
//     cached shell as the offline fallback.
//   • Hashed build assets (/assets/…) + icons → CACHE-FIRST (their names are content-hashed, so a
//     cached copy is never stale — instant loads, and they survive offline once seen).
//   • Everything else same-origin → stale-while-revalidate.
// The build version is STAMPED into this file at build time (vite plugin replaces __SW_VERSION__), so
// the SW's bytes change every release → the browser detects a SW update → it activates (skipWaiting) and
// the page auto-reloads to the fresh build (see main.ts). activate() also drops the prior version's cache.
const VERSION = "__SW_VERSION__";
const CACHE = "gaia-" + VERSION;
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const putSafe = (req, res) => {
  if (res && res.ok && res.type === "basic") caches.open(CACHE).then((c) => c.put(req, res.clone()));
  return res;
};

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let cross-origin pass through untouched

  // Navigations + the entry HTML: network-first, fall back to the cached shell when offline.
  if (req.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/")) {
    e.respondWith(
      fetch(req).then((res) => putSafe(req, res))
        .catch(() => caches.match(req).then((m) => m || caches.match("./index.html")))
    );
    return;
  }

  // Content-hashed assets + icons: cache-first (immutable), populate on miss.
  if (url.pathname.includes("/assets/") || /\.(png|webmanifest|woff2?)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((m) => m || fetch(req).then((res) => putSafe(req, res)))
    );
    return;
  }

  // Anything else same-origin: stale-while-revalidate.
  e.respondWith(
    caches.match(req).then((m) => {
      const net = fetch(req).then((res) => putSafe(req, res)).catch(() => m);
      return m || net;
    })
  );
});
