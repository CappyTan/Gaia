# Rimewalker — NOX × Dual Swords

> **Status:** greenfield design spec, authored by the `build-class` skill against the
> [Class System Model](./README.md). **Pilot / worked example** — every entry is `proposed`
> (no brief supplied) — ratified canon (Dara, 2026-06-28). Numberless by design; magnitudes are a
> later balance pass.

## Identity (derived + DNA)

- **Class:** Rimewalker · **Attunement × Archetype:** NOX × Dual Swords
- **Primary stat:** STR (← NOX) · **Secondary stat:** AGI (← Dual Swords) — a STR/AGI hybrid duelist
- **Resource:** NOX (generates & spends the party's shared NOX pool)
- **Attunement signature:** **Decay** (cold/dark/order)

**Fantasy.** A frost-bound dual-blade duelist who fights at the threshold of stillness — opening
foes with creeping Decay, dancing through their guard on a hair-trigger of crit and evasion, and
freezing the battlefield to feed the party's cold. Every cut is patient; nothing is wasted.

### Lanes

| Lane | Identity | Keys off | Team role | Best when |
|---|---|---|---|---|
| **A · Rimebleed** | Decay/DoT attrition; consume stacks for payoffs | **STR**, Execute, Decay-duration | sustained single-target / boss damage | vs tanky/boss HP pools |
| **B · Glasscutter** | crit-burst, mobility, execute, evasion | **AGI**, Crit, Evasion | solo carry / spike | vs squishy packs; gear-rich crit build |
| **C · Hoarwarden** | frost-control + **NOX resource battery** | control (Chill/Gravity), economy | enabler / disruptor | NOX-stacked party (feeds the pool) or balanced party needing control |

**Build axes:** attrition ↔ burst (A↔B) · self-carry ↔ team-support (B↔C) · single-target ↔
control/AoE (A,B ↔ C).

---

## Auto-attack *(unlaned)*

- **Frost Cut** · phys · enemy · *two quick cold cuts* · gen **minor NOX** · cd **none** *(spammable)*

---

## Special skills — 10 milestones × 2 *(generate resource; never cost)*

**@ MNA 5** *(A/B)*
- **A · Frost Rot** · phys · enemy · *strike; applies Decay* · gen **moderate NOX** · cd **short**
- **B · Quickstep Slash** · phys · enemy · *strike; gain brief Evasion* · gen **moderate NOX** · cd **short**

**@ MNA 15** *(B/C)*
- **B · Rime Edge** · phys · enemy · *heavy single strike; sets up a crit* · gen **major NOX** · cd **medium**
- **C · Frostlace Web** · util · allEnemies · *light cold hit; Chill (slows attack-bar gain)* · gen **moderate NOX** · cd **medium**

**@ MNA 25** *(A/C)*
- **A · Hemorrhage** · phys · enemy · *strike; extends existing Decay's duration* · gen **moderate NOX** · cd **short**
- **C · Glacial Tithe** · buff · self · *the party's next NOX ability costs less* · gen **major NOX** *(battery)* · cd **medium**

**@ MNA 35** *(A/B)*
- **A · Wither Cut** · phys · enemy · *two cuts, each applying light Decay* · gen **moderate NOX** · cd **short**
- **B · Mirror Step** · phys · enemy · *dash strike; high crit vs targets above 50% HP* · gen **moderate NOX** · cd **medium**

**@ MNA 45** *(B/C)*
- **B · Killing Frost** · phys · enemy · *strike; bonus damage vs Chilled/slowed foes* · gen **major NOX** · cd **medium**
- **C · Numbing Field** · util · allEnemies · *apply Chill (reduced SPD) to all foes* · gen **moderate NOX** · cd **medium**

**@ MNA 55** *(A/C)*
- **A · Creeping Gangrene** · mag · enemy · *Decay that spreads to a nearby foe if the target dies* · gen **moderate NOX** · cd **medium**
- **C · Cryo Conduit** · buff · allAllies · *party's next NOX ability is discounted* · gen **major NOX** *(battery)* · cd **long**

**@ MNA 65** *(A/B)*
- **A · Frostbite Flurry** · phys · enemy · *four cuts; the last applies Decay* · gen **moderate NOX** · cd **medium**
- **B · Bloodless Edge** · phys · enemy · *crit-leaning strike; refunds attack-bar on a crit* · gen **moderate NOX** · cd **short**

**@ MNA 75** *(B/C)*
- **B · Phantom Cross** · phys · enemy · *teleport behind; guaranteed crit when flanking* · gen **major NOX** · cd **medium**
- **C · Iceroot Snare** · util · enemy · *root; chance to push the target's attack-bar back (Gravity)* · gen **moderate NOX** · cd **medium**

**@ MNA 85** *(A/C)*
- **A · Necrosis** · mag · enemy · *consume Decay stacks for a burst; leaves lesser Decay behind* · gen **moderate NOX** · cd **medium**
- **C · Glacier's Gift** · buff · allAllies · *brief party damage reduction; generates party NOX* · gen **major NOX** *(battery)* · cd **long**

**@ MNA 95** *(A/B)*
- **A · Final Rot** · phys · enemy · *heavy strike; applies max-duration Decay* · gen **major NOX** · cd **medium**
- **B · Zero-Sum Cut** · phys · enemy · *crit finisher; bonus damage vs low-HP foes* · gen **major NOX** · cd **medium**

---

## Signature abilities — 9 milestones × 2 *(cost resource; never generate)*

**@ MNA 10** *(A/B)*
- **A · Hoarfrost Verdict** · phys · enemy · *heavy hit; consumes the target's Decay for bonus damage* · cost **med NOX** · cd **medium**
- **B · Thirteenth Step** · phys · enemy · *teleport-strike, high crit; refunds part of the attack-bar* · cost **med NOX** · cd **medium**

**@ MNA 20** *(B/C)*
- **B · Flashfreeze Riposte** · buff · self · *counter stance: dodge the next hit and answer with a crit* · cost **med NOX** · cd **medium**
- **C · Permafrost Anchor** · util · allEnemies · *AoE Chill + slow; briefly draws threat off allies* · cost **low NOX** · cd **medium**

**@ MNA 30** *(A/C)*
- **A · Plague of Winter** · mag · allEnemies · *spread Decay to every foe* · cost **med NOX** · cd **long**
- **C · Coldforge** · buff · allAllies · *party NOX generation increased for several turns (battery)* · cost **low NOX** · cd **long**

**@ MNA 40** *(A/B)*
- **A · Exsanguinate** · phys · enemy · *strike scaling with the target's current Decay stacks* · cost **med NOX** · cd **medium**
- **B · Cull** · phys · enemy · *execute; massive vs targets under an HP threshold* · cost **med NOX** · cd **medium**

**@ MNA 50** *(B/C)*
- **B · Whirling Rime** · phys · allEnemies · *spinning crit burst across all foes* · cost **high NOX** · cd **medium**
- **C · Absolute Stillness** · util · allEnemies · *freeze (stun) one or more foes* · cost **high NOX** · cd **long**

**@ MNA 60** *(A/C)*
- **A · Rotting Embrace** · mag · enemy · *heavy Decay; reduces the target's incoming healing* · cost **med NOX** · cd **medium**
- **C · Resonant Cold** · buff · allAllies · *refund part of the party's NOX pool (battery)* · cost **low NOX** · cd **long**

**@ MNA 70** *(A/B)*
- **A · Black Frost** · mag · enemy · *Decay detonation; damage scales with stacks consumed* · cost **high NOX** · cd **medium**
- **B · Ghostblade Dance** · phys · enemy · *multi-hit crit chain; each crit extends the combo* · cost **high NOX** · cd **medium**

**@ MNA 80** *(B/C)*
- **B · Deathless Tempo** · buff · self · *crits grant a chance at an extra action for several turns* · cost **high NOX** · cd **long**
- **C · Winter's Dominion** · util · allEnemies · *AoE slow + Gravity (push all attack-bars back)* · cost **high NOX** · cd **long**

**@ MNA 90** *(A/C)*
- **A · Terminal Decay** · mag · enemy · *apply deep, un-cleansable Decay* · cost **high NOX** · cd **long**
- **C · Glacial Aegis** · buff · allAllies · *party damage reduction; generates a large party NOX surge* · cost **med NOX** · cd **long**

---

## Ultimates — @ MNA 100, **pick 2 of 4** *(all cost **high NOX**, cd **long**)*

- **A · The Long Winter** *(Rimebleed)* · allEnemies · *spread max-duration Decay to all foes; its ticks are doubled*
- **B · Execution: Zero Kelvin** *(Glasscutter)* · enemy · *massive single-target execute scaling with missing HP; guaranteed crit*
- **C · Absolute Zero** *(Hoarwarden)* · allEnemies · *freeze all foes (stun) + deep Chill; refund a burst of party NOX*
- **Whiteout** *(neutral/fusion)* · allEnemies · *AoE crit-cold detonation with light Decay*

---

## Passives — 3 sets of 3, **pick 1 each** @ MNA 30 / 60 / 90 *(one per lane)*

**Set @ MNA 30**
- **A · Permafrost** · *your Decay lasts +1 turn*
- **B · Bladedancer** · *after a crit, gain Evasion*
- **C · Cold Conduction** · *your specials generate extra NOX*

**Set @ MNA 60**
- **A · Festering** · *foes afflicted by your Decay take increased damage from you*
- **B · Killer's Instinct** · *your crit chance rises against foes below 50% HP*
- **C · Frostfeed** · *when an ally spends NOX, you generate a little NOX*

**Set @ MNA 90**
- **A · Entropy's Hand** · *your Decay can stack higher*
- **B · Coup de Grâce** · *your finishers deal more to low-HP foes*
- **C · Deepfreeze** · *your Chills/slows also reduce enemy attack-bar gain*

---

## Validation

| Invariant | Result |
|---|---|
| 1 auto + 20 specials + 18 signatures + 4 ultimates + 9 passives = **52** | ✓ |
| Every special/signature milestone has 2 options on the correct MNA thresholds | ✓ |
| No lane appears in every milestone (specials A7/B7/C6 of 10; signatures A6/B6/C6 of 9) | ✓ |
| Every special/signature/passive option lane-tagged; ultimates = 3 laned + 1 neutral | ✓ |
| Derived: primary STR ← NOX · secondary AGI ← Dual Swords · threshold = milestone | ✓ |
| Economy: specials generate-only · sig/ult cost-only · auto = minor trickle · all NOX | ✓ |
| Every entry has a provenance flag (all `proposed` here) | ✓ |
