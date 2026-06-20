# ADR 0007 — Version-tolerant save & resume

**Status:** accepted (Aurelion build). Builds on [ADR 0005](0005-modular-ts-vite.md) (layering) and
[ADR 0006](0006-explorable-settlements-greenfield-zones.md) (the data-driven world that keeps
growing).

## Context

The game has outgrown a single sitting: a run now spans three zones, three settlements, a hub chain,
a built party with levels/MNA/six equip slots, an inventory, and gold. Today **none of that
persists** — closing the tab loses the run. (The telemetry "crash-proof mirror" snapshots a run for
*analytics*; it is not a playable resume.)

Dara's requirement is specifically **"save and resume across versions, so we can play and build at
the same time."** We deploy to GitHub Pages many times a day; a saved run made on `vX` will routinely
be loaded on `vY` after a deploy. So the hard problem isn't serialization — it's **surviving content
change**: zones get inserted (Silverwood went in at index 1, shifting the Duskmarsh), enemies and
bands get added/retuned, items reference affix/class keys. A naive save (array indices, whole-object
dumps) would silently corrupt or crash on the next deploy. The save must degrade *gracefully*, never
crash, and preserve as much of the player's investment (party, levels, gear, gold) as possible.

## Decision

**1 · Autosave to `localStorage`, single "current run" slot.** Write the run on meaningful
transitions (after a battle resolves, on entering/leaving a town, on zone change, on equip changes).
Silent; no manual save. (Multi-slot / cloud is future work.) localStorage is synchronous,
static-host-friendly, and iOS-Safari-safe — no backend.

**2 · A schema-versioned envelope, separate from `GAME_VERSION`.**
```
{ saveSchema: <int>, gameVersion: "vX.Y", savedAt: <ts>, run: { …state… } }
```
`saveSchema` is an integer bumped **only when the run shape changes** (drives migration);
`gameVersion` is stored for diagnostics and "resumed a vX save" messaging — it is **not** a gate
(a different game version must still load).

**3 · Reference content by STABLE ID, never by array index.** This is the core of cross-version
tolerance:
- **Zone** → store `zone.id` ("greenvale"/"silverwood"/…), not `zoneIndex`. On load, resolve
  id→index against the current `ZONES`; if the id is gone, fall back (nearest prior zone / restart).
- **Party** → store each member's **class (Attunement × Archetype)**, level, MNA allocation,
  hp/mp/alive, and equipped items — reconstruct via `makeMember` + re-apply progression, not by
  dumping the live object.
- **Items** (inventory + equipped) → already data-shaped; they reference affix/class **keys**. On
  load, validate keys against the registry (`DB`); **drop** any item whose keys no longer exist
  rather than crash.
- **Run flags** → gold, encountersWon, steps, boss/mini flags, hub-chain position.
- **Field position** → store `{ zoneId | settlementId, px, py }` best-effort; if the map/layout
  changed so the saved tile is invalid, **respawn at the zone/town spawn** (safe, never stuck).

**4 · Graceful load: validate → migrate → degrade, never crash.** On load: parse, check `saveSchema`
(run registered migrations for older schemas), then **validate every reference against the live
content registry** (reuse `data/validate`). Preserve what resolves; reset what doesn't —
**preferring to keep the party (levels/gear/gold) even if exact zone-progress/position resets.** Any
parse/validation failure that can't be salvaged → discard the save and start fresh **with a notice**
(never a broken state, never a crash).

**5 · Save at fight boundaries, not mid-battle.** The ATB battle is transient; resuming drops the
player back on the field (or in town) with the run intact, not mid-fight. Simpler and sufficient.

**6 · UI.** A **Continue** button on the title screen, enabled only when a valid save exists
(alongside New Game / Roster). A small "saved" tick is optional. Starting a new run overwrites the
slot (with a confirm if a run is in progress).

## Consequences / trade-offs

- **Layering (ADR 0005):** a new **pure `systems/save.ts`** owns serialize / deserialize / migrate /
  validate (no DOM, unit-tested — round-trip + "load with a removed zone/enemy/affix degrades
  gracefully"). A thin hook in `controllers/game.ts` calls autosave on transitions and wires the
  title **Continue**. Run state stays in `game.ts`; `save.ts` only (de)serializes it.
- **Cross-version works for content ADDITIONS by construction** (id-based refs + best-effort
  migration). For breaking *combat/stat* changes the party still loads (levels/gear/gold);
  the player just continues under the new balance — acceptable, this is a playtest build.
- **Single-slot, fight-boundary, local-only** is the deliberate POC scope; multi-slot, mid-fight
  resume, and cloud sync are explicitly deferred.
- **Tests + a `saveSchema` discipline** are the safety net: bump `saveSchema` + add a migration
  whenever the run shape changes, or old saves silently reset. A test asserts the current shape
  round-trips and that a doctored old/foreign save loads-or-resets without throwing.
