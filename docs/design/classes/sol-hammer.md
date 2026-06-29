# Solar Arbiter — SOL × Hammer

> **Status:** greenfield design spec, authored by the `build-class` skill against the
> [Class System Model](./README.md). Lanes from the [Hammer family note](./hammer-family.md);
> every ability is `proposed`. Numberless. Mechanics vocabulary (Burn/Blind/Scorched/Sunder/Shatter/
> stagger) draws on the [Attunement Mechanics Framework](../attunement-mechanics.md) — ratified canon.

## Identity (derived + DNA)

- **Class:** Solar Arbiter · **Attunement × Archetype:** SOL × Hammer
- **Primary stat:** AGI (← SOL) · **Secondary stat:** STR (← Hammer) — a fast, precise wrecking ball
- **Resource:** SOL (party-shared; **runs hot** — generates fast, bleeds away if hoarded)
- **Attunement signature:** **Burn / Blind / Scorched**; Breaker toolkit (stagger · armor-sunder · Shatter)

**Fantasy.** The Solar Arbiter passes sentence with **light and force**. Its maul lands like a meteor —
the blow **detonates and spreads**, a radiant shockwave that breaks everything *around* the impact:
armor cracks, the ground faults, fire jumps from foe to foe. Where the Causality Arbiter decides an
outcome before it lands, the Solar Arbiter simply **breaks the whole field, here and now.** A
glass-cannon Breaker — quick, blinding, apocalyptic.

**Breaker flavor — the blast (spatial judgment).** Impact is **AoE and immediate**: shockwaves that
stagger, sunders that strip armor, Burn that spreads. The deliberate counterpart to the QUANTA
Hammer's single-target, fate-sealed verdict.

### Lanes

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Seismic** | AoE shockwave slams — stagger and hit clusters | **AGI**/STR, AoE, stagger | wide burst-breaker | packs; clustered foes |
| **B · Sunder** | Armor-break + Scorched — strip the enemy line, set up the team | sunder, vulnerability | enabler / debuff-breaker | armored foes; coordinated party |
| **C · Pyroclasm** | Burn-on-impact that spreads, then detonates | Burn, spread, detonation | DoT / AoE burst | drawn-out fights; many targets |

**Build axes:** AoE shock ↔ single-target sunder/exec (A↔B) · physical impact ↔ fire/DoT (A,B↔C).

---

## Auto-attack *(unlaned)*

- **Emberfall** · phys · enemy · *a heavy radiant maul swing, trailing sparks* · gen **minor SOL** · cd **none** *(spammable)*

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Tremor** · phys · allEnemies · *a ground-slam shockwave that hits nearby foes* · gen **moderate SOL** · cd **short**
- **B · Cleave Armor** · phys · enemy · *heavy blow that sunders armor (reduce DEF)* · gen **moderate SOL** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Crack** · phys · enemy · *strike; applies Scorched (the target takes more damage)* · gen **moderate SOL** · cd **short**
- **C · Ignite** · phys · enemy · *flaming smash; applies Burn* · gen **moderate SOL** · cd **short**

**@ MNA 25** *(A/C)*
- **A · Fault Line** · phys · allEnemies · *a fissure shockwave; brief stagger* · gen **moderate SOL** · cd **medium**
- **C · Cinder Smash** · phys · enemy · *Burn that can spread to an adjacent foe* · gen **moderate SOL** · cd **short**

**@ MNA 35** *(A/B)*
- **A · Aftershock** · phys · allEnemies · *a second wave; bonus vs staggered foes* · gen **moderate SOL** · cd **medium**
- **B · Shatterplate** · phys · enemy · *armor-break; bonus vs already-sundered foes* · gen **moderate SOL** · cd **medium**

**@ MNA 45** *(B/C)*
- **B · Expose** · util · allEnemies · *Scorched all foes (vulnerability)* · gen **moderate SOL** · cd **medium**
- **C · Wildfire Swing** · phys · allEnemies · *AoE smash; Burn spreads among foes* · gen **moderate SOL** · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Earthbreaker** · phys · allEnemies · *a big AoE slam; stagger all nearby foes* · gen **major SOL** · cd **medium**
- **C · Magma Burst** · phys · enemy · *detonate the target's Burn; splash to neighbors* · gen **moderate SOL** · cd **medium**

**@ MNA 65** *(A/B)*
- **A · Concussive Wave** · phys · allEnemies · *a shockwave that pushes enemy attack-bars back* · gen **moderate SOL** · cd **medium**
- **B · Sunsplitter** · phys · enemy · *crit-leaning sunder strike (AGI); ignores some armor* · gen **moderate SOL** · cd **medium**

**@ MNA 75** *(B/C)*
- **B · Pulverize** · phys · enemy · *heavy strike; deepen Scorched and sunder* · gen **major SOL** · cd **medium**
- **C · Eruption** · phys · allEnemies · *an AoE Burn detonation* · gen **major SOL** · cd **medium**

**@ MNA 85** *(A/C)*
- **A · Meteor Smash** · phys · allEnemies · *a leap-slam crater; heavy AoE + stagger* · gen **major SOL** · cd **medium**
- **C · Conflagrate** · phys · allEnemies · *spread Burn to all foes* · gen **moderate SOL** · cd **medium**

**@ MNA 95** *(A/B)*
- **A · Sunquake** · phys · allEnemies · *a massive radiant quake; AoE + stagger* · gen **major SOL** · cd **medium**
- **B · Sunder Storm** · phys · allEnemies · *AoE armor-break across all foes* · gen **major SOL** · cd **medium**

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Shockfront** · phys · allEnemies · *a radiant shockwave; stagger + damage* · cost **med SOL** · cd **medium**
- **B · Breach** · phys · enemy · *a massive armor-break; the target is sundered deeply* · cost **med SOL** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Weak Point** · phys · enemy · *exploit a sundered foe for a big hit (scales with sunder)* · cost **med SOL** · cd **medium**
- **C · Firestorm** · mag · allEnemies · *AoE Burn that spreads* · cost **med SOL** · cd **long**

**@ MNA 30** *(A/C)*
- **A · Tectonic Slam** · phys · allEnemies · *a huge AoE slam; stagger all foes* · cost **med SOL** · cd **medium**
- **C · Sunflare** · mag · allEnemies · *a radiant burst; Blind all foes* · cost **med SOL** · cd **long**

**@ MNA 40** *(A/B)*
- **A · Epicenter** · phys · allEnemies · *a quake centered on you; bonus to staggered foes* · cost **med SOL** · cd **medium**
- **B · Demolish** · phys · enemy · *execute vs heavily-sundered / low-armor foes* · cost **med SOL** · cd **medium**

**@ MNA 50** *(B/C)*
- **B · Crater** · phys · allEnemies · *a smash leaving a sundered zone: AoE armor-break + damage* · cost **high SOL** · cd **medium**
- **C · Pyre Nova** · mag · allEnemies · *detonate all Burn on the field at once* · cost **high SOL** · cd **medium**

**@ MNA 60** *(A/C)*
- **A · Seismic Judgment** · phys · allEnemies · *the Arbiter's spatial verdict — massive AoE quake + stagger* · cost **high SOL** · cd **long**
- **C · Immolate** · mag · enemy · *extreme single-target Burn, then detonate it* · cost **high SOL** · cd **medium**

**@ MNA 70** *(A/B)*
- **A · Fissure** · phys · allEnemies · *the ground splits; AoE + foes lose their next turn (stagger-stun)* · cost **high SOL** · cd **long**
- **B · Riftblow** · phys · enemy · *a blow that ignores all armor (full penetration)* · cost **high SOL** · cd **medium**

**@ MNA 80** *(B/C)*
- **B · Ruin** · phys · allEnemies · *strip armor + Scorched from all foes for several turns* · cost **high SOL** · cd **long**
- **C · Heat Death** · mag · allEnemies · *the entropic end — massive AoE Burn that escalates each turn* · cost **high SOL** · cd **long**

**@ MNA 90** *(A/C)*
- **A · Worldquake** · phys · allEnemies · *a continent-cracking slam; massive AoE + stagger-stun* · cost **high SOL** · cd **long**
- **C · Solar Judgment** · mag · allEnemies · *a radiant execution; Burn + Blind, bonus vs low-HP foes* · cost **high SOL** · cd **long**

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high SOL**, cd **long**)*

- **A · The Sundering Blow** *(Seismic)* · allEnemies · *one apocalyptic slam — massive AoE, stagger-stun every foe, leave the field cratered (sundered)*
- **B · Total Sunder** *(Sunder)* · allEnemies · *strip all armor to nothing across the enemy team; your hits ignore armor for the duration*
- **C · Pyroclasm** *(Pyroclasm)* · allEnemies · *the sky ignites — apply max Burn to all foes and detonate it in a chain*
- **Solar Verdict** *(neutral/fusion)* · allEnemies · *the Arbiter passes sentence: an AoE radiant smash that sunders, Burns, and staggers every foe at once*

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Aftershocks** · *your AoE slams have a chance to stagger*
- **B · Armorbane** · *your sunder strips more armor*
- **C · Wildfire** · *your Burns spread more readily*

**Set @ MNA 60**
- **A · Shockwave Mastery** · *your shockwaves strike a wider area*
- **B · Exploit** · *you deal bonus damage to sundered / Scorched foes*
- **C · Combustion** · *your Burn detonations hit harder*

**Set @ MNA 90**
- **A · Epicentric** · *your quakes deal more the more foes they hit*
- **B · Demolisher** · *your strikes innately ignore some armor*
- **C · Inferno** · *your Burns stack higher and don't expire while you keep applying them*

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6; signatures A6/B6/C6) | ✓ |
| Every option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary AGI ← SOL · secondary STR ← Hammer · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all SOL | ✓ |
| Provenance flag on every entry (all `proposed`) | ✓ |
| Ability names globally unique (invariant #8) | ✓ |
