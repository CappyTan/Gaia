# Heliomancer — SOL × Staff

> **Status:** greenfield spec (Phase 2 kit), authored by the `build-class` skill. Lanes from the
> [Staff family note](./staff-family.md); every ability `proposed`. Numberless. Mechanics from the
> ratified [Attunement Mechanics Framework](../attunement-mechanics.md). Energy operation: **emit**.

## Identity (derived + DNA)

- **Class:** Heliomancer · **Attunement × Archetype:** SOL × Staff
- **Primary stat:** AGI (← SOL) · **Secondary stat:** VIT (← Staff) — back-line glass cannon
- **Resource:** SOL (party-shared; **runs hot**) · **Signature:** Burn / Blind / Scorched
- **Energy op:** **Emit** — radiate SOL outward as raw fire & light. Caster role: **artillery / nuker**.

**Fantasy.** A Heliomancer holds a star in the hand and pours it onto the field — fire that spreads,
light that blinds, heat that builds to detonation. The back-line furnace: a glass cannon that *emits*
SOL as raw radiance, and the more it burns, the wider the fire jumps.

### Lanes *(three flavors of artillery)*

| Lane | Identity | Best when |
|---|---|---|
| **A · Conflagration** | spreading Burn / DoT — ignite, propagate, detonate | many targets; drawn-out fights |
| **B · Solar Lance** | focused bolts & beams — single-target burst, pierce (AGI crit) | bosses; high-value targets |
| **C · Corona** | radiance fields — AoE Blind + escalating heat-zones | packs; battlefield-wide pressure |

**Build axes:** spread/DoT ↔ focused burst (A↔B) · single-target ↔ field/AoE (A,B↔C).

---

## Auto-attack *(unlaned)*
- **Sunbolt** · mag · enemy · *a small bolt of light* · gen **minor SOL** · cd **none** *(spammable)*

## Special skills — 10 milestones × 2 *(generate; never cost)*

**@ MNA 5** *(A/B)*
- **A · Firebolt** · mag · enemy · *a flaming bolt; applies Burn* · gen **moderate SOL** · cd **short**
- **B · Sunbeam** · mag · enemy · *a focused beam; bonus vs Blinded* · gen **moderate SOL** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Photon Lance** · mag · enemy · *a piercing beam of light* · gen **moderate SOL** · cd **short**
- **C · Flash** · util · allEnemies · *a burst of light; Blind nearby foes* · gen **moderate SOL** · cd **short**

**@ MNA 25** *(A/C)*
- **A · Scorch** · mag · enemy · *Burn that spreads to an adjacent foe* · gen **moderate SOL** · cd **short**
- **C · Flare Ring** · mag · allEnemies · *a radiant ring; light damage + Scorched* · gen **moderate SOL** · cd **medium**

**@ MNA 35** *(A/B)*
- **A · Wildflame** · mag · allEnemies · *fire that jumps between foes (spread Burn)* · gen **moderate SOL** · cd **medium**
- **B · Pierce Light** · mag · enemy · *a beam that ignores some resistance; crit-leaning (AGI)* · gen **moderate SOL** · cd **medium**

**@ MNA 45** *(B/C)*
- **B · Sunspear** · mag · enemy · *a heavy single-target bolt* · gen **major SOL** · cd **medium**
- **C · Solar Glare** · util · allEnemies · *Blind all foes + light Scorched* · gen **moderate SOL** · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Ember Spread** · mag · allEnemies · *spread existing Burn across foes* · gen **moderate SOL** · cd **medium**
- **C · Heatwave** · mag · allEnemies · *a wave of heat; escalating field damage* · gen **major SOL** · cd **medium**

**@ MNA 65** *(A/B)*
- **A · Combust** · mag · enemy · *detonate the target's Burn; splash to neighbors* · gen **moderate SOL** · cd **medium**
- **B · Lightlance** · mag · enemy · *a precise lance; guaranteed crit vs Blinded* · gen **moderate SOL** · cd **medium**

**@ MNA 75** *(B/C)*
- **B · Sunpiercer** · mag · enemy · *a beam through the target and the one behind it* · gen **major SOL** · cd **medium**
- **C · Solar Field** · util · allEnemies · *a lingering light field: Blind + area damage* · gen **moderate SOL** · cd **long**

**@ MNA 85** *(A/C)*
- **A · Emberstorm** · mag · allEnemies · *a storm of embers; spreading Burn* · gen **major SOL** · cd **medium**
- **C · Blinding Light** · util · allEnemies · *intense Blind; enemy accuracy crashes* · gen **moderate SOL** · cd **medium**

**@ MNA 95** *(A/B)*
- **A · Hellfire** · mag · allEnemies · *raining fire; heavy Burn on all foes* · gen **major SOL** · cd **medium**
- **B · Sunlance** · mag · enemy · *a massive focused beam* · gen **major SOL** · cd **medium**

## Signature abilities — 9 milestones × 2 *(cost; never generate)*

**@ MNA 10** *(A/B)*
- **A · Ignition** · mag · enemy · *heavy Burn* · cost **med SOL** · cd **medium**
- **B · Searing Ray** · mag · enemy · *a burning beam; big single-target* · cost **med SOL** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Sunstrike** · mag · enemy · *a strike from above; bonus vs Blinded* · cost **med SOL** · cd **medium**
- **C · Daystar** · mag · allEnemies · *a blinding flash; AoE light + Blind* · cost **med SOL** · cd **long**

**@ MNA 30** *(A/C)*
- **A · Blaze** · mag · allEnemies · *spread Burn to all foes* · cost **med SOL** · cd **long**
- **C · Sunburst** · mag · allEnemies · *a radiant burst; AoE damage + Blind* · cost **med SOL** · cd **medium**

**@ MNA 40** *(A/B)*
- **A · Firewave** · mag · allEnemies · *detonate all Burn on the field* · cost **med SOL** · cd **medium**
- **B · Solar Beam** · mag · enemy · *a charged beam; massive single-target* · cost **med SOL** · cd **medium**

**@ MNA 50** *(B/C)*
- **B · Lance of Dawn** · mag · enemy · *a piercing execution beam; bonus vs low-HP foes* · cost **high SOL** · cd **medium**
- **C · Solar Storm** · mag · allEnemies · *a storm of light; AoE damage + Blind all* · cost **high SOL** · cd **medium**

**@ MNA 60** *(A/C)*
- **A · Cinderfall** · mag · allEnemies · *raining cinders: heavy spreading Burn* · cost **high SOL** · cd **medium**
- **C · Radiance** · util · allEnemies · *blinding radiance: Blind all foes; brief party accuracy up* · cost **med SOL** · cd **medium**

**@ MNA 70** *(A/B)*
- **A · Firenova** · mag · allEnemies · *a nova of fire; AoE + Burn* · cost **high SOL** · cd **long**
- **B · Starfall Beam** · mag · enemy · *a beam of starfire; enormous single-target* · cost **high SOL** · cd **long**

**@ MNA 80** *(B/C)*
- **B · Apex Ray** · mag · enemy · *peak-power beam; guaranteed crit* · cost **high SOL** · cd **long**
- **C · Sunstorm** · mag · allEnemies · *a relentless sun-storm: AoE damage + Blind over time* · cost **high SOL** · cd **long**

**@ MNA 90** *(A/C)*
- **A · Worldfire** · mag · allEnemies · *the field ignites — max Burn on all, detonating* · cost **high SOL** · cd **long**
- **C · Solar Zenith** · mag · allEnemies · *the sun at noon: massive AoE light + total Blind* · cost **high SOL** · cd **long**

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high SOL**, cd **long**)*
- **A · Solar Flare** *(Conflagration)* · allEnemies · *unleash a solar flare — max Burn on all foes, detonated in a chain*
- **B · Death Ray** *(Solar Lance)* · enemy · *a beam of pure starfire — colossal single-target damage piercing all resistance*
- **C · Solar Apocalypse** *(Corona)* · allEnemies · *the sky becomes a sun — sustained AoE light, Blinding and burning the whole field*
- **Heliosphere** *(neutral/fusion)* · allEnemies · *become a small star: a blast that Burns, Blinds, and spreads across all foes at once*

## Passives — 3 sets of 3, **pick 1 each** @ 30 / 60 / 90 *(one per lane)*
**@ 30** — A · **Pyromania** *(your Burns spread to more foes)* | B · **Focus** *(your beams crit more)* | C · **Glare** *(your Blinds last longer)*
**@ 60** — A · **Chain Ignition** *(your Burn detonations chain further)* | B · **Pierce** *(your beams ignore more resistance)* | C · **Sunsoaked** *(your light fields deal more over time)*
**@ 90** — A · **Eternal Flame** *(your Burns don't expire while you keep dealing fire)* | B · **Solar Focus** *(more single-target damage vs a lone or Blinded foe)* | C · **Daylight** *(your Blinds also reduce enemy accuracy further)*

---

## Validation
| Invariant | Result |
|---|---|
| 1 + 20 + 18 + 4 + 9 = **52** | ✓ |
| 2 options on correct thresholds; lanes A7/B7/C6 (specials), A6/B6/C6 (sigs), no lane every milestone | ✓ |
| ults 3 laned + 1 neutral; every option lane-tagged | ✓ |
| primary AGI ← SOL · secondary VIT ← Staff | ✓ |
| economy (specials gen / sig·ult cost / auto minor / all SOL) | ✓ |
| all `proposed`; names globally unique (invariant #8) | ✓ |
