// Asset URL resolver. Dara's sliced sprites live in app/assets/**; references are built
// dynamically (weapon class + rarity, enemy key, hero id), so we let Vite hash + copy them
// via import.meta.glob and resolve by relative path at runtime. Missing art returns null so
// callers can fall back to an emoji glyph.
//
// Sprites (.png) are eager — the field/battle render path resolves them synchronously every frame.
// Cutscene VIDEOS (.mp4) are multi-MB and only play on a rare ultimate, so they're globbed LAZILY
// (a dynamic import per file): their URL mapping stays OUT of the initial JS chunk / eager graph,
// and a video's URL is fetched only when that cutscene is about to play (see preloadVideoUrl).

const modules = import.meta.glob<string>("../../assets/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

// Re-key from "../../assets/items/sns-rare.png" -> "items/sns-rare.png" for easy lookup.
const byPath: Record<string, string> = {};
for (const full in modules) {
  const rel = full.replace(/^.*\/assets\//, "");
  byPath[rel] = modules[full];
}

/** Resolve "items/sns-rare.png" to its built URL, or null if that art doesn't exist. */
export function assetUrl(rel: string): string | null {
  return byPath[rel] ?? null;
}

// Lazy video loaders, keyed "videos/..." -> () => Promise<url>. The glob is NOT eager, so each
// entry is a code-split chunk; nothing video-related is in the initial bundle until awaited.
const videoLoaders = import.meta.glob<string>("../../assets/**/*.mp4", {
  query: "?url",
  import: "default",
});
const videoByPath: Record<string, () => Promise<string>> = {};
for (const full in videoLoaders) {
  videoByPath[full.replace(/^.*\/assets\//, "")] = videoLoaders[full];
}
const videoCache: Record<string, string | null> = {};

/**
 * Resolve a video like "cutscenes/orbital-cannon.mp4" to its built URL, lazily. The result is
 * cached so a later synchronous read (videoUrlSync) can hand it straight to a <video> inside a
 * click handler (preserving the user-gesture for unmuted audio). Returns null if it doesn't exist.
 */
export async function preloadVideoUrl(rel: string): Promise<string | null> {
  if (rel in videoCache) return videoCache[rel];
  const load = videoByPath[rel];
  const url = load ? await load() : null;
  videoCache[rel] = url;
  return url;
}

/** Synchronously read a video URL preloaded via preloadVideoUrl, or null if not yet resolved. */
export function videoUrlSync(rel: string): string | null {
  return videoCache[rel] ?? null;
}
