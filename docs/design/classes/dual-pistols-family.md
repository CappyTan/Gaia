# Dual Pistols — the class family (the Gunslinger: how fast can you keep firing?) — PROPOSAL (pending Dara)

> **Status: DRAFT PROPOSAL — dev-approved, pending Dara.** Family note for the five Dual Pistols
> classes, designed **as a pair with the [Rifle family](./rifle-family.md)** (the two back-row ranged
> archetypes) so they never blur. Mirrors the other family notes; built on the ratified
> [Attunement Mechanics Framework](../attunement-mechanics.md). Frame + lanes are the proposal;
> ability content is skill-drafted (`proposed`).

## The organizing principle

Dual Pistols is the **Gunner** (`party.ts`: `role: "Gunner"`, **back row**, **AGI-secondary**, `spd 11`,
fast and fragile). It is one of the two ranged archetypes — and the entire frame is built to split it
from the **Rifle** (Marksman):

### Pistols = **VOLUME OF FIRE**; Rifle = **THE ONE SHOT**

The Gunslinger asks **"how fast can you keep firing?"** — a relentless **hail** of attuned rounds:
**volume** (many fast shots, dual-wield = two barrels), **crit** (AGI finesse — trick shots, ricochets),
**mobility** (back-line kiting, reposition, quickdraw), and **flexible targeting** (spray the line,
swap targets at will). Where the Rifle removes *one* target with a single charged shot, the Gunslinger
**buries the whole line under fire.** Pistols are the ranged **applicator** — they stack the attunement
signature fastest at range.

**Shared Gunslinger DNA:** (1) **double-tap** — dual barrels fire two rounds → two crit rolls / two
signature applications; (2) **volume/rhythm** — sustained fire builds heat/momentum; cheap fast shots
feed the finisher; (3) **mobility** — reposition / quickdraw / kite from the back line (fragility
answer = don't get hit, stay at range); (4) reuse the Attunement's phase chain *applied by fire*
(spray Burn→detonate, Chill-rounds→Frozen→shatter-shot, etc.). No new resource.

| × Dual Pistols | Canon name | Primary + AGI | Seat (volume) | vs its Rifle cousin (precision) |
|---|---|---|---|---|
| **SOL** | Gunslinger Solaris | **AGI+AGI** | doubled-AGI flagship — pure crit-spray, fan-the-hammer radiant volley | volume crit-hail, not Photon Vanguard's single charged beam |
| **NOX** | Cryovex | STR+AGI | frost volley — Chill-rounds spray the line, heavy freeze | Chill-spray, not Terminus's single freezing kill-shot |
| **ANIMA** | Sporecaster | VIT+AGI | spore-gun — Infestation rounds spread contagion (**non-healer**) | spray-contagion, not Genewarden's precision gene-injection |
| **QUANTA** | Entropic Echo | SPD+AGI | probability-spray — ricocheting **echo** shots, crit/dodge swings | echoing volley, not Observer Prime's single collapse-shot |
| **UMBRAXIS** | Orbitalist | DEF+AGI | gravity volley — curved rounds that pull/cluster, drain | clustering volley, not Astrolancer's single gravity-lance |

**Cohesion:** all five share AGI-secondary + the Gunslinger DNA (volume / crit / mobility); the primary
sets the role. **SOL is the doubled-AGI flagship.** *(Distinctness watch: SOL Gunslinger Solaris is
AGI+AGI like the melee **Sunblade** — but Gunslinger is the ranged volume-fire gunner, Sunblade the
melee parry-duelist; different row, different mechanic.)*

## Per-class sketches (3 lanes: a volume/spray lane · a crit/precision lane · a mobility/control lane)

### SOL · Gunslinger Solaris — doubled-AGI crit-gunslinger (pure offense)
- **A · Fan Fire** — rapid radiant volley: crit-spray that rakes **Burn** across the line.
- **B · Trick Shot** — precision crit shots, ricochets, muzzle-flash **Blind**.
- **C · Quickdraw** — mobility/tempo: reposition, **Haste**, first-shot off the draw. No defensive line.

### NOX · Cryovex — frost volley gunner
- **A · Frost Volley** — Chill-rounds spray the line, dragging attack-bars.
- **B · Cryo Shot** — heavy STR freeze-rounds → **Brittle**; punish the frozen.
- **C · Coldsnap** — control at range: **Frozen**, attack-bar drag, a little stillness-ward.

### ANIMA · Sporecaster — spore-gun (non-healer)
- **A · Spore Volley** — **Infestation** rounds that spread contagion on death (the applicator).
- **B · Mutagen Round** — evolving/adaptive shots (Seed→Bloom→Overgrowth); grow resistances.
- **C · Hive Field** — zone-control: spore clouds, root the line. Self-sustain only ([ledger #16](../attunement-mechanics.md)).

### QUANTA · Entropic Echo — probability-spray (math/physics register, no gambling)
- **A · Echo Fire** — shots that **echo/ricochet** — one round resolves into several across the line.
- **B · Decohere Round** — **Decohere** enemy accuracy/crit; bend crit/dodge swings.
- **C · Doomshot** — stamp **Doom** and collapse it; outcome control at range.

### UMBRAXIS · Orbitalist — gravity volley (curved rounds)
- **A · Orbital Volley** — gravity-curved rounds that **pull/cluster** the line into a kill-box.
- **B · Drain Round** — **Drain** shots; conservation sustain from the back line.
- **C · Anchor Shot** — **Anchor**/event-horizon at range; durable, deny escape.

## Open flags
- Confirm the **Pistols (volume) vs Rifle (precision)** split as the differentiator for the ranged pair.
- **SOL Gunslinger Solaris ↔ Sunblade** (both AGI+AGI): ranged volume-gunner vs melee parry-duelist — confirm.
- **ANIMA Sporecaster** kept a **non-healer** (ledger #16).
