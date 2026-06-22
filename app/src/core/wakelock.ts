// Screen Wake Lock — keep the display awake while playing (iOS 16.4+ Safari, Chromium). Best-effort:
// unsupported / non-activated requests fail silently and the game is unaffected. The OS auto-releases
// the lock when the page is hidden, so re-request on return to visibility (wired in main.ts).
let lock: { release(): Promise<void>; addEventListener?: (t: string, cb: () => void) => void } | null = null;
let want = false; // whether we WANT the screen awake right now (drives re-acquire after backgrounding)

export const WakeLock = {
  async request(): Promise<void> {
    want = true;
    const nav = navigator as Navigator & { wakeLock?: { request(t: "screen"): Promise<typeof lock> } };
    if (!nav.wakeLock || lock) return;
    try {
      lock = await nav.wakeLock.request("screen");
      lock?.addEventListener?.("release", () => { lock = null; });
    } catch { /* not granted (no user activation, low battery, unsupported) — ignore */ }
  },
  release(): void {
    want = false;
    try { lock?.release(); } catch { /* ignore */ }
    lock = null;
  },
  // Re-acquire after the OS dropped the lock on backgrounding, but only if we still want it.
  reacquire(): void { if (want && !lock) void this.request(); },
};
