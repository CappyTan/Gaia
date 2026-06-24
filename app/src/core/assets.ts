// Asset URL resolver. Dara's sliced sprites live in app/assets/**; references are built
// dynamically (weapon class + rarity, enemy key, hero id), so we let Vite hash + copy them
// via import.meta.glob and resolve by relative path at runtime. Missing art returns null so
// callers can fall back to an emoji glyph.

const modules = import.meta.glob<string>("../../assets/**/*.{png,mp4}", {
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
